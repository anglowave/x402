"""
Flask Server Example with x402 Middleware
Demonstrates how to protect routes with payment requirements
"""

from flask import Flask, jsonify, request
from solders.keypair import Keypair
from x402 import X402Client, TokenType, X402Config
from x402.middleware import FlaskX402Middleware

app = Flask(__name__)

# Initialize x402 client
# In production, load keypair from secure storage
keypair = Keypair()
config = X402Config(
    rpc_url="https://api.devnet.solana.com",
    network="devnet",
)
client = X402Client(keypair, config)

# Initialize middleware
x402 = FlaskX402Middleware(
    app,
    client,
    default_token=TokenType.SOL,
)

print(f"Server wallet: {keypair.pubkey()}")
print(f"Server running on http://localhost:5000")


@app.route('/')
def index():
    """Public endpoint - no payment required"""
    return jsonify({
        "message": "Welcome to x402 Demo API",
        "endpoints": {
            "/": "This public endpoint",
            "/free": "Another free endpoint",
            "/premium": "Premium content (requires 0.001 SOL)",
            "/exclusive": "Exclusive content (requires 0.01 SOL)",
        }
    })


@app.route('/free')
def free_content():
    """Free endpoint"""
    return jsonify({
        "message": "This is free content!",
        "data": "Anyone can access this"
    })


@app.route('/premium')
@x402.require_payment(amount=0.001)
def premium_content():
    """Premium endpoint - requires 0.001 SOL payment"""
    return jsonify({
        "message": "Premium content unlocked!",
        "data": {
            "secret": "This is premium data",
            "value": "Worth 0.001 SOL",
            "tips": [
                "Always verify payments",
                "Use proper error handling",
                "Cache payment verifications",
            ]
        }
    })


@app.route('/exclusive')
@x402.require_payment(amount=0.01)
def exclusive_content():
    """Exclusive endpoint - requires 0.01 SOL payment"""
    return jsonify({
        "message": "Exclusive content unlocked!",
        "data": {
            "secret": "This is highly exclusive data",
            "value": "Worth 0.01 SOL",
            "exclusive_tips": [
                "Scale your payments with x402",
                "Support multiple tokens",
                "Build micropayment economies",
            ]
        }
    })


@app.route('/api/balance')
def check_balance():
    """Check server wallet balance"""
    try:
        balance = client.get_balance()
        return jsonify({
            "public_key": str(client.public_key),
            "balance": balance,
            "token": "SOL",
            "network": config.network,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.errorhandler(402)
def payment_required(error):
    """Custom handler for 402 Payment Required"""
    return jsonify({
        "error": "Payment Required",
        "message": "This endpoint requires payment",
        "status": 402,
    }), 402


if __name__ == '__main__':
    print("\n" + "="*60)
    print("x402 Flask Server Example")
    print("="*60)
    print(f"\nServer Wallet: {keypair.pubkey()}")
    print(f"Network: {config.network}")
    print(f"RPC URL: {config.rpc_url}")
    print("\nEndpoints:")
    print("  GET  /           - Public info")
    print("  GET  /free       - Free content")
    print("  GET  /premium    - Premium content (0.001 SOL)")
    print("  GET  /exclusive  - Exclusive content (0.01 SOL)")
    print("  GET  /api/balance - Check server balance")
    print("\n" + "="*60 + "\n")
    
    app.run(debug=True, port=5000)


