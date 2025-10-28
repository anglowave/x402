# Setting Up Your Vault

Your vault is what pays for all the x402 requests. Here's how to set it up.

## Step 1: Get a Solana Wallet

### Option A: Create New Wallet

```bash
npm install -g @solana/web3.js
```

Then create a script to generate a keypair, or use Solana CLI:

```bash
solana-keygen new --outfile ~/my-vault.json
```

### Option B: Use Existing Wallet

If you have Phantom or another wallet, export the private key.

## Step 2: Get Your Keys

You need:
1. **Private Key** (base58 encoded)
2. **Public Key** (your wallet address)

### From Solana CLI:

```bash
# Show public key
solana-keygen pubkey ~/my-vault.json

# Show private key (base58)
cat ~/my-vault.json | python3 -c "import sys, json, base58; print(base58.b58encode(bytes(json.load(sys.stdin))).decode())"
```

### From Phantom:

1. Settings → Show Private Key
2. Copy the private key
3. Your public key is your wallet address

## Step 3: Fund Your Vault

### For Testing (Devnet):

```bash
solana airdrop 2 YOUR_PUBLIC_KEY --url devnet
```

Then get devnet USDC from a faucet.

### For Production (Mainnet):

1. Send SOL to your vault address (for transaction fees)
2. Send USDC to your vault address (for x402 payments)

Recommended starting amounts:
- **SOL**: 0.1 - 0.5 SOL (for gas fees)
- **USDC**: 100 - 1000 USDC (for payments)

## Step 4: Configure .env.local

Create `.env.local` in the gateway folder:

```env
# Your vault private key (base58 encoded)
VAULT_PRIVATE_KEY=your_private_key_here_base58_encoded

# Your vault public address
VAULT_PUBLIC_KEY=your_public_key_here

# Network (devnet for testing, mainnet for production)
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet

# Authentication (false for first week)
AUTH_ENABLED=false
JWT_SECRET=change_this_to_random_string

# Rate limiting
RATE_LIMIT_PER_HOUR=100
```

## Step 5: Test Your Vault

Run the gateway:

```bash
npm run dev
```

Check console output - you should see:
```
Vault public key: YourPublicKeyHere
Vault balance: X.XX SOL
```

## Security Best Practices

### DO:
- ✅ Keep private key in `.env.local` only
- ✅ Never commit `.env.local` to git
- ✅ Use devnet for testing first
- ✅ Monitor vault balance regularly
- ✅ Set up alerts for low balance
- ✅ Use separate wallet for vault (not your personal wallet)

### DON'T:
- ❌ Share your private key
- ❌ Commit private key to GitHub
- ❌ Use your main wallet as vault
- ❌ Leave vault with too much funds
- ❌ Skip testing on devnet

## Monitoring Your Vault

### Check Balance:

```bash
solana balance YOUR_PUBLIC_KEY
```

### Check USDC Balance:

Visit: https://solscan.io/account/YOUR_PUBLIC_KEY

### Set Up Alerts:

Monitor:
- SOL balance (for gas)
- USDC balance (for payments)
- Transaction history
- Failed transactions

## Refilling Your Vault

### From Pump.fun Token Sales:

1. Collect fees from token sales
2. Convert to USDC
3. Send to vault address
4. Gateway automatically uses new funds

### Automated Refill:

Set up a script to:
1. Check vault balance every hour
2. If below threshold (e.g., 10 USDC)
3. Alert you or auto-refill from main wallet

## Troubleshooting

### "Vault not configured" error:
- Check `.env.local` exists
- Verify private key format (base58)
- Restart the server

### "Insufficient funds" error:
- Check vault balance
- Ensure both SOL and USDC available
- Verify network (devnet vs mainnet)

### Transactions failing:
- Increase SOL for gas fees
- Check USDC token account exists
- Verify RPC endpoint is working

## Example .env.local

```env
# Devnet example (for testing)
VAULT_PRIVATE_KEY=5JDdRci6JqwnYu3nMHu8PQexYFHG9CZyH3nHZ8xvQbCXgZyWgTXqH7pvxDfxBhNXvKqHrMh2gBxS4n5nQDYGXxAU
VAULT_PUBLIC_KEY=9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
AUTH_ENABLED=false
JWT_SECRET=my-super-secret-jwt-key-change-this
RATE_LIMIT_PER_HOUR=100
```

## You're Ready!

Once you have:
- ✅ Vault keypair
- ✅ `.env.local` configured
- ✅ Vault funded
- ✅ Gateway running

You're ready to start handling AI agent x402 payments!

---

**Pro Tip**: Start with a small amount on devnet, test thoroughly, then move to mainnet with production funds.

