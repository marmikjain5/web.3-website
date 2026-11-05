import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Bot, Sparkles, Compass, Trophy, MessageSquare, Clock } from "lucide-react";
import MagneticButton from "@/components/MagneticButton";

export const metadata: Metadata = {
  title: "PROTO | WEB.3 BMSIT&M",
  description:
    "PROTO is getting ready. Your WEB.3 AI Companion for exploring Web3, hackathons, and campus projects at BMSIT&M.",
};

export default function ProtoPage() {
  const PREVIEW_CAPABILITIES = [
    {
      icon: Compass,
      title: "YOUR WEB3 GUIDE",
      desc: "Explore blockchain, smart contracts, AI and emerging technologies with guided explanations.",
    },
    {
      icon: Trophy,
      title: "EVENTS & HACKATHONS",
      desc: "Discover upcoming hackathons, campus workshops, competitions, and bounty opportunities.",
    },
    {
      icon: MessageSquare,
      title: "ASK. EXPLORE. DISCOVER.",
      desc: "An AI-powered conversational experience built directly for the WEB.3 community.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden py-24 sm:py-28 px-4 sm:px-6 lg:px-12 lab-grid-bg">
      {/* Background Ambient Red/Orange Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#E50914]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-8 sm:space-y-12">
        {/* Navigation Breadcrumb & Status Pill */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-foreground/60 hover:text-[#E50914] transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>BACK TO WEB.3</span>
          </Link>

          {/* Under Construction Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-500 text-[10px] font-mono tracking-wider uppercase font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>UNDER CONSTRUCTION</span>
          </div>
        </div>

        {/* Hero Header */}
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-[#E50914]/30 bg-[#E50914]/10 text-[#E50914] font-mono text-xs font-bold uppercase tracking-widest">
            <Bot className="w-3.5 h-3.5" />
            <span>OFFICIAL WEB.3 AI COMPANION</span>
          </div>

          <h1 className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl font-black font-mono uppercase tracking-tight text-foreground break-words">
            PROTO IS GETTING READY.
          </h1>

          <div className="font-mono text-xs sm:text-sm font-bold text-[#E50914] uppercase tracking-widest">
            YOUR WEB.3 AI COMPANION.
          </div>

          <p className="font-mono text-xs sm:text-sm text-foreground/70 leading-relaxed max-w-2xl mx-auto pt-2">
            We&apos;re building something intelligent. Soon, you&apos;ll be able to explore Web3, discover hackathons, find upcoming events and get answers through PROTO.
          </p>
        </div>

        {/* Central HUD Card */}
        <div className="relative rounded-2xl border border-border bg-card/85 p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-8">
          <span className="tech-bracket-tl text-foreground/30" />
          <span className="tech-bracket-tr text-foreground/30" />
          <span className="tech-bracket-bl text-foreground/30" />
          <span className="tech-bracket-br text-foreground/30" />

          {/* Telemetry Status Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-border/80 bg-foreground/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#E50914]/10 border border-[#E50914]/20 flex items-center justify-center text-[#E50914] shrink-0">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div className="text-left font-mono">
                <div className="text-xs font-bold uppercase text-foreground">
                  STATUS: SYSTEM INITIALIZATION
                </div>
                <div className="text-[11px] text-foreground/50">
                  AI Model Pipeline & Knowledge Graph in Active Assembly
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-foreground/[0.04] border border-border text-[10px] font-mono text-foreground/60 uppercase">
              <Sparkles className="w-3 h-3 text-[#E50914]" />
              <span>PROTO_CORE // V0.1 STAGING</span>
            </div>
          </div>

          {/* Capabilities Preview Grid */}
          <div className="space-y-3">
            <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/50 font-bold">
              UPCOMING CAPABILITIES
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PREVIEW_CAPABILITIES.map((cap) => {
                const Icon = cap.icon;
                return (
                  <div
                    key={cap.title}
                    className="p-5 rounded-xl border border-border/80 bg-foreground/[0.015] hover:border-[#E50914]/40 transition-colors space-y-2 relative group"
                  >
                    <span className="tech-bracket-tl" />
                    <span className="tech-bracket-tr" />
                    <div className="w-8 h-8 rounded-lg bg-[#E50914]/10 border border-[#E50914]/20 flex items-center justify-center text-[#E50914]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-mono font-bold text-xs uppercase text-foreground group-hover:text-[#E50914] transition-colors">
                      {cap.title}
                    </h3>
                    <p className="font-mono text-[11px] text-foreground/60 leading-relaxed">
                      {cap.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Development Notice & Return CTA */}
          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="space-y-1">
              <div className="font-mono text-xs font-bold text-foreground uppercase">
                PROTO IS CURRENTLY UNDER DEVELOPMENT
              </div>
              <p className="font-mono text-xs text-foreground/60 max-w-md">
                Follow our official club channels for staging announcements, demo previews, and launch date updates.
              </p>
            </div>

            <MagneticButton strength={0.25}>
              <Link
                href="/"
                className="cyber-btn px-8 py-3.5 bg-[#E50914] hover:bg-[#c90812] text-white font-mono font-black text-xs uppercase tracking-widest shadow-[0_8px_24px_rgba(229,9,20,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>BACK TO WEB.3</span>
              </Link>
            </MagneticButton>
          </div>
        </div>

        {/* Informational Footer */}
        <div className="p-4 rounded-xl border border-border/60 bg-card/40 text-center font-mono text-[11px] text-foreground/50 max-w-xl mx-auto">
          WEB.3 BMSIT&amp;M Technical Council • PROTO Companion Project
        </div>
      </div>
    </div>
  );
}

