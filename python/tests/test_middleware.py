"""
Tests for X402Middleware
"""

import pytest
import json
from unittest.mock import Mock, MagicMock
from solders.keypair import Keypair
from x402 import X402Client, TokenType, X402Config
from x402.middleware import X402Middleware
from x402.types import PaymentResponse, PaymentStatus


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


@pytest.fixture
def middleware(client):
    """Create a test middleware"""
    return X402Middleware(
        client=client,
        default_token=TokenType.SOL,
        auto_verify=False,  # Disable auto-verify for testing
    )


def test_middleware_initialization(middleware, client):
    """Test middleware initialization"""
    assert middleware.client == client
    assert middleware.default_token == TokenType.SOL
    assert middleware.auto_verify is False


def test_create_payment_challenge(middleware):
    """Test payment challenge creation"""
    challenge = middleware.create_payment_challenge(
        amount=0.001,
        resource="/api/test",
        token=TokenType.SOL,
    )
    
    assert isinstance(challenge, dict)
    assert challenge["amount"] == 0.001
    assert challenge["resource"] == "/api/test"
    assert challenge["token"] == "SOL"
    assert "nonce" in challenge
    assert "timestamp" in challenge


def test_create_payment_challenge_with_metadata(middleware):
    """Test payment challenge with metadata"""
    metadata = {"user_id": "123"}
    challenge = middleware.create_payment_challenge(
        amount=0.001,
        resource="/api/test",
        metadata=metadata,
    )
    
    assert challenge["metadata"] == metadata


def test_extract_request_from_args(middleware):
    """Test request extraction from args"""
    mock_request = Mock()
    mock_request.headers = {"X-Payment-Request": "test"}
    
    args = (mock_request, "other_arg")
    kwargs = {}
    
    request = middleware._extract_request(args, kwargs)
    assert request == mock_request


def test_extract_request_from_kwargs(middleware):
    """Test request extraction from kwargs"""
    mock_request = Mock()
    mock_request.headers = {"X-Payment-Request": "test"}
    
    args = ()
    kwargs = {"request": mock_request}
    
    request = middleware._extract_request(args, kwargs)
    assert request == mock_request


def test_get_payment_header_flask_style(middleware):
    """Test payment header extraction (Flask style)"""
    mock_request = Mock()
    mock_request.headers = MagicMock()
    mock_request.headers.get = MagicMock(return_value="payment_data")
    
    header = middleware._get_payment_header(mock_request)
    assert header == "payment_data"
    mock_request.headers.get.assert_called_with('X-Payment-Request')


def test_get_payment_header_none(middleware):
    """Test payment header when request is None"""
    header = middleware._get_payment_header(None)
    assert header is None


def test_get_resource_path_flask_style(middleware):
    """Test resource path extraction (Flask style)"""
    mock_request = Mock()
    mock_request.path = "/api/test"
    
    path = middleware._get_resource_path(mock_request)
    assert path == "/api/test"


def test_get_resource_path_fastapi_style(middleware):
    """Test resource path extraction (FastAPI style)"""
    mock_request = Mock()
    mock_url = Mock()
    mock_url.path = "/api/test"
    mock_request.url = mock_url
    
    path = middleware._get_resource_path(mock_request)
    assert path == "/api/test"


def test_get_resource_path_default(middleware):
    """Test resource path default"""
    path = middleware._get_resource_path(None)
    assert path == "/"


def test_create_payment_required_response(middleware):
    """Test 402 Payment Required response creation"""
    response = middleware._create_payment_required_response(
        amount=0.001,
        recipient="test_recipient",
        resource="/api/test",
        token=TokenType.SOL,
    )
    
    assert isinstance(response, tuple)
    assert len(response) == 3
    
    body, status_code, headers = response
    assert status_code == 402
    assert "error" in body
    assert "payment_challenge" in body
    assert "X-Payment-Challenge" in headers


def test_create_error_response(middleware):
    """Test error response creation"""
    response = middleware._create_error_response("Test error", 400)
    
    assert isinstance(response, tuple)
    assert len(response) == 3
    
    body, status_code, headers = response
    assert status_code == 400
    assert body["error"] == "Test error"


def test_cache_payment(middleware):
    """Test payment caching"""
    payment_response = PaymentResponse(
        success=True,
        transaction_signature="test_sig",
        status=PaymentStatus.COMPLETED,
    )
    
    nonce = "test_nonce"
    middleware._cache_payment(nonce, payment_response)
    
    assert nonce in middleware._payment_cache
    assert middleware._payment_cache[nonce] == payment_response


def test_verify_payment_header(middleware, client):
    """Test payment header verification"""
    payment_request = client.create_payment_request(
        amount=0.001,
        recipient=str(client.public_key),
        resource="/api/test",
    )
    
    payment_header = json.dumps(payment_request.to_dict())
    
    # This will fail without actual funds, but tests the flow
    response = middleware.verify_payment_header(payment_header)
    assert isinstance(response, PaymentResponse)


def test_verify_payment_header_invalid_json(middleware):
    """Test payment header verification with invalid JSON"""
    response = middleware.verify_payment_header("invalid json")
    assert response.success is False
    assert response.error is not None


def test_require_payment_decorator(middleware):
    """Test require_payment decorator"""
    @middleware.require_payment(amount=0.001)
    def test_endpoint():
        return {"data": "success"}
    
    # Function should be wrapped
    assert hasattr(test_endpoint, '__wrapped__')


def test_middleware_with_custom_recipient(client):
    """Test middleware with custom recipient"""
    custom_recipient = "custom_recipient_pubkey"
    middleware = X402Middleware(
        client=client,
        recipient=custom_recipient,
    )
    
    assert middleware.recipient == custom_recipient


