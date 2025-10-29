# Quick Deploy to Render

Follow these steps to deploy your x402 Agent Gateway to Render:

## Step 1: Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

## Step 2: Sign Up / Log In to Render

Go to https://render.com and sign up or log in.

## Step 3: Deploy Using Blueprint (Easiest Method)

1. Click **"New"** → **"Blueprint"**
2. Connect your GitHub account if not already connected
3. Select the repository: **anglowave/x402**
4. Render will detect the `render.yaml` file automatically
5. Click **"Apply"**

## Step 4: Add Environment Variables

Go to the service dashboard and add these environment variables:

```
NEXT_PUBLIC_TEST_WALLET_1=<your_wallet_1>
NEXT_PUBLIC_TEST_WALLET_2=<your_wallet_2>
NEXT_PUBLIC_TEST_WALLET_3=<your_wallet_3>
NEXT_PUBLIC_TEST_WALLET_4=<your_wallet_4>
NEXT_PUBLIC_TEST_WALLET_5=<your_wallet_5>
NEXT_PUBLIC_TEST_WALLET_6=<your_wallet_6>
NEXT_PUBLIC_TEST_WALLET_7=<your_wallet_7>
NEXT_PUBLIC_CONTRACT_ADDRESS=<your_contract_address>
VAULT_PRIVATE_KEY=<your_vault_private_key_base58>
```

The RPC URL and network are already set in `render.yaml`.

## Step 5: Deploy

Click **"Deploy"** or wait for automatic deployment to complete.

## Step 6: Get Your URL

After deployment, you'll get:
- Frontend: `https://x402-agent-gateway.onrender.com`

## Step 7: Test

Visit your frontend URL and test all three demos:
1. Sora AI Video
2. X API Tweet
3. Helius API

## Important Notes

### Free Tier Limitations
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds (cold start)
- 750 hours/month free

### Vault Funding
Make sure your vault has:
- SOL for transaction fees (~0.1 SOL)
- USDC for demo payments (~50 USDC)

Fund at: https://solscan.io/account/Ctty13EdquEQSMUyrxBdfZnVkzAF9sgHQwdUdjUKwhBP

### Monitoring
- Check logs in Render dashboard
- Set up email alerts for deployment failures
- Monitor vault balance regularly

## Troubleshooting

**Build fails?**
- Check the build logs in Render dashboard
- Verify all dependencies are in package.json

**Environment variables not working?**
- Make sure they're added in Render dashboard, not in code
- Restart the service after adding variables

**Payment failures?**
- Verify VAULT_PRIVATE_KEY is correct
- Check vault has sufficient balance
- Verify RPC URL is accessible

## Need Help?

- Render Docs: https://render.com/docs
- GitHub Issues: https://github.com/anglowave/x402/issues
