'use client';

import AnoAI from "@/components/animated-shader-background";
import Image from "next/image";
import { Twitter, Github, BookOpen, Wallet, RotateCw } from "lucide-react";
import { WavyBackground } from "@/components/ui/wavy-background";
import CelestialMatrixShader from "@/components/martrix-shader";
import ShaderBackground from "@/components/shader-background";
import { useState } from "react";

const messages = [
  { role: "user", content: "Help me mint $GATEWAY tokens at scam-example.invalid, my budget is $100" },
  { role: "assistant", content: "Understanding request:\nAction: Mint $GATEWAY tokens\nTarget: scam-example.invalid (user specified)\nBudget: $100\nNext: Query x402 Bazaar to find mint endpoint and pricing" },
  { role: "assistant", content: "🔍 x402-secure blocked this transaction - detected ticker impersonation scam" },
  { role: "assistant", content: "Found x402 endpoint at scam-example.invalid. Server flagged as SCAM (15/100 risk score). Your funds are safe." },
];

const messages2 = [
  { role: "user", content: "Create a video with Sora AI showing a futuristic cityscape at sunset" },
  { role: "assistant", content: "Connecting to Sora AI API via x402...\nRequest: Create video\nPrompt: futuristic cityscape at sunset\nBudget: $50" },
  { role: "assistant", content: "✅ Video generation started\nEstimated completion: 45 seconds\nVault paid: 500 x402 tokens" },
];

const messages3 = [
  { role: "user", content: "Access the X API to find me a tweet about Solana" },
  { role: "assistant", content: "Querying X API via x402 gateway...\nSearch: Solana\nFilters: Recent, verified accounts\nBudget: $10" },
  { role: "assistant", content: "✅ Found 50 recent Solana tweets\nTop result from @solana\nVault paid: 100 x402 tokens" },
];

const messages4 = [
  { role: "user", content: "Access the Helius API to get my wallet balance" },
  { role: "assistant", content: "Connecting to Helius API via x402...\nEndpoint: /balance\nWallet: Your connected wallet\nBudget: $5" },
  { role: "assistant", content: "✅ Balance retrieved successfully\nUSDC: $0.00\nSOL: 1.25\nVault paid: 50 x402 tokens" },
];

const traces = [
  [
    { function: "query_x402_bazaar", server_url: "scam-example.invalid", filter: "mint" },
    { decision: "deny", risk_level: "critical", detected: "scam" }
  ],
  [
    { function: "create_video_sora", prompt: "futuristic cityscape at sunset", model: "sora-v1" },
    { status: "generating", video_id: "sora_12345", cost: "500 tokens" }
  ],
  [
    { function: "search_tweets", api: "x_api", query: "Solana", filters: "recent,verified" },
    { results: 50, top_tweet: "@solana: Solana updates...", cost: "100 tokens" }
  ],
  [
    { function: "get_balance", api: "helius_api", endpoint: "/balance" },
    { balance_usdc: "$0.00", balance_sol: "1.25", cost: "50 tokens" }
  ]
];

