# x402 Python Examples

This directory contains example scripts demonstrating how to use x402 for Solana payments.

## Examples Overview

### 1. Basic Client (`basic_client.py`)

Demonstrates basic payment creation and processing.

```bash
python examples/basic_client.py
```

**What it shows:**
- Creating an x402 client
- Checking wallet balance
- Creating payment requests
- Processing payments

### 2. Flask Server (`flask_server.py`)

A Flask server with payment-protected routes.

```bash
python examples/flask_server.py
```

**Endpoints:**
- `GET /` - Public info (free)
- `GET /free` - Free content
- `GET /premium` - Premium content (0.001 SOL)
- `GET /exclusive` - Exclusive content (0.01 SOL)
- `GET /api/balance` - Check server balance

### 3. FastAPI Server (`fastapi_server.py`)

An async FastAPI server with payment protection.

```bash
python examples/fastapi_server.py
```

**Features:**
- Async payment processing
- Automatic API documentation at `/docs`
- Dependency injection for payments
- Same endpoints as Flask example

### 4. Client Request (`client_request.py`)

Demonstrates making requests to payment-protected endpoints.

```bash
# First, start a server (Flask or FastAPI)
python examples/flask_server.py

# Then, in another terminal:
python examples/client_request.py
```

**What it shows:**
- Detecting 402 Payment Required
- Extracting payment challenge
- Creating and signing payment
- Retrying request with payment

## Running the Examples

### Prerequisites

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Fund your wallet with devnet SOL:
```bash
solana airdrop 2 YOUR_PUBLIC_KEY --url devnet
```

Or visit: https://faucet.solana.com/

### Quick Test

1. **Terminal 1** - Start server:
```bash
python examples/flask_server.py
```

2. **Terminal 2** - Test with client:
```bash
python examples/client_request.py
```

3. **Terminal 3** - Test with curl:
```bash
# Free endpoint
curl http://localhost:5000/free

# Premium endpoint (will return 402)
curl -v http://localhost:5000/premium
```

## Example Workflows

### Workflow 1: Simple Payment

```python
from solders.keypair import Keypair
from x402 import X402Client

# Create client
keypair = Keypair()
client = X402Client(keypair, rpc_url="https://api.devnet.solana.com")

# Create payment
payment = client.create_payment_request(
    amount=0.001,
    recipient="recipient_pubkey",
    resource="/api/data"
)

# Process payment
response = client.process_payment(payment)
print(f"Success: {response.success}")
```

### Workflow 2: Protected API Route

```python
from flask import Flask
from x402.middleware import FlaskX402Middleware

app = Flask(__name__)
x402 = FlaskX402Middleware(app, client)

@app.route('/api/data')
@x402.require_payment(amount=0.001)
def get_data():
    return {"data": "premium content"}
```

### Workflow 3: Client Making Paid Request

```python
import requests
import json

# 1. Try to access protected resource
response = requests.get('http://localhost:5000/premium')

# 2. Get payment challenge from 402 response
if response.status_code == 402:
    challenge = json.loads(response.headers['X-Payment-Challenge'])
    
    # 3. Create payment
    payment = client.create_payment_request(**challenge)
    
    # 4. Retry with payment
    headers = {'X-Payment-Request': json.dumps(payment.to_dict())}
    response = requests.get('http://localhost:5000/premium', headers=headers)
    
    # 5. Access granted!
    print(response.json())
```

## Testing Different Scenarios

### Test 1: Insufficient Payment

```python
# Server requires 0.001 SOL
@app.route('/data')
@x402.require_payment(amount=0.001)
def data():
    return {"data": "content"}

# Client sends only 0.0001 SOL
payment = client.create_payment_request(
    amount=0.0001,  # Too little!
    recipient=server_pubkey,
    resource="/data"
)
# Result: 402 Payment Required (insufficient amount)
```

### Test 2: Expired Nonce

```python
import time

# Create payment
payment = client.create_payment_request(...)

# Wait for nonce to expire (default: 5 minutes)
time.sleep(301)

# Try to process
response = client.process_payment(payment)
# Result: Failed (nonce expired)
```

### Test 3: Multiple Tokens

```python
# SOL payment
@app.route('/sol-content')
@x402.require_payment(amount=0.001, token=TokenType.SOL)
def sol_content():
    return {"paid": "with SOL"}

# USDC payment
@app.route('/usdc-content')
@x402.require_payment(
    amount=1.0,
    token=TokenType.USDC,
    token_mint="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
)
def usdc_content():
    return {"paid": "with USDC"}
```

## Customization

### Custom Recipient

```python
# Use a different recipient for each route
@app.route('/content1')
@x402.require_payment(amount=0.001, recipient="pubkey1")
def content1():
    return {"content": 1}

@app.route('/content2')
@x402.require_payment(amount=0.001, recipient="pubkey2")
def content2():
    return {"content": 2}
```

### Dynamic Pricing

```python
@app.route('/api/compute/<complexity>')
def compute(complexity):
    # Calculate price based on complexity
    price = float(complexity) * 0.001
    
    # Manually verify payment
    payment_header = request.headers.get('X-Payment-Request')
    if not payment_header:
        return create_payment_challenge(price), 402
    
    payment = PaymentRequest.from_dict(json.loads(payment_header))
    if payment.amount < price:
        return {"error": "Insufficient payment"}, 402
    
    # Process payment and return result
    response = client.process_payment(payment)
    if response.success:
        return {"result": perform_computation(complexity)}
```

## Troubleshooting

### "Insufficient funds" Error

Make sure your wallet has enough SOL:
```bash
solana balance YOUR_PUBLIC_KEY --url devnet
solana airdrop 2 YOUR_PUBLIC_KEY --url devnet
```

### "Connection refused" Error

Check if the server is running:
```bash
curl http://localhost:5000/
```

### "Invalid signature" Error

Verify you're using the correct keypair and the nonce hasn't expired.

## Next Steps

1. Modify examples to fit your use case
2. Deploy to production (use mainnet-beta)
3. Add monitoring and logging
4. Implement caching for better performance
5. Add rate limiting and security measures

## Resources

- [x402 Documentation](../README.md)
- [Quick Start Guide](../QUICKSTART.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Solana Documentation](https://docs.solana.com/)

---

**Happy coding! 🚀**


