"""
x402 Gateway Server
Handles x402 payment requests using a shared vault
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
import json
import os
import sys
from datetime import datetime
from pathlib import Path

project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root / 'python'))

from solders.keypair import Keypair
import base58

from x402 import X402Client, TokenType, X402Config
from x402.types import PaymentRequest

app = Flask(__name__)
CORS(app)

VAULT_PRIVATE_KEY = os.getenv('VAULT_PRIVATE_KEY')
vault_client = None

def initialize_vault():
    """Initialize the vault client with keypair"""
    global vault_client
    
    if VAULT_PRIVATE_KEY:
        keypair_bytes = base58.b58decode(VAULT_PRIVATE_KEY)
        keypair = Keypair.from_bytes(keypair_bytes)
    else:
        print("Warning: Using new keypair. Set VAULT_PRIVATE_KEY env variable for production")
        keypair = Keypair()
        print(f"Vault Public Key: {keypair.pubkey()}")
        print(f"Private Key (base58): {base58.b58encode(bytes(keypair)).decode()}")
    
    config = X402Config(
        rpc_url="https://api.devnet.solana.com",
        network="devnet",
    )
    
    vault_client = X402Client(keypair, config)
    return vault_client


@app.route('/')
def index():
    """Serve the frontend"""
    return send_file('index.html')


@app.route('/api/vault/info', methods=['GET'])
def vault_info():
    """Get vault information"""
    try:
        balance = vault_client.get_balance()
        return jsonify({
            "success": True,
            "vault": {
                "public_key": str(vault_client.public_key),
                "balance": balance,
                "network": vault_client.config.network
            }
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/proxy', methods=['POST'])
def proxy_request():
    """
    Proxy a request through x402 payment
    Handles the payment from vault and returns the response
    """
    data = request.json
    endpoint = data.get('endpoint')
    method = data.get('method', 'GET')
    body = data.get('body')
    
    if not endpoint:
        return jsonify({
            "success": False,
            "error": "Endpoint is required"
        }), 400
    
    try:
        print(f"\n[{datetime.now()}] Processing request to: {endpoint}")
        
        response = requests.request(method, endpoint, json=body)
        
        if response.status_code == 402:
            print("Received 402 Payment Required")
            
            payment_challenge_header = response.headers.get('X-Payment-Challenge')
            if not payment_challenge_header:
                return jsonify({
                    "success": False,
                    "error": "No payment challenge in 402 response"
                }), 400
            
            payment_challenge = json.loads(payment_challenge_header)
            print(f"Payment required: {payment_challenge.get('amount')} {payment_challenge.get('token')}")
            
            payment_request = vault_client.create_payment_request(
                amount=payment_challenge['amount'],
                recipient=payment_challenge['recipient'],
                resource=payment_challenge['resource'],
                token=TokenType(payment_challenge.get('token', 'SOL')),
            )
            
            payment_response = vault_client.process_payment(payment_request)
            
            if not payment_response.success:
                return jsonify({
                    "success": False,
                    "error": f"Payment failed: {payment_response.error}",
                    "payment_challenge": payment_challenge
                }), 402
            
            print(f"Payment successful: {payment_response.transaction_signature}")
            
            headers = {
                'X-Payment-Request': json.dumps(payment_request.to_dict()),
                'Content-Type': 'application/json'
            }
            
            response = requests.request(method, endpoint, json=body, headers=headers)
            
            if response.status_code == 200:
                return jsonify({
                    "success": True,
                    "response": response.json(),
                    "payment": {
                        "amount": payment_challenge['amount'],
                        "token": payment_challenge.get('token', 'SOL'),
                        "signature": payment_response.transaction_signature,
                        "status": payment_response.status.value
                    }
                })
            else:
                return jsonify({
                    "success": False,
                    "error": f"Request failed with status {response.status_code}",
                    "response": response.text
                }), response.status_code
        
        elif response.status_code == 200:
            return jsonify({
                "success": True,
                "response": response.json(),
                "payment": None
            })
        
        else:
            return jsonify({
                "success": False,
                "error": f"Request failed with status {response.status_code}",
                "response": response.text
            }), response.status_code
    
    except requests.exceptions.ConnectionError as e:
        return jsonify({
            "success": False,
            "error": f"Could not connect to {endpoint}. Is the server running?"
        }), 503
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/test', methods=['GET'])
def test_endpoint():
    """Test endpoint for development"""
    return jsonify({
        "success": True,
        "message": "x402 Gateway is running!",
        "timestamp": datetime.now().isoformat()
    })


if __name__ == '__main__':
    print("\n" + "="*60)
    print("x402 Gateway Server")
    print("="*60)
    
    vault = initialize_vault()
    
    try:
        balance = vault.get_balance()
        print(f"\nVault Balance: {balance:.4f} SOL")
        
        if balance < 0.01:
            print("\nWarning: Low vault balance!")
            print(f"Fund the vault: {vault.public_key}")
            print("Get devnet SOL: https://faucet.solana.com/")
    except Exception as e:
        print(f"\nCould not check balance: {e}")
    
    print(f"\nServer starting on http://localhost:3000")
    print("Open http://localhost:3000 in your browser")
    print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=3000, debug=True)

