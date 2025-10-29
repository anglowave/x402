# x402 Agent Gateway

> AI agents can access paid x402 APIs - we pay the fees from our shared vault

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black.svg)](https://nextjs.org/)
[![Solana](https://img.shields.io/badge/Solana-Mainnet-purple.svg)](https://solana.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## What is x402 Agent Gateway?

x402 Agent Gateway is a Next.js web application that enables AI agents to access paid APIs using the x402 payment protocol. Our shared vault automatically handles all payments on Solana, so agents can focus on their tasks without managing wallets or transaction fees.

**Live Demo**: [Coming Soon]

## Features

- ✅ **Automatic Payments** - Shared vault pays x402 API fees automatically
- ✅ **Multiple Demos** - Sora AI Video, X API Tweets, Helius Blockchain Data
- ✅ **Real-time Transactions** - All payments processed on Solana mainnet
- ✅ **Agent Trace Viewer** - See exactly how AI agents make payment decisions
- ✅ **No Wallet Needed** - Users don't need their own crypto wallet
- ✅ **USDC & SOL Support** - Pay with stablecoins or native Solana tokens

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Blockchain**: Solana Web3.js, SPL Token
- **Payments**: x402 Protocol, USDC, SOL
- **Deployment**: Render, Vercel

## Quick Start

### Prerequisites
- Node.js 18+
- Solana wallet with SOL and USDC (for vault)

### Installation

```bash
cd frontend/x402-agent-gateway
npm install
```

### Environment Variables

Create `.env.local` in `frontend/x402-agent-gateway/`:

```env
# Test Wallet Addresses (Demo Recipients)
NEXT_PUBLIC_TEST_WALLET_1=your_wallet_1
NEXT_PUBLIC_TEST_WALLET_2=your_wallet_2
NEXT_PUBLIC_TEST_WALLET_3=your_wallet_3
NEXT_PUBLIC_TEST_WALLET_4=your_wallet_4
NEXT_PUBLIC_TEST_WALLET_5=your_wallet_5
NEXT_PUBLIC_TEST_WALLET_6=your_wallet_6
NEXT_PUBLIC_TEST_WALLET_7=your_wallet_7

# Contract Address (Optional)
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address

# Vault Configuration (REQUIRED)
VAULT_PRIVATE_KEY=your_vault_private_key_base58
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_NETWORK=mainnet-beta
```

See `frontend/x402-agent-gateway/env.example` for more details.

### Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## Deployment

### Deploy to Render

1. Push code to GitHub
2. Connect repository to Render
3. Create a new Web Service:
   - **Name**: `x402-agent-gateway`
   - **Language**: Node
   - **Root Directory**: `frontend/x402-agent-gateway`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add environment variables (see above)
5. Deploy!

See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for detailed instructions.

### Deploy to Vercel

```bash
cd frontend/x402-agent-gateway
vercel deploy
```

## How It Works

### Payment Flow

```
1. User selects a demo (e.g., "Sora AI Video")
2. AI agent searches for the API endpoint
3. Agent checks pricing ($0.50 USDC for video generation)
4. Agent prepares x402 payment request
5. User copies the Payment Response JSON
6. User pastes it in "Make x402 Payment" form
7. Shared vault automatically pays the fee
8. Transaction confirmed on Solana
9. User sees transaction signature and Solscan link
```

### x402 Protocol

x402 is an HTTP-native payment protocol that uses the `402 Payment Required` status code:

```
Client → API: GET /generate-video
API → Client: 402 Payment Required
              X-Payment-Challenge: {"amount": 0.50, "recipient": "..."}
Client → API: GET /generate-video
              X-Payment-Request: {"signature": "...", "tx": "..."}
API → Client: 200 OK
              {"video_url": "..."}
```

## Demos

### 1. Sora AI Video Generation
- **Service**: AI video generation from text prompts
- **Cost**: $0.50 USDC per video
- **Demo**: Generate a 5-10 second 1080p video

### 2. X API Tweet Search
- **Service**: Search recent tweets from verified accounts
- **Cost**: $0.10 USDC per search
- **Demo**: Find 50 tweets about Solana

### 3. Helius API Wallet Balance
- **Service**: Query Solana wallet balances and tokens
- **Cost**: $0.05 USDC per query
- **Demo**: Check wallet SOL and USDC balance

## Vault

Our shared vault automatically pays all x402 fees:

- **Address**: `Ctty13EdquEQSMUyrxBdfZnVkzAF9sgHQwdUdjUKwhBP`
- **View on Solscan**: [https://solscan.io/account/Ctty13EdquEQSMUyrxBdfZnVkzAF9sgHQwdUdjUKwhBP](https://solscan.io/account/Ctty13EdquEQSMUyrxBdfZnVkzAF9sgHQwdUdjUKwhBP)
- **Funded by**: Token trading fees

## Architecture

### Frontend (Next.js)
- **Location**: `frontend/x402-agent-gateway/`
- **Components**:
  - Interactive demo interface with 3 AI agent scenarios
  - Real-time payment processing
  - Agent conversation simulator
  - Payment trace visualization

### Payment API (Next.js API Routes)
- **Location**: `frontend/x402-agent-gateway/src/app/api/`
- **Routes**:
  - `/api/send-payment` - Processes USDC/SOL payments from vault
  - `/api/contract` - Returns contract address
- **Features**:
  - Automatic transaction signing
  - ATA (Associated Token Account) creation
  - Transaction memos with payment details
  - Multi-token support

## Why Solana?

| Feature | Traditional Payments | x402 on Solana |
|---------|---------------------|----------------|
| **Speed** | Minutes to days | ~400ms |
| **Fees** | 2-3% + fixed fee | ~$0.00025 |
| **Minimum Amount** | ~$0.50 | Any amount |
| **Integration** | Complex APIs | HTTP-native |
| **Reversibility** | Chargebacks | Final |
| **Global** | Limited | Worldwide |

## Project Structure

```
x402/
├── frontend/
│   └── x402-agent-gateway/
│       ├── src/
│       │   ├── app/
│       │   │   ├── api/
│       │   │   │   ├── send-payment/route.ts  # Payment processing
│       │   │   │   └── contract/route.ts      # Contract info
│       │   │   ├── page.tsx                   # Main demo page
│       │   │   └── globals.css
│       │   ├── components/                    # UI components
│       │   └── config/
│       │       └── test-wallets.ts            # Wallet configuration
│       ├── public/
│       ├── package.json
│       └── env.example
├── render.yaml                                # Render deployment config
├── RENDER_DEPLOYMENT.md
└── README.md
```

## Roadmap

### Current (v1.0)
- ✅ Frontend with 3 demo scenarios
- ✅ Automated vault payment system
- ✅ Real Solana mainnet transactions
- ✅ USDC and SOL support
- ✅ Agent trace visualization

### Next (v1.1)
- [ ] More AI service demos (Claude, GPT-4, Midjourney)
- [ ] User wallet connection (optional)
- [ ] Payment history dashboard
- [ ] Custom API endpoint support
- [ ] Webhook notifications

### Future
- [ ] Multi-chain support (Ethereum, Base, Polygon)
- [ ] Subscription management
- [ ] Payment analytics
- [ ] White-label solution
- [ ] API marketplace

## Security

- **Vault Security**: Private keys stored securely in environment variables
- **Transaction Signing**: All transactions signed server-side via Next.js API routes
- **Rate Limiting**: Prevents abuse of shared vault
- **Input Validation**: All user inputs validated and sanitized
- **No Client-Side Keys**: Private keys never exposed to browser

## Contributing

We welcome contributions! Areas we need help:

- Additional AI service integrations
- UI/UX improvements
- Documentation
- Testing
- Bug fixes

## Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/anglowave/x402/issues)
- **Twitter**: [@saxorita](https://x.com/saxorita)
- **GitHub**: [anglowave/x402](https://github.com/anglowave/x402)

## Links

- [x402 Protocol Specification](https://docs.payai.network/x402/reference)
- [Solana Documentation](https://docs.solana.com/)
- [Coinbase x402](https://github.com/coinbase/x402)
- [Whitepaper](x402-whitepaper.pdf)

## License

This project is licensed under the MIT License.

## Acknowledgments

- [**Coinbase**](https://github.com/coinbase/x402) - Original x402 protocol specification
- [**Solana Foundation**](https://solana.com/) - High-performance blockchain infrastructure
- [**x402.org**](https://www.x402.org/) - x402 payment facilitator
- [**Coinbase Developer Platform**](https://cdp.coinbase.com/) - Payment infrastructure

---

**Built for the future of AI and payments**

Enable your AI agents to access the world's APIs. No wallet needed.
