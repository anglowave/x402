// Test script for Agent API
// This simulates how an AI agent would call the gateway

const API_BASE = 'http://localhost:3000';
const X402_ENDPOINT = 'http://localhost:5001/premium';

async function testAgentAPI() {
  console.log('Testing x402 Agent Gateway API...\n');

  try {
    console.log(`Requesting: ${X402_ENDPOINT}`);
    console.log('Gateway will auto-pay from vault if 402 detected\n');

    const response = await fetch(`${API_BASE}/api/agent-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: X402_ENDPOINT,
        method: 'GET',
      }),
    });

    const data = await response.json();

    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('\n✓ SUCCESS!');
      if (data.paid) {
        console.log(`\n💰 Payment Details:`);
        console.log(`   Amount: ${data.payment.amount} ${data.payment.token}`);
        console.log(`   TX: ${data.payment.signature}`);
        console.log(`   Paid By: ${data.payment.paidBy}`);
      } else {
        console.log('\n✓ No payment required (free endpoint)');
      }
      console.log(`\n📦 Data Received:`, data.data);
    } else {
      console.log('\n✗ FAILED:', data.error);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAgentAPI();

