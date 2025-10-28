import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { Connection, Keypair, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } from '@solana/web3.js';
import bs58 from 'bs58';

interface AgentRequest {
  endpoint: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  apiKey?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get API key from header or body
  const apiKey = req.headers['x-api-key'] || req.body.apiKey;
  
  // Check if auth is enabled
  const authEnabled = process.env.AUTH_ENABLED === 'true';
  if (authEnabled && !apiKey) {
    return res.status(401).json({ 
      error: 'API key required',
      message: 'Get your API key by verifying your Twitter account' 
    });
  }

  const { endpoint, method = 'GET', headers = {}, body }: AgentRequest = req.body;

  if (!endpoint) {
    return res.status(400).json({ error: 'endpoint is required' });
  }

  try {
    console.log(`[${new Date().toISOString()}] Agent request to: ${endpoint}`);

    // Step 1: Make initial request
    const response = await axios({
      method,
      url: endpoint,
      data: body,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      validateStatus: () => true,
    });

    // If not 402, return response directly
    if (response.status !== 402) {
      return res.status(response.status).json({
        success: true,
        data: response.data,
        paid: false,
      });
    }

    // Step 2: 402 detected - process payment
    console.log('402 Payment Required - processing automatic payment from vault');

    const paymentChallenge = response.headers['x-payment-challenge'];
    if (!paymentChallenge) {
      return res.status(400).json({ 
        error: 'No payment challenge in 402 response',
        details: 'Server returned 402 but did not provide payment details'
      });
    }

    const challenge = JSON.parse(paymentChallenge);
    console.log('Payment challenge:', challenge);

    // Step 3: Get vault keypair
    const vaultPrivateKey = process.env.VAULT_PRIVATE_KEY;
    if (!vaultPrivateKey) {
      return res.status(500).json({ 
        error: 'Vault not configured',
        message: 'Automatic payments are not enabled yet. Please pay manually.'
      });
    }

    let vaultKeypair: Keypair;
    try {
      const privateKeyBytes = bs58.decode(vaultPrivateKey);
      vaultKeypair = Keypair.fromSecretKey(privateKeyBytes);
    } catch (error) {
      console.error('Failed to decode vault private key:', error);
      return res.status(500).json({ error: 'Invalid vault configuration' });
    }

    // Step 4: Create and send payment transaction
    const connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
      'confirmed'
    );

    const recipientPubkey = new PublicKey(challenge.recipient);
    const amountLamports = Math.floor(challenge.amount * 1_000_000_000);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: vaultKeypair.publicKey,
        toPubkey: recipientPubkey,
        lamports: amountLamports,
      })
    );

    console.log(`Sending payment: ${challenge.amount} SOL to ${challenge.recipient}`);
    
    let signature: string;
    try {
      signature = await sendAndConfirmTransaction(connection, transaction, [vaultKeypair]);
      console.log('Payment successful! TX:', signature);
    } catch (error: any) {
      console.error('Payment failed:', error);
      return res.status(500).json({ 
        error: 'Payment failed',
        details: error.message,
        challenge: challenge
      });
    }

    // Step 5: Create x402 payment proof
    const paymentProof = {
      amount: challenge.amount,
      recipient: challenge.recipient,
      resource: challenge.resource,
      nonce: challenge.nonce,
      timestamp: challenge.timestamp,
      token: challenge.token || 'SOL',
      signature: signature,
      payer: vaultKeypair.publicKey.toBase58(),
    };

    // Step 6: Retry request with payment proof
    const retryResponse = await axios({
      method,
      url: endpoint,
      data: body,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'X-Payment': JSON.stringify(paymentProof),
      },
      validateStatus: () => true,
    });

    if (retryResponse.status === 200) {
      return res.status(200).json({
        success: true,
        data: retryResponse.data,
        paid: true,
        payment: {
          amount: challenge.amount,
          token: challenge.token || 'SOL',
          signature: signature,
          paidBy: 'vault',
        },
      });
    } else {
      return res.status(retryResponse.status).json({
        success: false,
        error: 'Payment processed but request still failed',
        data: retryResponse.data,
        payment: {
          amount: challenge.amount,
          token: challenge.token || 'SOL',
          signature: signature,
          paidBy: 'vault',
        },
      });
    }

  } catch (error: any) {
    console.error('Agent request error:', error);
    
    let errorMessage = 'Internal server error';
    if (error.code === 'ECONNREFUSED') {
      errorMessage = `Cannot connect to ${endpoint}. Server may be down.`;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
}

