# Deploying x402 Agent Gateway to Render

This guide will help you deploy the x402 Agent Gateway (Next.js frontend with built-in payment API) to Render.

## Prerequisites

1. A Render account (sign up at https://render.com)
2. Your GitHub repository connected to Render
3. Environment variables ready (wallet addresses, private keys, etc.)

## Deployment Options

### Option 1: Deploy Using render.yaml (Recommended)

The `render.yaml` file in the root directory contains all the configuration.

1. **Connect Your Repository to Render**
   - Go to https://dashboard.render.com
   - Click "New" → "Blueprint"
   - Connect your GitHub repository: `anglowave/x402`
   - Render will automatically detect the `render.yaml` file

2. **Set Environment Variables**
   
   For **x402-agent-gateway**:
   ```
   NEXT_PUBLIC_TEST_WALLET_1=<wallet_address_1>
   NEXT_PUBLIC_TEST_WALLET_2=<wallet_address_2>
   NEXT_PUBLIC_TEST_WALLET_3=<wallet_address_3>
   NEXT_PUBLIC_TEST_WALLET_4=<wallet_address_4>
   NEXT_PUBLIC_TEST_WALLET_5=<wallet_address_5>
   NEXT_PUBLIC_TEST_WALLET_6=<wallet_address_6>
   NEXT_PUBLIC_TEST_WALLET_7=<wallet_address_7>
   NEXT_PUBLIC_CONTRACT_ADDRESS=<your_contract_address>
   VAULT_PRIVATE_KEY=<your_vault_private_key_base58>
   SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   SOLANA_NETWORK=mainnet-beta
   ```

3. **Deploy**
   - Click "Apply" to deploy
   - Render will build and deploy automatically

### Option 2: Deploy Manually

1. Go to https://dashboard.render.com
2. Click "New" → "Web Service"
3. Connect your repository: `anglowave/x402`
4. Configure:
   - **Name**: `x402-agent-gateway`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `frontend/x402-agent-gateway`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add Environment Variables (see above)

6. Click "Create Web Service"

## Important Notes

### Security

- **NEVER** commit `.env` files or private keys to GitHub
- Always use Render's environment variables dashboard to set sensitive data
- The `VAULT_PRIVATE_KEY` should be in base58 format

### Wallet Addresses

You need 7 test wallet addresses for the demos. These should be Solana wallet addresses that will receive payments:
- WALLET_1: Used for scam detection demo
- WALLET_2: Sora AI Video demo recipient
- WALLET_3: Reserved
- WALLET_4: X API Tweet demo recipient
- WALLET_5: Reserved
- WALLET_6: Helius API demo recipient
- WALLET_7: Reserved

### Vault Setup

The vault wallet (Ctty13EdquEQSMUyrxBdfZnVkzAF9sgHQwdUdjUKwhBP) needs:
- Sufficient SOL for transaction fees (~0.1 SOL recommended)
- USDC balance for demo payments (~50 USDC recommended)

You can fund it at: https://solscan.io/account/Ctty13EdquEQSMUyrxBdfZnVkzAF9sgHQwdUdjUKwhBP

### RPC URL

For production, consider using a dedicated RPC provider:
- **Helius**: https://helius.xyz (Recommended)
- **QuickNode**: https://quicknode.com
- **Alchemy**: https://alchemy.com

Free tier options:
- Helius: 100k requests/month free
- Public RPC: https://api.mainnet-beta.solana.com (rate limited)

### Monitoring

After deployment:
1. Check the logs in Render dashboard
2. Test the frontend at: `https://x402-agent-gateway.onrender.com`
3. Test the payment API at: `https://x402-agent-gateway.onrender.com/api/send-payment`

### Troubleshooting

**Build Fails:**
- Check that all dependencies are in `package.json`
- Verify the build command is correct
- Check Render logs for specific errors
- Make sure Tailwind CSS dependencies are in `dependencies`, not `devDependencies`

**Environment Variables Not Working:**
- Ensure they're set in Render dashboard, not in code
- For Next.js, public variables must start with `NEXT_PUBLIC_`
- Restart the service after adding new variables

**Payment Failures:**
- Verify `VAULT_PRIVATE_KEY` is correct and in base58 format
- Check vault has sufficient SOL and USDC
- Verify RPC URL is accessible
- Check Render logs for error messages

## Post-Deployment

1. **Test All Demos**: Run through all three demos (Sora AI, X API, Helius)
2. **Monitor Vault**: Keep an eye on vault balance
3. **Set Up Alerts**: Configure Render to notify you of deployment failures
4. **Custom Domain** (Optional): Add your own domain in Render settings

## Costs

- **Free Tier**: Service can run on Render's free tier
- **Limitations**: 
  - Services spin down after 15 minutes of inactivity
  - 750 hours/month free
  - Cold starts take ~30 seconds

- **Paid Plans**: 
  - Starter: $7/month (no spin down)
  - Standard: $25/month (more resources)

## Support

- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- GitHub Issues: https://github.com/anglowave/x402/issues

## Next Steps

After successful deployment:
1. Share your frontend URL with users
2. Update README.md with live demo link
3. Set up custom domain (optional)
4. Configure monitoring and alerts
5. Plan for scaling if needed
