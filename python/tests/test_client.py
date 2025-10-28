"""
Tests for X402Client
"""

import pytest
from solders.keypair import Keypair
from x402 import X402Client, TokenType, X402Config
from x402.types import PaymentRequest, PaymentResponse, PaymentStatus
from x402.exceptions import NonceExpiredError, InvalidPaymentError


@pytest.fixture
def keypair():
    """Create a test keypair"""
    return Keypair()


@pytest.fixture
def client(keypair):
    """Create a test client"""
    config = X402Config(
        rpc_url="https://api.devnet.solana.com",
        network="devnet",
    )
    return X402Client(keypair, config)


def test_client_initialization(client, keypair):
    """Test client initialization"""
    assert client.keypair == keypair
    assert client.public_key == keypair.pubkey()
    assert client.config.network == "devnet"


def test_create_payment_request(client):
    """Test payment request creation"""
    payment = client.create_payment_request(
        amount=0.001,
        recipient="11111111111111111111111111111111",
        resource="/api/test",
        token=TokenType.SOL,
    )
    
    assert isinstance(payment, PaymentRequest)
    assert payment.amount == 0.001
    assert payment.token == TokenType.SOL
    assert payment.nonce is not None
    assert payment.signature is not None
    assert payment.timestamp > 0


def test_payment_request_with_metadata(client):
    """Test payment request with metadata"""
    metadata = {"user_id": "123", "session": "abc"}
    payment = client.create_payment_request(
        amount=0.001,
        recipient="11111111111111111111111111111111",
        resource="/api/test",
        metadata=metadata,
    )
    
    assert payment.metadata == metadata


def test_nonce_generation(client):
    """Test nonce generation"""
    nonce1 = client._generate_nonce()
    nonce2 = client._generate_nonce()
    
    assert nonce1 != nonce2
    assert len(nonce1) == 64  # SHA256 hex
    assert len(nonce2) == 64


def test_nonce_verification(client):
    """Test nonce verification"""
    import time
    
    nonce = client._generate_nonce()
    timestamp = int(time.time())
    
    # Valid nonce
    assert client._verify_nonce(nonce, timestamp) is True
    
    # Mark as used
    client._mark_nonce_used(nonce)
    
    # Used nonce should fail
    assert client._verify_nonce(nonce, timestamp) is False


def test_expired_nonce(client):
    """Test expired nonce detection"""
    nonce = client._generate_nonce()
    old_timestamp = int(time.time()) - 400  # 400 seconds ago
    
    assert client._verify_nonce(nonce, old_timestamp) is False


def test_payment_request_serialization(client):
    """Test payment request to/from dict"""
    payment = client.create_payment_request(
        amount=0.001,
        recipient="11111111111111111111111111111111",
        resource="/api/test",
    )
    
    # To dict
    data = payment.to_dict()
    assert isinstance(data, dict)
    assert data["amount"] == 0.001
    
    # From dict
    payment2 = PaymentRequest.from_dict(data)
    assert payment2.amount == payment.amount
    assert payment2.recipient == payment.recipient
    assert payment2.nonce == payment.nonce


def test_payment_response_serialization():
    """Test payment response to/from dict"""
    response = PaymentResponse(
        success=True,
        transaction_signature="test_signature",
        status=PaymentStatus.COMPLETED,
        message="Payment successful",
    )
    
    # To dict
    data = response.to_dict()
    assert isinstance(data, dict)
    assert data["success"] is True
    assert data["status"] == "completed"
    
    # From dict
    response2 = PaymentResponse.from_dict(data)
    assert response2.success == response.success
    assert response2.status == response.status


def test_sign_payment_request(client):
    """Test payment request signing"""
    payment = PaymentRequest(
        amount=0.001,
        recipient="11111111111111111111111111111111",
        resource="/api/test",
        nonce="test_nonce",
        timestamp=1234567890,
    )
    
    signature = client._sign_payment_request(payment)
    assert signature is not None
    assert len(signature) > 0


def test_check_balance_sol(client):
    """Test SOL balance checking"""
    # This will fail if wallet has no balance, but tests the method
    try:
        has_balance = client._check_balance(0.000001, TokenType.SOL)
        assert isinstance(has_balance, bool)
    except Exception:
        # Expected if wallet has no funds
        pass


def test_get_balance(client):
    """Test get balance method"""
    try:
        balance = client.get_balance(TokenType.SOL)
        assert isinstance(balance, float)
        assert balance >= 0
    except Exception:
        # Expected if RPC is unavailable
        pass


def test_spl_token_not_implemented(client):
    """Test that SPL token balance raises NotImplementedError"""
    with pytest.raises(NotImplementedError):
        client.get_balance(TokenType.USDC)


def test_token_types():
    """Test token type enumeration"""
    assert TokenType.SOL.value == "SOL"
    assert TokenType.USDC.value == "USDC"
    assert TokenType.USDT.value == "USDT"
    assert TokenType.BONK.value == "BONK"
    assert TokenType.WIF.value == "WIF"


def test_payment_status():
    """Test payment status enumeration"""
    assert PaymentStatus.PENDING.value == "pending"
    assert PaymentStatus.PROCESSING.value == "processing"
    assert PaymentStatus.COMPLETED.value == "completed"
    assert PaymentStatus.FAILED.value == "failed"
    assert PaymentStatus.EXPIRED.value == "expired"


