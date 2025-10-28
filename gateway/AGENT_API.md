# x402 Agent Gateway API

## Auto-Pay API for AI Agents

This API allows AI agents to access x402-protected endpoints without setting up their own wallet. Our vault automatically pays the x402 fees.

## Endpoint

```
POST /api/agent-request
```

## Authentication

**Week 1:** No authentication required (open access)

**After Week 1:** Requires API key via Twitter verification
```bash
X-API-Key: your_api_key_here
```

## Request Format

```json
{
  "endpoint": "https://api.example.com/premium-data",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer your_token"
  },
  "body": {
    "query": "your data"
  }
}
```

### Parameters

- `endpoint` (required): The x402-protected API endpoint
- `method` (optional): HTTP method (default: "GET")
- `headers` (optional): Additional headers to send
- `body` (optional): Request body for POST/PUT requests
- `apiKey` (optional): Your API key (can also use X-API-Key header)

## Response Format

### Success (No Payment Required)

```json
{
  "success": true,
  "data": { ... },
  "paid": false
}
```

### Success (Payment Made)

```json
{
  "success": true,
  "data": { ... },
  "paid": true,
  "payment": {
    "amount": 0.001,
    "token": "SOL",
    "signature": "5j7s...",
    "paidBy": "vault"
  }
}
```

### Error

```json
{
  "success": false,
  "error": "Error description"
}
```

## Example Usage

### cURL

```bash
curl -X POST http://localhost:3000/api/agent-request \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "http://localhost:5001/premium",
    "method": "GET"
  }'
```

### Python

```python
import requests

response = requests.post(
    "http://localhost:3000/api/agent-request",
    json={
        "endpoint": "https://api.example.com/premium-data",
        "method": "GET",
        "headers": {
            "Authorization": "Bearer token"
        }
    }
)

data = response.json()
if data.get("success"):
    print("Data:", data["data"])
    if data.get("paid"):
        print(f"Paid {data['payment']['amount']} {data['payment']['token']}")
```

### JavaScript

```javascript
const response = await fetch('/api/agent-request', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    endpoint: 'https://api.example.com/premium-data',
    method: 'GET',
  }),
});

const data = await response.json();
if (data.success) {
  console.log('Data:', data.data);
  if (data.paid) {
    console.log(`Paid ${data.payment.amount} ${data.payment.token}`);
  }
}
```

### TypeScript (Agent SDK Example)

```typescript
interface AgentRequest {
  endpoint: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

async function fetchX402Data(request: AgentRequest) {
  const response = await fetch('/api/agent-request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.GATEWAY_API_KEY,
    },
    body: JSON.stringify(request),
  });

  return response.json();
}

// Usage
const result = await fetchX402Data({
  endpoint: 'https://api.example.com/premium-data',
  method: 'GET',
});

console.log(result.data);
```

## Rate Limits

- **Week 1:** 100 requests/hour per IP
- **After Week 1:** Varies by verification status
- **Token Holders:** Higher limits (coming soon)

## Error Codes

- `400` - Bad request (missing endpoint)
- `401` - Unauthorized (API key required after week 1)
- `405` - Method not allowed (use POST)
- `500` - Server error or payment failed
- `503` - Target endpoint unavailable

## How It Works

1. **Agent sends request** to `/api/agent-request`
2. **Gateway proxies** to the target x402 endpoint
3. **If 402 detected**, gateway automatically:
   - Reads payment challenge
   - Creates Solana transaction
   - Sends payment from vault
   - Retries request with payment proof
4. **Returns data** to agent with payment details

## Testing

Start the test x402 server:

```bash
cd gateway
node test-x402-server.js
```

Then test the agent API:

```bash
curl -X POST http://localhost:3000/api/agent-request \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "http://localhost:5001/premium",
    "method": "GET"
  }'
```

## Security Notes

- Vault private key is stored securely in environment variables
- All transactions are logged for transparency
- Rate limiting prevents abuse
- API keys required after week 1 launch

## Support

- GitHub: https://github.com/anglowave/x402
- Issues: https://github.com/anglowave/x402/issues

## Coming Soon

- API key dashboard
- Usage analytics
- Multiple payment tokens (USDC, USDT)
- Webhook notifications
- Token holder benefits

