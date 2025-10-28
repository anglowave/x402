"""
x402 - HTTP 402 Payment Protocol for Solana
A Python implementation of the x402 payment protocol enabling
HTTP-native, chain-agnostic micropayments on Solana.
"""

from .client import X402Client, PaymentRequest, PaymentResponse
from .middleware import X402Middleware
from .exceptions import (
    X402Error,
    PaymentRequiredError,
    InvalidSignatureError,
    InsufficientFundsError,
    TransactionFailedError,
)

__version__ = "0.1.0"
__all__ = [
    "X402Client",
    "X402Middleware",
    "PaymentRequest",
    "PaymentResponse",
    "X402Error",
    "PaymentRequiredError",
    "InvalidSignatureError",
    "InsufficientFundsError",
    "TransactionFailedError",
]


