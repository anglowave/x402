import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { Connection, Keypair, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } from '@solana/web3.js';
import bs58 from 'bs58';

// In-memory usage tracking (replace with database later)
const usageTracking: Record<string, number> = {};

// Vault configuration
const getVaultKeypair = (): Keypair | null => {
  const privateKey = process.env.VAULT_PRIVATE_KEY;
  if (!privateKey) {
    console.error('VAULT_PRIVATE_KEY not set');
    return null;
  }
  
  try {
    return Keypair.fromSecretKey(bs58.decode(privateKey));
  } catch (error) {
    console.error('Invalid vault private key');
    return null;
  }
};

const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { endpoint, request: agentRequest } = req.body;

  if (!endpoint) {
    return res.status(400).json({ error: 'Endpoint is required' });
  }

  // Check authentication (disabled for first week)
  const authEnabled = process.env.AUTH_ENABLED === 'true';
  if (authEnabled) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    // Add JWT verification here
  }

  // Rate limiting check
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const hourKey = `${clientIp}-${new Date().getHours()}`;
  usageTracking[hourKey] = (usageTracking[hourKey] || 0) + 1;
  
  const rateLimit = parseInt(process.env.RATE_LIMIT_PER_HOUR || '100');
  if (usageTracking[hourKey] > rateLimit) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded',
      message: `Maximum ${rateLimit} requests per hour`
    });
  }

  try {
    console.log(`[${new Date().toISOString()}] Processing request to: ${endpoint}`);

    // Make initial request
    const response = await axios({
      method: agentRequest.method || 'GET',
      url: endpoint,
      data: agentRequest.body,
      headers: agentRequest.headers || {},
      validateStatus: () => true, // Don't throw on any status
    });

    // Check if 402 Payment Required
    if (response.status === 402) {
      console.log('402 Payment Required - returning payment details to user');
      
      const paymentChallenge = response.headers['x-payment-challenge'];
      if (!paymentChallenge) {
        return res.status(400).json({ 
          error: 'No payment challenge in 402 response' 
        });
      }

      const challenge = JSON.parse(paymentChallenge);
      console.log('Payment challenge:', challenge);

      // Return payment details to user so they can pay manually
      return res.status(200).json({
        success: false,
        paymentRequired: true,
        challenge: {
          amount: challenge.amount,
          recipient: challenge.recipient,
          resource: challenge.resource,
          nonce: challenge.nonce,
          timestamp: challenge.timestamp,
          token: challenge.token || 'SOL',
        },
        data: response.data,
        message: 'Payment required. Copy the recipient address and pay manually, or configure vault for automatic payments.',
      });
    }

    // No payment required - return response directly
    return res.status(200).json({
      success: true,
      data: response.data,
      payment: null,
    });

  } catch (error: any) {
    console.error('Proxy error:', error);
    
    let errorMessage = 'Internal server error';
    if (error.code === 'ECONNREFUSED') {
      errorMessage = `Cannot connect to ${endpoint}. Make sure the server is running.`;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
}

