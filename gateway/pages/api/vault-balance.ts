import type { NextApiRequest, NextApiResponse } from 'next';
import { Connection, PublicKey } from '@solana/web3.js';

// USDC token mint address on Solana mainnet
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const vaultAddress = process.env.VAULT_PUBLIC_KEY;
  const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
  
  if (!vaultAddress) {
    return res.status(200).json({
      success: false,
      message: 'Vault not configured yet',
      balances: {
        sol: 0,
        usdc: 0
      }
    });
  }

  try {
    const connection = new Connection(rpcUrl, 'confirmed');
    const publicKey = new PublicKey(vaultAddress);

    // Get SOL balance
    const solBalanceLamports = await connection.getBalance(publicKey);
    const solBalance = solBalanceLamports / 1_000_000_000;

    // Get USDC balance (SPL token)
    let usdcBalance = 0;
    try {
      const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID }
      );

      for (const account of tokenAccounts.value) {
        const mintAddress = account.account.data.parsed.info.mint;
        if (mintAddress === USDC_MINT) {
          usdcBalance = account.account.data.parsed.info.tokenAmount.uiAmount || 0;
          break;
        }
      }
    } catch (tokenError) {
      console.log('Could not fetch USDC balance:', tokenError);
    }

    return res.status(200).json({
      success: true,
      vaultAddress,
      balances: {
        sol: solBalance,
        usdc: usdcBalance
      },
      scanUrl: `https://solscan.io/account/${vaultAddress}`
    });

  } catch (error: any) {
    console.error('Vault balance error:', error.message);
    
    return res.status(200).json({
      success: false,
      message: 'Could not fetch balance',
      balances: {
        sol: 0,
        usdc: 0
      }
    });
  }
}

