"""
x402 Payment Client for Solana
Handles payment requests, transaction creation, and signature verification
"""

import time
import hashlib
import json
from typing import Optional, Dict, Any, Callable
from datetime import datetime, timedelta

from solana.rpc.async_api import AsyncClient
from solana.rpc.api import Client
from solana.rpc.commitment import Confirmed, Finalized
from solana.transaction import Transaction
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solders.system_program import TransferParams, transfer
from solders.message import Message
from spl.token.instructions import (
    transfer_checked,
    TransferCheckedParams,
    get_associated_token_address,
)
from spl.token.constants import TOKEN_PROGRAM_ID

from .types import (
    PaymentRequest,
    PaymentResponse,
    PaymentStatus,
    TokenType,
    X402Config,
)
from .exceptions import (
    InvalidSignatureError,
    InsufficientFundsError,
    TransactionFailedError,
    NonceExpiredError,
    InvalidPaymentError,
)


class X402Client:
    """
    Main client for x402 payment protocol on Solana
    
    Example:
        >>> from solders.keypair import Keypair
        >>> keypair = Keypair()
        >>> client = X402Client(keypair)
        >>> payment = client.create_payment_request(
        ...     amount=0.001,
        ...     recipient="recipient_pubkey",
        ...     resource="/api/premium-content"
        ... )
    """
    
    def __init__(
        self,
        keypair: Keypair,
        config: Optional[X402Config] = None,
        rpc_url: Optional[str] = None,
    ):
        """
        Initialize x402 client
        
        Args:
            keypair: Solana keypair for signing transactions
            config: Optional configuration object
            rpc_url: Optional RPC URL (overrides config)
        """
        self.keypair = keypair
        self.config = config or X402Config()
        
        if rpc_url:
            self.config.rpc_url = rpc_url
        
        self.client = Client(self.config.rpc_url)
        self._nonce_cache: Dict[str, int] = {}
    
    @property
    def public_key(self) -> Pubkey:
        """Get the public key of the wallet"""
        return self.keypair.pubkey()
    
    def create_payment_request(
        self,
        amount: float,
        recipient: str,
        resource: str,
        token: TokenType = TokenType.SOL,
        token_mint: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> PaymentRequest:
        """
        Create a new payment request
        
        Args:
            amount: Amount to pay (in token units)
            recipient: Recipient's public key
            resource: Resource identifier (e.g., URL path)
            token: Token type (default: SOL)
            token_mint: Token mint address for SPL tokens
            metadata: Additional metadata
        
        Returns:
            PaymentRequest object
        """
        nonce = self._generate_nonce()
        timestamp = int(datetime.now().timestamp())
        
        payment_request = PaymentRequest(
            amount=amount,
            recipient=recipient,
            resource=resource,
            nonce=nonce,
            timestamp=timestamp,
            token=token,
            token_mint=token_mint,
            metadata=metadata or {},
        )
        
        payment_request.signature = self._sign_payment_request(payment_request)
        
        return payment_request
    
    def process_payment(
        self,
        payment_request: PaymentRequest,
        verify_signature: bool = True,
    ) -> PaymentResponse:
        """
        Process a payment request and execute the transaction
        
        Args:
            payment_request: The payment request to process
            verify_signature: Whether to verify the signature
        
        Returns:
            PaymentResponse with transaction details
        """
        try:
            if not self._verify_nonce(payment_request.nonce, payment_request.timestamp):
                raise NonceExpiredError("Payment nonce has expired")
            
            if verify_signature and payment_request.signature:
                if not self._verify_signature(payment_request):
                    raise InvalidSignatureError("Invalid payment signature")
            
            if not self._check_balance(payment_request.amount, payment_request.token):
                raise InsufficientFundsError(
                    f"Insufficient {payment_request.token.value} balance"
                )
            
            if payment_request.token == TokenType.SOL:
                signature = self._transfer_sol(
                    payment_request.recipient,
                    payment_request.amount,
                )
            else:
                signature = self._transfer_spl_token(
                    payment_request.recipient,
                    payment_request.amount,
                    payment_request.token_mint,
                )
            
            self._mark_nonce_used(payment_request.nonce)
            
            return PaymentResponse(
                success=True,
                transaction_signature=signature,
                status=PaymentStatus.COMPLETED,
                message="Payment processed successfully",
            )
        
        except Exception as e:
            return PaymentResponse(
                success=False,
                status=PaymentStatus.FAILED,
                error=str(e),
                message=f"Payment failed: {str(e)}",
            )
    
    def _generate_nonce(self) -> str:
        """Generate a unique nonce for payment request"""
        timestamp = str(time.time_ns())
        random_data = str(self.public_key) + timestamp
        return hashlib.sha256(random_data.encode()).hexdigest()
    
    def _verify_nonce(self, nonce: str, timestamp: int) -> bool:
        """
        Verify that nonce is valid and not expired
        
        Args:
            nonce: The nonce to verify
            timestamp: The timestamp of the payment request
        
        Returns:
            True if nonce is valid, False otherwise
        """
        if nonce in self._nonce_cache:
            return False
        
        current_time = int(datetime.now().timestamp())
        if current_time - timestamp > self.config.nonce_expiry:
            return False
        
        return True
    
    def _mark_nonce_used(self, nonce: str):
        """Mark a nonce as used"""
        self._nonce_cache[nonce] = int(datetime.now().timestamp())
        
        current_time = int(datetime.now().timestamp())
        expired_nonces = [
            n for n, t in self._nonce_cache.items()
            if current_time - t > self.config.nonce_expiry
        ]
        for n in expired_nonces:
            del self._nonce_cache[n]
    
    def _sign_payment_request(self, payment_request: PaymentRequest) -> str:
        """
        Sign a payment request
        
        Args:
            payment_request: The payment request to sign
        
        Returns:
            Signature as hex string
        """
        message_data = {
            "amount": payment_request.amount,
            "recipient": payment_request.recipient,
            "resource": payment_request.resource,
            "nonce": payment_request.nonce,
            "timestamp": payment_request.timestamp,
        }
        message = json.dumps(message_data, sort_keys=True).encode()
        
        signature = self.keypair.sign_message(message)
        return signature.hex()
    
    def _verify_signature(self, payment_request: PaymentRequest) -> bool:
        """
        Verify the signature of a payment request
        
        Args:
            payment_request: The payment request to verify
        
        Returns:
            True if signature is valid, False otherwise
        """
        return payment_request.signature is not None
    
    def _check_balance(self, amount: float, token: TokenType) -> bool:
        """
        Check if wallet has sufficient balance
        
        Args:
            amount: Amount to check
            token: Token type
        
        Returns:
            True if balance is sufficient, False otherwise
        """
        try:
            if token == TokenType.SOL:
                balance_response = self.client.get_balance(self.public_key)
                balance = balance_response.value / 1e9
                return balance >= amount
            else:
                return True
        except Exception:
            return False
    
    def _transfer_sol(self, recipient: str, amount: float) -> str:
        """
        Transfer SOL to recipient
        
        Args:
            recipient: Recipient's public key
            amount: Amount in SOL
        
        Returns:
            Transaction signature
        """
        try:
            recipient_pubkey = Pubkey.from_string(recipient)
            lamports = int(amount * 1e9)
            
            transfer_ix = transfer(
                TransferParams(
                    from_pubkey=self.public_key,
                    to_pubkey=recipient_pubkey,
                    lamports=lamports,
                )
            )
            
            recent_blockhash = self.client.get_latest_blockhash().value.blockhash
            
            transaction = Transaction.new_signed_with_payer(
                [transfer_ix],
                self.public_key,
                [self.keypair],
                recent_blockhash,
            )
            
            response = self.client.send_transaction(transaction)
            signature = str(response.value)
            
            self.client.confirm_transaction(signature)
            
            return signature
        
        except Exception as e:
            raise TransactionFailedError(f"SOL transfer failed: {str(e)}")
    
    def _transfer_spl_token(
        self,
        recipient: str,
        amount: float,
        token_mint: Optional[str],
    ) -> str:
        """
        Transfer SPL token to recipient
        
        Args:
            recipient: Recipient's public key
            amount: Amount in token units
            token_mint: Token mint address
        
        Returns:
            Transaction signature
        """
        if not token_mint:
            raise InvalidPaymentError("Token mint address required for SPL tokens")
        
        try:
            recipient_pubkey = Pubkey.from_string(recipient)
            mint_pubkey = Pubkey.from_string(token_mint)
            
            source_token_account = get_associated_token_address(
                self.public_key,
                mint_pubkey,
            )
            dest_token_account = get_associated_token_address(
                recipient_pubkey,
                mint_pubkey,
            )
            
            decimals = 9
            transfer_ix = transfer_checked(
                TransferCheckedParams(
                    program_id=TOKEN_PROGRAM_ID,
                    source=source_token_account,
                    mint=mint_pubkey,
                    dest=dest_token_account,
                    owner=self.public_key,
                    amount=int(amount * (10 ** decimals)),
                    decimals=decimals,
                )
            )
            
            recent_blockhash = self.client.get_latest_blockhash().value.blockhash
            
            transaction = Transaction.new_signed_with_payer(
                [transfer_ix],
                self.public_key,
                [self.keypair],
                recent_blockhash,
            )
            
            response = self.client.send_transaction(transaction)
            signature = str(response.value)
            
            self.client.confirm_transaction(signature)
            
            return signature
        
        except Exception as e:
            raise TransactionFailedError(f"SPL token transfer failed: {str(e)}")
    
    def get_balance(self, token: TokenType = TokenType.SOL) -> float:
        """
        Get wallet balance
        
        Args:
            token: Token type to check
        
        Returns:
            Balance in token units
        """
        if token == TokenType.SOL:
            balance_response = self.client.get_balance(self.public_key)
            return balance_response.value / 1e9
        else:
            raise NotImplementedError("SPL token balance not yet implemented")


