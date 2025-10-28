import { useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import VaultBalance from '../components/VaultBalance';

export default function Home() {
  const [jsonInput, setJsonInput] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const parsedJson = JSON.parse(jsonInput);
      
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint,
          request: parsedJson,
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setResponse(data);
      } else {
        setError(data.error || 'Request failed');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid JSON or request failed');
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    setEndpoint('http://localhost:5001/premium');
    setJsonInput(JSON.stringify({
      "method": "GET",
      "headers": {
        "Content-Type": "application/json"
      }
    }, null, 2));
  };

  return (
    <>
      <Head>
        <title>x402 Agent Gateway - AI Payment Proxy</title>
        <meta name="description" content="Pay for your AI agent x402 requests with our shared vault" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1>x402 Agent Gateway</h1>
          <p className={styles.subtitle}>
            Your AI agents can access paid x402 APIs - we pay the fees from our shared vault
          </p>
          <div className={styles.badge}>Open Access - First Week Free</div>
          <p className={styles.subtitle} style={{fontSize: '0.9em', marginTop: '12px', color: '#9ca3af'}}>
            Vault funded by token trading fees • After week 1: Twitter verification required
          </p>
        </header>

        <VaultBalance />

        <div className={styles.mainContent}>
          <div className={styles.card}>
            <h2>Your Agent Request</h2>
            
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="endpoint">API Endpoint</label>
                <input
                  id="endpoint"
                  type="text"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="https://api.example.com/premium-data"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="jsonInput">Request JSON</label>
                <textarea
                  id="jsonInput"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='{\n  "method": "GET",\n  "body": {...}\n}'
                  rows={12}
                  required
                />
              </div>

              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={loadExample}
                  className={styles.btnSecondary}
                >
                  Load Example
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={styles.btnPrimary}
                >
                  {loading ? 'Processing...' : 'Send Request (Vault Pays Fees)'}
                </button>
              </div>
            </form>
          </div>

          <div className={styles.card}>
            <h2>Response</h2>
            
            {loading && (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Processing payment and fetching data...</p>
              </div>
            )}

            {error && (
              <div className={styles.error}>
                <strong>Error:</strong> {error}
              </div>
            )}

            {response && (
              <div className={styles.success}>
                <div className={styles.statusBadge}>
                  {response.success ? 'Success' : 'Payment Required'}
                </div>
                
                {response.paymentRequired && (
                  <div className={styles.paymentRequired}>
                    <h3>Payment Required</h3>
                    <p><strong>Amount:</strong> {response.challenge.amount} {response.challenge.token}</p>
                    <p><strong>Pay To:</strong></p>
                    <input 
                      type="text" 
                      value={response.challenge.recipient} 
                      readOnly 
                      className={styles.copyInput}
                      onClick={(e) => {
                        (e.target as HTMLInputElement).select();
                        navigator.clipboard.writeText(response.challenge.recipient);
                      }}
                    />
                    <p><strong>Resource:</strong> {response.challenge.resource}</p>
                    <p><strong>Nonce:</strong> {response.challenge.nonce}</p>
                    
                    <div className={styles.paymentOptions}>
                      <button 
                        className={styles.btnPrimary}
                        onClick={() => {
                          const data = JSON.stringify(response.challenge, null, 2);
                          const blob = new Blob([data], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'payment-details.json';
                          a.click();
                        }}
                      >
                        Download Payment Details
                      </button>
                      <p className={styles.hint}>
                        Copy the address above, pay manually via your wallet, then retry with payment proof
                      </p>
                    </div>
                  </div>
                )}
                
                {response.payment && (
                  <div className={styles.paymentInfo}>
                    <h3>Payment Details</h3>
                    <p><strong>Amount:</strong> {response.payment.amount} {response.payment.token}</p>
                    <p><strong>TX:</strong> {response.payment.signature?.substring(0, 16)}...</p>
                    <p><strong>Paid by:</strong> {response.payment.paidBy || 'Vault'}</p>
                  </div>
                )}

                <div className={styles.responseData}>
                  <h3>Response Data</h3>
                  <pre>{JSON.stringify(response.data, null, 2)}</pre>
                </div>
              </div>
            )}

            {!loading && !error && !response && (
              <div className={styles.placeholder}>
                <p>Paste your agent's x402 request above and click send</p>
                <p className={styles.hint}>Our shared vault (funded by token fees) will handle the payment</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <h3>What is x402 Gateway?</h3>
            <p>
              x402 is a protocol that lets AI agents pay for premium APIs using micropayments on Solana. 
              Instead of setting up your own wallet and payment flow, use our <strong>shared vault</strong> to pay for x402 fees.
            </p>
            <p style={{marginTop: '12px'}}>
              Our vault is funded by trading fees from our Solana token. Every trade contributes to keeping 
              this service free and accessible for AI developers.
            </p>
          </div>

          <div className={styles.infoCard}>
            <h3>How It Works</h3>
            <ol>
              <li><strong>Send your x402 request</strong> - paste endpoint and JSON</li>
              <li><strong>We detect 402 payment</strong> - our gateway intercepts payment requirements</li>
              <li><strong>View payment details</strong> - see amount, recipient, nonce instantly</li>
              <li><strong>Manual or auto pay</strong> - copy address to pay yourself, or we'll handle it (coming soon)</li>
            </ol>
          </div>

          <div className={styles.infoCard}>
            <h3>Access Policy</h3>
            <ul>
              <li><strong>Week 1:</strong> Completely open - no auth, no signup</li>
              <li><strong>After Week 1:</strong> Simple Twitter verification (anti-abuse)</li>
              <li><strong>Rate Limits:</strong> 100 requests/hour per IP (fair use)</li>
              <li><strong>Coming Soon:</strong> API keys for automated agents and bots</li>
            </ul>
            <p style={{marginTop: '12px', fontSize: '0.9em', opacity: 0.8}}>
              Hold our token? Get priority access and higher rate limits (coming soon)
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

