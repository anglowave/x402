# x402 Agent Gateway

> AI agents can access paid x402 APIs - we pay the fees from our shared vault

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black.svg)](https://nextjs.org/)
[![Solana](https://img.shields.io/badge/Solana-Mainnet-purple.svg)](https://solana.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## What is x402 Agent Gateway?

x402 Agent Gateway is a web application that enables AI agents to access paid APIs using the x402 payment protocol. Our shared vault automatically handles all payments, so your agents can focus on their tasks without managing wallets or transaction fees.

**Live Demo**: [Coming Soon]

## Features

- ✅ **Automatic Payments** - Shared vault pays x402 API fees automatically
- ✅ **Multiple Demos** - Sora AI Video, X API Tweets, Helius Blockchain Data
- ✅ **Real-time Transactions** - All payments processed on Solana mainnet
- ✅ **Agent Trace Viewer** - See exactly how AI agents make payment decisions
- ✅ **No Wallet Needed** - Users don't need their own crypto wallet
- ✅ **USDC & SOL Support** - Pay with stablecoins or native Solana tokens

## Architecture

### Frontend (Next.js)
- **Location**: `frontend/x402-agent-gateway/`
- **Tech Stack**: Next.js 16, React 19, Tailwind CSS 4, TypeScript
- **Features**: 
  - Interactive demo interface with 3 AI agent scenarios
  - Real-time payment processing
  - Agent conversation simulator
  - Payment trace visualization

### Backend (Python Flask)
- **Location**: `gateway/`
- **Tech Stack**: Flask, Solana Web3, SPL Token
- **Features**:
  - x402 payment proxy server
  - Shared vault management
  - Transaction signing and confirmation
  - Multi-token support (SOL, USDC, USDT, etc.)

## Quick Start

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.8+ (for backend)
- Solana wallet with SOL and USDC (for vault)

### Frontend Setup

```bash
cd frontend/x402-agent-gateway
npm install
npm run dev
```

Visit `http://localhost:3000`

### Backend Setup

```bash
cd gateway
pip install -r requirements.txt
python server.py
```

Backend runs on `http://localhost:5000`

### Environment Variables

Create `.env.local` in `frontend/x402-agent-gateway/`:

```env
# Test Wallet Addresses
NEXT_PUBLIC_TEST_WALLET_1=your_wallet_1
NEXT_PUBLIC_TEST_WALLET_2=your_wallet_2
NEXT_PUBLIC_TEST_WALLET_3=your_wallet_3
NEXT_PUBLIC_TEST_WALLET_4=your_wallet_4
NEXT_PUBLIC_TEST_WALLET_5=your_wallet_5
NEXT_PUBLIC_TEST_WALLET_6=your_wallet_6
NEXT_PUBLIC_TEST_WALLET_7=your_wallet_7

# Contract Address
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address

# Vault Configuration (Backend)
VAULT_PRIVATE_KEY=your_vault_private_key_base58
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_NETWORK=mainnet-beta
```

See `env.example` for more details.

## Deployment

### Deploy to Render

We provide a complete deployment configuration for Render:

1. Push code to GitHub
2. Connect repository to Render
3. Use the `render.yaml` blueprint
4. Add environment variables
5. Deploy!

See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for detailed instructions.

### Deploy to Vercel (Frontend Only)

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
5. Shared vault automatically pays the fee
6. API processes request and returns result
7. User sees the complete trace and payment details
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

## Why Solana?

| Feature | Traditional Payments | x402 on Solana |
|---------|---------------------|----------------|
| **Speed** | Minutes to days | ~400ms |
| **Fees** | 2-3% + fixed fee | ~$0.00025 |
| **Minimum Amount** | ~$0.50 | Any amount |
| **Integration** | Complex APIs | HTTP-native |
| **Reversibility** | Chargebacks | Final |
| **Global** | Limited | Worldwide |

## Roadmap

### Current (v1.0)
- ✅ Frontend with 3 demo scenarios
- ✅ Backend payment proxy
- ✅ Shared vault system
- ✅ Real Solana mainnet transactions
- ✅ USDC and SOL support

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

## Contributing

We welcome contributions! Areas we need help:

- Additional AI service integrations
- UI/UX improvements
- Documentation
- Testing
- Bug fixes

## Security

- **Vault Security**: Private keys stored securely in environment variables
- **Transaction Signing**: All transactions signed server-side
- **Rate Limiting**: Prevents abuse of shared vault
- **Input Validation**: All user inputs validated and sanitized

## Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/anglowave/x402/issues)
- **Twitter**: [@saxorita](https://x.com/saxorita)
- **Documentation**: See `/docs` folder

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
