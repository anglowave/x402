"""
Basic x402 Client Example
Demonstrates how to create and process payments
"""

from solders.keypair import Keypair
from x402 import X402Client, TokenType, X402Config

def main():
    # Create or load a keypair
    # In production, load from secure storage
    keypair = Keypair()
    
    print(f"Wallet Public Key: {keypair.pubkey()}")
    
    # Initialize client (using devnet)
    config = X402Config(
        rpc_url="https://api.devnet.solana.com",
        network="devnet",
    )
    client = X402Client(keypair, config)
    
    # Check balance
    try:
        balance = client.get_balance()
        print(f"SOL Balance: {balance:.4f} SOL")
    except Exception as e:
        print(f"Error checking balance: {e}")
    
    # Create a payment request
    recipient = "11111111111111111111111111111111"  # Replace with actual recipient
    payment_request = client.create_payment_request(
        amount=0.001,  # 0.001 SOL
        recipient=recipient,
        resource="/api/premium-content",
        token=TokenType.SOL,
        metadata={
            "user_id": "user123",
            "content_id": "content456",
        }
    )
    
    print("\nPayment Request Created:")
    print(f"  Amount: {payment_request.amount} {payment_request.token.value}")
    print(f"  Recipient: {payment_request.recipient}")
    print(f"  Resource: {payment_request.resource}")
    print(f"  Nonce: {payment_request.nonce}")
    print(f"  Signature: {payment_request.signature[:32]}...")
    
    # In a real scenario, you would send this payment_request to the server
    # and the server would process it
    
    # Example: Process payment (as if we're the server)
    print("\nProcessing payment...")
    payment_response = client.process_payment(payment_request)
    
    if payment_response.success:
        print("✓ Payment successful!")
        print(f"  Transaction: {payment_response.transaction_signature}")
        print(f"  Status: {payment_response.status.value}")
    else:
        print("✗ Payment failed!")
        print(f"  Error: {payment_response.error}")


if __name__ == "__main__":
    main()


