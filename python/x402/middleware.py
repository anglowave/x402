"""
x402 Middleware for HTTP servers
Enables HTTP 402 Payment Required responses and automatic payment verification
"""

import json
import time
from typing import Callable, Optional, Dict, Any, List
from functools import wraps
from datetime import datetime

from .client import X402Client
from .types import PaymentRequest, PaymentResponse, TokenType
from .exceptions import PaymentRequiredError, InvalidSignatureError


class X402Middleware:
    """
    Middleware for integrating x402 payments into HTTP servers
    
    Supports Flask, FastAPI, and other WSGI/ASGI frameworks
    
    Example (Flask):
        >>> from flask import Flask
        >>> app = Flask(__name__)
        >>> middleware = X402Middleware(client)
        >>> 
        >>> @app.route('/premium')
        >>> @middleware.require_payment(amount=0.001)
        >>> def premium_content():
        ...     return {"data": "premium content"}
    
    Example (FastAPI):
        >>> from fastapi import FastAPI, Request
        >>> app = FastAPI()
        >>> middleware = X402Middleware(client)
        >>> 
        >>> @app.get('/premium')
        >>> @middleware.require_payment(amount=0.001)
        >>> async def premium_content(request: Request):
        ...     return {"data": "premium content"}
    """
    
    def __init__(
        self,
        client: X402Client,
        recipient: Optional[str] = None,
        default_token: TokenType = TokenType.SOL,
        auto_verify: bool = True,
    ):
        """
        Initialize x402 middleware
        
        Args:
            client: X402Client instance
            recipient: Default recipient address (uses client's pubkey if None)
            default_token: Default token type for payments
            auto_verify: Automatically verify payments
        """
        self.client = client
        self.recipient = recipient or str(client.public_key)
        self.default_token = default_token
        self.auto_verify = auto_verify
        self._payment_cache: Dict[str, PaymentResponse] = {}
    
    def require_payment(
        self,
        amount: float,
        token: Optional[TokenType] = None,
        recipient: Optional[str] = None,
        resource: Optional[str] = None,
    ):
        """
        Decorator to require payment for a route
        
        Args:
            amount: Payment amount required
            token: Token type (uses default if None)
            recipient: Recipient address (uses default if None)
            resource: Resource identifier (uses route path if None)
        
        Returns:
            Decorated function
        """
        def decorator(func: Callable):
            @wraps(func)
            def wrapper(*args, **kwargs):
                # Try to extract request object
                request = self._extract_request(args, kwargs)
                
                # Check for payment header
                payment_header = self._get_payment_header(request)
                
                if not payment_header:
                    # No payment provided, return 402
                    return self._create_payment_required_response(
                        amount=amount,
                        recipient=recipient or self.recipient,
                        resource=resource or self._get_resource_path(request),
                        token=token or self.default_token,
                    )
                
                # Verify payment
                try:
                    payment_request = PaymentRequest.from_dict(
                        json.loads(payment_header)
                    )
                    
                    # Validate payment parameters
                    if payment_request.amount < amount:
                        return self._create_error_response(
                            "Insufficient payment amount",
                            402,
                        )
                    
                    if payment_request.recipient != (recipient or self.recipient):
                        return self._create_error_response(
                            "Invalid recipient",
                            400,
                        )
                    
                    # Process payment
                    if self.auto_verify:
                        payment_response = self.client.process_payment(
                            payment_request
                        )
                        
                        if not payment_response.success:
                            return self._create_error_response(
                                payment_response.error or "Payment failed",
                                402,
                            )
                        
                        # Cache successful payment
                        self._cache_payment(
                            payment_request.nonce,
                            payment_response,
                        )
                    
                    # Payment successful, call original function
                    return func(*args, **kwargs)
                
                except Exception as e:
                    return self._create_error_response(str(e), 400)
            
            return wrapper
        return decorator
    
    def verify_payment_header(self, payment_header: str) -> PaymentResponse:
        """
        Verify a payment header
        
        Args:
            payment_header: JSON string of payment request
        
        Returns:
            PaymentResponse
        """
        try:
            payment_request = PaymentRequest.from_dict(
                json.loads(payment_header)
            )
            return self.client.process_payment(payment_request)
        except Exception as e:
            return PaymentResponse(
                success=False,
                error=str(e),
                message=f"Payment verification failed: {str(e)}",
            )
    
    def create_payment_challenge(
        self,
        amount: float,
        resource: str,
        token: Optional[TokenType] = None,
        recipient: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Create a payment challenge for clients
        
        Args:
            amount: Payment amount required
            resource: Resource identifier
            token: Token type
            recipient: Recipient address
            metadata: Additional metadata
        
        Returns:
            Payment challenge dictionary
        """
        nonce = self.client._generate_nonce()
        timestamp = int(datetime.now().timestamp())
        
        return {
            "amount": amount,
            "recipient": recipient or self.recipient,
            "resource": resource,
            "token": (token or self.default_token).value,
            "nonce": nonce,
            "timestamp": timestamp,
            "metadata": metadata or {},
        }
    
    def _extract_request(self, args: tuple, kwargs: dict) -> Any:
        """Extract request object from function arguments"""
        for arg in args:
            if hasattr(arg, 'headers') or hasattr(arg, 'get_header'):
                return arg
        
        if 'request' in kwargs:
            return kwargs['request']
        
        return None
    
    def _get_payment_header(self, request: Any) -> Optional[str]:
        """Get payment header from request"""
        if request is None:
            return None
        
        if hasattr(request, 'headers'):
            return request.headers.get('X-Payment-Request')
        
        if hasattr(request, 'get_header'):
            return request.get_header('X-Payment-Request')
        
        return None
    
    def _get_resource_path(self, request: Any) -> str:
        """Get resource path from request"""
        if request is None:
            return "/"
        
        if hasattr(request, 'path'):
            return request.path
        
        if hasattr(request, 'url'):
            return str(request.url.path)
        
        return "/"
    
    def _create_payment_required_response(
        self,
        amount: float,
        recipient: str,
        resource: str,
        token: TokenType,
    ) -> tuple:
        """Create HTTP 402 Payment Required response"""
        challenge = self.create_payment_challenge(
            amount=amount,
            recipient=recipient,
            resource=resource,
            token=token,
        )
        
        return (
            {
                "error": "Payment Required",
                "message": f"Payment of {amount} {token.value} required",
                "payment_challenge": challenge,
            },
            402,
            {
                "WWW-Authenticate": f'x402 amount={amount} token={token.value}',
                "X-Payment-Challenge": json.dumps(challenge),
            },
        )
    
    def _create_error_response(self, message: str, status_code: int) -> tuple:
        """Create error response"""
        return (
            {"error": message},
            status_code,
            {"Content-Type": "application/json"},
        )
    
    def _cache_payment(self, nonce: str, payment_response: PaymentResponse):
        """Cache a successful payment"""
        self._payment_cache[nonce] = payment_response
        
        current_time = int(datetime.now().timestamp())
        expired_nonces = [
            n for n, p in self._payment_cache.items()
            if current_time - p.timestamp > 3600
        ]
        for n in expired_nonces:
            del self._payment_cache[n]


class FlaskX402Middleware:
    """
    Flask-specific middleware for x402
    
    Example:
        >>> from flask import Flask
        >>> app = Flask(__name__)
        >>> middleware = FlaskX402Middleware(app, client)
        >>> 
        >>> @app.route('/premium')
        >>> @middleware.require_payment(amount=0.001)
        >>> def premium_content():
        ...     return {"data": "premium content"}
    """
    
    def __init__(self, app, client: X402Client, **kwargs):
        """Initialize Flask middleware"""
        self.app = app
        self.middleware = X402Middleware(client, **kwargs)
    
    def require_payment(self, *args, **kwargs):
        """Require payment for a Flask route"""
        return self.middleware.require_payment(*args, **kwargs)


class FastAPIX402Middleware:
    """
    FastAPI-specific middleware for x402
    
    Example:
        >>> from fastapi import FastAPI, Depends
        >>> app = FastAPI()
        >>> middleware = FastAPIX402Middleware(client)
        >>> 
        >>> @app.get('/premium')
        >>> async def premium_content(
        ...     payment = Depends(middleware.verify_payment(amount=0.001))
        ... ):
        ...     return {"data": "premium content"}
    """
    
    def __init__(self, client: X402Client, **kwargs):
        """Initialize FastAPI middleware"""
        self.middleware = X402Middleware(client, **kwargs)
    
    def verify_payment(self, amount: float, **kwargs):
        """Create FastAPI dependency for payment verification"""
        async def dependency(request):
            payment_header = request.headers.get('X-Payment-Request')
            
            if not payment_header:
                from fastapi import HTTPException
                challenge = self.middleware.create_payment_challenge(
                    amount=amount,
                    resource=str(request.url.path),
                    **kwargs,
                )
                raise HTTPException(
                    status_code=402,
                    detail="Payment Required",
                    headers={
                        "X-Payment-Challenge": json.dumps(challenge),
                    },
                )
            
            payment_response = self.middleware.verify_payment_header(
                payment_header
            )
            
            if not payment_response.success:
                from fastapi import HTTPException
                raise HTTPException(
                    status_code=402,
                    detail=payment_response.error or "Payment verification failed",
                )
            
            return payment_response
        
        return dependency


