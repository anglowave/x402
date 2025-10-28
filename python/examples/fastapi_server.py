"""
FastAPI Server Example with x402 Middleware
Demonstrates async payment processing with FastAPI
"""

from fastapi import FastAPI, Depends, Request
from fastapi.responses import JSONResponse
from solders.keypair import Keypair
from x402 import X402Client, TokenType, X402Config
from x402.middleware import FastAPIX402Middleware

app = FastAPI(
    title="x402 FastAPI Demo",
    description="HTTP 402 Payment Protocol on Solana",
    version="0.1.0",
)

# Initialize x402 client
keypair = Keypair()
config = X402Config(
    rpc_url="https://api.devnet.solana.com",
    network="devnet",
)
client = X402Client(keypair, config)

# Initialize middleware
x402 = FastAPIX402Middleware(client, default_token=TokenType.SOL)

print(f"Server wallet: {keypair.pubkey()}")


@app.get("/")
async def root():
    """Public endpoint - no payment required"""
    return {
        "message": "Welcome to x402 FastAPI Demo",
        "server_pubkey": str(client.public_key),
        "network": config.network,
        "endpoints": {
            "/": "This public endpoint",
            "/docs": "API documentation",
            "/free": "Free content",
            "/premium": "Premium content (requires 0.001 SOL)",
            "/exclusive": "Exclusive content (requires 0.01 SOL)",
        }
    }


@app.get("/free")
async def free_content():
    """Free endpoint"""
    return {
        "message": "This is free content!",
        "data": "Anyone can access this",
        "cost": 0,
    }


@app.get("/premium")
async def premium_content(
    payment = Depends(x402.verify_payment(amount=0.001))
):
    """Premium endpoint - requires 0.001 SOL payment"""
    return {
        "message": "Premium content unlocked!",
        "payment": {
            "transaction": payment.transaction_signature,
            "status": payment.status.value,
        },
        "data": {
            "secret": "This is premium data",
            "value": "Worth 0.001 SOL",
            "tips": [
                "Use FastAPI for async operations",
                "Leverage dependency injection",
                "Scale with ease",
            ]
        }
    }


@app.get("/exclusive")
async def exclusive_content(
    payment = Depends(x402.verify_payment(amount=0.01))
):
    """Exclusive endpoint - requires 0.01 SOL payment"""
    return {
        "message": "Exclusive content unlocked!",
        "payment": {
            "transaction": payment.transaction_signature,
            "status": payment.status.value,
        },
        "data": {
            "secret": "This is highly exclusive data",
            "value": "Worth 0.01 SOL",
            "exclusive_tips": [
                "Build micropayment APIs",
                "Monetize AI endpoints",
                "Create pay-per-use services",
            ]
        }
    }


@app.get("/api/balance")
async def check_balance():
    """Check server wallet balance"""
    try:
        balance = client.get_balance()
        return {
            "public_key": str(client.public_key),
            "balance": balance,
            "token": "SOL",
            "network": config.network,
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )


@app.exception_handler(402)
async def payment_required_handler(request: Request, exc):
    """Custom handler for 402 Payment Required"""
    return JSONResponse(
        status_code=402,
        content={
            "error": "Payment Required",
            "message": "This endpoint requires payment",
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    print("\n" + "="*60)
    print("x402 FastAPI Server Example")
    print("="*60)
    print(f"\nServer Wallet: {keypair.pubkey()}")
    print(f"Network: {config.network}")
    print(f"RPC URL: {config.rpc_url}")
    print("\nEndpoints:")
    print("  GET  /           - Public info")
    print("  GET  /docs       - API documentation")
    print("  GET  /free       - Free content")
    print("  GET  /premium    - Premium content (0.001 SOL)")
    print("  GET  /exclusive  - Exclusive content (0.01 SOL)")
    print("  GET  /api/balance - Check server balance")
    print("\n" + "="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)


