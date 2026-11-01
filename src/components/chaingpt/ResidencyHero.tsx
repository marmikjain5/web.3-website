"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MagneticButton from "@/components/MagneticButton";
import HeroFrameScrubber from "./HeroFrameScrubber";

gsap.registerPlugin(ScrollTrigger);

export default function ResidencyHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  // GSAP ScrollTrigger Entrance
  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      if (headlineRef.current) {
        gsap.from(headlineRef.current.children, {
          y: 28,
          opacity: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: "power3.out",
        });
      }

      if (featuresRef.current) {
        gsap.from(featuresRef.current.children, {
          x: 28,
          opacity: 0,
          stagger: 0.12,
          duration: 0.8,
          ease: "power3.out",
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="residency"
      className="relative w-full min-h-screen py-24 sm:py-28 lg:py-32 flex items-center justify-center text-white overflow-hidden"
      style={{
        backgroundColor: "#BE4105",
        backgroundImage:
          "radial-gradient(ellipse at 50% 38%, #F26305 0%, #D84D05 45%, #BE4105 85%, #9E3202 100%)",
      }}
    >
      {/* ── Centerpiece Cursor-Driven Face Tracking Canvas (HeroFrameScrubber) ── */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden flex items-center justify-center">
        <HeroFrameScrubber
          frameCount={85}
          framePath="/hero-mouse-frames/frame_"
          className="w-full h-full flex items-center justify-center"
        />
      </div>

      {/* Blueprint Grid Lines & Corner Accents */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div
          className="w-full h-full opacity-15"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "100px 100px",
          }}
        />

        {/* Technical vertical division lines */}
        <div className="hidden lg:block absolute top-20 bottom-10 left-[36%] w-px bg-white/20" />
        <div className="hidden lg:block absolute top-20 bottom-10 right-[36%] w-px bg-white/20" />

        {/* Corner Crosshairs & L Brackets */}
        <span className="absolute top-24 left-6 sm:left-10 text-white/60 font-mono text-sm">┌</span>
        <span className="absolute top-24 right-6 sm:right-10 text-white/60 font-mono text-sm">┐</span>
        <span className="absolute bottom-6 left-6 sm:left-10 text-white/60 font-mono text-sm">└</span>
        <span className="absolute bottom-6 right-6 sm:right-10 text-white/60 font-mono text-sm">┘</span>

        {/* Coordinate markers */}
        <span className="absolute top-28 left-12 sm:left-16 font-mono text-[10px] text-white/60 tracking-widest uppercase">
          SYS:RESIDENCY_V2.4 // LATENCY: 0.14MS
        </span>
        <span className="absolute bottom-8 left-12 sm:left-16 font-mono text-[10px] text-white/60 tracking-widest uppercase">
          PROTOCOL: CAPITAL + ADVISORY
        </span>
      </div>

      {/* ── Content Grid Overlaid on Full Screen Video ── */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 w-full relative z-20 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center min-h-[65vh]">
          
          {/* ════════ LEFT COLUMN: Headline & Chamfered CTAs (Col 5) ════════ */}
          <div ref={headlineRef} className="lg:col-span-5 space-y-5 lg:pr-2">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/30 border border-white/30 backdrop-blur-md text-white font-mono text-[11px] font-bold tracking-widest uppercase shadow-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>INCUBATION RESIDENCY 2026</span>
            </div>

            {/* Headline with No Text Clipping & High-Fidelity Typography */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.6rem] xl:text-[4.2rem] font-black font-sans tracking-tight leading-[0.92] text-white select-none whitespace-nowrap drop-shadow-md">
                WE BACK
              </h1>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.6rem] xl:text-[4.2rem] font-black font-amiga tracking-wider leading-[0.92] text-white select-none whitespace-nowrap drop-shadow-md">
                BUILDERS
              </h1>
            </div>

            <p className="font-mono text-xs sm:text-sm text-white/95 leading-relaxed uppercase tracking-wider max-w-md drop-shadow-sm">
              A CURATED, HIGH-TOUCH RESIDENCY DESIGNED TO TAKE WEB3 TEAMS FROM EARLY TRACTION TO FULLY LAUNCH-READY, WITH HANDS-ON SUPPORT ACROSS PRODUCT, TOKENOMICS, FUNDRAISING, AND GO-TO-MARKET.
            </p>

            {/* Proof Points & High-Trust Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-3 max-w-md border-t border-white/20">
              <div>
                <div className="font-mono font-black text-xl sm:text-2xl text-white tracking-tight drop-shadow-sm">$40M+</div>
                <div className="font-mono text-[10px] text-white/80 uppercase tracking-wider">Capital Raised</div>
              </div>
              <div>
                <div className="font-mono font-black text-xl sm:text-2xl text-white tracking-tight drop-shadow-sm">14+</div>
                <div className="font-mono text-[10px] text-white/80 uppercase tracking-wider">Incubations</div>
              </div>
              <div>
                <div className="font-mono font-black text-xl sm:text-2xl text-white tracking-tight drop-shadow-sm">100%</div>
                <div className="font-mono text-[10px] text-white/80 uppercase tracking-wider">Hands-On</div>
              </div>
            </div>

            {/* Chamfered Brand Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <MagneticButton strength={0.25}>
                <Link
                  href="/join"
                  className="cyber-btn px-7 py-3.5 !bg-white !text-[#BE4105] hover:!bg-white/95 font-mono font-black text-xs uppercase tracking-widest shadow-[0_12px_36px_rgba(0,0,0,0.35)] transition-all flex items-center gap-2 inline-flex cursor-pointer"
                >
                  <span>APPLY FOR RESIDENCY</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </MagneticButton>

              <MagneticButton strength={0.2}>
                <Link
                  href="/#incubation-hub"
                  className="cyber-btn px-6 py-3.5 bg-black/25 hover:bg-black/35 text-white font-mono font-bold text-xs uppercase tracking-widest border border-white/40 backdrop-blur-md transition-all inline-flex cursor-pointer"
                >
                  LEARN MORE
                </Link>
              </MagneticButton>
            </div>
          </div>

          {/* ════════ CENTER COLUMN: Spacer for Character Centerpiece (Col 3) ════════ */}
          <div className="hidden lg:block lg:col-span-3 min-h-[420px] pointer-events-none" />

          {/* ════════ RIGHT COLUMN: Telemetry Cards & Node Widget (Col 4) ════════ */}
          <div ref={featuresRef} className="lg:col-span-4 space-y-3.5 lg:pl-3 lg:pr-4">
            
            {/* 3 Sleek Telemetry Cards */}
            <div className="space-y-2.5">
              {[
                {
                  code: "01",
                  title: "CAPITAL & GRANTS",
                  desc: "Up to $250k initial check, syndicate co-investment, and non-dilutive grant backing.",
                },
                {
                  code: "02",
                  title: "TECHNICAL CO-BUILDING",
                  desc: "Direct pairing with senior cryptography, smart contract, and tokenomics engineers.",
                },
                {
                  code: "03",
                  title: "INSTITUTIONAL ACCESS",
                  desc: "Immediate introductions to tier-1 market makers, audited launchpads, and exchanges.",
                },
              ].map((item) => (
                <div
                  key={item.code}
                  className="relative p-3.5 sm:p-4 rounded-xl border border-white/30 bg-black/25 backdrop-blur-md hover:bg-black/35 hover:border-white/50 transition-all duration-200 group"
                >
                  <span className="tech-bracket-tl text-white/50" />
                  <span className="tech-bracket-tr text-white/50" />

                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-mono font-black text-xs sm:text-sm text-white tracking-wider uppercase flex items-center gap-2">
                      <span className="text-[#FFE600] font-bold">›</span>
                      {item.title}
                    </h4>
                    <span className="font-mono text-[10px] text-white/80 font-bold">{item.code}</span>
                  </div>

                  <p className="font-mono text-[11px] sm:text-xs text-white/95 leading-relaxed pl-3.5">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom Support Tagline */}
            <div className="text-xs font-mono text-white/95 leading-relaxed pt-1 drop-shadow-sm">
              Strategy, capital, and launch support, working alongside your team from day one.
            </div>

            {/* Bottom-right bracketed widget with 3D isometric node */}
            <div className="border border-white/30 px-4 py-2.5 flex items-center justify-between font-mono text-xs text-white/95 bg-black/30 backdrop-blur-md rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 relative shrink-0">
                  <div className="absolute inset-0 border border-white/70 rotate-45 scale-75" />
                  <div className="absolute inset-0 border border-white/50 rotate-12 scale-90" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-sm shadow-[0_0_8px_white]" />
                  </div>
                </div>
                <span className="tracking-widest uppercase font-bold text-[11px]">ISO_NODE // ACTIVE</span>
              </div>
              <span className="text-[10px] text-emerald-300 font-bold tracking-wider">
                ● 100% SYNCED
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
