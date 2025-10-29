import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, TransactionInstruction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import bs58 from 'bs58';

// USDC Mint Address on Solana Mainnet
const USDC_MINT_ADDRESS = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// Memo Program ID
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

// Maximum transaction amount
const MAX_TRANSACTION_AMOUNT = 1.0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Agent Request received:', JSON.stringify(body, null, 2));
    
    // Extract payment details
    const { recipient, amount, currency, memo, agent_id, service_name } = body;

    // Validate required fields
    if (!recipient || !amount || !currency) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields',
          message: 'Request must include: recipient (wallet address), amount (number), and currency (USDC or SOL)',
          example: {
            recipient: "SolanaWalletAddressHere",
            amount: 0.50,
            currency: "USDC",
            memo: "Optional description",
            agent_id: "optional-agent-identifier",
            service_name: "optional-service-name"
          }
        },
        { status: 400 }
      );
    }

    // Validate amount is a number
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid amount',
          message: 'Amount must be a positive number',
          received: amount
        },
        { status: 400 }
      );
    }

    // Enforce maximum transaction limit
    if (amount > MAX_TRANSACTION_AMOUNT) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Transaction amount exceeds limit',
          message: `The requested amount of ${amount} ${currency} exceeds our maximum transaction limit of $${MAX_TRANSACTION_AMOUNT}.`,
          details: {
            requested: `${amount} ${currency}`,
            maximum: `${MAX_TRANSACTION_AMOUNT} ${currency}`,
            reason: 'This limit helps protect our shared vault and ensures fair usage for all users.'
          },
          help: {
            suggestion: 'Please reduce the payment amount to $1.00 or less and try again.'
          }
        },
        { status: 400 }
      );
    }

    // Validate currency
    if (currency !== 'USDC' && currency !== 'SOL') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unsupported currency',
          message: `Currency "${currency}" is not supported. Only USDC and SOL are accepted.`,
          supported_currencies: ['USDC', 'SOL']
        },
        { status: 400 }
      );
    }

    // Validate recipient address
    try {
      new PublicKey(recipient);
    } catch (error) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid recipient address',
          message: 'The recipient must be a valid Solana wallet address',
          received: recipient
        },
        { status: 400 }
      );
    }

    // Get vault private key from environment
    const vaultPrivateKey = process.env.VAULT_PRIVATE_KEY;
    if (!vaultPrivateKey) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Vault not configured',
          message: 'Payment gateway is not properly configured. Please contact support.'
        },
        { status: 500 }
      );
    }

    // Initialize connection
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');

    // Load vault keypair
    const vaultKeypair = Keypair.fromSecretKey(bs58.decode(vaultPrivateKey));
    const recipientPubkey = new PublicKey(recipient);

    // Prepare memo data
    const memoData = JSON.stringify({
      type: 'x402_agent_payment',
      amount: amount,
      currency: currency,
      recipient: recipient,
      payer: vaultKeypair.publicKey.toBase58(),
      agent_id: agent_id || 'unknown',
      service_name: service_name || 'unknown',
      memo: memo || '',
      timestamp: new Date().toISOString(),
      gateway: 'x402-agent-gateway'
    });

    let signature: string;

    if (currency === 'SOL') {
      // Send SOL
      const transaction = new Transaction();
      
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
            vaultKeypair.publicKey,
            toTokenAccount,
            recipientPubkey,
            usdcMint,
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
          amount * 1_000_000,
          [],
          TOKEN_PROGRAM_ID
        )
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
    }

    // Return success with transaction details
    const network = process.env.SOLANA_NETWORK === 'devnet' ? 'devnet' : 'mainnet';
    const solscanUrl = `https://solscan.io/tx/${signature}${network === 'devnet' ? '?cluster=devnet' : ''}`;

    return NextResponse.json({
      success: true,
      message: 'Payment completed successfully',
      transaction: {
        signature,
        solscanUrl,
        amount,
        currency,
        recipient,
        payer: vaultKeypair.publicKey.toBase58(),
        timestamp: new Date().toISOString()
      },
      agent_info: {
        agent_id: agent_id || 'unknown',
        service_name: service_name || 'unknown'
      }
    });

  } catch (error: any) {
    console.error('Agent payment error:', error);
    
    // Check for rate limit errors
    if (error.message && (error.message.includes('429') || error.message.includes('rate limit'))) {
      return NextResponse.json(
        { 
          success: false,
          error: 'RPC rate limit exceeded',
          message: 'The Solana RPC endpoint has reached its connection rate limit. Please try again in a few moments.',
          help: {
            suggestion: 'Consider using a dedicated RPC provider for better reliability',
            resources: 'Find RPC providers and explore the Solana ecosystem at https://www.x402scan.com/ecosystem?chain=solana'
          }
        },
        { status: 429 }
      );
    }

    // Check for blockhash errors
    if (error.message && error.message.includes('blockhash')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Network connection issue',
          message: 'Unable to connect to the Solana network. The RPC service may be experiencing high traffic.',
          help: {
            suggestion: 'Try again in a moment or use a different RPC endpoint',
            resources: 'Explore RPC providers and the Solana ecosystem at https://www.x402scan.com/ecosystem?chain=solana'
          }
        },
        { status: 503 }
      );
    }

    // Generic error
    return NextResponse.json(
      { 
        success: false,
        error: 'Payment failed',
        message: error.message || 'An unexpected error occurred while processing your payment',
        help: {
          resources: 'For API providers and ecosystem tools, visit https://www.x402scan.com/ecosystem?chain=solana'
        }
      },
      { status: 500 }
    );
  }
}

