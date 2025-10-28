// Simple x402 test server
// Returns 402 Payment Required with proper headers

const http = require('http');

const PORT = 5001;

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  if (req.url === '/') {
    // Free endpoint
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'x402 Test Server',
      endpoints: {
        '/': 'This free endpoint',
        '/premium': 'Premium content (requires 0.001 SOL)',
        '/exclusive': 'Exclusive content (requires 0.01 SOL)'
      }
    }));
  } 
  else if (req.url === '/premium') {
    // Check for payment header
    const paymentHeader = req.headers['x-payment-request'];
    
    if (paymentHeader) {
      // Payment provided - return content
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: 'This is premium content! You paid for this.',
        timestamp: Date.now()
      }));
    } else {
      // No payment - return 402
      const challenge = {
        amount: 0.001,
        recipient: '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin',
        resource: '/premium',
        nonce: generateNonce(),
        timestamp: Math.floor(Date.now() / 1000),
        token: 'SOL'
      };
      
      res.writeHead(402, {
        'Content-Type': 'application/json',
        'X-Payment-Challenge': JSON.stringify(challenge)
      });
      res.end(JSON.stringify({
        error: 'Payment required',
        message: 'This endpoint requires 0.001 SOL',
        challenge: challenge
      }));
    }
  }
  else if (req.url === '/exclusive') {
    // Check for payment header
    const paymentHeader = req.headers['x-payment-request'];
    
    if (paymentHeader) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: 'Exclusive premium content! You paid 0.01 SOL.',
        timestamp: Date.now()
      }));
    } else {
      const challenge = {
        amount: 0.01,
        recipient: '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin',
        resource: '/exclusive',
        nonce: generateNonce(),
        timestamp: Math.floor(Date.now() / 1000),
        token: 'SOL'
      };
      
      res.writeHead(402, {
        'Content-Type': 'application/json',
        'X-Payment-Challenge': JSON.stringify(challenge)
      });
      res.end(JSON.stringify({
        error: 'Payment required',
        message: 'This endpoint requires 0.01 SOL',
        challenge: challenge
      }));
    }
  }
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

function generateNonce() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

server.listen(PORT, () => {
  console.log(`x402 Test Server running on http://localhost:${PORT}`);
  console.log('');
  console.log('Test endpoints:');
  console.log(`  http://localhost:${PORT}/          - Free`);
  console.log(`  http://localhost:${PORT}/premium   - 0.001 SOL`);
  console.log(`  http://localhost:${PORT}/exclusive - 0.01 SOL`);
  console.log('');
  console.log('Try:');
  console.log(`  curl -v http://localhost:${PORT}/premium`);
});

