"""
Example: AI Agent using x402 Gateway API

This shows how an AI agent can access x402-protected APIs
without managing its own wallet. The gateway vault pays automatically.
"""

import requests
import json

GATEWAY_URL = "http://localhost:3000/api/agent-request"
API_KEY = None  # Not required in week 1

def fetch_x402_data(endpoint: str, method: str = "GET", headers: dict = None, body: dict = None):
    """
    Fetch data from an x402-protected endpoint.
    The gateway automatically pays the x402 fee from its vault.
    
    Args:
        endpoint: The x402-protected API endpoint
        method: HTTP method (GET, POST, etc.)
        headers: Additional headers to send
        body: Request body for POST/PUT
    
    Returns:
        dict: Response data with payment info if applicable
    """
    payload = {
        "endpoint": endpoint,
        "method": method,
    }
    
    if headers:
        payload["headers"] = headers
    if body:
        payload["body"] = body
    
    request_headers = {"Content-Type": "application/json"}
    if API_KEY:
        request_headers["X-API-Key"] = API_KEY
    
    response = requests.post(GATEWAY_URL, json=payload, headers=request_headers)
    return response.json()


def main():
    print("AI Agent x402 Gateway Example\n")
    
    # Example 1: Access premium data
    print("Example 1: Accessing premium endpoint...")
    result = fetch_x402_data(
        endpoint="http://localhost:5001/premium",
        method="GET"
    )
    
    if result.get("success"):
        print("✓ Success!")
        print(f"Data: {result['data']}")
        
        if result.get("paid"):
            payment = result["payment"]
            print(f"\n💰 Payment Info:")
            print(f"   Amount: {payment['amount']} {payment['token']}")
            print(f"   TX: {payment['signature'][:16]}...")
            print(f"   Paid by: {payment['paidBy']}")
    else:
        print(f"✗ Failed: {result.get('error')}")
    
    print("\n" + "="*50 + "\n")
    
    # Example 2: Access exclusive endpoint
    print("Example 2: Accessing exclusive endpoint...")
    result = fetch_x402_data(
        endpoint="http://localhost:5001/exclusive",
        method="GET"
    )
    
    if result.get("success"):
        print("✓ Success!")
        print(f"Data: {result['data']}")
        
        if result.get("paid"):
            payment = result["payment"]
            print(f"\n💰 Payment Info:")
            print(f"   Amount: {payment['amount']} {payment['token']}")
            print(f"   TX: {payment['signature'][:16]}...")
    else:
        print(f"✗ Failed: {result.get('error')}")


if __name__ == "__main__":
    main()

