import { useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

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
    setEndpoint('http://localhost:5000/premium');
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
            Paste your AI agent's x402 request - we'll handle the payment
          </p>
          <div className={styles.badge}>Free for first week</div>
        </header>

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
                  {loading ? 'Processing...' : 'Send Request (Our Vault Pays)'}
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
                  {response.success ? 'Success' : 'Failed'}
                </div>
                
                {response.payment && (
                  <div className={styles.paymentInfo}>
                    <h3>Payment Details</h3>
                    <p><strong>Amount:</strong> {response.payment.amount} {response.payment.token}</p>
                    <p><strong>TX:</strong> {response.payment.signature?.substring(0, 16)}...</p>
                    <p><strong>Paid by:</strong> Our Vault</p>
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
                <p>Paste your agent's request and click send</p>
                <p className={styles.hint}>We'll use our vault to pay for x402 fees</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <h3>How It Works</h3>
            <ol>
              <li>Your AI agent makes an x402 request</li>
              <li>Paste the endpoint and JSON here</li>
              <li>Our vault pays the x402 fee in USDC</li>
              <li>You get the response instantly</li>
            </ol>
          </div>

          <div className={styles.infoCard}>
            <h3>Coming Soon</h3>
            <ul>
              <li>API access for automated agents</li>
              <li>Usage tracking dashboard</li>
              <li>Token-based access after free week</li>
              <li>Analytics and monitoring</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

