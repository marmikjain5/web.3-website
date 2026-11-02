"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, Disc3, Sparkles, Terminal, Activity, ShieldCheck, Zap, Send } from "lucide-react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import ScrambleText from "@/components/chaingpt/ScrambleText";

export default function LaboratoryPage() {
  const [activeTab, setActiveTab] = useState<"agent" | "coin">("coin");
  const [messages, setMessages] = useState<Array<{ role: "system" | "agent" | "user"; text: string }>>([
    {
      role: "system",
      text: "SYS_INIT // BMSIT Web.3 Autonomous Agent connected to Mainnet Node.",
    },
    {
      role: "agent",
      text: "Welcome to the BMSIT Web.3 Lab. I am your autonomous incubation copilot. Ask me about student grants, smart contract auditing, or hackathon team pairing.",
    },
  ]);
  const [inputVal, setInputVal] = useState("");

  // 3D Mouse Parallax
  const mouseX = useSpring(0, { stiffness: 90, damping: 20 });
  const mouseY = useSpring(0, { stiffness: 90, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x * 16);
    mouseY.set(-y * 14);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userText = inputVal.trim();
    setInputVal("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);

    // Smart Agent Response Simulator
    setTimeout(() => {
      let reply = "Processing your query across BMSIT builder repository...";
      const lower = userText.toLowerCase();

      if (lower.includes("grant") || lower.includes("funding")) {
        reply = "BMSIT Web.3 connects student teams to Polygon Village, Solana Foundation, and Arbitrum Grants ($2.5k - $25k non-dilutive). Next review cutoff: Nov 15.";
      } else if (lower.includes("hackathon") || lower.includes("ethindia")) {
        reply = "Our club delegates student teams to ETHIndia, Solana Renaissance, and local Bengaluru hackathons with travel support and senior mentor pairing.";
      } else if (lower.includes("team") || lower.includes("join") || lower.includes("apply")) {
        reply = "Applications for Cohort 2026 are currently OPEN. Head to the Apply tab or join our Discord/Telegram builder channels.";
      } else if (lower.includes("audit") || lower.includes("contract") || lower.includes("solidity")) {
        reply = "We offer free peer-to-peer Solidity/Rust code reviews, gas profiling, and static analysis using Slither and Mythril.";
      } else {
        reply = `Telemetry received: "${userText}". Our lead student researchers are available in the Web.3 Innovation Lab (Room 304, BMSIT&M).`;
      }

      setMessages((prev) => [...prev, { role: "agent", text: reply }]);
    }, 700);
  };

  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden lab-grid-bg flex flex-col">
      {/* Top Cyber Telemetry Bar */}
      <header className="border-b border-border bg-card/70 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 font-mono text-xs text-foreground/70 hover:text-foreground border border-border px-3 py-1.5 rounded-lg bg-background hover:border-[#E50914] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>RETURN TO PORTAL</span>
          </Link>
          <span className="hidden sm:inline-block text-border">/</span>
          <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-xs text-foreground/50">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            BMSIT_NODE_ACTIVE
          </span>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 p-1 bg-background/80 border border-border rounded-xl">
          <button
            onClick={() => setActiveTab("agent")}
            className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "agent"
                ? "bg-[#E50914] text-white shadow-[0_0_12px_rgba(229,9,20,0.35)]"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI AGENT</span>
          </button>

          <button
            onClick={() => setActiveTab("coin")}
            className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "coin"
                ? "bg-[#FF7A00] text-white shadow-[0_0_12px_rgba(255,122,0,0.35)]"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            <Disc3 className="w-3.5 h-3.5" />
            <span>PROTOCOL COIN</span>
          </button>
        </div>
      </header>

      {/* Main Interactive Stage */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: 3D Interactive Asset Stage (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full max-w-[480px] aspect-square rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md p-8 flex items-center justify-center overflow-hidden shadow-xl"
            style={{ perspective: 1000 }}
          >
            {/* Tech Corner Brackets */}
            <span className="tech-bracket-tl" />
            <span className="tech-bracket-tr" />
            <span className="tech-bracket-bl" />
            <span className="tech-bracket-br" />

            {/* Ambient Background Glow */}
            <div
              className={`absolute inset-0 rounded-3xl blur-3xl opacity-20 pointer-events-none transition-colors duration-700 ${
                activeTab === "agent" ? "bg-red-500" : "bg-amber-500"
              }`}
            />

            {/* 3D Tilting Video Container */}
            <motion.div
              style={{
                rotateX: mouseY,
                rotateY: mouseX,
                transformStyle: "preserve-3d",
              }}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4.0, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full h-full flex items-center justify-center pointer-events-none"
            >
              {activeTab === "agent" ? (
                <video
                  key="agent_video"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(229,9,20,0.3)]"
                >
                  <source src="/chaingpt-assets/LABS_robot_CHROME_VP9.webm" type="video/webm" />
                  <source src="/chaingpt-assets/LABS_robot_SAFARI_HEVC.mp4" type="video/mp4" />
                </video>
              ) : (
                <video
                  key="coin_video"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(255,122,0,0.4)]"
                >
                  <source src="/chaingpt-assets/LABS_coin_CHROME_VP9.webm" type="video/webm" />
                  <source src="/chaingpt-assets/LABS_coin_SAFARI_HEVC.mp4" type="video/mp4" />
                </video>
              )}
            </motion.div>

            {/* Stage Telemetry Tag */}
            <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between font-mono text-[10px] text-foreground/50 border-t border-border/60 pt-3">
              <span>{activeTab === "agent" ? "STATUS: AUTONOMOUS_ACTIVE" : "STANDARD: ERC-20 // 24FPS_3D"}</span>
              <span className="flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-[#E50914] animate-pulse" />
                <span>100% ONLINE</span>
              </span>
            </div>
          </div>

          <div className="mt-4 font-mono text-xs text-foreground/40 tracking-wider uppercase text-center">
            {activeTab === "agent"
              ? ":: AUTONOMOUS INCUBATION AGENT — DRAG TO TILT 3D PERSPECTIVE"
              : ":: WEB.3 BMSIT PROTOCOL COIN — SEAMLESS 360° ORBITAL ROTATION"}
          </div>
        </div>

        {/* Right Column: Interactive Terminal & Telemetry Dashboard (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card font-mono text-xs text-foreground/70 mb-3">
              <Sparkles className="w-3 h-3 text-[#E50914]" />
              <span>STUDENT INNOVATION LAB</span>
            </div>
            
            <ScrambleText
              text={activeTab === "agent" ? "AI INCUBATION AGENT" : "BMSIT PROTOCOL COIN"}
              as="h1"
              className="text-3xl sm:text-4xl font-black font-amiga text-foreground tracking-tight"
            />
            
            <p className="font-mono text-xs text-foreground/60 mt-2 leading-relaxed">
              {activeTab === "agent"
                ? "Interact with the Web.3 Club's autonomous mentor. Ask questions about grants, smart contract audits, hackathon team pairing, and club bootcamps."
                : "The signature 3D digital token representing builder reputation, hackathon bounties, and decentralized governance inside BMSIT Web.3 Club."}
            </p>
          </div>

          {/* Interactive Chat / Terminal Box */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3 relative shadow-md">
            <span className="tech-bracket-tl" />
            <span className="tech-bracket-tr" />

            <div className="flex items-center justify-between pb-2 border-b border-border text-xs font-mono text-foreground/50">
              <span className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-[#E50914]" />
                <span>CO-PILOT_CONSOLE</span>
              </span>
              <span>NODE: #BMSIT-01</span>
            </div>

            {/* Chat History */}
            <div className="h-48 overflow-y-auto space-y-2.5 pr-1 font-mono text-xs scrollbar-thin">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                    m.role === "system"
                      ? "bg-foreground/[0.03] text-foreground/40 border border-border/40"
                      : m.role === "agent"
                      ? "bg-foreground/[0.05] text-foreground/90 border border-border"
                      : "bg-[#E50914]/10 text-foreground border border-[#E50914]/30 ml-4"
                  }`}
                >
                  <span className="font-bold text-[10px] uppercase block mb-1 opacity-60">
                    {m.role === "system" ? "SYSTEM" : m.role === "agent" ? "AGENT" : "YOU"}
                  </span>
                  {m.text}
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-border">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask about grants, hackathons, or contracts..."
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:border-[#E50914]"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-[#E50914] hover:bg-[#d00812] text-white rounded-lg font-mono text-xs flex items-center justify-center transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 font-mono text-center">
            <div className="p-3 rounded-xl border border-border bg-card">
              <div className="text-xs text-foreground/40">GRANTS POOL</div>
              <div className="text-base font-black text-foreground mt-0.5">$50K+</div>
            </div>
            <div className="p-3 rounded-xl border border-border bg-card">
              <div className="text-xs text-foreground/40">ACTIVE BUILDERS</div>
              <div className="text-base font-black text-[#E50914] mt-0.5">500+</div>
            </div>
            <div className="p-3 rounded-xl border border-border bg-card">
              <div className="text-xs text-foreground/40">DAPPS SHIPPED</div>
              <div className="text-base font-black text-foreground mt-0.5">15+</div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

