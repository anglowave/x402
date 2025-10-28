"""
Tests for x402 exceptions
"""

import pytest
from x402.exceptions import (
    X402Error,
    PaymentRequiredError,
    InvalidSignatureError,
    InsufficientFundsError,
    TransactionFailedError,
    NonceExpiredError,
    InvalidPaymentError,
)


def test_x402_error():
    """Test base X402Error"""
    error = X402Error("Test error")
    assert str(error) == "Test error"
    assert isinstance(error, Exception)


def test_payment_required_error():
    """Test PaymentRequiredError"""
    error = PaymentRequiredError(
        amount=0.001,
        recipient="test_recipient",
        resource="/api/test",
        nonce="test_nonce",
    )
    
    assert error.amount == 0.001
    assert error.recipient == "test_recipient"
    assert error.resource == "/api/test"
    assert error.nonce == "test_nonce"
    assert "0.001" in str(error)
    assert isinstance(error, X402Error)


def test_invalid_signature_error():
    """Test InvalidSignatureError"""
    error = InvalidSignatureError("Invalid signature")
    assert str(error) == "Invalid signature"
    assert isinstance(error, X402Error)


def test_insufficient_funds_error():
    """Test InsufficientFundsError"""
    error = InsufficientFundsError("Insufficient SOL balance")
    assert "Insufficient" in str(error)
    assert isinstance(error, X402Error)


def test_transaction_failed_error():
    """Test TransactionFailedError"""
    error = TransactionFailedError("Transaction failed on chain")
    assert "Transaction failed" in str(error)
    assert isinstance(error, X402Error)


def test_nonce_expired_error():
    """Test NonceExpiredError"""
    error = NonceExpiredError("Payment nonce has expired")
    assert "expired" in str(error)
    assert isinstance(error, X402Error)


def test_invalid_payment_error():
    """Test InvalidPaymentError"""
    error = InvalidPaymentError("Invalid payment parameters")
    assert "Invalid" in str(error)
    assert isinstance(error, X402Error)


def test_exception_inheritance():
    """Test exception inheritance chain"""
    assert issubclass(PaymentRequiredError, X402Error)
    assert issubclass(InvalidSignatureError, X402Error)
    assert issubclass(InsufficientFundsError, X402Error)
    assert issubclass(TransactionFailedError, X402Error)
    assert issubclass(NonceExpiredError, X402Error)
    assert issubclass(InvalidPaymentError, X402Error)
    assert issubclass(X402Error, Exception)


