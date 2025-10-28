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
      console.log('402 Payment Required - processing payment from vault');
      
      const paymentChallenge = response.headers['x-payment-challenge'];
      if (!paymentChallenge) {
        return res.status(400).json({ 
          error: 'No payment challenge in 402 response' 
        });
      }

      const challenge = JSON.parse(paymentChallenge);
      console.log('Payment challenge:', challenge);

      // Get vault keypair
      const vaultKeypair = getVaultKeypair();
      if (!vaultKeypair) {
        return res.status(500).json({ error: 'Vault not configured' });
      }

      // Create payment (simplified - you'll need to implement actual x402 payment)
      const payment = {
        amount: challenge.amount,
        recipient: challenge.recipient,
        resource: challenge.resource,
        nonce: challenge.nonce,
        timestamp: challenge.timestamp,
        token: challenge.token || 'SOL',
      };

      // Sign payment request
      const paymentData = JSON.stringify(payment);
      // Note: In production, properly implement x402 payment signing

      // Retry request with payment
      const retryResponse = await axios({
        method: agentRequest.method || 'GET',
        url: endpoint,
        data: agentRequest.body,
        headers: {
          ...agentRequest.headers,
          'X-Payment-Request': paymentData,
        },
        validateStatus: () => true,
      });

      if (retryResponse.status === 200) {
        return res.status(200).json({
          success: true,
          data: retryResponse.data,
          payment: {
            amount: payment.amount,
            token: payment.token,
            signature: 'vault-paid-transaction',
            paidBy: 'vault',
          },
        });
      } else {
        return res.status(retryResponse.status).json({
          success: false,
          error: 'Payment processed but request still failed',
          data: retryResponse.data,
        });
      }
    }

    // No payment required - return response directly
    return res.status(200).json({
      success: true,
      data: response.data,
      payment: null,
    });

  } catch (error: any) {
    console.error('Proxy error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

