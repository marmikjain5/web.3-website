"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Gem, Trophy, Vote, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrambleText from "./ScrambleText";

gsap.registerPlugin(ScrollTrigger);

const COIN_FEATURES = [
  {
    icon: Gem,
    title: "Builder Reputation",
    desc: "On-chain proof of your Web3 contributions, skills, and project milestones.",
  },
  {
    icon: Trophy,
    title: "Hackathon Bounties",
    desc: "Earn protocol coins by winning hackathons, completing bounties, and shipping dApps.",
  },
  {
    icon: Vote,
    title: "DAO Governance",
    desc: "Vote on club proposals, treasury allocation, and curriculum direction.",
  },
];

export default function CoinShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  };
  const handleMouseLeave = () => setMousePos({ x: 0, y: 0 });

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".coin-title-anim", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
      });
      gsap.from(".coin-left-anim", {
        x: -40,
        opacity: 0,
        duration: 0.9,
        delay: 0.15,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      });
      gsap.from(".coin-right-anim", {
        x: 40,
        opacity: 0,
        duration: 0.9,
        delay: 0.15,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      });
      gsap.from(".coin-feature-card", {
        y: 30,
        opacity: 0,
        stagger: 0.12,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 65%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-20 border-b border-border lab-grid-bg overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        {/* Section Header */}
        <div className="coin-title-anim flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6 mb-14 gap-4">
          <ScrambleText
            text="PROTOCOL COIN"
            as="h2"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-amiga tracking-tight text-foreground"
          />
          <div className="flex items-center gap-2 text-xs font-mono text-foreground/60 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-[rgb(255,122,0)]" />
            <span>BMSIT_BUILDER_TOKEN</span>
          </div>
        </div>

        {/* 2-Column Layout: Coin Left | Info Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: 3D Coin with Parallax */}
          <div className="coin-left-anim flex flex-col items-center justify-center">
            <motion.div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              animate={{
                rotateY: mousePos.x * 18,
                rotateX: -mousePos.y * 18,
              }}
              transition={{ type: "spring", damping: 18, stiffness: 140 }}
              style={{ transformStyle: "preserve-3d", perspective: 800 }}
              className="relative w-full max-w-[360px] aspect-square rounded-2xl flex items-center justify-center cursor-grab active:cursor-grabbing"
            >
              {/* Ambient glow */}
              <div className="absolute inset-8 blur-3xl rounded-full bg-[rgb(255,122,0)]/20 pointer-events-none" />

              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="w-full h-full object-contain pointer-events-none filter drop-shadow-[0_20px_50px_rgba(255,122,0,0.5)]"
              >
                <source
                  src="/chaingpt-assets/LABS_coin_CHROME_VP9.webm"
                  type="video/webm"
                />
                <source
                  src="/chaingpt-assets/LABS_coin_SAFARI_HEVC.mp4"
                  type="video/mp4"
                />
              </video>
            </motion.div>

            {/* Status bar */}
            <span className="mt-3 font-mono text-[10px] text-foreground/40 uppercase tracking-widest">
              :: SEAMLESS 360° ORBIT — MOUSE TO INTERACT
            </span>
          </div>

          {/* Right: Description + Feature Cards */}
          <div className="coin-right-anim space-y-8">
            <div>
              <h3 className="font-mono text-xl md:text-2xl font-bold uppercase tracking-wider text-foreground mb-3">
                Builder Reputation Token
              </h3>
              <p className="font-mono text-sm text-foreground/70 leading-relaxed max-w-lg">
                The BMSIT Protocol Coin is your on-chain identity within the
                Web.3 ecosystem. Earn it through hackathons, bounties, and
                peer-reviewed contributions. Use it to vote on proposals, unlock
                advanced resources, and prove your builder credentials.
              </p>
            </div>

            {/* Feature cards */}
            <div className="space-y-4">
              {COIN_FEATURES.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="coin-feature-card group flex items-start gap-4 p-4 rounded-xl bg-card border border-border hover:border-[rgb(255,122,0)]/50 transition-colors relative"
                  >
                    <span className="tech-bracket-tl" />
                    <span className="tech-bracket-tr" />
                    <div className="w-10 h-10 rounded-lg bg-[rgb(255,122,0)]/10 border border-[rgb(255,122,0)]/20 flex items-center justify-center text-[rgb(255,122,0)] shrink-0 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-mono font-bold text-sm text-foreground group-hover:text-[rgb(255,122,0)] transition-colors">
                        {feat.title}
                      </h4>
                      <p className="font-mono text-[11px] text-foreground/55 leading-relaxed mt-1">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <Link
              href="/laboratory"
              className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-foreground/70 hover:text-[rgb(255,122,0)] transition-colors group"
            >
              <span>EXPLORE IN 3D LAB</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[rgb(255,122,0)]" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

