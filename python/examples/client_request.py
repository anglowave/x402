"""
Client Request Example
Demonstrates how to make payment-protected HTTP requests
"""

import requests
import json
from solders.keypair import Keypair
from x402 import X402Client, TokenType, X402Config


def make_paid_request(url: str, client: X402Client):
    """
    Make a request to a payment-protected endpoint
    
    Args:
        url: The URL to request
        client: X402Client instance
    
    Returns:
        Response data or error
    """
    print(f"\n{'='*60}")
    print(f"Requesting: {url}")
    print(f"{'='*60}")
    
    # First request - expect 402 Payment Required
    print("\n1. Initial request (no payment)...")
    response = requests.get(url)
    
    if response.status_code == 402:
        print("   ✓ Received 402 Payment Required")
        
        # Extract payment challenge
        payment_challenge = json.loads(
            response.headers.get('X-Payment-Challenge', '{}')
        )
        
        print(f"\n2. Payment Challenge:")
        print(f"   Amount: {payment_challenge.get('amount')} {payment_challenge.get('token')}")
        print(f"   Recipient: {payment_challenge.get('recipient')}")
        print(f"   Resource: {payment_challenge.get('resource')}")
        
        # Create payment request
        print(f"\n3. Creating payment...")
        payment_request = client.create_payment_request(
            amount=payment_challenge['amount'],
            recipient=payment_challenge['recipient'],
            resource=payment_challenge['resource'],
            token=TokenType(payment_challenge['token']),
        )
        
        # Make request with payment
        print(f"\n4. Sending request with payment...")
        headers = {
            'X-Payment-Request': json.dumps(payment_request.to_dict()),
            'Content-Type': 'application/json',
        }
        
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            print("   ✓ Payment accepted!")
            print(f"\n5. Response:")
            data = response.json()
            print(json.dumps(data, indent=2))
            return data
        else:
            print(f"   ✗ Request failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
    
    elif response.status_code == 200:
        print("   ✓ No payment required (free endpoint)")
        data = response.json()
        print(f"\nResponse:")
        print(json.dumps(data, indent=2))
        return data
    
    else:
        print(f"   ✗ Unexpected status code: {response.status_code}")
        print(f"   Response: {response.text}")
        return None


def main():
    # Initialize client
    keypair = Keypair()
    config = X402Config(
        rpc_url="https://api.devnet.solana.com",
        network="devnet",
    )
    client = X402Client(keypair, config)
    
    print("\n" + "="*60)
    print("x402 Client Request Example")
    print("="*60)
    print(f"\nClient Wallet: {keypair.pubkey()}")
    print(f"Network: {config.network}")
    
    # Check balance
    try:
        balance = client.get_balance()
        print(f"Balance: {balance:.4f} SOL")
        
        if balance < 0.001:
            print("\n⚠ Warning: Low balance! You may need to fund your wallet.")
            print(f"   Send SOL to: {keypair.pubkey()}")
            print(f"   Get devnet SOL: https://faucet.solana.com/")
    except Exception as e:
        print(f"Could not check balance: {e}")
    
    # Example server URL (adjust to your server)
    base_url = "http://localhost:5000"
    
    # Test free endpoint
    print("\n\n" + "="*60)
    print("TEST 1: Free Endpoint")
    print("="*60)
    make_paid_request(f"{base_url}/free", client)
    
    # Test premium endpoint
    print("\n\n" + "="*60)
    print("TEST 2: Premium Endpoint (0.001 SOL)")
    print("="*60)
    make_paid_request(f"{base_url}/premium", client)
    
    # Test exclusive endpoint
    print("\n\n" + "="*60)
    print("TEST 3: Exclusive Endpoint (0.01 SOL)")
    print("="*60)
    make_paid_request(f"{base_url}/exclusive", client)
    
    print("\n" + "="*60)
    print("Tests completed!")
    print("="*60 + "\n")


if __name__ == "__main__":
    main()


