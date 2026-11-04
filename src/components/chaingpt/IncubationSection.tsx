"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, BookOpen, Code2, Trophy, Rocket, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrambleText from "./ScrambleText";
import Robot3DCanvas from "./Robot3DCanvas";

gsap.registerPlugin(ScrollTrigger);

const SUPPORT_CARDS = [
  {
    num: "01",
    title: "Learn & Explore",
    desc: "Master blockchain fundamentals, smart contract development, and decentralized architectures through student-led workshops and bootcamps.",
    icon: BookOpen,
  },
  {
    num: "02",
    title: "Build Projects",
    desc: "Turn technical concepts into production dApps, open-source developer tooling, and decentralized protocols alongside senior student peers.",
    icon: Code2,
  },
  {
    num: "03",
    title: "Compete & Collaborate",
    desc: "Form multidisciplinary builder squads, compete in leading national and global Web3 hackathons, and tackle ecosystem bounties.",
    icon: Trophy,
  },
  {
    num: "04",
    title: "Showcase & Grow",
    desc: "Exhibit your working code at campus demo days, connect with foundation grants, and accelerate your engineering journey.",
    icon: Rocket,
  },
];

export default function IncubationSection() {
  const [startIndex, setStartIndex] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const centerColRef = useRef<HTMLDivElement>(null);
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
          y: 30,
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
    <section ref={sectionRef} className="relative w-full py-16 sm:py-20 border-b border-border lab-grid-bg overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header with Giant Typography & Scramble Animation */}
        <div ref={headerRef} className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6 mb-12 gap-4 overflow-visible">
          <ScrambleText
            text="THE BUILDER ECOSYSTEM"
            as="h2"
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black font-amiga tracking-tight text-foreground block max-w-full break-words pl-0.5"
          />
        </div>

        {/* Interactive Cards Area with 3D Robot & Constellation Stage */}
        <div className="relative w-full">
          {/* Full-width 3D Robot Stage & Soft Halo centered behind cards */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[580px] sm:h-[650px] lg:h-[720px] pointer-events-none flex items-center justify-center z-0 overflow-visible">
            {/* Soft, light ambient halo positioned directly behind the robot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 flex items-center justify-center">
              <div
                className="w-[360px] sm:w-[440px] h-[360px] sm:h-[440px] rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(circle, rgba(229, 9, 20, 0.28) 0%, rgba(229, 9, 20, 0.12) 45%, rgba(229, 9, 20, 0) 70%)",
                  filter: "blur(40px)",
                }}
              />
              <div
                className="absolute w-[200px] sm:w-[260px] h-[200px] sm:h-[260px] rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(circle, rgba(229, 9, 20, 0.38) 0%, rgba(229, 9, 20, 0.16) 50%, rgba(229, 9, 20, 0) 75%)",
                  filter: "blur(25px)",
                }}
              />
            </div>

            {/* Real 3D Robot Model & Constellation spanning the section */}
            <Robot3DCanvas className="w-full h-full pointer-events-auto" />
          </div>

          {/* 3-Column Balanced Layout: Cards sit in front of the constellation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start lg:items-center relative z-10 pointer-events-none">
          
          {/* Left Column: End-End Support & Carousel (4 cols) */}
          <div ref={leftColRef} className="lg:col-span-4 space-y-6 pointer-events-auto">
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
            <div className="space-y-3.5 min-h-[290px]">
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
                      className="bg-card border border-border p-4 sm:p-5 rounded-xl relative group transition-colors shadow-sm flex flex-col justify-between min-h-[135px] w-full"
                    >
                      <span className="tech-bracket-tl" />
                      <span className="tech-bracket-tr" />

                      <div>
                        <div className="flex justify-between items-center text-xs font-mono text-foreground/40 mb-2">
                          <span className="w-1.5 h-1.5 bg-[#E50914] ml-1.5" />
                          <span className="font-bold text-[#E50914] mr-2 text-sm">{card.num}</span>
                        </div>

                        <div className="flex items-center gap-3 mb-1.5">
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

            {/* Navigation Arrows with touch-friendly 40px+ tap targets */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                onClick={prevCard}
                className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg border border-border bg-card flex items-center justify-center hover:text-[#E50914] hover:border-[#E50914] transition-colors cursor-pointer min-h-[40px] sm:min-h-0"
                aria-label="Previous support items"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextCard}
                className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg border border-border bg-card flex items-center justify-center hover:text-[#E50914] hover:border-[#E50914] transition-colors cursor-pointer min-h-[40px] sm:min-h-0"
                aria-label="Next support items"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs text-foreground/50 ml-2">
                0{startIndex + 1} - 0{Math.min(startIndex + 2, SUPPORT_CARDS.length)} / 0{SUPPORT_CARDS.length}
              </span>
            </div>
          </div>

          {/* Center Column: AI Robot (center spacer & status telemetry) */}
          <div ref={centerColRef} className="lg:col-span-4 flex flex-col items-center justify-center relative py-4 lg:py-0 pointer-events-none">
            <div className="relative w-full max-w-[300px] sm:max-w-[340px] aspect-square rounded-2xl overflow-visible flex items-center justify-center" />

            {/* Status line */}
            <div className="mt-3 text-center space-y-1.5 pointer-events-auto">
              <span className="font-mono text-[10px] text-foreground/45 uppercase tracking-wider block">
                :: PROTO_AI_AGENT // ACTIVE TELEMETRY
              </span>
              <Link
                href="/proto"
                className="inline-flex items-center gap-1.5 font-mono text-[11px] text-foreground/70 hover:text-[#E50914] tracking-wider uppercase transition-colors group cursor-pointer min-h-[44px]"
              >
                <span>EXPLORE WITH PROTO</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#E50914]" />
              </Link>
            </div>
          </div>

          {/* Right Column: Philosophy (4 cols) */}
          <div ref={rightColRef} className="lg:col-span-4 space-y-6 pointer-events-auto">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-foreground" />
                <h3 className="font-mono text-lg md:text-xl font-bold uppercase tracking-wider text-foreground">
                  Our Philosophy
                </h3>
              </div>
              <p className="font-mono text-xs text-foreground/50 mt-1">
                Learn by Building, Ship to Mainnet
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border relative">
              <span className="tech-bracket-tl" />
              <span className="tech-bracket-tr" />
              <span className="tech-bracket-bl" />
              <span className="tech-bracket-br" />

              <p className="font-mono text-xs sm:text-sm text-foreground/80 leading-relaxed">
                At BMSIT&amp;M Web.3 Club, we believe the best way to master decentralized technologies is through hands-on building. We foster an open, collaborative environment where curious students transform into sovereign engineers, shipping production code and competing on the global stage.
              </p>

              <div className="mt-6 pt-4 border-t border-border/70 flex items-center justify-between text-xs font-mono text-foreground/50">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E50914] animate-pulse" />
                  <span className="text-[10px] uppercase tracking-wider font-bold text-foreground/70">
                    BMSIT&amp;M BUILDER SQUADS
                  </span>
                </div>
                <span className="text-[10px] font-mono text-foreground/40 uppercase">
                  CAMPUS_INITIATIVE
                </span>
              </div>
            </div>
          </div>

          </div>
        </div>

      </div>
    </section>
  );
}
