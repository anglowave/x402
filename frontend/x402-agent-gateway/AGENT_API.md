# x402 Agent Gateway API Documentation

## Direct Agent Payment API

This API allows AI agents to request USDC or SOL payments directly from our shared vault without manual intervention.

### Endpoint

```
POST /api/agent-request
```

### Base URL

- Production: `https://x402gateway.site/api/agent-request`
- Local Development: `http://localhost:3000/api/agent-request`

### Request Format

#### Headers
```
Content-Type: application/json
```

#### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `recipient` | string | Yes | Solana wallet address to receive payment |
| `amount` | number | Yes | Payment amount (max $1.00) |
| `currency` | string | Yes | Payment currency: "USDC" or "SOL" |
| `memo` | string | No | Optional description of the payment |
| `agent_id` | string | No | Optional identifier for your agent |
| `service_name` | string | No | Optional name of the service being paid for |

#### Example Request

```json
{
  "recipient": "BWFTKUYSPo3vKPAY9wSbAnH15wH4JyapTE4iA7Rs4MBV",
  "amount": 0.50,
  "currency": "USDC",
  "memo": "Payment for AI video generation",
  "agent_id": "my-ai-agent-v1",
  "service_name": "Sora AI Video Generation"
}
```

### Response Format

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Payment completed successfully",
  "transaction": {
    "signature": "5j7s...",
    "solscanUrl": "https://solscan.io/tx/5j7s...",
    "amount": 0.50,
    "currency": "USDC",
    "recipient": "BWFTKUYSPo3vKPAY9wSbAnH15wH4JyapTE4iA7Rs4MBV",
    "payer": "Ctty13EdquEQSMUyrxBdfZnVkzAF9sgHQwdUdjUKwhBP",
    "timestamp": "2025-10-29T12:34:56.789Z"
  },
  "agent_info": {
    "agent_id": "my-ai-agent-v1",
    "service_name": "Sora AI Video Generation"
  }
}
```

#### Error Response (400/429/500)

```json
{
  "success": false,
  "error": "Transaction amount exceeds limit",
  "message": "The requested amount of 1.5 USDC exceeds our maximum transaction limit of $1.",
  "details": {
    "requested": "1.5 USDC",
    "maximum": "1.0 USDC",
    "reason": "This limit helps protect our shared vault and ensures fair usage for all users."
  },
  "help": {
    "suggestion": "Please reduce the payment amount to $1.00 or less and try again."
  }
}
```

### Error Codes

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | Missing required fields | Request is missing recipient, amount, or currency |
| 400 | Invalid amount | Amount is not a positive number |
| 400 | Transaction amount exceeds limit | Amount is greater than $1.00 |
| 400 | Unsupported currency | Currency is not USDC or SOL |
| 400 | Invalid recipient address | Recipient is not a valid Solana address |
| 429 | RPC rate limit exceeded | Too many requests to Solana RPC |
| 500 | Payment failed | Unexpected error during payment processing |
| 503 | Network connection issue | Unable to connect to Solana network |

### Usage Examples

#### Python Example

```python
import requests

def request_payment(recipient, amount, currency, memo=None):
    url = "https://x402gateway.site/api/agent-request"
    
    payload = {
        "recipient": recipient,
        "amount": amount,
        "currency": currency,
        "memo": memo,
        "agent_id": "my-python-agent",
        "service_name": "AI Service"
    }
    
    response = requests.post(url, json=payload)
    return response.json()

# Make a payment request
result = request_payment(
    recipient="BWFTKUYSPo3vKPAY9wSbAnH15wH4JyapTE4iA7Rs4MBV",
    amount=0.50,
    currency="USDC",
    memo="Payment for AI service"
)

if result.get("success"):
    print(f"Payment successful! Transaction: {result['transaction']['signature']}")
    print(f"View on Solscan: {result['transaction']['solscanUrl']}")
else:
    print(f"Payment failed: {result.get('message')}")
```

#### JavaScript/Node.js Example

```javascript
async function requestPayment(recipient, amount, currency, memo = null) {
  const url = "https://x402gateway.site/api/agent-request";
  
  const payload = {
    recipient,
    amount,
    currency,
    memo,
    agent_id: "my-js-agent",
    service_name: "AI Service"
  };
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
}

// Make a payment request
const result = await requestPayment(
  "BWFTKUYSPo3vKPAY9wSbAnH15wH4JyapTE4iA7Rs4MBV",
  0.50,
  "USDC",
  "Payment for AI service"
);

if (result.success) {
  console.log(`Payment successful! Transaction: ${result.transaction.signature}`);
  console.log(`View on Solscan: ${result.transaction.solscanUrl}`);
} else {
  console.log(`Payment failed: ${result.message}`);
}
```

#### cURL Example

```bash
curl -X POST https://x402gateway.site/api/agent-request \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": "BWFTKUYSPo3vKPAY9wSbAnH15wH4JyapTE4iA7Rs4MBV",
    "amount": 0.50,
    "currency": "USDC",
    "memo": "Payment for AI service",
    "agent_id": "curl-test",
    "service_name": "Test Service"
  }'
```

### Rate Limits

- Maximum transaction amount: **$1.00 per request**
- The API inherits rate limits from the Solana RPC endpoint
- If you encounter rate limit errors, wait a few moments before retrying

### Best Practices

1. **Always validate amounts** - Ensure amounts are positive numbers ≤ $1.00
2. **Handle errors gracefully** - Check the `success` field in responses
3. **Include descriptive memos** - Help track what payments are for
4. **Use agent_id** - Makes it easier to track which agent made requests
5. **Retry on 429 errors** - Implement exponential backoff for rate limits
6. **Store transaction signatures** - Keep records of successful payments

### Security Notes

- This API is designed for AI agents to make small micropayments
- The $1.00 limit protects the shared vault from abuse
- All transactions are recorded on the Solana blockchain
- Transaction memos are public and visible on-chain

### Support

For issues or questions:
- GitHub: https://github.com/anglowave/x402
- Explore Solana ecosystem: https://www.x402scan.com/ecosystem?chain=solana

