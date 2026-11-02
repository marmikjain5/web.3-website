"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import MagneticButton from "../MagneticButton";
import HeroFrameScrubber from "./HeroFrameScrubber";

export default function ResidencyHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

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
      className="relative w-full min-h-screen py-20 sm:py-24 lg:py-32 flex flex-col items-center justify-center text-white overflow-hidden"
      style={{
        backgroundColor: "#BE4105",
        backgroundImage:
          "radial-gradient(ellipse at 50% 38%, #F26305 0%, #D84D05 45%, #BE4105 85%, #9E3202 100%)",
      }}
    >
      {/* ── Background Blueprint Grid & Coordinate Accents ── */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div
          className="w-full h-full opacity-15"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "100px 100px",
          }}
        />

        {/* Technical vertical division lines (desktop) */}
        <div className="hidden lg:block absolute top-20 bottom-10 left-[36%] w-px bg-white/20" />
        <div className="hidden lg:block absolute top-20 bottom-10 right-[36%] w-px bg-white/20" />

        {/* Corner Crosshairs */}
        <span className="absolute top-24 left-4 sm:left-10 text-white/60 font-mono text-sm">┌</span>
        <span className="absolute top-24 right-4 sm:right-10 text-white/60 font-mono text-sm">┐</span>
        <span className="absolute bottom-6 left-4 sm:left-10 text-white/60 font-mono text-sm">└</span>
        <span className="absolute bottom-6 right-4 sm:right-10 text-white/60 font-mono text-sm">┘</span>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          DESKTOP VIEWPORT (lg: 1024px+):
          Full-bleed background character canvas flanked by left & right telemetry
      ═════════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex absolute inset-0 w-full h-full z-0 overflow-hidden items-center justify-center">
        <HeroFrameScrubber
          frameCount={85}
          framePath="/hero-mouse-frames/frame_"
          className="w-full h-full flex items-center justify-center"
          showTouchHint={false}
        />
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          MAIN CONTENT CONTAINER (Responsive for Desktop & Mobile)
      ═════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 w-full relative z-20 my-auto">
        
        {/* ── DESKTOP GRID LAYOUT (lg: 1024px+) ── */}
        <div className="hidden lg:grid grid-cols-12 gap-8 items-center min-h-[65vh]">
          
          {/* LEFT COLUMN: Headline & Chamfered CTAs (Col 5) */}
          <div ref={headlineRef} className="col-span-5 space-y-5 pr-2">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/30 border border-white/30 backdrop-blur-md text-white font-mono text-[11px] font-bold tracking-widest uppercase shadow-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>BMSIT&M WEB3 CLUB</span>
            </div>

            {/* Headline */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl lg:text-[3.6rem] xl:text-[4.2rem] font-black font-sans tracking-tight leading-[0.92] text-white select-none whitespace-nowrap drop-shadow-md">
                WE BACK
              </h1>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.6rem] xl:text-[4.2rem] font-black font-amiga tracking-wider leading-[0.92] text-white select-none whitespace-nowrap drop-shadow-md">
                BUILDERS
              </h1>
            </div>

            <p className="font-mono text-xs sm:text-sm text-white/95 leading-relaxed uppercase tracking-wider max-w-md drop-shadow-sm">
              THE PREMIER STUDENT-LED BLOCKCHAIN & WEB3 TECHNICAL CLUB AT BMS INSTITUTE OF TECHNOLOGY AND MANAGEMENT, BENGALURU. EMPOWERING STUDENTS TO BUILD, SHIP, AND SCALE DECENTRALIZED PROTOCOLS.
            </p>


            {/* Chamfered Brand Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <MagneticButton strength={0.25}>
                <Link
                  href="/join"
                  className="cyber-btn px-7 py-3.5 !bg-white !text-[#BE4105] hover:!bg-white/95 font-mono font-black text-xs uppercase tracking-widest shadow-[0_12px_36px_rgba(0,0,0,0.35)] transition-all flex items-center gap-2 inline-flex cursor-pointer"
                >
                  <span>JOIN THE CLUB</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </MagneticButton>

              <MagneticButton strength={0.2}>
                <Link
                  href="/#portfolio"
                  className="cyber-btn px-6 py-3.5 bg-black/25 hover:bg-black/35 text-white font-mono font-bold text-xs uppercase tracking-widest border border-white/40 backdrop-blur-md transition-all inline-flex cursor-pointer"
                >
                  EXPLORE PROJECTS
                </Link>
              </MagneticButton>
            </div>
          </div>

          {/* CENTER COLUMN: Spacer for Fullscreen Character Centerpiece (Col 3) */}
          <div className="col-span-3 min-h-[440px] pointer-events-none" />

          {/* RIGHT COLUMN: Telemetry Cards & Node Widget (Col 4) */}
          <div ref={featuresRef} className="col-span-4 space-y-3.5 pl-3 pr-2">
            
            <div className="space-y-2.5">
              {[
                {
                  code: "01",
                  title: "HACKATHONS & BOUNTIES",
                  desc: "Team delegations to ETHIndia, Solana Renaissance, and Polygon Guilds with hands-on mentor support.",
                },
                {
                  code: "02",
                  title: "PEER-TO-PEER CO-BUILDING",
                  desc: "Direct technical pairing with senior student devs in Solidity, Rust, and ZK proofs.",
                },
                {
                  code: "03",
                  title: "ECOSYSTEM NETWORK",
                  desc: "Direct introductions to foundation developer grants, bounties, and leading Web3 internships.",
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

            <div className="text-xs font-mono text-white/95 leading-relaxed pt-1 drop-shadow-sm">
              Workshops, peer review, and campus demo days—building the decentralized web right from BMSIT&M.
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            MOBILE & TABLET VIEWPORT (< lg: 1024px):
            Clean, intentional vertical stack with dedicated character centerpiece
        ═════════════════════════════════════════════════════════════════════ */}
        <div className="lg:hidden flex flex-col items-center space-y-6 pt-2 pb-6">
          
          {/* 1. Header Tag & Title */}
          <div className="w-full text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 border border-white/30 backdrop-blur-md text-white font-mono text-[10px] font-bold tracking-widest uppercase shadow-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>BMSIT&M WEB3 CLUB</span>
            </div>

            <div className="space-y-0.5">
              <h1 className="text-3xl sm:text-5xl font-black font-sans tracking-tight text-white leading-tight uppercase drop-shadow-md">
                WE BACK
              </h1>
              <h1 className="text-3xl sm:text-5xl font-black font-amiga tracking-wider text-white leading-tight uppercase drop-shadow-md">
                BUILDERS
              </h1>
            </div>
          </div>

          {/* 2. DEDICATED MOBILE CHARACTER CENTERPIECE STAGE (Interactive Touch & Drag!) */}
          <div className="w-full max-w-sm sm:max-w-md h-[340px] sm:h-[420px] relative rounded-2xl overflow-hidden border border-white/25 bg-black/15 backdrop-blur-sm shadow-xl flex items-center justify-center my-1">
            <HeroFrameScrubber
              frameCount={85}
              framePath="/hero-mouse-frames/frame_"
              className="w-full h-full"
              showTouchHint={true}
            />
            {/* Tech Corner Brackets on the mobile interactive frame */}
            <span className="tech-bracket-tl text-white/60" />
            <span className="tech-bracket-tr text-white/60" />
            <span className="tech-bracket-bl text-white/60" />
            <span className="tech-bracket-br text-white/60" />
          </div>

          {/* 3. Pitch Description & Metrics */}
          <div className="w-full max-w-md text-center space-y-4">
            <p className="font-mono text-xs text-white/90 leading-relaxed uppercase tracking-wider px-2">
              The premier student-led blockchain & Web3 technical club at BMS Institute of Technology and Management, Bengaluru.
            </p>


            {/* Mobile Chamfered Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              <Link
                href="/join"
                className="cyber-btn w-full sm:w-auto px-6 py-3.5 !bg-white !text-[#BE4105] hover:!bg-white/95 font-mono font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>JOIN THE CLUB</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/#portfolio"
                className="cyber-btn w-full sm:w-auto px-6 py-3 bg-black/25 text-white font-mono font-bold text-xs uppercase tracking-widest border border-white/40 flex items-center justify-center cursor-pointer"
              >
                EXPLORE PROJECTS
              </Link>
            </div>
          </div>

          {/* 4. Telemetry Cards (Mobile Stack) */}
          <div className="w-full max-w-md space-y-2.5 pt-2">
            {[
              {
                code: "01",
                title: "HACKATHONS & BOUNTIES",
                desc: "Team delegations to ETHIndia, Solana Renaissance, and Polygon Guilds with hands-on mentor support.",
              },
              {
                code: "02",
                title: "PEER-TO-PEER CO-BUILDING",
                desc: "Direct technical pairing with senior student devs in Solidity, Rust, and ZK proofs.",
              },
              {
                code: "03",
                title: "ECOSYSTEM NETWORK",
                desc: "Direct introductions to foundation developer grants, bounties, and leading Web3 internships.",
              },
            ].map((item) => (
              <div
                key={item.code}
                className="relative p-3.5 rounded-xl border border-white/25 bg-black/20 backdrop-blur-md"
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-mono font-bold text-xs text-white uppercase flex items-center gap-1.5">
                    <span className="text-[#FFE600] font-bold">›</span>
                    {item.title}
                  </h4>
                  <span className="font-mono text-[10px] text-white/70 font-bold">{item.code}</span>
                </div>
                <p className="font-mono text-[11px] text-white/85 leading-relaxed pl-3">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
