# x402 - Python Implementation for Solana 🐍⚡

> HTTP 402 Payment Protocol for Solana - Enable micropayments in your Python applications

[![Python Version](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Solana](https://img.shields.io/badge/Solana-Devnet%20%7C%20Mainnet-purple.svg)](https://solana.com/)

## 🚀 What is x402?

x402 is an HTTP-native payment protocol that enables **micropayments** for web resources using the HTTP 402 status code. This Python implementation brings the power of x402 to Solana, allowing you to:

- 💰 Monetize APIs with pay-per-request pricing
- 🔐 Protect premium content with automatic payment verification
- ⚡ Process instant micropayments on Solana
- 🌐 Build HTTP-native payment flows
- 🎯 Support SOL and SPL tokens

## 📦 Installation

### From PyPI (coming soon)

```bash
pip install x402-solana
```

### From Source

```bash
git clone https://github.com/HaidarIDK/x402.git
cd x402/python
pip install -e .
```

### With Optional Dependencies

```bash
# For Flask support
pip install x402-solana[flask]

# For FastAPI support
pip install x402-solana[fastapi]

# For development
pip install x402-solana[dev]
```

## 🎯 Quick Start

### Basic Client Usage

```python
from solders.keypair import Keypair
from x402 import X402Client, TokenType

# Initialize client
keypair = Keypair()
client = X402Client(keypair, rpc_url="https://api.devnet.solana.com")

# Create a payment request
payment = client.create_payment_request(
    amount=0.001,  # 0.001 SOL
    recipient="recipient_pubkey_here",
    resource="/api/premium-content",
    token=TokenType.SOL
)

# Process the payment
response = client.process_payment(payment)
if response.success:
    print(f"Payment successful! TX: {response.transaction_signature}")
```

### Flask Server with Payment Protection

```python
from flask import Flask
from solders.keypair import Keypair
from x402 import X402Client
from x402.middleware import FlaskX402Middleware

app = Flask(__name__)
keypair = Keypair()
client = X402Client(keypair)
x402 = FlaskX402Middleware(app, client)

@app.route('/premium')
@x402.require_payment(amount=0.001)
def premium_content():
    return {"data": "This costs 0.001 SOL to access!"}

if __name__ == '__main__':
    app.run()
```

### FastAPI Server with Payment Protection

```python
from fastapi import FastAPI, Depends
from solders.keypair import Keypair
from x402 import X402Client
from x402.middleware import FastAPIX402Middleware

app = FastAPI()
keypair = Keypair()
client = X402Client(keypair)
x402 = FastAPIX402Middleware(client)

@app.get('/premium')
async def premium_content(
    payment = Depends(x402.verify_payment(amount=0.001))
):
    return {"data": "This costs 0.001 SOL to access!"}
```

## 📚 Documentation

### Core Components

#### X402Client

The main client for creating and processing payments.

```python
from x402 import X402Client, X402Config

config = X402Config(
    rpc_url="https://api.devnet.solana.com",
    network="devnet",
    commitment="confirmed",
    timeout=30,
)

client = X402Client(keypair, config)
```

**Methods:**
- `create_payment_request()` - Create a new payment request
- `process_payment()` - Process and verify a payment
- `get_balance()` - Check wallet balance

#### X402Middleware

Middleware for protecting HTTP routes with payment requirements.

```python
from x402.middleware import X402Middleware

middleware = X402Middleware(
    client=client,
    recipient="your_pubkey",
    default_token=TokenType.SOL,
    auto_verify=True,
)
```

**Decorators:**
- `@require_payment(amount, token, recipient)` - Require payment for a route

### Payment Flow

1. **Client requests protected resource** → Receives HTTP 402 with payment challenge
2. **Client creates payment** → Signs transaction with x402 client
3. **Client retries request** → Includes payment in `X-Payment-Request` header
4. **Server verifies payment** → Processes transaction and grants access

### Token Support

Currently supported tokens:

- ✅ **SOL** - Native Solana token
- ✅ **USDC** - USD Coin
- ✅ **USDT** - Tether USD
- ✅ **BONK** - Bonk memecoin
- ✅ **WIF** - Dogwifhat
- ✅ **Custom SPL Tokens** - Any SPL token via mint address

## 🧪 Examples

Check out the `/examples` directory for complete examples:

- **`basic_client.py`** - Basic payment creation and processing
- **`flask_server.py`** - Flask server with payment-protected routes
- **`fastapi_server.py`** - FastAPI server with async payment handling
- **`client_request.py`** - Making requests to payment-protected endpoints

### Running Examples

```bash
# Start Flask server
python examples/flask_server.py

# Start FastAPI server
python examples/fastapi_server.py

# Run client example
python examples/client_request.py
```

## 🔧 Configuration

### Environment Variables

```bash
# Solana RPC URL
SOLANA_RPC_URL=https://api.devnet.solana.com

# Network (devnet, testnet, mainnet-beta)
SOLANA_NETWORK=devnet

# Wallet private key (base58 encoded)
SOLANA_PRIVATE_KEY=your_private_key_here
```

### X402Config Options

```python
from x402 import X402Config

config = X402Config(
    rpc_url="https://api.devnet.solana.com",  # Solana RPC endpoint
    network="devnet",                          # Network name
    commitment="confirmed",                    # Transaction commitment level
    timeout=30,                                # Request timeout (seconds)
    max_retries=3,                            # Max retry attempts
    nonce_expiry=300,                         # Nonce expiry time (seconds)
    enable_logging=True,                      # Enable debug logging
)
```

## 🧪 Testing

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Run with coverage
pytest --cov=x402 --cov-report=html

# Type checking
mypy x402

# Code formatting
black x402 examples
```

## 🌟 Use Cases

### 1. **Monetize APIs**
Charge per API request with automatic payment verification.

```python
@app.route('/api/ai-inference')
@x402.require_payment(amount=0.001)
def ai_inference():
    return run_ai_model()
```

### 2. **Premium Content**
Protect premium content behind micropayments.

```python
@app.route('/premium-article/<id>')
@x402.require_payment(amount=0.005)
def premium_article(id):
    return get_article(id)
```

### 3. **Pay-Per-Use Services**
Build services that charge based on usage.

```python
@app.route('/compute/<task>')
@x402.require_payment(amount=0.01)
def compute_task(task):
    return execute_compute_task(task)
```

### 4. **Micropayment Streaming**
Enable streaming payments for continuous services.

```python
@app.route('/stream/data')
@x402.require_payment(amount=0.0001)
def stream_data():
    return stream_realtime_data()
```

## 🔒 Security Best Practices

1. **Never expose private keys** - Use environment variables or secure key management
2. **Verify signatures** - Always verify payment signatures on the server
3. **Use nonce validation** - Prevent replay attacks with unique nonces
4. **Set proper expiry times** - Configure appropriate nonce expiry periods
5. **Monitor transactions** - Log and monitor all payment transactions
6. **Use HTTPS** - Always use HTTPS in production
7. **Rate limiting** - Implement rate limiting to prevent abuse

## 🛣️ Roadmap

- [x] Core x402 protocol implementation
- [x] SOL payment support
- [x] SPL token support
- [x] Flask middleware
- [x] FastAPI middleware
- [ ] Django middleware
- [ ] Async client support
- [ ] Payment streaming
- [ ] Subscription management
- [ ] Payment analytics
- [ ] CLI tools
- [ ] Mainnet deployment guide

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Coinbase](https://github.com/coinbase/x402) - Original x402 protocol specification
- [Solana](https://solana.com/) - High-performance blockchain
- [solana-py](https://github.com/michaelhly/solana-py) - Python Solana SDK

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/HaidarIDK/x402/issues)
- **Documentation**: [Full documentation](https://github.com/HaidarIDK/x402/tree/main/python)
- **Examples**: [Code examples](https://github.com/HaidarIDK/x402/tree/main/python/examples)

## 🌐 Links

- [x402 Protocol Specification](https://docs.payai.network/x402/reference)
- [Solana Documentation](https://docs.solana.com/)
- [TypeScript Implementation](https://github.com/coinbase/x402)

---

**Built with ❤️ for the Solana ecosystem**

*Enable micropayments. Build the future of web monetization.*


