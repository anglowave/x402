# x402 Agent Gateway - Overview

## What You Built

A payment proxy service where AI agents can make x402 requests and YOUR vault pays the fees.

## Architecture

```
AI Agent → Gateway Website → Paste JSON Request
                ↓
        Gateway Backend (Next.js API)
                ↓
        Detects 402 Payment Required
                ↓
        Your Vault Pays USDC Fee
                ↓
        Response Returned to Agent
```

## Key Features

### 1. Web Interface (`pages/index.tsx`)
- Beautiful UI for pasting agent requests
- Shows payment details
- Real-time response display

### 2. Payment Proxy API (`pages/api/proxy.ts`)
- Handles x402 payment flow
- Uses YOUR vault to pay fees
- Rate limiting (100/hour)
- Usage tracking

### 3. Authentication (Disabled for Week 1)
- Set `AUTH_ENABLED=true` after week 1
- Prevents abuse
- Tracks per-user usage

### 4. Rate Limiting
- 100 requests/hour per IP (free tier)
- Configurable limits
- In-memory tracking (upgrade to DB later)

## Setup Instructions

### 1. Install

```bash
cd gateway
npm install
```

### 2. Configure Vault

Copy `env.example` to `.env.local`:

```env
VAULT_PRIVATE_KEY=your_base58_private_key
VAULT_PUBLIC_KEY=your_solana_public_key
SOLANA_RPC_URL=https://api.devnet.solana.com
AUTH_ENABLED=false
RATE_LIMIT_PER_HOUR=100
```

### 3. Run

```bash
npm run dev
```

Open http://localhost:3000

## How to Use

### Web Interface

1. Go to http://localhost:3000
2. Enter x402 API endpoint
3. Paste agent request JSON
4. Click send - vault pays automatically
5. Get response with payment details

### API (For Agents)

```bash
curl -X POST http://localhost:3000/api/proxy \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "http://api.example.com/premium",
    "request": {"method": "GET"}
  }'
```

## Next Steps

### Week 1 (Free Access)
- [ ] Deploy to production
- [ ] Add your vault private key
- [ ] Share with AI agent developers
- [ ] Monitor usage

### After Week 1
- [ ] Enable authentication (`AUTH_ENABLED=true`)
- [ ] Launch pump.fun token
- [ ] Integrate token for access
- [ ] Add usage dashboard

### Future Features
- [ ] User dashboard
- [ ] API keys system
- [ ] Usage analytics
- [ ] Multiple vault support
- [ ] Webhook notifications
- [ ] Batch requests

## File Structure

```
gateway/
├── pages/
│   ├── index.tsx           # Main web interface
│   ├── api/
│   │   └── proxy.ts        # Payment proxy API
│   └── _app.tsx
├── styles/
│   ├── Home.module.css     # Page styles
│   └── globals.css
├── package.json
├── tsconfig.json
├── env.example             # Environment template
├── README.md               # Setup guide
├── API_DOCS.md            # API documentation
└── OVERVIEW.md            # This file
```

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Next.js API Routes
- **Blockchain**: Solana Web3.js
- **Payments**: x402 protocol + your USDC vault

## Monetization Ideas

1. **Token Access** - Hold X tokens to use gateway
2. **Pay-per-use** - Small fee per request
3. **Subscription** - Monthly plans
4. **Volume discounts** - Bulk request packages
5. **Premium features** - Higher rate limits, priority

## Your Vault Setup

Your vault will:
1. Hold USDC for x402 payments
2. Automatically pay fees when agents make requests
3. Track all transactions
4. You convert pump.fun token fees → USDC → vault

## Security Notes

- Vault private key in `.env.local` (NEVER commit)
- Rate limiting prevents abuse
- Enable auth after week 1
- Monitor vault balance
- Use devnet for testing

## Deploy

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard.

### Self-hosted

```bash
npm run build
npm start
```

---

**You're ready to launch! Just add your vault key and run it!**
