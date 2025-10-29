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
    const connection = new Connection(rpcUrl, 'confirmed');
    
    const vaultPubkey = new PublicKey(VAULT_ADDRESS);
    const usdcMint = new PublicKey(USDC_MINT_ADDRESS);
    
    // Get SOL balance
    const solBalance = await connection.getBalance(vaultPubkey);
    const solAmount = solBalance / LAMPORTS_PER_SOL;
    
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
      console.log('USDC account not found or error fetching balance:', error);
      usdcAmount = 0;
    }
    
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
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch vault balance',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

