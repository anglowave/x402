# Agent API Quick Start

Get started with the x402 Agent Gateway API in 5 minutes.

## What You Get

- AI agents can access x402-protected APIs
- No wallet setup required
- Automatic payment from shared vault
- Simple REST API

## Prerequisites

1. Gateway server running (http://localhost:3000)
2. Test x402 server running (optional, for testing)

## Step 1: Start the Gateway

```bash
cd gateway
npm install
npm run dev
```

Gateway will be available at http://localhost:3000

## Step 2: (Optional) Start Test Server

For testing, run the included x402 test server:

```bash
node test-x402-server.js
```

This creates test endpoints at:
- http://localhost:5001/premium (costs 0.001 SOL)
- http://localhost:5001/exclusive (costs 0.01 SOL)

## Step 3: Make Your First Request

### Using cURL

```bash
curl -X POST http://localhost:3000/api/agent-request \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "http://localhost:5001/premium",
    "method": "GET"
  }'
```

### Using Python

```python
import requests

response = requests.post(
    "http://localhost:3000/api/agent-request",
    json={
        "endpoint": "http://localhost:5001/premium",
        "method": "GET"
    }
)

data = response.json()
print(data)
```

### Using JavaScript/Node.js

```javascript
const response = await fetch('http://localhost:3000/api/agent-request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint: 'http://localhost:5001/premium',
    method: 'GET',
  }),
});

const data = await response.json();
console.log(data);
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "success": true,
    "data": "This is premium content!",
    "timestamp": 1234567890
  },
  "paid": true,
  "payment": {
    "amount": 0.001,
    "token": "SOL",
    "signature": "5j7s8k9l...",
    "paidBy": "vault"
  }
}
```

**Fields:**
- `success`: Request succeeded
- `data`: Response from the x402-protected endpoint
- `paid`: Whether payment was made
- `payment`: Payment details (if paid was true)

### Error Response

```json
{
  "success": false,
  "error": "Error description"
}
```

## Testing Examples

Run the included examples:

### JavaScript
```bash
node examples/agent-example.js
```

### Python
```bash
python examples/agent-example.py
```

### Test Script
```bash
node test-agent-api.js
```

## Configuration

The gateway needs a vault private key for automatic payments:

```bash
# Copy env.example to .env.local
cp env.example .env.local

# Edit .env.local
VAULT_PRIVATE_KEY=your_base58_private_key_here
VAULT_PUBLIC_KEY=your_public_key_here
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

**Note:** Without `VAULT_PRIVATE_KEY`, the gateway will return payment details but won't auto-pay.

## What Happens Behind the Scenes

1. **Agent → Gateway**: POST to `/api/agent-request`
2. **Gateway → x402 API**: Forward the request
3. **x402 API → Gateway**: 402 Payment Required + challenge
4. **Gateway → Solana**: Create and send payment transaction
5. **Gateway → x402 API**: Retry with payment proof
6. **x402 API → Gateway**: 200 OK + data
7. **Gateway → Agent**: Return data + payment details

All in one API call!

## Rate Limits

- **Week 1**: 100 requests/hour per IP (no auth)
- **After Week 1**: API key required (Twitter verification)
- **Token Holders**: Higher limits (coming soon)

## Error Handling

```javascript
const result = await fetchX402Data(endpoint);

if (!result.success) {
  if (result.error.includes('Cannot connect')) {
    // Target endpoint is down
  } else if (result.error.includes('Payment failed')) {
    // Payment transaction failed
  } else if (result.error === 'Vault not configured') {
    // Private key not set
  }
}
```

## Production Use

When deploying for production agents:

1. **Use mainnet RPC**: Update `SOLANA_RPC_URL` in `.env.local`
2. **Fund the vault**: Send USDC/SOL to your vault address
3. **Get API key**: After week 1, get verified via Twitter
4. **Monitor usage**: Check vault balance regularly
5. **Set rate limits**: Configure per your needs

## Next Steps

- Read full [API Documentation](./AGENT_API.md)
- Check [Examples](./examples/)
- Join the community on GitHub
- Launch your pump.fun token (coming soon!)

## Support

- Issues: https://github.com/anglowave/x402/issues
- Docs: See AGENT_API.md

## Security

- Never commit your private key
- Use `.env.local` (gitignored)
- Monitor transactions on Solscan
- Set reasonable rate limits

