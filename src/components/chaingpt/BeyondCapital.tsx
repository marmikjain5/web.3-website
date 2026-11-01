"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, Layers, Sparkles } from "lucide-react";
import IncubationCapsule from "./IncubationCapsule";
import ScrambleText from "./ScrambleText";

gsap.registerPlugin(ScrollTrigger);

const PILLARS = [
  {
    id: "ai",
    label: "AI",
    desc: "Decentralized Machine Learning, Autonomous Agents & Inference",
  },
  {
    id: "defi",
    label: "DeFi",
    desc: "Next-generation AMMs, Yield Primitives & Cross-Chain Liquidity",
  },
  {
    id: "depin",
    label: "DePIN",
    desc: "Decentralized Physical Infrastructure Networks & Zero-Knowledge Verification",
  },
  {
    id: "l1l2",
    label: "L1/L2",
    desc: "High-Throughput Modular Execution Layers & Rollup Ecosystems",
  },
];

export default function BeyondCapital() {
  const [activePillar, setActivePillar] = useState("ai");
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Heading reveal
      gsap.fromTo(
        headingRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.0,
          ease: "expo.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );

      // Left column stagger
      gsap.fromTo(
        leftRef.current?.querySelectorAll(".pillar-btn") ?? [],
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: leftRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );

      // Center capsule
      gsap.fromTo(
        centerRef.current,
        { y: 40, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: centerRef.current,
            start: "top 82%",
            once: true,
          },
        }
      );

      // Right column
      gsap.fromTo(
        rightRef.current?.children ?? [],
        { x: 30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: rightRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-20 border-b border-border lab-grid-bg overflow-hidden"
    >
      {/* Subtle ambient */}
      

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">

        {/* Section Title with Scramble Effect & LabsAmiga font */}
        <div className="border-b border-border pb-6 mb-12">
          <ScrambleText
            text="BEYOND CAPITAL"
            as="h2"
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-amiga tracking-tight text-foreground block"
          />
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

          {/* LEFT — Pillars checklist */}
          <div ref={leftRef} className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-foreground" />
              <h3 className="font-mono text-lg md:text-xl font-bold uppercase tracking-wider text-foreground">
                Supercharging Web3 Builders
              </h3>
            </div>

            <div className="space-y-3">
              {PILLARS.map((p) => {
                const isSelected = activePillar === p.id;
                return (
                  <motion.button
                    key={p.id}
                    onClick={() => setActivePillar(p.id)}
                    className={`pillar-btn w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col gap-1 relative ${
                      isSelected
                        ? "bg-card border-[#E50914] shadow-[0_4px_20px_rgba(255,30,39,0.15)]"
                        : "bg-card/40 border-border hover:border-foreground/20 hover:bg-card/80"
                    }`}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {isSelected && (
                      <>
                        <span className="tech-bracket-tl text-[#E50914]" />
                        <span className="tech-bracket-tr text-[#E50914]" />
                        <span className="tech-bracket-bl text-[#E50914]" />
                        <span className="tech-bracket-br text-[#E50914]" />
                      </>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-md bg-[#E50914]/10 border border-[#E50914] flex items-center justify-center text-[#E50914] shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span className="font-mono font-bold text-base md:text-lg text-foreground">
                        {p.label}
                      </span>
                    </div>

                    <motion.p
                      className="font-mono text-xs text-foreground/60 pl-8 mt-1"
                      animate={{ opacity: isSelected ? 1 : 0.6 }}
                    >
                      {p.desc}
                    </motion.p>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* CENTER — 3D Transparent Rotating Coin Animation from labs.chaingpt.org */}
          <div ref={centerRef} className="lg:col-span-4 flex justify-center py-6 opacity-0">
            <div className="w-full max-w-[340px] aspect-square relative flex items-center justify-center">
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                
                className="w-full h-full object-contain pointer-events-none drop-shadow-[0_16px_40px_rgba(0,0,0,0.06)]"
              >
                <source
                  src="/chaingpt-assets/LABS_coin_SAFARI_HEVC.mp4"
                  type='video/mp4; codecs="hvc1"'
                />
                <source
                  src="/chaingpt-assets/LABS_coin_CHROME_VP9.webm"
                  type="video/webm"
                />
              </video>
            </div>
          </div>

          {/* RIGHT — Smart Capital cards */}
          <div ref={rightRef} className="lg:col-span-4 space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-foreground" />
                <h3 className="font-mono text-lg md:text-xl font-bold uppercase tracking-wider text-foreground">
                  Smart Capital
                </h3>
              </div>
              <p className="font-mono text-xs text-foreground/50 mt-1">
                Our ecosystem support & advisory
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {/* Card 01 */}
              <motion.div
                className="bg-card border border-border p-6 rounded-2xl relative group card-hover"
                whileHover={{ borderColor: "rgba(255,30,39,0.5)" }}
              >
                <span className="tech-bracket-tl" />
                <span className="tech-bracket-tr" />

                <div className="flex justify-between items-center text-xs font-mono text-foreground/40 mb-4">
                  <span className="flex items-center gap-1.5 font-bold text-foreground">
                    <span className="w-1.5 h-1.5 bg-foreground" />
                    PROGRAM
                  </span>
                  <span className="font-bold text-[#E50914]">01</span>
                </div>

                <div className="w-16 h-16 rounded-xl bg-foreground/[0.04] border border-border mb-4 flex items-center justify-center text-foreground/60 group-hover:scale-105 group-hover:text-[#E50914] transition-all">
                  <Layers className="w-8 h-8" />
                </div>

                <h4 className="font-mono font-bold text-base text-foreground mb-1">
                  Incubation & Acceleration Program
                </h4>
                <p className="font-mono text-xs text-foreground/60">
                  Comprehensive 12-week intensive accelerator taking teams from prototype to mainnet launch.
                </p>
              </motion.div>

              {/* Card 02 */}
              <motion.div
                className="bg-card border border-border p-6 rounded-2xl relative group card-hover"
                whileHover={{ borderColor: "rgba(255,30,39,0.5)" }}
              >
                <span className="tech-bracket-tl" />
                <span className="tech-bracket-tr" />

                <div className="flex justify-between items-center text-xs font-mono text-foreground/40 mb-4">
                  <span className="flex items-center gap-1.5 font-bold text-foreground">
                    <span className="w-1.5 h-1.5 bg-foreground" />
                    VENTURE
                  </span>
                  <span className="font-bold text-[#E50914]">02</span>
                </div>

                <div className="w-16 h-16 rounded-xl bg-foreground/[0.04] border border-border mb-4 flex items-center justify-center text-foreground/60 group-hover:scale-105 group-hover:text-[#E50914] transition-all">
                  <Sparkles className="w-8 h-8" />
                </div>

                <h4 className="font-mono font-bold text-base text-foreground mb-1">
                  Investment & Funding
                </h4>
                <p className="font-mono text-xs text-foreground/60">
                  Direct seed and private round investments, treasury backing, and Tier 1 co-investment syndicates.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
