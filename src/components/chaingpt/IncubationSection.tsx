"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Coins, Handshake, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MagneticButton from "@/components/MagneticButton";
import ScrambleText from "./ScrambleText";

gsap.registerPlugin(ScrollTrigger);

const SUPPORT_CARDS = [
  {
    num: "01",
    title: "Product & Architecture",
    desc: "Zero-knowledge proofs, smart contract architecture reviews, and audits by elite Web3 security auditors.",
    icon: ShieldCheck,
  },
  {
    num: "02",
    title: "Treasury Building",
    desc: "Institutional tokenomics modeling, liquidity provision, market making strategies, and runway planning.",
    icon: Coins,
  },
  {
    num: "03",
    title: "Strategic Partnerships",
    desc: "Curated matchmaking with Tier 1 exchanges, top validator networks, and liquidity providers worldwide.",
    icon: Handshake,
  },
  {
    num: "04",
    title: "Growth & GTM Acceleration",
    desc: "Global hacker house sponsorships, developer advocate programs, and community token launchpad syndicates.",
    icon: Zap,
  },
];

export default function IncubationSection() {
  const [startIndex, setStartIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  const prevCard = () => {
    setStartIndex((prev) => (prev === 0 ? SUPPORT_CARDS.length - 2 : prev - 1));
  };
  const nextCard = () => {
    setStartIndex((prev) => (prev >= SUPPORT_CARDS.length - 2 ? 0 : prev + 1));
  };

  const visibleCards = SUPPORT_CARDS.slice(startIndex, startIndex + 2);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.from(headerRef.current.children, {
          y: 35,
          opacity: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        });
      }

      if (leftColRef.current) {
        gsap.from(leftColRef.current, {
          x: -40,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
        });
      }

      if (rightColRef.current) {
        gsap.from(rightColRef.current, {
          x: 40,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full py-20 border-b border-border lab-grid-bg overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Section Header with Giant Typography & Scramble Animation */}
        <div ref={headerRef} className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6 mb-12 gap-6">
          <ScrambleText
            text="INCUBATION"
            as="h2"
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-amiga tracking-tight text-foreground"
          />

          <div className="flex items-center gap-2 text-xs font-mono text-foreground/50">
            <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse shadow-[0_0_8px_#E50914]" />
            <span>FULL_CYCLE_VENTURE_STUDIO</span>
          </div>
        </div>

        {/* 3-Column Layout: Support Cards | Center Energy Conduit | Unique Approach */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: End-End Support & Carousel */}
          <div ref={leftColRef} className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-foreground" />
                <h3 className="font-mono text-lg md:text-xl font-bold uppercase tracking-wider text-foreground">
                  End-end Support
                </h3>
              </div>
              <p className="font-mono text-xs text-foreground/50 mt-1">
                From pre-seed funding to global GTM
              </p>
            </div>

            {/* Support Cards Grid with AnimatePresence */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-h-[240px]">
              <AnimatePresence mode="popLayout">
                {visibleCards.map((card) => {
                  const IconComponent = card.icon;
                  return (
                    <motion.div
                      key={card.num}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ y: -4, borderColor: "rgba(229,9,20,0.5)" }}
                      className="bg-card border border-border p-5 rounded-xl relative group transition-colors shadow-sm flex flex-col justify-between min-h-[220px]"
                    >
                      <span className="tech-bracket-tl" />
                      <span className="tech-bracket-tr" />

                      <div>
                        <div className="flex justify-between items-center text-xs font-mono text-foreground/40 mb-3">
                          <span className="w-1.5 h-1.5 bg-[#E50914]" />
                          <span className="font-bold text-[#E50914]">{card.num}</span>
                        </div>

                        <div className="w-12 h-12 rounded-lg bg-foreground/[0.04] border border-border flex items-center justify-center text-foreground/70 mb-3 group-hover:text-[#E50914] group-hover:scale-105 transition-all">
                          <IconComponent className="w-6 h-6" />
                        </div>

                        <h4 className="font-mono font-bold text-sm text-foreground mb-1 group-hover:text-[#E50914] transition-colors">
                          {card.title}
                        </h4>
                        <p className="font-mono text-[11px] text-foreground/60 leading-relaxed">
                          {card.desc}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={prevCard}
                className="w-9 h-9 rounded-lg border border-border bg-card flex items-center justify-center hover:text-[#E50914] hover:border-[#E50914] transition-colors cursor-pointer"
                aria-label="Previous support items"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextCard}
                className="w-9 h-9 rounded-lg border border-border bg-card flex items-center justify-center hover:text-[#E50914] hover:border-[#E50914] transition-colors cursor-pointer"
                aria-label="Next support items"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs text-foreground/40 ml-2">
                0{startIndex + 1} - 0{Math.min(startIndex + 2, SUPPORT_CARDS.length)} / 0{SUPPORT_CARDS.length}
              </span>
            </div>
          </div>

          {/* Center Column: 3D Transparent Robot Animation from labs.chaingpt.org */}
          <div className="lg:col-span-2 hidden lg:flex flex-col items-center justify-center relative">
            <div className="w-full max-w-[220px] aspect-[800/1024] relative flex items-center justify-center">
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="w-full h-full object-contain pointer-events-none drop-shadow-[0_12px_32px_rgba(229,9,20,0.2)]"
              >
                <source
                  src="/chaingpt-assets/LABS_robot_SAFARI_HEVC.mp4"
                  type='video/mp4; codecs="hvc1"'
                />
                <source
                  src="/chaingpt-assets/LABS_robot_CHROME_VP9.webm"
                  type="video/webm"
                />
              </video>
            </div>
          </div>

          {/* Right Column: Unique Approach & Narrative */}
          <div ref={rightColRef} className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-foreground" />
                <h3 className="font-mono text-lg md:text-xl font-bold uppercase tracking-wider text-foreground">
                  Unique Approach
                </h3>
              </div>
              <p className="font-mono text-xs text-foreground/50 mt-1">
                Beyond Capital
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border relative">
              <span className="tech-bracket-tl" />
              <span className="tech-bracket-tr" />
              <span className="tech-bracket-bl" />
              <span className="tech-bracket-br" />

              <p className="font-mono text-sm md:text-base text-foreground/80 leading-relaxed">
                We do the impossible. In web3, it takes an entire ecosystem to transform ideas into industry leaders. With strategic funding, GTM support, and top-tier partnerships — we set you up for unparalleled growth.
              </p>

              <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                <MagneticButton strength={0.25}>
                  <Link
                    href="/events"
                    className="cyber-btn px-6 py-3 bg-[#E50914] hover:bg-[#e0151e] text-white font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_16px_rgba(255,30,39,0.3)] transition-all flex items-center gap-2"
                  >
                    <span>JOIN OUR PROGRAM</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </MagneticButton>
                
                <span className="font-mono text-[11px] text-foreground/40 uppercase">
                  BATCH 2026 LIVE
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