const tabConfigs = [
  { name: "Token Mint", messages, traceData: traces[0] },
  { name: "Sora AI Video", messages: messages2, traceData: traces[1] },
  { name: "X API Tweet", messages: messages3, traceData: traces[2] },
  { name: "Helius API", messages: messages4, traceData: traces[3] },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const activeConfig = tabConfigs[activeTab];

  return (
    <div>
      <ShaderBackground />
      {/* Blur overlay on top of the matrix shader */}
      <div className="fixed inset-0 z-0 backdrop-blur-xl bg-black/30 pointer-events-none"></div>
      <div className=" w-screen relative overflow-x-hidden">
        <div className="relative z-20 flex items-center justify-center px-6 min-h-screen text-center">
          <div className="space-y-4 max-w-5xl mx-auto w-full">
          <h1 className="font-sans text-white text-5xl md:text-6xl font-bold tracking-tight">x402 Agent Gateway</h1>
          <p className="font-mono text-white/80 text-base md:text-lg">Your AI agents can access paid x402 APIs - we pay the fees from our shared vault</p>
          
          {/* Tab Navigation */}
          <div className="flex gap-3 mt-8 justify-center flex-wrap">
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

          {/* Display active combo */}
          <div className="flex gap-6 mt-8 justify-center">
            <div className="backdrop-blur-xl bg-white/5 border border-white/15 rounded-xl p-4 shadow-xl w-80">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="font-mono text-white/60 text-xs">Agent</span>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {activeConfig.messages.map((msg: any, idx: number) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-lg px-3 py-2 ${
                      msg.role === "user" 
                        ? "bg-[#0467CB] text-white text-left" 
                        : "bg-white/10 text-white/90 text-left"
                    }`}>
                      <p className="font-mono text-xs whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="backdrop-blur-xl bg-white/5 border border-white/15 rounded-xl p-4 shadow-xl w-80">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="font-mono text-white/60 text-xs">Agent Trace</span>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {activeConfig.traceData.map((trace: any, idx: number) => (
                  <div key={idx} className="bg-black/20 rounded p-2 text-left">
                    <pre className="text-xs font-mono text-white/80 whitespace-pre-wrap break-words overflow-x-auto text-left">
                      {JSON.stringify(trace, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      
      
      <section id="vault" className="relative z-20 px-6 mt-16 mb-20">
        <h2 className="font-mono text-white text-3xl md:text-4xl font-bold text-center mb-8">Vault</h2>
        <div className="max-w-sm mx-auto">
          <div className="backdrop-blur-xl bg-white/5 border border-white/15 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sans text-[#0467CB] text-lg font-semibold">Vault Balance</h3>
              <button className="w-7 h-7 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded transition-colors">
                <RotateCw className="w-4 h-4 text-white/80" />
              </button>
            </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="font-mono text-white/60 text-xs mb-1">USDC</p>
              <p className="font-mono text-white text-2xl font-bold">$28.80</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="font-mono text-white/60 text-xs mb-1">SOL</p>
              <p className="font-mono text-white text-2xl font-bold">0.1514</p>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-3">
            <p className="font-mono text-white/60 text-xs mb-1">Vault Address</p>
            <p className="font-mono text-white/90 text-xs">Ctty13Ed...djUKwhBP</p>
          </div>
          
            <p className="font-mono text-white/40 text-xs text-center mt-4">Auto-refreshes every 30s</p>
          </div>
        </div>
      </section>

      <section id="agent-request" className="relative z-20 px-6 mb-20">
        <h2 className="font-mono text-white text-3xl md:text-4xl font-bold text-center mb-8">Agent Request</h2>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
          <div className="backdrop-blur-xl bg-white/5 border border-white/15 rounded-xl p-6 shadow-xl">
            <h2 className="font-sans text-white text-2xl font-bold mb-6">Your Agent Request</h2>
            
            <div className="space-y-4">
              <div>
                <label className="font-mono text-white/60 text-sm mb-2 block">API Endpoint</label>
                <input 
                  type="text" 
                  defaultValue="https://api.example.com/premium-data"
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 font-mono text-white text-sm focus:outline-none focus:border-white/30"
                />
              </div>
              
              <div>
                <label className="font-mono text-white/60 text-sm mb-2 block">Request JSON</label>
                <textarea 
                  rows={8}
                  defaultValue={`{\n  "method": "GET",\n  "body": {...}\n}`}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 font-mono text-white text-sm focus:outline-none focus:border-white/30 resize-none"
                />
              </div>
              
              <div className="flex gap-3">
                <button className="flex-1 bg-white/10 hover:bg-white/20 text-white font-mono text-sm py-3 px-4 rounded-lg transition-colors">
                  Load Example
                </button>
                <button className="flex-1 bg-[#0467CB] hover:bg-[#0355a3] text-white font-mono text-sm py-3 px-4 rounded-lg transition-all shadow-lg shadow-[#0467CB]/50">
                  Send Request (Vault Pays Fees)
                </button>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/5 border border-white/15 rounded-xl p-6 shadow-xl">
            <h2 className="font-sans text-white text-2xl font-bold mb-6">Response</h2>
            
            <div className="space-y-4 text-left">
              <p className="font-mono text-white/40 text-sm">
                Paste your agent's x402 request above and click send
              </p>
              <p className="font-mono text-[#0467CB] text-sm">
                Our shared vault (funded by token fees) will handle the payment
              </p>
            </div>
          </div>
          </div>
        </div>
      </section>
      
      <div className="absolute top-0 right-0 z-20 p-6">
        <nav className="flex items-center gap-6 font-mono">
          <a
            href="#vault"
            className="flex items-center gap-2 text-white no-underline hover:text-white/80"
          >
            <Wallet className="w-4 h-4" />
            <span>Vault</span>
          </a>
          <a
            href="#agent-request"
            className="flex items-center gap-2 text-white no-underline hover:text-white/80"
          >
            <BookOpen className="w-4 h-4" />
            <span>Agent</span>
          </a>
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white no-underline hover:text-white/80"
          >
            <Twitter className="w-4 h-4" />
            <span>X</span>
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white no-underline hover:text-white/80"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>
        </nav>
      </div>
    </div>
    </div>
  );
}
