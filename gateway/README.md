# x402 Agent Gateway

AI Agent payment proxy - paste your x402 requests, we pay with our vault.

## Features

- AI agents can make x402 requests without their own wallets
- Shared vault pays all fees (funded by token trading fees)
- **Agent API** - Direct API endpoint for automated agents
- Usage tracking and rate limiting
- Authentication system (disabled for first week)
- Beautiful web interface
- Real-time vault balance display

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure vault

Copy `env.example` to `.env.local`:

```bash
cp env.example .env.local
```

Edit `.env.local` and add your vault credentials:

```
VAULT_PRIVATE_KEY=your_base58_private_key
VAULT_PUBLIC_KEY=your_public_key
SOLANA_RPC_URL=https://api.devnet.solana.com
AUTH_ENABLED=false
```

### 3. Run development server

```bash
npm run dev
```

Open http://localhost:3000

## Usage

### Web Interface

1. Open http://localhost:3000
2. Paste your x402 API endpoint
3. Add request JSON
4. Click "Send Request" - vault pays automatically!

### Agent API (For Automated Agents)

Direct API endpoint for AI agents to call programmatically:

```bash
curl -X POST http://localhost:3000/api/agent-request \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "http://localhost:5001/premium",
    "method": "GET"
  }'
```

**Full Agent API Documentation:** See [AGENT_API.md](./AGENT_API.md)

## How It Works

1. User pastes their AI agent's x402 request JSON
2. Gateway receives the request
3. If endpoint returns 402 Payment Required:
   - Gateway reads payment challenge
   - Vault pays the fee in USDC
   - Request retries with payment
4. Response returned to user

## Usage Example

### Web Interface

1. Go to http://localhost:3000
2. Enter API endpoint: `http://api.example.com/premium`
3. Paste request JSON:
```json
{
  "method": "GET",
  "headers": {
    "Content-Type": "application/json"
  }
}
```
4. Click "Send Request (Our Vault Pays)"
5. Get response with payment details

### API (Coming Soon)

```bash
curl -X POST http://localhost:3000/api/proxy \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "http://api.example.com/premium",
    "request": {
      "method": "GET"
    }
  }'
```

## Authentication

After the first week, set `AUTH_ENABLED=true` in `.env.local`

Users will need to authenticate before making requests.

## Rate Limiting

Default: 100 requests per hour per IP

Adjust in `.env.local`:
```
RATE_LIMIT_PER_HOUR=100
```

## Deploy

```bash
npm run build
npm start
```

Or deploy to Vercel:

```bash
vercel
```

## Coming Soon

- API keys for automated agents
- Usage dashboard
- Token-based access
- Analytics and monitoring
- Multiple vault support
- Custom rate limits per user

## Development

Built with:
- Next.js 14
- TypeScript
- Solana Web3.js
- React

## Support

Issues? Create an issue or reach out.

---

**Free for first week - then authentication required**

