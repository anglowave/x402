import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, TransactionInstruction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import bs58 from 'bs58';

// USDC Mint Address on Solana Mainnet
const USDC_MINT_ADDRESS = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// Memo Program ID
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Received body:', JSON.stringify(body, null, 2));
    
    // Try to extract payment info
    let recipient: string;
    let amount: number;
    let currency: string;
    
    if (body.payment_summary) {
      // Extract from payment_summary (easiest format)
      console.log('Detected payment_summary format');
      recipient = body.payment_summary.recipient;
      amount = body.payment_summary.amount;
      currency = body.payment_summary.currency;
    } else if (body.settlementResponse && body.serviceResponse) {
      // x402 Payment Response format
      console.log('Detected x402 format');
      recipient = body.settlementResponse.recipient;
      
      // Extract amount from serviceResponse.price (e.g., "$0.50")
      const priceStr = body.serviceResponse.price;
      if (priceStr && typeof priceStr === 'string') {
        amount = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
      } else {
        amount = body.amount || 0;
      }
      
      // Default to USDC for x402 payments
      currency = body.currency || 'USDC';
    } else {
      // Simple format
      console.log('Detected simple format');
      recipient = body.recipient;
      amount = body.amount;
      currency = body.currency;
    }

    if (!recipient || !amount || !currency) {
      console.log('Extraction failed:', { recipient, amount, currency, body });
      return NextResponse.json(
        { 
          error: 'Invalid request JSON. Must include: recipient, amount, currency',
          hint: 'Use either {recipient, amount, currency} or x402 Payment Response format',
          example: {
            recipient: "SolanaWalletAddressHere",
            amount: 0.1,
            currency: "USDC"
          }
        },
        { status: 400 }
      );
    }

    // Get vault private key from environment
    const vaultPrivateKey = process.env.VAULT_PRIVATE_KEY;
    if (!vaultPrivateKey) {
      return NextResponse.json(
        { error: 'Vault private key not configured' },
        { status: 500 }
      );
    }

    // Initialize connection
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');

    // Load vault keypair
    const vaultKeypair = Keypair.fromSecretKey(bs58.decode(vaultPrivateKey));
    const recipientPubkey = new PublicKey(recipient);

    // Prepare memo data (same for both SOL and USDC)
    let memoData: string;
    if (body.settlementResponse && body.serviceResponse) {
      // Include full x402 response in memo
      memoData = JSON.stringify({
        type: 'x402_payment',
        x402_response: body,
        extracted: {
          amount: amount,
          currency: currency,
          recipient: recipient,
          payer: vaultKeypair.publicKey.toBase58()
        },
        timestamp: new Date().toISOString(),
        service: 'x402-agent-gateway'
      });
    } else {
      // Simple payment memo
      memoData = JSON.stringify({
        type: 'x402_payment',
        amount: amount,
        currency: currency,
        recipient: recipient,
        payer: vaultKeypair.publicKey.toBase58(),
        timestamp: new Date().toISOString(),
        service: 'x402-agent-gateway'
      });
    }

    let signature: string;

    if (currency === 'SOL') {
      // Send SOL
      const transaction = new Transaction();
      
      // Add transfer instruction
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: vaultKeypair.publicKey,
          toPubkey: recipientPubkey,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      // Add memo
      
      transaction.add(
        new TransactionInstruction({
          keys: [],
          programId: MEMO_PROGRAM_ID,
          data: Buffer.from(memoData, 'utf-8'),
        })
      );

      transaction.feePayer = vaultKeypair.publicKey;
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      signature = await connection.sendTransaction(transaction, [vaultKeypair]);
      await connection.confirmTransaction(signature, 'confirmed');

    } else if (currency === 'USDC') {
      // Send USDC (SPL Token)
      const usdcMint = new PublicKey(USDC_MINT_ADDRESS);
      
      // Get token accounts
      const fromTokenAccount = await getAssociatedTokenAddress(
        usdcMint,
        vaultKeypair.publicKey
      );
      
      const toTokenAccount = await getAssociatedTokenAddress(
        usdcMint,
        recipientPubkey
      );

      // Check if recipient's token account exists
      const toAccountInfo = await connection.getAccountInfo(toTokenAccount);
      
      const transaction = new Transaction();
      
      // If recipient doesn't have a USDC account, create it
      if (!toAccountInfo) {
        console.log('Creating USDC token account for recipient...');
        transaction.add(
          createAssociatedTokenAccountInstruction(
            vaultKeypair.publicKey, // payer
            toTokenAccount, // associated token account
            recipientPubkey, // owner
            usdcMint, // mint
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }

      // Add transfer instruction (USDC has 6 decimals)
      transaction.add(
        createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          vaultKeypair.publicKey,
          amount * 1_000_000, // Convert to micro-USDC
          [],
          TOKEN_PROGRAM_ID
        )
      );

      // Add memo (already prepared above)
      transaction.add(
        new TransactionInstruction({
          keys: [],
          programId: MEMO_PROGRAM_ID,
          data: Buffer.from(memoData, 'utf-8'),
        })
      );

      transaction.feePayer = vaultKeypair.publicKey;
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      signature = await connection.sendTransaction(transaction, [vaultKeypair]);
      await connection.confirmTransaction(signature, 'confirmed');

    } else {
      return NextResponse.json(
        { error: `Unsupported currency: ${currency}` },
        { status: 400 }
      );
    }

    // Return success with Solscan link
    const network = process.env.SOLANA_NETWORK === 'devnet' ? 'devnet' : 'mainnet';
    const solscanUrl = `https://solscan.io/tx/${signature}${network === 'devnet' ? '?cluster=devnet' : ''}`;

    return NextResponse.json({
      success: true,
      signature,
      solscanUrl,
      payer: vaultKeypair.publicKey.toBase58(),
      recipient,
      amount,
      currency,
    });

  } catch (error: any) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Payment failed' 
      },
      { status: 500 }
    );
  }
}

