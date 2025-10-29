# Environment Setup Guide

## Overview

This project uses environment variables for configuration. **Private keys should NEVER be committed to git.**

---

## Frontend Local Development

### File: `.env.local` (in `frontend/x402-agent-gateway/`)

This file is for **local development only** and contains **public information only**.

```env
# Test Wallet Addresses (Memory Wallets)
NEXT_PUBLIC_TEST_WALLET_1=D4s8tF4WeKmYaiQG9JZEmAQLS8RxQqjmaRsYmPRDRqFW
NEXT_PUBLIC_TEST_WALLET_2=BWFTKUYSPo3vKPAY9wSbAnH15wH4JyapTE4iA7Rs4MBV
NEXT_PUBLIC_TEST_WALLET_3=HzZvZLQMwn5F5MQEKNuCGxENENpHY35ra5E6FUrVaWVv
NEXT_PUBLIC_TEST_WALLET_4=6APdwg5KywFXbWdR8Yr25MKCRE6JtyDXtx8xb47LjSLH
NEXT_PUBLIC_TEST_WALLET_5=87pkzrFkUQrEgP8CsmMB9az2pZFJqcwRTrTkXpZALxUs
NEXT_PUBLIC_TEST_WALLET_6=3rRuZKZQUWWzMgMrFoXMq5YARqH37JoRatwHWoZs3EZR
NEXT_PUBLIC_TEST_WALLET_7=FZZqaEPxdq94P85v4bup3a4hTkma5jwMLTwxF2uBjQrw

# Contract Address
CONTRACT_ADDRESS=Coming Soon
```

**⚠️ DO NOT add `VAULT_PRIVATE_KEY` to this file!**

---

## Backend/Production Environment

### Where to add these: **Render / Vercel / Your hosting platform dashboard**

These environment variables contain **sensitive information** and should be added directly to your hosting platform:

### Required Variables:

```env
# Vault Private Key (KEEP SECRET!)
VAULT_PRIVATE_KEY=your_base58_private_key_here

# Vault Public Key (safe to share)
VAULT_PUBLIC_KEY=Ctty13EdquEQSMUyrxBdfZnVkzAF9sgHQwdUdjUKwhBP

# Solana Network Configuration
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_NETWORK=mainnet-beta
```

---

## How to Add Environment Variables on Render

1. Go to your Render dashboard
2. Select your web service
3. Click "Environment" in the left sidebar
4. Click "Add Environment Variable"
5. Add each variable:
   - Key: `VAULT_PRIVATE_KEY`
   - Value: `your_actual_base58_private_key`
6. Click "Save Changes"
7. Render will automatically redeploy with the new variables

---

## How to Add Environment Variables on Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add each variable:
   - Name: `VAULT_PRIVATE_KEY`
   - Value: `your_actual_base58_private_key`
   - Environment: Production (or all)
5. Click "Save"
6. Redeploy your project

---

## Security Checklist

- ✅ `.env.local` is in `.gitignore`
- ✅ Never commit `.env.local` to git
- ✅ Never include `VAULT_PRIVATE_KEY` in frontend code
- ✅ Private key only exists on hosting platform
- ✅ Use `env.example` as a template (no real keys)

---

## Testing Locally

For local testing with actual payments:

1. Create `.env.local` in `frontend/x402-agent-gateway/`
2. Add only the public variables (test wallets, contract address)
3. Add backend variables to your terminal session:
   ```bash
   export VAULT_PRIVATE_KEY="your_key_here"
   export SOLANA_RPC_URL="https://api.devnet.solana.com"
   export SOLANA_NETWORK="devnet"
   ```
4. Run `npm run dev`

**Note:** Use devnet for testing to avoid spending real funds!

---

## Questions?

- Frontend env vars start with `NEXT_PUBLIC_` (accessible in browser)
- Backend env vars (like `VAULT_PRIVATE_KEY`) are server-side only
- Never expose private keys to the frontend



