# x402 - HTTP 402 Payment Protocol for Solana

> Enable micropayments for web resources using HTTP-native payment protocol on Solana

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![Solana](https://img.shields.io/badge/Solana-Devnet%20%7C%20Mainnet-purple.svg)](https://solana.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## What is x402?

x402 is an **HTTP-native payment protocol** that enables micropayments for web resources using the HTTP 402 "Payment Required" status code. This implementation brings the power of x402 to **Solana**, allowing you to:

- **Monetize APIs** with pay-per-request pricing
- **Protect premium content** with automatic payment verification
- **Process instant micropayments** on Solana (400ms finality)
- **Build HTTP-native payment flows** using standard HTTP
- **Support multiple tokens** (SOL, USDC, USDT, BONK, WIF, custom SPL tokens)

## Implementations

### Python Implementation

**Status**: Complete and Production Ready

A full-featured Python implementation with support for Flask, FastAPI, and other web frameworks.

```bash
cd python
pip install -r requirements.txt
pip install -e .
```

**Quick Example:**

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
def premium():
    return {"data": "This costs 0.001 SOL!"}
```

**[Full Python Documentation](python/README.md)**

### TypeScript Implementation (Coming Soon)

The TypeScript implementation is planned and will provide similar functionality for Node.js applications.

## Use Cases

### 1. **API Monetization**
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
@app.route('/compute/<complexity>')
@x402.require_payment(amount=0.01)
def compute(complexity):
    return execute_task(complexity)
```

### 4. **Micropayment Streaming**
Enable streaming payments for continuous services.

## Features

### Core Protocol
- HTTP 402 Payment Required responses
- Payment request creation and signing
- Nonce-based replay attack prevention
- Signature verification
- Automatic payment processing

### Solana Integration
- SOL transfers (native token)
- SPL token transfers (USDC, USDT, BONK, WIF, custom)
- Transaction signing and confirmation
- Balance checking
- Devnet, testnet, and mainnet support

### Web Framework Support
- Flask middleware with decorators
- FastAPI middleware with dependency injection
- Generic middleware for other frameworks
- Automatic payment verification
- Payment challenge generation

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/HaidarIDK/x402.git
cd x402/python

# Install dependencies
pip install -r requirements.txt
pip install -e .
```

### Basic Usage

```python
from solders.keypair import Keypair
from x402 import X402Client, TokenType

# Initialize client
keypair = Keypair()
client = X402Client(keypair, rpc_url="https://api.devnet.solana.com")

# Create a payment request
payment = client.create_payment_request(
    amount=0.001,
    recipient="recipient_pubkey",
    resource="/api/premium-content",
    token=TokenType.SOL
)

# Process the payment
response = client.process_payment(payment)
if response.success:
    print(f"Payment successful! TX: {response.transaction_signature}")
```

### Run Examples

```bash
# Start Flask server
python python/examples/flask_server.py

# Start FastAPI server
python python/examples/fastapi_server.py

# Run client example
python python/examples/client_request.py
```

## Documentation

### Python Implementation
- [**README**](python/README.md) - Full documentation and API reference
- [**Quick Start**](python/QUICKSTART.md) - 5-minute getting started guide
- [**Examples**](python/examples/) - Working examples for Flask, FastAPI, and clients
- [**Contributing**](python/CONTRIBUTING.md) - How to contribute
- [**Deployment**](python/DEPLOYMENT.md) - Production deployment guide

### Additional Resources
- [**Whitepaper**](x402-whitepaper.pdf) - Technical specification and architecture
- [**x402 Protocol Spec**](https://docs.payai.network/x402/reference) - Official protocol documentation

## How It Works

### Payment Flow

```
1. Client requests protected resource
   GET /premium-content
   
2. Server responds with 402 Payment Required
   HTTP/1.1 402 Payment Required
   X-Payment-Challenge: {"amount": 0.001, "recipient": "...", "nonce": "..."}
   
3. Client creates and signs payment
   payment = client.create_payment_request(...)
   
4. Client retries with payment
   GET /premium-content
   X-Payment-Request: {"amount": 0.001, "signature": "...", ...}
   
5. Server verifies and processes payment
   - Verify signature
   - Process Solana transaction
   - Grant access to resource
   
6. Client receives protected content
   HTTP/1.1 200 OK
   {"data": "premium content"}
```

## Security

- **Nonce-based replay protection** - Each payment uses a unique nonce
- **Signature verification** - All payments are cryptographically signed
- **Timestamp expiry** - Payments expire after a configurable time
- **Secure key management** - Examples for environment variables and key vaults
- **Input validation** - All inputs are validated before processing

## Supported Tokens

- **SOL** - Native Solana token
- **USDC** - USD Coin
- **USDT** - Tether USD
- **BONK** - Bonk memecoin
- **WIF** - Dogwifhat
- **Custom SPL Tokens** - Any SPL token via mint address

## Why x402 on Solana?

| Feature | Traditional Payments | x402 on Solana |
|---------|---------------------|----------------|
| **Speed** | Minutes to days | ~400ms |
| **Fees** | 2-3% + fixed fee | ~$0.00025 |
| **Minimum Amount** | ~$0.50 | Any amount |
| **Integration** | Complex APIs | HTTP-native |
| **Reversibility** | Chargebacks | Final |
| **Global** | Limited | Worldwide |

## Roadmap

### Current (v0.1.0)
- [x] Python implementation
- [x] SOL and SPL token support
- [x] Flask and FastAPI middleware
- [x] Comprehensive documentation
- [x] Example applications
- [x] Test suite

### Next (v0.2.0)
- [ ] TypeScript implementation
- [ ] Django middleware
- [ ] Async client support
- [ ] Payment streaming
- [ ] Subscription management

### Future
- [ ] CLI tools
- [ ] Payment analytics dashboard
- [ ] Webhook support
- [ ] Multi-signature support
- [ ] GraphQL support
- [ ] WebSocket payments

## Contributing

We welcome contributions! Please see our [Contributing Guide](python/CONTRIBUTING.md) for details.

### Areas We Need Help
- TypeScript implementation
- Additional framework integrations (Django, Tornado, etc.)
- Performance optimizations
- More examples and tutorials
- Documentation improvements
- Bug fixes and testing

## License

This project is licensed under the MIT License - see the [LICENSE](python/LICENSE) file for details.

## Acknowledgments

- [**Coinbase**](https://github.com/coinbase/x402) - Original x402 protocol specification
- [**Solana Foundation**](https://solana.com/) - High-performance blockchain infrastructure
- [**solana-py**](https://github.com/michaelhly/solana-py) - Python Solana SDK

## Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/anglowave/x402/issues)
- **Documentation**: [Full documentation](https://github.com/anglowave/x402/tree/main/python)
- **Examples**: [Code examples](https://github.com/anglowave/x402/tree/main/python/examples)

## Links

- [x402 Protocol Specification](https://docs.payai.network/x402/reference)
- [Solana Documentation](https://docs.solana.com/)
- [Python Implementation](https://github.com/anglowave/x402/tree/main/python)
- [Coinbase x402](https://github.com/coinbase/x402)

---

**Built for the Solana ecosystem**

Enable micropayments. Build the future of web monetization.


