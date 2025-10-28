/**
 * Example: AI Agent using x402 Gateway API (JavaScript)
 * 
 * This shows how an AI agent can access x402-protected APIs
 * without managing its own wallet. The gateway vault pays automatically.
 */

const GATEWAY_URL = 'http://localhost:3000/api/agent-request';
const API_KEY = null; // Not required in week 1

/**
 * Fetch data from an x402-protected endpoint
 * The gateway automatically pays the x402 fee from its vault
 */
async function fetchX402Data(endpoint, options = {}) {
  const { method = 'GET', headers = {}, body = null } = options;
  
  const payload = {
    endpoint,
    method,
  };
  
  if (Object.keys(headers).length > 0) {
    payload.headers = headers;
  }
  if (body) {
    payload.body = body;
  }
  
  const requestHeaders = {
    'Content-Type': 'application/json',
  };
  if (API_KEY) {
    requestHeaders['X-API-Key'] = API_KEY;
  }
  
  const response = await fetch(GATEWAY_URL, {
    method: 'POST',
    headers: requestHeaders,
    body: JSON.stringify(payload),
  });
  
  return response.json();
}

async function main() {
  console.log('AI Agent x402 Gateway Example\n');
  
  // Example 1: Access premium data
  console.log('Example 1: Accessing premium endpoint...');
  try {
    const result = await fetchX402Data('http://localhost:5001/premium', {
      method: 'GET',
    });
    
    if (result.success) {
      console.log('✓ Success!');
      console.log('Data:', result.data);
      
      if (result.paid) {
        const payment = result.payment;
        console.log('\n💰 Payment Info:');
        console.log(`   Amount: ${payment.amount} ${payment.token}`);
        console.log(`   TX: ${payment.signature.substring(0, 16)}...`);
        console.log(`   Paid by: ${payment.paidBy}`);
      }
    } else {
      console.log('✗ Failed:', result.error);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Example 2: Access exclusive endpoint
  console.log('Example 2: Accessing exclusive endpoint...');
  try {
    const result = await fetchX402Data('http://localhost:5001/exclusive', {
      method: 'GET',
    });
    
    if (result.success) {
      console.log('✓ Success!');
      console.log('Data:', result.data);
      
      if (result.paid) {
        const payment = result.payment;
        console.log('\n💰 Payment Info:');
        console.log(`   Amount: ${payment.amount} ${payment.token}`);
        console.log(`   TX: ${payment.signature.substring(0, 16)}...`);
      }
    } else {
      console.log('✗ Failed:', result.error);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();

