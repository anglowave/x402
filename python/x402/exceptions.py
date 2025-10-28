"""
Custom exceptions for x402 protocol
"""


class X402Error(Exception):
    """Base exception for x402 protocol errors"""
    pass


class PaymentRequiredError(X402Error):
    """Raised when HTTP 402 Payment Required is received"""
    def __init__(self, amount: float, recipient: str, resource: str, nonce: str):
        self.amount = amount
        self.recipient = recipient
        self.resource = resource
        self.nonce = nonce
        super().__init__(
            f"Payment required: {amount} SOL to {recipient} for {resource}"
        )


class InvalidSignatureError(X402Error):
    """Raised when signature verification fails"""
    pass


class InsufficientFundsError(X402Error):
    """Raised when wallet has insufficient funds"""
    pass


class TransactionFailedError(X402Error):
    """Raised when transaction fails on Solana"""
    pass


class NonceExpiredError(X402Error):
    """Raised when payment nonce has expired"""
    pass


class InvalidPaymentError(X402Error):
    """Raised when payment parameters are invalid"""
    pass


