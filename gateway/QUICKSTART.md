# Quick Start - Get Running in 2 Minutes

## Step 1: Configure Your Vault

Create `.env.local`:

```bash
cp env.example .env.local
```

Edit `.env.local` and add your Solana wallet:

```env
VAULT_PRIVATE_KEY=your_base58_encoded_private_key
VAULT_PUBLIC_KEY=your_solana_public_key
SOLANA_RPC_URL=https://api.devnet.solana.com
AUTH_ENABLED=false
RATE_LIMIT_PER_HOUR=100
```

## Step 2: Start the Gateway

### Windows:
```bash
start.bat
```

### Mac/Linux:
```bash
chmod +x start.sh
./start.sh
```

### Or manually:
```bash
npm run dev
```

## Step 3: Open in Browser

Go to: http://localhost:3000

## Step 4: Test It

### Example 1: Test Endpoint

1. Enter endpoint: `https://jsonplaceholder.typicode.com/posts/1`
2. Leave JSON as default GET request
3. Click "Send Request"
4. See the response!

### Example 2: x402 Protected Endpoint

1. Enter your x402 endpoint
2. Paste agent request JSON
3. Gateway vault pays automatically
4. Get response with payment details!

## That's It!

Your gateway is now running and ready to handle AI agent x402 requests.

## What's Next?

- Deploy to production (Vercel recommended)
- Share with AI developers
- Monitor usage
- After week 1: Enable authentication

## Troubleshooting

**Can't start?**
- Make sure Node.js is installed: `node --version`
- Run `npm install` if dependencies missing

**Vault errors?**
- Check your private key format (base58)
- Ensure vault has USDC balance
- Try devnet first for testing

**Port 3000 in use?**
- Change in `package.json`: `"dev": "next dev -p 3001"`

## Need Help?

Check:
- `README.md` - Full setup guide
- `API_DOCS.md` - API documentation
- `OVERVIEW.md` - Architecture details

---

**Happy building!**

