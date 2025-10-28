"""
Type definitions for x402 protocol
"""

from dataclasses import dataclass, field
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum


class PaymentStatus(Enum):
    """Payment status enumeration"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    EXPIRED = "expired"


class TokenType(Enum):
    """Supported token types on Solana"""
    SOL = "SOL"
    USDC = "USDC"
    USDT = "USDT"
    BONK = "BONK"
    WIF = "WIF"
    CUSTOM = "CUSTOM"


@dataclass
class PaymentRequest:
    """
    Represents a payment request in the x402 protocol
    """
    amount: float
    recipient: str
    resource: str
    nonce: str
    timestamp: int
    token: TokenType = TokenType.SOL
    token_mint: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    signature: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert payment request to dictionary"""
        return {
            "amount": self.amount,
            "recipient": self.recipient,
            "resource": self.resource,
            "nonce": self.nonce,
            "timestamp": self.timestamp,
            "token": self.token.value,
            "token_mint": self.token_mint,
            "metadata": self.metadata,
            "signature": self.signature,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "PaymentRequest":
        """Create payment request from dictionary"""
        token = TokenType(data.get("token", "SOL"))
        return cls(
            amount=data["amount"],
            recipient=data["recipient"],
            resource=data["resource"],
            nonce=data["nonce"],
            timestamp=data["timestamp"],
            token=token,
            token_mint=data.get("token_mint"),
            metadata=data.get("metadata", {}),
            signature=data.get("signature"),
        )


@dataclass
class PaymentResponse:
    """
    Represents a payment response in the x402 protocol
    """
    success: bool
    transaction_signature: Optional[str] = None
    status: PaymentStatus = PaymentStatus.PENDING
    message: Optional[str] = None
    timestamp: int = field(default_factory=lambda: int(datetime.now().timestamp()))
    error: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert payment response to dictionary"""
        return {
            "success": self.success,
            "transaction_signature": self.transaction_signature,
            "status": self.status.value,
            "message": self.message,
            "timestamp": self.timestamp,
            "error": self.error,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "PaymentResponse":
        """Create payment response from dictionary"""
        status = PaymentStatus(data.get("status", "pending"))
        return cls(
            success=data["success"],
            transaction_signature=data.get("transaction_signature"),
            status=status,
            message=data.get("message"),
            timestamp=data.get("timestamp", int(datetime.now().timestamp())),
            error=data.get("error"),
        )


@dataclass
class X402Config:
    """
    Configuration for x402 client
    """
    rpc_url: str = "https://api.devnet.solana.com"
    network: str = "devnet"
    commitment: str = "confirmed"
    timeout: int = 30
    max_retries: int = 3
    nonce_expiry: int = 300  # 5 minutes
    enable_logging: bool = True


