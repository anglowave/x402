import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../styles/Demo.module.css';

interface Message {
  role: 'user' | 'agent' | 'system';
  content: string;
}

export default function Demo() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'system', 
      content: 'Welcome! Try asking me to help you access premium APIs or data.' 
    }
  ]);
  const [input, setInput] = useState('');
  const [currentJson, setCurrentJson] = useState<any>(null);
  const [showCopied, setShowCopied] = useState(false);

  // Example scenarios
  const examples = [
    "Help me get premium market data from api.example.com",
    "I need to access exclusive AI models",
    "Fetch crypto analytics data for me",
  ];

  const handleExample = (example: string) => {
    setInput(example);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const newMessages = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMessages);

    // Simulate agent response
    setTimeout(() => {
      const agentMessage = {
        role: 'agent' as const,
        content: 'Understanding your request...\n\nI found a premium API that provides this data. It requires a small payment via x402 protocol.'
      };
      setMessages(prev => [...prev, agentMessage]);

      // Generate x402 payment request
      setTimeout(() => {
        const paymentRequest = {
          function: "query_x402_bazaar",
          server_url: "https://premium-api.example.com/data",
          filter: "market-analytics",
          payment_required: {
            amount: 0.001,
            token: "SOL",
            recipient: "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
            resource: "/premium/market-data",
            nonce: generateNonce(),
            timestamp: Math.floor(Date.now() / 1000)
          },
          decision: "pending",
          risk_level: "low",
          verified: "safe"
        };

        setCurrentJson(paymentRequest);

        const paymentMessage = {
          role: 'agent' as const,
          content: '💳 Payment Required\n\nI found the data you need! It costs 0.001 SOL.\n\nThe payment details are shown on the right. You can:\n1. Copy the JSON and paste it in the Gateway to auto-pay\n2. Review the payment details first'
        };
        setMessages(prev => [...prev, paymentMessage]);
      }, 1000);
    }, 500);

    setInput('');
  };

  const handleCopyJson = () => {
    if (currentJson) {
      navigator.clipboard.writeText(JSON.stringify(currentJson, null, 2));
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const handleUseInGateway = () => {
    if (currentJson && currentJson.payment_required) {
      // Store in session storage
      sessionStorage.setItem('x402-demo-request', JSON.stringify({
        endpoint: currentJson.server_url,
        method: 'GET',
        challenge: currentJson.payment_required
      }));
      // Navigate to main page
      router.push('/?demo=true');
    }
  };

  const generateNonce = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  return (
    <>
      <Head>
        <title>x402 Agent Demo - Interactive Example</title>
        <meta name="description" content="See how AI agents interact with x402 payment protocol" />
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1>x402 Agent Demo</h1>
          <p>See how AI agents request payments and use the Gateway</p>
          <button onClick={() => router.push('/')} className={styles.backBtn}>
            ← Back to Gateway
          </button>
        </header>

        <div className={styles.demoGrid}>
          {/* Left: Chat Interface */}
          <div className={styles.chatSection}>
            <div className={styles.chatHeader}>
              <div className={styles.statusDot}></div>
              <h2>Agent Chat</h2>
            </div>

            <div className={styles.messagesContainer}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`${styles.message} ${styles[msg.role]}`}>
                  <div className={styles.messageHeader}>
                    {msg.role === 'user' ? '👤 You' : msg.role === 'agent' ? '🤖 Agent' : '💡 System'}
                  </div>
                  <div className={styles.messageContent}>
                    {msg.content.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.inputSection}>
              <div className={styles.examples}>
                <p>Try these examples:</p>
                <div className={styles.exampleButtons}>
                  {examples.map((ex, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleExample(ex)}
                      className={styles.exampleBtn}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.inputGroup}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask the agent to fetch data for you..."
                  className={styles.input}
                />
                <button onClick={handleSend} className={styles.sendBtn}>
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Right: JSON Trace */}
          <div className={styles.jsonSection}>
            <div className={styles.jsonHeader}>
              <div className={styles.statusDot}></div>
              <h2>Agent Trace</h2>
            </div>

            <div className={styles.jsonContent}>
              {currentJson ? (
                <>
                  <pre className={styles.json}>
                    {JSON.stringify(currentJson, null, 2)}
                  </pre>

                  <div className={styles.jsonActions}>
                    <button onClick={handleCopyJson} className={styles.copyBtn}>
                      {showCopied ? '✓ Copied!' : '📋 Copy JSON'}
                    </button>
                    <button onClick={handleUseInGateway} className={styles.useBtn}>
                      Use in Gateway →
                    </button>
                  </div>

                  <div className={styles.explanation}>
                    <h3>What happens next?</h3>
                    <ol>
                      <li>Click "Use in Gateway" to auto-fill the payment form</li>
                      <li>Gateway will handle the payment from the shared vault</li>
                      <li>You get the data - no wallet needed!</li>
                    </ol>
                  </div>
                </>
              ) : (
                <div className={styles.placeholder}>
                  <p>Agent trace will appear here</p>
                  <p className={styles.hint}>
                    Start by sending a message to the agent
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.infoBar}>
          <div className={styles.infoCard}>
            <h3>💡 How This Works</h3>
            <p>
              1. You ask the agent for data<br/>
              2. Agent finds x402-protected API<br/>
              3. Payment details shown as JSON<br/>
              4. Gateway pays automatically from vault
            </p>
          </div>
          <div className={styles.infoCard}>
            <h3>🔒 Security</h3>
            <p>
              All payments verified<br/>
              Scam detection enabled<br/>
              Risk scoring active<br/>
              Your funds stay safe
            </p>
          </div>
          <div className={styles.infoCard}>
            <h3>🚀 For Developers</h3>
            <p>
              Use our Agent API<br/>
              POST to /api/agent-request<br/>
              Automatic x402 payment<br/>
              See AGENT_API.md for docs
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

