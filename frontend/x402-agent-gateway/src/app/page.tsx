import AnoAI from "@/components/animated-shader-background";
import Image from "next/image";
import { Twitter, Github, BookOpen } from "lucide-react";

export default function Home() {
  return (
    <div className="h-screen w-screen bg-[#000] relative overflow-hidden">
      <AnoAI/>
      <div className="absolute inset-0 z-20 flex items-center justify-center px-6 text-center bottom-50">
        <div className="space-y-4 max-w-3xl mx-auto w-full">
          <h1 className="font-sans text-white text-5xl md:text-6xl font-bold tracking-tight">x402 Agent Gateway</h1>
          <p className="font-mono text-white/80 text-base md:text-lg">Your AI agents can access paid x402 APIs - we pay the fees from our shared vault</p>
        </div>
      </div>
      
      <div className="absolute top-0 right-0 z-20 p-6">
        <nav className="flex items-center gap-6 font-mono">
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
            href="#how-it-works"
            className="flex items-center gap-2 text-white no-underline hover:text-white/80"
          >
            <BookOpen className="w-4 h-4" />
            <span>How it works</span>
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
      <section id="how-it-works" className="absolute inset-x-0 bottom-8 z-20 px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-sans text-white text-xl md:text-2xl font-semibold tracking-tight mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="backdrop-blur-xl bg-white/5 border border-white/15 rounded-xl p-4 md:p-5 shadow-xl">
              <h3 className="font-sans text-white text-lg mb-2">What is x402 Gateway?</h3>
              <p className="font-mono text-white/80 text-xs md:text-sm leading-relaxed mb-2">
                x402 is a protocol that lets AI agents pay for premium APIs using micropayments on Solana. Instead of
                setting up your own wallet and payment flow, use our shared vault to pay for x402 fees.
              </p>
              <p className="font-mono text-white/80 text-xs md:text-sm leading-relaxed">
                Our vault is funded by trading fees from our Solana token. Every trade contributes to keeping this
                service free and accessible for AI developers.
              </p>
            </div>
            <div className="backdrop-blur-xl bg-white/5 border border-white/15 rounded-xl p-4 md:p-5 shadow-xl">
              <h3 className="font-sans text-white text-lg mb-2">Steps</h3>
              <ol className="font-mono text-white/80 text-xs md:text-sm leading-relaxed list-decimal list-inside space-y-1">
                <li>Send your x402 request - paste endpoint and JSON</li>
                <li>We detect 402 payment - our gateway intercepts payment requirements</li>
                <li>View payment details - see amount, recipient, nonce instantly</li>
                <li>Manual or auto pay - copy address to pay yourself, or we'll handle it (coming soon)</li>
              </ol>
            </div>
          </div>
        </div>
      </section>
      <div className="pointer-events-none absolute inset-0 z-10 backdrop-blur-xs" />
    </div>
  );
}
