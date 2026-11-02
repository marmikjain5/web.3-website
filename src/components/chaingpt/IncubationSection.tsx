"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Coins, Handshake, ArrowRight, ShieldCheck, Zap, Bot, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MagneticButton from "@/components/MagneticButton";
import ScrambleText from "./ScrambleText";

gsap.registerPlugin(ScrollTrigger);

const SUPPORT_CARDS = [
  {
    num: "01",
    title: "Smart Contract Architecture",
    desc: "Gas optimization, security best practices, and Solidity/Rust peer reviews by senior student engineers.",
    icon: ShieldCheck,
  },
  {
    num: "02",
    title: "Hackathons & Grants",
    desc: "Structuring winning proposals for Polygon Village, Solana Foundation, and Arbitrum student developer grants.",
    icon: Coins,
  },
  {
    num: "03",
    title: "Industry Masterclasses",
    desc: "AMAs and live code-alongs with Web3 protocol engineers, dev advocates, and BMSIT alumni.",
    icon: Handshake,
  },
  {
    num: "04",
    title: "Campus Demo Days",
    desc: "Live exhibitions of student dApps in front of faculty, peers, and Bengaluru Web3 startup founders.",
    icon: Zap,
  },
];

export default function IncubationSection() {
  const [startIndex, setStartIndex] = useState(0);
  const [activeModel, setActiveModel] = useState<"coin" | "robot">("coin");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const centerColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const prevCard = () => {
    setStartIndex((prev) => (prev === 0 ? SUPPORT_CARDS.length - 2 : prev - 1));
  };
  const nextCard = () => {
    setStartIndex((prev) => (prev >= SUPPORT_CARDS.length - 2 ? 0 : prev + 1));
  };

  const visibleCards = SUPPORT_CARDS.slice(startIndex, startIndex + 2);

  // Parallax tilt on mouse hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => setMousePos({ x: 0, y: 0 });

  // Ensure video plays smoothly on model change
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, [activeModel]);

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
          x: -30,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
        });
      }

      if (centerColRef.current) {
        gsap.from(centerColRef.current, {
          scale: 0.92,
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
          x: 30,
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
        <div ref={headerRef} className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6 mb-12 gap-4">
          <ScrambleText
            text="STUDENT INCUBATOR"
            as="h2"
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-amiga tracking-tight text-foreground"
          />

          <div className="flex items-center gap-2 text-xs font-mono text-foreground/60 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse shadow-[0_0_8px_#E50914]" />
            <span>BMSIT_INCUBATION_COHORT_2026</span>
          </div>
        </div>

        {/* 3-Column Balanced Layout: 4 cols Cards | 4 cols Center 3D Stage | 4 cols Narrative */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: End-End Support & Carousel (4 cols) */}
          <div ref={leftColRef} className="lg:col-span-4 space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-foreground" />
                <h3 className="font-mono text-lg md:text-xl font-bold uppercase tracking-wider text-foreground">
                  End-to-End Support
                </h3>
              </div>
              <p className="font-mono text-xs text-foreground/50 mt-1">
                From idea validation to hackathon demo day
              </p>
            </div>

            {/* Support Cards Grid with AnimatePresence */}
            <div className="space-y-3.5 min-h-[260px]">
              <AnimatePresence mode="wait">
                {visibleCards.map((card) => {
                  const IconComponent = card.icon;
                  return (
                    <motion.div
                      key={card.num}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      whileHover={{ y: -3, borderColor: "rgba(229,9,20,0.5)" }}
                      className="bg-card border border-border p-5 rounded-xl relative group transition-colors shadow-sm flex flex-col justify-between"
                    >
                      <span className="tech-bracket-tl" />
                      <span className="tech-bracket-tr" />

                      <div>
                        <div className="flex justify-between items-center text-xs font-mono text-foreground/40 mb-2.5">
                          <span className="w-1.5 h-1.5 bg-[#E50914] ml-1.5" />
                          <span className="font-bold text-[#E50914] mr-2 text-sm">{card.num}</span>
                        </div>

                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 rounded-lg bg-foreground/[0.04] border border-border flex items-center justify-center text-foreground/70 shrink-0 group-hover:text-[#E50914] group-hover:scale-105 transition-all">
                            <IconComponent className="w-4.5 h-4.5" />
                          </div>
                          <h4 className="font-mono font-bold text-sm text-foreground group-hover:text-[#E50914] transition-colors leading-tight">
                            {card.title}
                          </h4>
                        </div>

                        <p className="font-mono text-[11px] text-foreground/60 leading-relaxed pl-1">
                          {card.desc}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={prevCard}
                className="w-8 h-8 rounded-lg border border-border bg-card flex items-center justify-center hover:text-[#E50914] hover:border-[#E50914] transition-colors cursor-pointer"
                aria-label="Previous support items"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextCard}
                className="w-8 h-8 rounded-lg border border-border bg-card flex items-center justify-center hover:text-[#E50914] hover:border-[#E50914] transition-colors cursor-pointer"
                aria-label="Next support items"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs text-foreground/40 ml-2">
                0{startIndex + 1} - 0{Math.min(startIndex + 2, SUPPORT_CARDS.length)} / 0{SUPPORT_CARDS.length}
              </span>
            </div>
          </div>

          {/* Center Column: 3D Protocol Coin & Autonomous Robot Stage */}
          <div ref={centerColRef} className="lg:col-span-4 flex flex-col items-center justify-center relative py-4 lg:py-0">
            
            {/* Interactive Switcher: 3D Protocol Coin | AI Agent */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card border border-border mb-3 shadow-sm select-none z-20">
              <button
                onClick={() => setActiveModel("coin")}
                className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeModel === "coin"
                    ? "bg-[#E50914] text-white shadow-[0_0_12px_rgba(229,9,20,0.4)]"
                    : "text-foreground/60 hover:text-foreground hover:bg-foreground/[0.04]"
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>3D PROTOCOL COIN</span>
              </button>
              <button
                onClick={() => setActiveModel("robot")}
                className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeModel === "robot"
                    ? "bg-[#E50914] text-white shadow-[0_0_12px_rgba(229,9,20,0.4)]"
                    : "text-foreground/60 hover:text-foreground hover:bg-foreground/[0.04]"
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>AI AGENT</span>
              </button>
            </div>

            {/* 3D Interactive Stage with Mouse Parallax */}
            <motion.div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              animate={{
                rotateY: mousePos.x * 14,
                rotateX: -mousePos.y * 14,
              }}
              transition={{ type: "spring", damping: 20, stiffness: 150 }}
              style={{ transformStyle: "preserve-3d" }}
              className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-square rounded-2xl overflow-visible flex items-center justify-center cursor-grab active:cursor-grabbing"
            >
              {/* Subtle ambient radiant glow behind the model */}
              <div
                className={`absolute inset-0 blur-3xl rounded-full pointer-events-none transition-colors duration-500 ${
                  activeModel === "coin" ? "bg-[rgb(255,122,0)]/15" : "bg-[#E50914]/15"
                }`}
              />
              
              {activeModel === "coin" ? (
                <video
                  ref={videoRef}
                  key="main_coin_video"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="w-full h-full object-contain pointer-events-none filter drop-shadow-[0_20px_40px_rgba(255,122,0,0.45)]"
                >
                  <source src="/chaingpt-assets/LABS_coin_CHROME_VP9.webm" type="video/webm" />
                  <source src="/chaingpt-assets/LABS_coin_SAFARI_HEVC.mp4" type="video/mp4" />
                </video>
              ) : (
                <video
                  ref={videoRef}
                  key="main_robot_video"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="w-full h-full object-contain pointer-events-none filter drop-shadow-[0_20px_40px_rgba(229,9,20,0.3)]"
                >
                  <source src="/chaingpt-assets/LABS_robot_CHROME_VP9.webm" type="video/webm" />
                  <source src="/chaingpt-assets/LABS_robot_SAFARI_HEVC.mp4" type="video/mp4" />
                </video>
              )}
            </motion.div>
            
            {/* Status Subtitle and Link */}
            <div className="mt-2 text-center space-y-1">
              <span className="font-mono text-[10px] text-foreground/50 uppercase tracking-wider block">
                {activeModel === "coin"
                  ? ":: BMSIT PROTOCOL COIN — SEAMLESS 360° ORBIT"
                  : ":: AUTONOMOUS AI AGENT — ACTIVE TELEMETRY"}
              </span>
              <Link
                href="/laboratory"
                className="inline-flex items-center gap-1.5 font-mono text-[11px] text-foreground/70 hover:text-[#E50914] tracking-wider uppercase transition-colors group cursor-pointer"
              >
                <span>OPEN 3D LAB &amp; AI CO-PILOT</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#E50914]" />
              </Link>
            </div>
          </div>

          {/* Right Column: Unique Approach & Narrative (4 cols) */}
          <div ref={rightColRef} className="lg:col-span-4 space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-foreground" />
                <h3 className="font-mono text-lg md:text-xl font-bold uppercase tracking-wider text-foreground">
                  Our Approach
                </h3>
              </div>
              <p className="font-mono text-xs text-foreground/50 mt-1">
                From Lab Projects to Mainnet
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border relative">
              <span className="tech-bracket-tl" />
              <span className="tech-bracket-tr" />
              <span className="tech-bracket-bl" />
              <span className="tech-bracket-br" />

              <p className="font-mono text-xs sm:text-sm text-foreground/80 leading-relaxed">
                At BMSIT&amp;M Web.3 Club, we bridge the gap between classroom theory and decentralized production. Through peer-to-peer co-building, grant structuring, and hackathon sprints, we empower student teams to build, ship, and scale real protocols.
              </p>

              <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
                <MagneticButton strength={0.25}>
                  <Link
                    href="/join"
                    className="cyber-btn px-5 py-2.5 bg-[#E50914] hover:bg-[#e0151e] text-white font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_16px_rgba(255,30,39,0.3)] transition-all flex items-center gap-2"
                  >
                    <span>SUBMIT YOUR IDEA</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </MagneticButton>
                
                <span className="font-mono text-[10px] text-foreground/50 uppercase">
                  COHORT 2026 OPEN
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
