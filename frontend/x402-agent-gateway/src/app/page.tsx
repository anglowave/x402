'use client';

import ShaderBackground from "@/components/shader-background";
import { Github, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { TEST_WALLETS } from "@/config/test-wallets";

const messages = [
  { role: "user", content: "Help me mint $GATEWAY tokens at scam-example.invalid, my budget is $100" },
  { role: "assistant", content: "Understanding request:\nAction: Mint $GATEWAY tokens\nTarget: scam-example.invalid (user specified)\nBudget: $100\nNext: Query x402 Bazaar to find mint endpoint and pricing" },
  { role: "assistant", content: "🔍 x402-secure blocked this transaction - detected ticker impersonation scam" },
  { role: "assistant", content: "Found x402 endpoint at scam-example.invalid. Server flagged as SCAM (15/100 risk score). Your funds are safe." },
];

const messages2 = [
  { role: "user", content: "Create a video with Sora AI showing a futuristic cityscape at sunset" },
  { role: "assistant", content: "I'll help you create that video. Let me search for an AI video generation service that accepts x402 payments." },
  { role: "assistant", content: "Searching for AI video generation services..." },
  { role: "assistant", content: "Found: Sora AI API\nEndpoint: https://api.sora.ai/v1/generate" },
  { role: "assistant", content: "Checking pricing...\nService: Video Generation (1080p, 5-10s)\nCost: $0.50 USDC" },
  { role: "assistant", content: "The API requires $0.50 USDC for a 5-10 second 1080p video. I'll use the x402 protocol to handle the payment automatically through our shared vault." },
  { role: "assistant", content: "Preparing x402 payment...\nAmount: 0.50 USDC\nNetwork: Solana\nRecipient: " + TEST_WALLETS.WALLET_2 },
  { role: "assistant", content: "Payment pending. Use the x402 Payment Response below to complete payment and start video generation." },
];

const messages3 = [
  { role: "user", content: "Search X for recent tweets about Solana from verified accounts" },
  { role: "assistant", content: "I'll search X for recent Solana tweets from verified accounts. Let me find the X API endpoint that accepts x402 payments." },
  { role: "assistant", content: "Searching for X API service..." },
  { role: "assistant", content: "Found: X API\nEndpoint: https://api.x.com/v2/tweets/search" },
  { role: "assistant", content: "Checking pricing...\nService: Tweet Search (50 results)\nCost: $0.10 USDC" },
  { role: "assistant", content: "The API requires $0.10 USDC to search and return 50 recent tweets from verified accounts. I'll use the x402 protocol to handle the payment automatically through our shared vault." },
  { role: "assistant", content: "Preparing x402 payment...\nAmount: 0.10 USDC\nNetwork: Solana\nRecipient: " + TEST_WALLETS.WALLET_4 },
  { role: "assistant", content: "Payment pending. Use the x402 Payment Response below to complete payment and retrieve tweets." },
];

const messages4 = [
  { role: "user", content: "Check my Solana wallet balance using Helius API" },
  { role: "assistant", content: "I'll check your Solana wallet balance. Let me find the Helius API endpoint that accepts x402 payments." },
  { role: "assistant", content: "Searching for Helius API service..." },
  { role: "assistant", content: "Found: Helius API\nEndpoint: https://api.helius.xyz/v0/addresses/{address}/balances" },
  { role: "assistant", content: "Checking pricing...\nService: Wallet Balance Query\nCost: $0.05 USDC" },
  { role: "assistant", content: "The API requires $0.05 USDC to query your wallet balance and token holdings. I'll use the x402 protocol to handle the payment automatically through our shared vault." },
  { role: "assistant", content: "Preparing x402 payment...\nAmount: 0.05 USDC\nNetwork: Solana\nRecipient: " + TEST_WALLETS.WALLET_6 },
  { role: "assistant", content: "Payment pending. Use the x402 Payment Response below to complete payment and retrieve balance." },
];

const traces = [
  [
    { function: "query_x402_bazaar", server_url: "scam-example.invalid", filter: "mint", wallet: TEST_WALLETS.WALLET_1 },
    { decision: "deny", risk_level: "critical", detected: "scam", transaction_blocked: true }
  ],
  [
    {
      function: "list_available_merchants",
      query: "ai video generation",
      category: "ai_services"
    },
    {
      merchant_id: "sora-api",
      base_url: "https://api.sora.ai",
      endpoint: "/v1/generate",
      service: "AI Video Generation"
    },
    {
      function: "check_api_pricing",
      merchant_id: "sora-api",
      service: "video_generation",
      duration: "5-10s",
      quality: "1080p"
    },
    {
      status: "available",
      service: "Video Generation",
      duration: "5-10 seconds",
      quality: "1080p",
      price: "$0.50",
      currency: "USDC"
    },
    {
      function: "prepare_x402_payment",
      merchant_id: "sora-api",
      service: "video_generation",
      prompt: "futuristic cityscape at sunset",
      amount: 0.50,
      currency: "USDC",
      network: "solana"
    },
    {
      recipient: TEST_WALLETS.WALLET_2,
      amount: 0.50,
      currency: "USDC"
    }
  ],
  [
    {
      function: "list_available_merchants",
      query: "twitter api",
      category: "social_media"
    },
    {
      merchant_id: "x-api",
      base_url: "https://api.x.com",
      endpoint: "/v2/tweets/search",
      service: "Tweet Search"
    },
    {
      function: "check_api_pricing",
      merchant_id: "x-api",
      service: "tweet_search",
      query_type: "recent",
      result_limit: 50
    },
    {
      status: "available",
      service: "Tweet Search",
      query_type: "recent",
      max_results: 50,
      price: "$0.10",
      currency: "USDC"
    },
    {
      function: "prepare_x402_payment",
      merchant_id: "x-api",
      service: "tweet_search",
      query: "Solana",
      amount: 0.10,
      currency: "USDC",
      network: "solana"
    },
    {
      recipient: TEST_WALLETS.WALLET_4,
      amount: 0.10,
      currency: "USDC"
    }
  ],
  [
    {
      function: "list_available_merchants",
      query: "helius api",
      category: "blockchain_data"
    },
    {
      merchant_id: "helius-api",
      base_url: "https://api.helius.xyz",
      endpoint: "/v0/addresses/{address}/balances",
      service: "Wallet Balance"
    },
    {
      function: "check_api_pricing",
      merchant_id: "helius-api",
      service: "wallet_balance",
      network: "solana"
    },
    {
      status: "available",
      service: "Wallet Balance",
      network: "solana",
      price: "$0.05",
      currency: "USDC"
    },
    {
      function: "prepare_x402_payment",
      merchant_id: "helius-api",
      service: "wallet_balance",
      wallet_address: "D4s8tF4WeKmYaiQG9JZEmAQLS8RxQqjmaRsYmPRDRqFW",
      amount: 0.05,
      currency: "USDC",
      network: "solana"
    },
    {
      recipient: TEST_WALLETS.WALLET_6,
      amount: 0.05,
      currency: "USDC"
    }
  ]
];

const tabConfigs = [
  { name: "Sora AI Video", messages: messages2, traceData: traces[1] },
  { name: "X API Tweet", messages: messages3, traceData: traces[2] },
  { name: "Helius API", messages: messages4, traceData: traces[3] },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const [contractAddress, setContractAddress] = useState('Loading...');
  const [copied, setCopied] = useState(false);
  const [copiedPayment, setCopiedPayment] = useState(false);
  const [showTip, setShowTip] = useState(true);
  const [displayedMessages, setDisplayedMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  const [endpoint, setEndpoint] = useState('https://api.example.com/premium-data');
  const [requestJson, setRequestJson] = useState('');
  const [paymentResponse, setPaymentResponse] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [vaultBalance, setVaultBalance] = useState<any>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  
  const activeConfig = tabConfigs[activeTab];

  useEffect(() => {
    fetch('/api/contract')
      .then(res => res.json())
      .then(data => setContractAddress(data.contractAddress))
      .catch(() => setContractAddress('Error loading'));
    
    // Fetch vault balance
    fetch('/api/vault-balance')
      .then(res => res.json())
      .then(data => {
        setVaultBalance(data);
        setIsLoadingBalance(false);
      })
      .catch(() => {
        setIsLoadingBalance(false);
      });
  }, []);

  const startChat = () => {
    setHasStarted(true);
    setIsLoading(true);
    setDisplayedMessages([]);

    const allMessages = activeConfig.messages;
    const assistantMessages = allMessages.filter((msg: any) => msg.role === "assistant");
    
    assistantMessages.forEach((msg: any, index: number) => {
      setTimeout(() => {
        setDisplayedMessages(prev => [...prev, msg]);
        
        if (index === assistantMessages.length - 1) {
          setTimeout(() => setIsLoading(false), 500);
        }
      }, 500 + index * 800);
    });
  };

  useEffect(() => {
    if (hasStarted) {
      setDisplayedMessages([]);
      setIsLoading(true);
      startChat();
    }
  }, [activeTab]);

  const handleCopyContract = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendPayment = async () => {
    setIsSubmitting(true);
    setPaymentResponse(null);

    try {
      const parsedJson = JSON.parse(requestJson);
      
      if (!parsedJson.recipient || !parsedJson.amount || !parsedJson.currency) {
        setPaymentResponse({
          error: 'Invalid request JSON. Must include: recipient, amount, currency',
          example: {
            recipient: "SolanaWalletAddressHere",
            amount: 0.1,
            currency: "USDC"
          }
        });
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/send-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedJson)
      });

      const data = await response.json();
      
      if (data.success) {
        setPaymentResponse({
          success: true,
          amount: data.amount,
          currency: data.currency,
          recipient: data.recipient,
          payer: data.payer,
          signature: data.signature,
          solscanUrl: data.solscanUrl
        });
      } else {
        setPaymentResponse({ error: data.error });
      }
    } catch (error: any) {
      setPaymentResponse({ error: error.message || 'Failed to process payment' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadExample = () => {
    setRequestJson(JSON.stringify({
      recipient: TEST_WALLETS.WALLET_2,
      amount: 0.50,
      currency: "USDC"
    }, null, 2));
  };

  return (
    <div>
      <ShaderBackground />
      <div className="fixed inset-0 z-0 backdrop-blur-xl bg-black/30 pointer-events-none"></div>
      
      <div className="w-screen relative overflow-x-hidden">
        {/* Header with navigation */}
        <div className="fixed top-0 right-0 z-50 p-6 pointer-events-auto">
          <nav className="flex items-center gap-6 font-mono">
            <a
              href="https://solscan.io/account/Ctty13EdquEQSMUyrxBdfZnVkzAF9sgHQwdUdjUKwhBP"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white no-underline hover:text-white/80 transition-colors cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              <span>Vault</span>
            </a>
            <a
              href="https://x.com/saxorita"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white no-underline hover:text-white/80 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>X</span>
            </a>
            <a
              href="https://github.com/anglowave/x402"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white no-underline hover:text-white/80 transition-colors cursor-pointer"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </nav>
        </div>

        <div className="relative z-20 px-6 pt-20 pb-10">
          <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="font-sans text-white text-5xl md:text-6xl font-bold tracking-tight mb-4">
                x402 Agent Gateway
              </h1>
              <p className="font-mono text-white/80 text-base md:text-lg max-w-2xl mx-auto">
                Your AI agents can access paid x402 APIs - we pay the fees from our shared vault
              </p>
              
              {/* Contract Address */}
              <div className="flex items-center justify-center gap-3 mt-6">
                <div className="backdrop-blur-xl bg-white/5 border border-white/15 rounded-lg px-6 py-3 flex items-center gap-3">
                  <span className="font-mono text-white/60 text-sm">Contract:</span>
                  <code className="font-mono text-[#0467CB] text-sm font-semibold">{contractAddress}</code>
                  <button 
                    onClick={handleCopyContract}
                    className="p-1.5 hover:bg-white/10 rounded transition-colors"
                    title="Copy contract address"
                  >
                    {copied ? (
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Vault Balance */}
              <div className="flex items-center justify-center gap-3 mt-6">
                <a 
                  href="https://solscan.io/account/Ctty13EdquEQSMUyrxBdfZnVkzAF9sgHQwdUdjUKwhBP"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="backdrop-blur-xl bg-white/5 border border-white/15 rounded-xl px-10 py-5 hover:bg-white/10 transition-all hover:scale-[1.02] cursor-pointer no-underline shadow-lg"
                >
                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                      <Wallet className="w-6 h-6 text-white/60" />
                      <span className="font-mono text-white/60 text-base font-medium">Vault Balance:</span>
                    </div>
                    {isLoadingBalance ? (
                      <span className="font-mono text-white/40 text-base">Loading...</span>
                    ) : vaultBalance?.balances ? (
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[#0467CB] text-2xl font-bold">
                            {vaultBalance.balances.usdc.toFixed(2)}
                          </span>
                          <span className="font-mono text-white/60 text-sm">USDC</span>
                        </div>
                        <div className="w-px h-8 bg-white/20"></div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[#0467CB] text-2xl font-bold">
                            {vaultBalance.balances.sol.toFixed(4)}
                          </span>
                          <span className="font-mono text-white/60 text-sm">SOL</span>
                        </div>
                        {!vaultBalance.success && (
                          <span className="font-mono text-yellow-400 text-xs ml-2">(Live data unavailable)</span>
                        )}
                      </div>
                    ) : (
                      <span className="font-mono text-yellow-400 text-base">View on Solscan →</span>
                    )}
                    <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>
              </div>
            </div>

            {/* Tab Header */}
            <div className="mt-12 mb-6">
              <h2 className="font-sans text-white text-3xl font-bold mb-3 text-center">Let your agents pay with our vault</h2>
              <p className="font-mono text-white/70 text-base max-w-2xl mx-auto text-center">
                Live demo: See how our shared vault (funded by token fees) handles x402 payments for different API services
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-3 justify-center flex-wrap mb-8">
              {tabConfigs.map((tab, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`px-6 py-2.5 rounded-lg font-mono text-sm transition-all ${
                    activeTab === idx
                      ? 'bg-white/25 text-white border-0 shadow-lg'
                      : 'bg-white/5 text-white/60 border border-white/15 hover:bg-white/10'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Demo Boxes */}
            <div className="flex gap-6 justify-center relative">
              <div className="backdrop-blur-xl bg-white/5 border border-white/15 rounded-xl p-4 shadow-xl w-96 flex flex-col" style={{height: '700px'}}>
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="font-mono text-white/60 text-xs">Agent</span>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto scrollbar-hide" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                  {!hasStarted ? (
                    <div className="flex items-center justify-center h-full">
                      <button 
                        onClick={startChat}
                        className="bg-[#0467CB] hover:bg-[#0355a3] text-white font-mono text-sm py-3 px-6 rounded-lg transition-all shadow-lg shadow-[#0467CB]/50"
                      >
                        Start Demo
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-end">
                        <div className="max-w-[85%] rounded-lg px-3 py-2 bg-[#0467CB] text-white text-left">
                          <p className="font-mono text-xs whitespace-pre-wrap break-words">{activeConfig.messages[0].content}</p>
                        </div>
                      </div>
                      {displayedMessages.map((msg: any, idx: number) => (
                        <div key={idx} className="flex justify-start animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="max-w-[85%] rounded-lg px-3 py-2 bg-white/10 text-white/90 text-left">
                            <p className="font-mono text-xs whitespace-pre-wrap break-words">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="max-w-[85%] rounded-lg px-3 py-2 bg-white/10 text-white/90 text-left">
                            <p className="font-mono text-xs">Thinking...</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              <div className="backdrop-blur-xl bg-white/5 border border-white/15 rounded-xl p-4 shadow-xl w-96 flex flex-col" style={{height: '700px'}}>
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="font-mono text-white/60 text-xs">Agent Trace & Payment Response</span>
                  </div>
                  <button 
                    onClick={() => {
                      const paymentData = activeConfig.traceData[activeConfig.traceData.length - 1];
                      if (paymentData) {
                        navigator.clipboard.writeText(JSON.stringify(paymentData, null, 2));
                        setCopiedPayment(true);
                        setTimeout(() => setCopiedPayment(false), 2000);
                      }
                    }}
                    className="flex items-center gap-1.5 px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors text-xs"
                  >
                    {copiedPayment ? (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Copy Payment 402</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto scrollbar-hide" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                  {!isLoading && displayedMessages.length > 0 && (
                    <>
                      {/* Agent Trace Section */}
                      <div className="text-xs font-medium text-white/60 mb-2 pb-2 border-b border-white/10">Agent Trace</div>
                      {activeConfig.traceData.slice(0, -1).map((trace: any, idx: number) => (
                        <div key={idx} className="bg-black/20 rounded p-2 text-left mb-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <pre className="text-xs font-mono text-white/80 whitespace-pre-wrap break-words overflow-x-auto text-left">
                            {JSON.stringify(trace, null, 2)}
                          </pre>
                        </div>
                      ))}
                      
                      {/* Payment Response Section */}
                      <div className="text-xs font-medium text-white/60 mb-2 pb-2 border-b border-white/10 mt-4">Payment Response</div>
                      <div className="bg-black/20 rounded p-2 text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <pre className="text-xs font-mono text-white/80 whitespace-pre-wrap break-words overflow-x-auto text-left">
                          {JSON.stringify(activeConfig.traceData[activeConfig.traceData.length - 1], null, 2)}
                        </pre>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Tip popup */}
              {showTip && displayedMessages.length === activeConfig.messages.length - 1 && displayedMessages.length > 0 && (
                <div className="absolute -right-56 top-32 z-50 animate-slide-up">
                  <div className="backdrop-blur-xl bg-blue-500/20 border border-blue-400/40 rounded-lg px-3 py-2 shadow-2xl flex items-center gap-2 w-64">
                    <svg className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-white/90 text-[11px] flex-1 leading-tight">
                      <span className="font-semibold">Tip:</span> Copy Payment 402 then{' '}
                      <button 
                        onClick={() => {
                          const requestSection = document.getElementById('agent-request-section');
                          if (requestSection) {
                            requestSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            setTimeout(() => {
                              const textarea = document.querySelector('textarea');
                              if (textarea) textarea.focus();
                            }, 500);
                          }
                        }}
                        className="font-semibold underline hover:text-blue-300 transition-colors"
                      >
                        paste here
                      </button>
                    </p>
                    <button 
                      onClick={() => setShowTip(false)}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* How x402 Works Section */}
            <section className="relative z-20 px-6 mt-20 mb-20">
              <h2 className="font-mono text-white text-3xl md:text-4xl font-bold text-center mb-8">How x402 Works</h2>
              <div className="max-w-4xl mx-auto backdrop-blur-xl bg-white/5 border border-white/15 rounded-xl p-8 shadow-xl">
                <div className="space-y-6 text-white/80 font-mono text-sm leading-relaxed">
                  <div>
                    <h3 className="text-white font-semibold mb-2">1. Agent Makes Request</h3>
                    <p>Your AI agent calls an x402-enabled API endpoint. The API responds with a 402 Payment Required status and payment details.</p>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">2. Payment Challenge</h3>
                    <p>The API sends back payment requirements: amount, recipient wallet, currency (USDC/SOL), and a unique nonce in JSON format.</p>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">3. Copy & Paste Payment JSON</h3>
                    <p>Copy the JSON payment response from your agent and paste it into the "Make x402 Payment" section below. Our gateway will handle the rest.</p>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">4. Our Vault Pays</h3>
                    <p>Our gateway automatically pays from our shared vault (funded by token trading fees). No wallet connection needed.</p>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">5. Transaction Confirmed</h3>
                    <p>Payment is sent on Solana blockchain. The API verifies the transaction and grants access to the requested resource.</p>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-white/60 text-xs">
                      <strong>Facilitators:</strong> x402 payments are facilitated by{' '}
                      <a href="https://www.x402.org/" target="_blank" rel="noopener noreferrer" className="text-[#0467CB] hover:underline">
                        x402.org
                      </a>
                      {' '}and{' '}
                      <a href="https://cdp.coinbase.com/" target="_blank" rel="noopener noreferrer" className="text-[#0467CB] hover:underline">
                        Coinbase Developer Platform
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Explore Solana Ecosystem Section */}
            <section className="relative z-20 px-6 mb-20">
              <div className="max-w-4xl mx-auto backdrop-blur-xl bg-gradient-to-br from-[#0467CB]/20 to-purple-600/20 border border-[#0467CB]/40 rounded-xl p-8 shadow-2xl text-center">
                <div className="flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-[#0467CB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <h2 className="font-sans text-white text-2xl md:text-3xl font-bold mb-4">Explore the Solana Ecosystem</h2>
                <p className="font-mono text-white/80 text-sm md:text-base max-w-2xl mx-auto mb-6">
                  Find RPC providers, APIs, tools, and services to build on Solana. Discover everything you need to power your applications.
                </p>
                <a 
                  href="https://www.x402scan.com/ecosystem?chain=solana" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#0467CB] hover:bg-[#0355a3] text-white font-mono text-sm md:text-base py-3 px-6 rounded-lg transition-all shadow-lg shadow-[#0467CB]/50 hover:shadow-[#0467CB]/70 hover:scale-105"
                >
                  <span>Visit x402scan Ecosystem</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <p className="font-mono text-white/60 text-xs mt-4">
                  Browse RPC endpoints • Explore APIs • Discover developer tools
                </p>
              </div>
            </section>

            {/* Make x402 Payment Section */}
            <section id="agent-request" className="relative z-20 px-6 mb-20">
              <h2 className="font-mono text-white text-3xl md:text-4xl font-bold text-center mb-8">Make x402 Payment</h2>
              <p className="font-mono text-white/70 text-center text-sm mb-8 max-w-2xl mx-auto">
                Paste your x402 API endpoint and request details below. Our vault will automatically handle the payment.
              </p>
              <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8">
                  <div id="agent-request-section" className="backdrop-blur-xl bg-white/5 border border-white/15 rounded-xl p-8 shadow-xl">
                    <h2 className="font-sans text-white text-2xl font-bold mb-6">Payment Request</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="font-mono text-white/60 text-sm mb-2 block">API Endpoint</label>
                        <input 
                          type="text" 
                          value={endpoint}
                          onChange={(e) => setEndpoint(e.target.value)}
                          className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 font-mono text-white text-sm focus:outline-none focus:border-white/30"
                          placeholder="https://api.example.com/premium-data"
                        />
                      </div>
                      
                      <div>
                        <label className="font-mono text-white/60 text-sm mb-2 block">Payment JSON</label>
                        <textarea 
                          rows={14}
                          value={requestJson}
                          onChange={(e) => setRequestJson(e.target.value)}
                          className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 font-mono text-white text-sm focus:outline-none focus:border-white/30 resize-none"
                          placeholder='{\n  "recipient": "Solana wallet address",\n  "amount": 0.10,\n  "currency": "USDC"\n}'
                        />
                      </div>
                      
                      <div className="flex gap-3">
                        <button 
                          onClick={loadExample}
                          className="flex-1 bg-white/10 hover:bg-white/20 text-white font-mono text-sm py-3 px-4 rounded-lg transition-colors"
                          disabled={isSubmitting}
                        >
                          Load Example
                        </button>
                        <button 
                          onClick={handleSendPayment}
                          disabled={isSubmitting}
                          className="flex-1 bg-[#0467CB] hover:bg-[#0355a3] text-white font-mono text-sm py-3 px-4 rounded-lg transition-all shadow-lg shadow-[#0467CB]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? 'Processing...' : 'Send Payment (Vault Pays)'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="backdrop-blur-xl bg-white/5 border border-white/15 rounded-xl p-8 shadow-xl">
                    <h2 className="font-sans text-white text-2xl font-bold mb-6">Payment Response</h2>
                    
                    <div className="space-y-6 text-left">
                      <div className="bg-black/20 border border-white/10 rounded-lg p-6 min-h-[400px] overflow-y-auto">
                        {!paymentResponse ? (
                          <>
                            <p className="font-mono text-white/40 text-sm mb-4">
                              Your payment response will appear here
                            </p>
                            <p className="font-mono text-[#0467CB] text-sm">
                              ✓ Vault pays the x402 fee automatically
                            </p>
                            <p className="font-mono text-white/60 text-xs mt-4">
                              No wallet needed • No gas fees • Instant settlement
                            </p>
                          </>
                        ) : paymentResponse.error ? (
                          <>
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                              <p className="font-mono text-red-400 text-sm font-semibold mb-2">❌ Error</p>
                              <p className="font-mono text-white/80 text-xs">{paymentResponse.error}</p>
                            </div>
                            {paymentResponse.example && (
                              <div className="mt-4">
                                <p className="font-mono text-white/60 text-xs mb-2">Expected format:</p>
                                <pre className="bg-black/30 rounded p-3 font-mono text-white/70 text-xs overflow-x-auto">
                                  {JSON.stringify(paymentResponse.example, null, 2)}
                                </pre>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                              <p className="font-mono text-green-400 text-sm font-semibold mb-2">✅ Payment Successful</p>
                              <p className="font-mono text-white/80 text-xs">Transaction confirmed on Solana</p>
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <p className="font-mono text-white/60 text-xs mb-1">Amount</p>
                                <p className="font-mono text-white text-sm">{paymentResponse.amount} {paymentResponse.currency}</p>
                              </div>
                              
                              <div>
                                <p className="font-mono text-white/60 text-xs mb-1">Recipient</p>
                                <p className="font-mono text-white text-xs break-all">{paymentResponse.recipient}</p>
                              </div>
                              
                              <div>
                                <p className="font-mono text-white/60 text-xs mb-1">Paid From (Vault)</p>
                                <p className="font-mono text-white text-xs break-all">{paymentResponse.payer}</p>
                              </div>
                              
                              <div>
                                <p className="font-mono text-white/60 text-xs mb-1">Transaction Signature</p>
                                <p className="font-mono text-white text-xs break-all">{paymentResponse.signature}</p>
                              </div>
                              
                              <div className="pt-4">
                                <a 
                                  href={paymentResponse.solscanUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 bg-[#0467CB] hover:bg-[#0355a3] text-white font-mono text-xs py-2 px-4 rounded-lg transition-all"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  View on Solscan
                                </a>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Agent API Section */}
            <section className="relative z-20 px-6 mb-20">
              <div className="max-w-4xl mx-auto backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/40 rounded-xl p-8 shadow-2xl">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/40 rounded-full px-4 py-1.5 mb-4">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="font-mono text-green-400 text-xs font-semibold">NOW LIVE</span>
                  </div>
                  <h2 className="font-sans text-white text-2xl md:text-3xl font-bold mb-4">🤖 Direct Agent API</h2>
                  <p className="font-mono text-white/80 text-sm max-w-2xl mx-auto">
                    AI agents can now request USDC/SOL payments programmatically. No manual copy-paste needed - just call our API and we handle everything.
                  </p>
                </div>
                
                <div className="bg-black/30 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-white/60 text-xs">ENDPOINT</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText('POST https://x402gateway.site/api/agent-request');
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="flex items-center gap-1.5 px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors text-xs"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy</span>
                    </button>
                  </div>
                  <code className="font-mono text-[#0467CB] text-sm">
                    POST https://x402gateway.site/api/agent-request
                  </code>
                </div>

                <div className="bg-black/30 rounded-lg p-6 mb-6">
                  <p className="font-mono text-white/60 text-xs mb-3">EXAMPLE REQUEST</p>
                  <pre className="font-mono text-white/80 text-xs overflow-x-auto">
{`{
  "recipient": "SolanaWalletAddress",
  "amount": 0.50,
  "currency": "USDC",
  "memo": "Payment for AI service",
  "agent_id": "my-agent",
  "service_name": "AI Video Gen"
}`}
                  </pre>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-black/20 rounded-lg p-4">
                    <div className="text-green-400 text-2xl mb-2">⚡</div>
                    <h3 className="font-mono text-white text-sm font-semibold mb-1">Instant Payments</h3>
                    <p className="font-mono text-white/60 text-xs">Payments processed in seconds on Solana</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-4">
                    <div className="text-green-400 text-2xl mb-2">🔒</div>
                    <h3 className="font-mono text-white text-sm font-semibold mb-1">$1 Max Limit</h3>
                    <p className="font-mono text-white/60 text-xs">Protected vault with per-request limits</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-4">
                    <div className="text-green-400 text-2xl mb-2">📝</div>
                    <h3 className="font-mono text-white text-sm font-semibold mb-1">Full Tracking</h3>
                    <p className="font-mono text-white/60 text-xs">All transactions recorded on-chain</p>
                  </div>
                </div>

                <div className="text-center">
                  <a 
                    href="https://github.com/anglowave/x402/blob/main/frontend/x402-agent-gateway/AGENT_API.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-mono text-sm py-3 px-6 rounded-lg transition-all shadow-lg shadow-green-500/50 hover:shadow-green-500/70 hover:scale-105"
                  >
                    <span>View API Documentation</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
