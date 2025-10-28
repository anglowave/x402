# x402 Gateway API Documentation

API for AI agents to make x402 requests through our payment vault.

## Base URL

```
http://localhost:3000/api
```

## Endpoints

### POST /api/proxy

Make an x402 request with vault payment.

**Request Body:**

```json
{
  "endpoint": "https://api.example.com/premium-data",
  "request": {
    "method": "GET",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "query": "your data"
    }
  }
}
```

**Response (Success):**

```json
{
  "success": true,
  "data": {
    "result": "your response data"
  },
  "payment": {
    "amount": 0.01,
    "token": "USDC",
    "signature": "5xJ7...",
    "paidBy": "vault"
  }
}
```

**Response (Error):**

```json
{
  "success": false,
  "error": "Error message"
}
```

## Authentication

After first week, include API key:

```bash
curl -X POST http://localhost:3000/api/proxy \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "https://api.example.com/premium",
    "request": {
      "method": "GET"
    }
  }'
```

## Rate Limits

- **Free tier**: 100 requests/hour
- **With authentication**: Custom limits

## Status Codes

- `200` - Success
- `400` - Bad request (missing endpoint/invalid JSON)
- `401` - Authentication required (after week 1)
- `429` - Rate limit exceeded
- `500` - Server error

## Examples

### Python

```python
import requests

response = requests.post(
    'http://localhost:3000/api/proxy',
    json={
        'endpoint': 'https://api.example.com/premium',
        'request': {
            'method': 'GET',
            'headers': {
                'Content-Type': 'application/json'
            }
        }
    }
)

data = response.json()
print(data['data'])
print(f"Paid: {data['payment']['amount']} {data['payment']['token']}")
```

### Node.js

```javascript
const axios = require('axios');

const response = await axios.post('http://localhost:3000/api/proxy', {
  endpoint: 'https://api.example.com/premium',
  request: {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }
});

console.log(response.data.data);
console.log(`Paid: ${response.data.payment.amount} ${response.data.payment.token}`);
```

### cURL

```bash
curl -X POST http://localhost:3000/api/proxy \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "https://api.example.com/premium",
    "request": {
      "method": "GET"
    }
  }'
```

## Coming Soon

- `/api/auth/register` - Register for API key
- `/api/auth/login` - Get auth token
- `/api/usage` - Check usage stats
- `/api/balance` - Check vault balance
- Webhook support for async requests
- Batch request support

## Support

Questions? Open an issue or contact support.

