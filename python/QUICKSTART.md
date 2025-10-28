# x402 Python - Quick Start Guide 🚀

Get up and running with x402 on Solana in 5 minutes!

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Basic understanding of Solana and HTTP APIs

## Installation

### Step 1: Install the Package

```bash
# Clone the repository
git clone https://github.com/HaidarIDK/x402.git
cd x402/python

# Install dependencies
pip install -r requirements.txt

# Install the package in development mode
pip install -e .
```

### Step 2: Set Up Solana Wallet

You'll need a Solana wallet with some SOL for testing.

#### Option A: Create a New Wallet

```python
from solders.keypair import Keypair
import base58

# Generate new keypair
keypair = Keypair()

print(f"Public Key: {keypair.pubkey()}")
print(f"Private Key (base58): {base58.b58encode(bytes(keypair)).decode()}")

# Save this private key securely!
```

#### Option B: Use Existing Wallet

```python
from solders.keypair import Keypair
import base58

# Load from base58 private key
private_key_b58 = "your_private_key_here"
keypair = Keypair.from_bytes(base58.b58decode(private_key_b58))
```

### Step 3: Fund Your Wallet (Devnet)

Get free devnet SOL from the faucet:

```bash
# Using Solana CLI
solana airdrop 2 YOUR_PUBLIC_KEY --url devnet

# Or visit: https://faucet.solana.com/
```

## Your First Payment

### Client Example

Create a file `my_first_payment.py`:

```python
from solders.keypair import Keypair
from x402 import X402Client, TokenType, X402Config

# Initialize client
keypair = Keypair()  # Or load your existing keypair
config = X402Config(
    rpc_url="https://api.devnet.solana.com",
    network="devnet",
)
client = X402Client(keypair, config)

# Check balance
balance = client.get_balance()
print(f"Balance: {balance:.4f} SOL")

# Create payment request
payment = client.create_payment_request(
    amount=0.001,
    recipient="recipient_pubkey_here",
    resource="/api/premium",
    token=TokenType.SOL,
)

print(f"Payment created!")
print(f"Amount: {payment.amount} SOL")
print(f"Nonce: {payment.nonce}")
```

Run it:

```bash
python my_first_payment.py
```

## Your First Payment-Protected API

### Flask Server Example

Create a file `my_first_server.py`:

```python
from flask import Flask
from solders.keypair import Keypair
from x402 import X402Client, X402Config
from x402.middleware import FlaskX402Middleware

app = Flask(__name__)

# Initialize x402
keypair = Keypair()  # Or load your keypair
config = X402Config(rpc_url="https://api.devnet.solana.com")
client = X402Client(keypair, config)
x402 = FlaskX402Middleware(app, client)

print(f"Server wallet: {keypair.pubkey()}")

@app.route('/')
def index():
    return {"message": "Welcome to x402!"}

@app.route('/premium')
@x402.require_payment(amount=0.001)
def premium():
    return {"data": "This costs 0.001 SOL!"}

if __name__ == '__main__':
    app.run(port=5000)
```

Run the server:

```bash
python my_first_server.py
```

### Test Your Server

In another terminal:

```bash
# Free endpoint - should work
curl http://localhost:5000/

# Premium endpoint - should return 402
curl http://localhost:5000/premium
```

## Complete Example: Client + Server

### 1. Start the Server

```bash
python examples/flask_server.py
```

### 2. Make Paid Requests

```bash
python examples/client_request.py
```

This will:
1. Request a protected endpoint
2. Receive 402 Payment Required
3. Create and sign a payment
4. Retry with payment header
5. Receive the protected content

## Common Use Cases

### 1. Protect a Single Route

```python
@app.route('/api/data')
@x402.require_payment(amount=0.001)
def get_data():
    return {"data": "premium data"}
```

### 2. Different Prices for Different Routes

```python
@app.route('/basic')
@x402.require_payment(amount=0.001)
def basic_content():
    return {"tier": "basic"}

@app.route('/premium')
@x402.require_payment(amount=0.01)
def premium_content():
    return {"tier": "premium"}
```

### 3. Accept Different Tokens

```python
@app.route('/usdc-payment')
@x402.require_payment(
    amount=1.0,
    token=TokenType.USDC,
    token_mint="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
)
def usdc_content():
    return {"data": "paid with USDC"}
```

## Testing

Run the test suite:

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=x402

# Run specific test file
pytest tests/test_client.py

# Run with verbose output
pytest -v
```

## Environment Variables

Create a `.env` file:

```bash
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
SOLANA_PRIVATE_KEY=your_base58_private_key_here
```

Load in your code:

```python
import os
from dotenv import load_dotenv
from solders.keypair import Keypair
import base58

load_dotenv()

# Load keypair from environment
private_key = os.getenv('SOLANA_PRIVATE_KEY')
keypair = Keypair.from_bytes(base58.b58decode(private_key))

# Use environment variables
rpc_url = os.getenv('SOLANA_RPC_URL')
```

## Next Steps

1. **Explore Examples**: Check out `/examples` directory for more examples
2. **Read Documentation**: See `README.md` for full API documentation
3. **Deploy to Production**: Switch to mainnet-beta for production
4. **Add Monitoring**: Implement logging and transaction monitoring
5. **Scale Up**: Add caching, rate limiting, and load balancing

## Troubleshooting

### "Insufficient funds" Error

- Make sure your wallet has enough SOL
- Check balance: `client.get_balance()`
- Get devnet SOL: https://faucet.solana.com/

### "Connection refused" Error

- Check if Solana RPC is accessible
- Try different RPC: `https://api.mainnet-beta.solana.com`
- Check your network connection

### "Invalid signature" Error

- Verify you're using the correct keypair
- Check that nonce hasn't expired
- Ensure payment parameters match

### Import Errors

- Make sure all dependencies are installed: `pip install -r requirements.txt`
- Check Python version: `python --version` (should be 3.8+)

## Getting Help

- **GitHub Issues**: https://github.com/HaidarIDK/x402/issues
- **Examples**: https://github.com/HaidarIDK/x402/tree/main/python/examples
- **Documentation**: https://github.com/HaidarIDK/x402/tree/main/python

## Production Checklist

Before deploying to production:

- [ ] Use mainnet-beta RPC URL
- [ ] Store private keys securely (use environment variables or key management service)
- [ ] Enable HTTPS
- [ ] Implement rate limiting
- [ ] Add transaction logging
- [ ] Set up monitoring and alerts
- [ ] Test with small amounts first
- [ ] Implement proper error handling
- [ ] Add payment verification caching
- [ ] Set appropriate nonce expiry times

---

**Congratulations! You're now ready to build with x402 on Solana! 🎉**

Start monetizing your APIs with micropayments today!


