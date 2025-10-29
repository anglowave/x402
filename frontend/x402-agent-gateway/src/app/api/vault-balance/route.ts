import { NextResponse } from 'next/server';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';

// USDC Mint Address on Solana Mainnet
const USDC_MINT_ADDRESS = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// Vault address
const VAULT_ADDRESS = 'Ctty13EdquEQSMUyrxBdfZnVkzAF9sgHQwdUdjUKwhBP';

export async function GET() {
  try {
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const connection = new Connection(rpcUrl, {
      commitment: 'confirmed',
      fetch: (url, options) => {
        return fetch(url, { ...options, signal: controller.signal });
      }
    });
    
    const vaultPubkey = new PublicKey(VAULT_ADDRESS);
    const usdcMint = new PublicKey(USDC_MINT_ADDRESS);
    
    // Get SOL balance
    let solAmount = 0;
    try {
      const solBalance = await connection.getBalance(vaultPubkey);
      solAmount = solBalance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.log('Error fetching SOL balance:', error);
      solAmount = 0;
    }
    
    // Get USDC balance
    let usdcAmount = 0;
    try {
      const usdcTokenAccount = await getAssociatedTokenAddress(
        usdcMint,
        vaultPubkey
      );
      
      const tokenAccountInfo = await connection.getTokenAccountBalance(usdcTokenAccount);
      usdcAmount = parseFloat(tokenAccountInfo.value.uiAmount?.toString() || '0');
    } catch (error) {
      console.log('Error fetching USDC balance:', error);
      usdcAmount = 0;
    }
    
    clearTimeout(timeoutId);
    
    return NextResponse.json({
      success: true,
      vault: VAULT_ADDRESS,
      balances: {
        sol: solAmount,
        usdc: usdcAmount
      },
      solscanUrl: `https://solscan.io/account/${VAULT_ADDRESS}`
    });
    
  } catch (error: any) {
    console.error('Error fetching vault balance:', error);
    
    // Return a graceful error response instead of 500
    return NextResponse.json(
      { 
        success: false,
        vault: VAULT_ADDRESS,
        balances: {
          sol: 0,
          usdc: 0
        },
        error: 'Unable to fetch balance',
        message: 'RPC service temporarily unavailable',
        solscanUrl: `https://solscan.io/account/${VAULT_ADDRESS}`
      },
      { status: 200 } // Return 200 instead of 500 to prevent errors in frontend
    );
  }
}

