"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, X } from "lucide-react";
import { motion, useSpring } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { PublicSubmissionPortalSettings } from "@/lib/submissions";
import MagneticButton from "@/components/MagneticButton";
import CapsuleScrollAnimation from "./CapsuleScrollAnimation";
import ScrambleText from "./ScrambleText";

gsap.registerPlugin(ScrollTrigger);

interface ChainHeroProps {
  portalSettings?: PublicSubmissionPortalSettings;
  onApplyClick?: () => void;
}

const CATEGORIES = [
  { id: "ai", label: "AI", desc: "Decentralized Machine Learning & Autonomous Agents" },
  { id: "defi", label: "DeFi", desc: "Automated Market Makers & Micro-lending Protocols" },
  { id: "depin", label: "DePin", desc: "Physical Infrastructure Networks & Compute Nodes" },
  { id: "l1l2", label: "L1/L2", desc: "High-Throughput Rollups & Zero-Knowledge Verification" },
];

export default function ChainHero({ portalSettings, onApplyClick }: ChainHeroProps) {
  const [selectedCategory, setSelectedCategory] = useState("0");

  const checklistItems = [
    portalSettings?.checklist_label_1,
    portalSettings?.checklist_label_2,
    portalSettings?.checklist_label_3,
    portalSettings?.checklist_label_4,
  ].filter(Boolean) as string[];

  const activeChecklist = checklistItems.length > 0
    ? checklistItems.map((label, idx) => ({ id: String(idx), label }))
    : CATEGORIES;
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showCookies, setShowCookies] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const consent = localStorage.getItem("chaingpt_cookie_consent");
      if (consent === "accepted") {
        setShowCookies(false);
      }
    }
  }, []);

  const handleDismissCookies = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("chaingpt_cookie_consent", "accepted");
    }
    setShowCookies(false);
  };

  const heroRef = useRef<HTMLElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const centerColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  // Mouse parallax tracker
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x: nx, y: ny });
    };
    window.addEventListener("mousemove", handleMouse, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  // GSAP entrance
  useEffect(() => {
    if (!heroRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.1 });

      tl.fromTo(
        leftColRef.current,
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.85 }
      );

      tl.fromTo(
        centerColRef.current,
        { scale: 0.95, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 1.0 },
        "-=0.6"
      );

      tl.fromTo(
        rightColRef.current,
        { x: 30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.85 },
        "-=0.7"
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative w-full min-h-[92vh] pt-24 pb-12 flex flex-col justify-center overflow-hidden border-b border-border bg-background"
    >
      {/* ── Technical Grid Lines (Blueprint Style from Screenshot 1) ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Horizontal dividing cross-lines */}
        <div className="absolute top-24 left-0 right-0 h-px bg-border/80" />
        <div className="absolute bottom-12 left-0 right-0 h-px bg-border/80" />
        
        {/* Vertical dividing lines */}
        <div className="hidden lg:block absolute top-24 bottom-12 left-[26%] w-px bg-border/80" />
        <div className="hidden lg:block absolute top-24 bottom-12 right-[34%] w-px bg-border/80" />

        {/* Blueprint Crosshairs (+) */}
        <span className="absolute top-[92px] left-[25.6%] text-foreground/40 font-mono text-xs">+</span>
        <span className="absolute top-[92px] right-[33.6%] text-foreground/40 font-mono text-xs">+</span>
        <span className="absolute bottom-[44px] left-[25.6%] text-foreground/40 font-mono text-xs">+</span>
        <span className="absolute bottom-[44px] right-[33.6%] text-foreground/40 font-mono text-xs">+</span>

        {/* Corner L brackets */}
        <span className="absolute top-28 left-8 text-foreground/30 font-mono text-xs">┌</span>
        <span className="absolute top-28 right-8 text-foreground/30 font-mono text-xs">┐</span>
        <span className="absolute bottom-16 left-8 text-foreground/30 font-mono text-xs">└</span>
        <span className="absolute bottom-16 right-8 text-foreground/30 font-mono text-xs">┘</span>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 w-full relative z-10">
        
        {/* ── 3-Column Architecture: Left Pill Selectors | Center Video | Right Smart Capital ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center min-h-[640px]">

          {/* ═════════ LEFT COLUMN: Supercharging Web3 Builders + Category Checklist ═════════ */}
          <div
            ref={leftColRef}
            className="lg:col-span-3 flex flex-col justify-between py-6 space-y-6 lg:pr-4"
          >
            <div>
              {/* Header Title with Solid Square Marker */}
              <div className="flex items-center gap-2.5 mb-8">
                <span className="w-2.5 h-2.5 bg-foreground inline-block shrink-0" />
                <ScrambleText
                  text="SUPERCHARGING STUDENT BUILDERS"
                  as="h2"
                  className="text-xl sm:text-2xl font-black cyber-font tracking-tight text-foreground uppercase block"
                />
              </div>

              {/* 4 Category Pill Cards with Checkmarks and Corner L Brackets */}
              <div className="space-y-3.5">
                {activeChecklist.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`relative px-5 py-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                        isSelected
                          ? "bg-card border-[#E50914] shadow-[0_4px_16px_rgba(229,9,20,0.18)]"
                          : "bg-card/50 border-border hover:border-foreground/30 hover:bg-card"
                      }`}
                    >
                      {/* Technical Corner Brackets */}
                      <span className="tech-bracket-tl text-foreground/30" />
                      <span className="tech-bracket-tr text-foreground/30" />
                      <span className="tech-bracket-bl text-foreground/30" />
                      <span className="tech-bracket-br text-foreground/30" />

                      <div className="flex items-center gap-3">
                        {/* Checkmark in brand orange */}
                        <div className="w-5 h-5 rounded-md flex items-center justify-center text-[#E50914]">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                        <span className="font-mono font-bold text-sm tracking-wider uppercase text-foreground">
                          {cat.label}
                        </span>
                      </div>

                      {/* Small node dot */}
                      <span
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          isSelected ? "bg-[#E50914] shadow-[0_0_6px_#E50914]" : "bg-foreground/20"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chamfered Brand Orange Button: SUBMIT PROJECT / IDEA */}
            <div className="pt-4">
              <MagneticButton strength={0.25}>
                <Link
                  href="/join"
                  onClick={onApplyClick}
                  className="cyber-btn px-6 py-3.5 bg-[#E50914] hover:bg-[#e05500] text-white font-mono font-black text-xs uppercase tracking-widest shadow-[0_8px_24px_rgba(229,9,20,0.35)] transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <span>{portalSettings?.cta_label || "SUBMIT PROJECT PROPOSAL"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </MagneticButton>
            </div>
          </div>

          {/* ═════════ CENTER COLUMN: Pure Borderless Mechanical AI Core Video on Continuous Loop ═════════ */}
          <div
            ref={centerColRef}
            className="lg:col-span-5 flex flex-col items-center justify-center py-2 px-1 select-none"
          >
            <div className="relative w-full max-w-[320px] sm:max-w-[420px] lg:max-w-[540px] aspect-[490/594] overflow-hidden flex items-center justify-center">
              <video
                src="/chaingpt-assets/mechanical-core-loop.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>
          </div>

          {/* ═════════ RIGHT COLUMN: Smart Capital + 2 Isometric 3D Cards ═════════ */}
          <div
            ref={rightColRef}
            className="lg:col-span-4 flex flex-col justify-between py-6 space-y-6 lg:pl-4"
          >
            <div>
              {/* Header Title with Solid Square Marker */}
              <div className="space-y-1 mb-8">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 bg-foreground inline-block shrink-0" />
                  <ScrambleText
                    text={portalSettings?.join_heading || "BUILD & SHIP YOUR WEB3 PROJECT"}
                    as="h3"
                    className="text-xl sm:text-2xl font-black cyber-font tracking-tight text-foreground uppercase block"
                  />
                </div>
                <p className="font-mono text-xs text-foreground/50 tracking-wider pl-5 line-clamp-2">
                  {portalSettings?.join_subtitle || "Official student developer portal for technical architectures & ecosystem tooling"}
                </p>
              </div>

              {/* 2 White/Dark Beveled Cards with 3D Isometric Shapes side-by-side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3.5">
                
                {/* CARD 01: Project Incubation & Mentorship */}
                <div className="relative p-5 rounded-2xl border border-border bg-card/90 shadow-sm hover:shadow-xl hover:border-[#E50914]/60 transition-all duration-300 flex flex-col justify-between group min-h-[190px]">
                  <span className="tech-bracket-tl text-foreground/30" />
                  <span className="tech-bracket-tr text-foreground/30" />

                  <div className="flex justify-between items-center text-xs font-mono text-foreground/40 mb-3">
                    <span className="w-2 h-2 bg-foreground/60 inline-block" />
                    <span className="font-bold text-foreground/50">01</span>
                  </div>

                  {/* 3D Isometric Cross Puzzle Block */}
                  <div className="w-full h-20 flex items-center justify-center my-1">
                    <svg viewBox="0 0 100 80" className="w-20 h-16 transition-transform duration-300 group-hover:scale-105">
                      <polygon
                        points="50,10 85,30 50,50 15,30"
                        className="fill-foreground/[0.06] stroke-foreground/40"
                        strokeWidth="1.5"
                      />
                      <polygon
                        points="15,30 50,50 50,75 15,55"
                        className="fill-foreground/[0.12] stroke-foreground/40"
                        strokeWidth="1.5"
                      />
                      <polygon
                        points="50,50 85,30 85,55 50,75"
                        className="fill-foreground/[0.18] stroke-foreground/40"
                        strokeWidth="1.5"
                      />
                      {/* Orange cross accent */}
                      <circle cx="50" cy="40" r="3" fill="#E50914" />
                    </svg>
                  </div>

                  <h4 className="font-mono font-bold text-xs sm:text-sm text-foreground uppercase tracking-tight group-hover:text-[#E50914] transition-colors leading-snug">
                    {portalSettings?.card1_heading || "Technical Mentorship & Review"}
                  </h4>
                </div>

                {/* CARD 02: Grants & Hackathon Bounties */}
                <div className="relative p-5 rounded-2xl border border-border bg-card/90 shadow-sm hover:shadow-xl hover:border-[#E50914]/60 transition-all duration-300 flex flex-col justify-between group min-h-[190px]">
                  <span className="tech-bracket-tl text-foreground/30" />
                  <span className="tech-bracket-tr text-foreground/30" />

                  <div className="flex justify-between items-center text-xs font-mono text-foreground/40 mb-3">
                    <span className="w-2 h-2 bg-foreground/60 inline-block" />
                    <span className="font-bold text-foreground/50">02</span>
                  </div>

                  {/* 3D Isometric Staircase Block */}
                  <div className="w-full h-20 flex items-center justify-center my-1">
                    <svg viewBox="0 0 100 80" className="w-20 h-16 transition-transform duration-300 group-hover:scale-105">
                      {/* Step 1 */}
                      <polygon points="30,45 50,35 70,45 50,55" className="fill-foreground/[0.06] stroke-foreground/40" strokeWidth="1.2" />
                      <polygon points="30,45 50,55 50,68 30,58" className="fill-foreground/[0.12] stroke-foreground/40" strokeWidth="1.2" />
                      <polygon points="50,55 70,45 70,58 50,68" className="fill-foreground/[0.18] stroke-foreground/40" strokeWidth="1.2" />
                      {/* Step 2 */}
                      <polygon points="40,30 60,20 80,30 60,40" className="fill-foreground/[0.08] stroke-foreground/40" strokeWidth="1.2" />
                      <polygon points="40,30 60,40 60,50 40,40" className="fill-foreground/[0.14] stroke-foreground/40" strokeWidth="1.2" />
                      <polygon points="60,40 80,30 80,40 60,50" className="fill-foreground/[0.20] stroke-foreground/40" strokeWidth="1.2" />
                      {/* Orange step accent */}
                      <circle cx="60" cy="28" r="3" fill="#E50914" />
                    </svg>
                  </div>

                  <h4 className="font-mono font-bold text-xs sm:text-sm text-foreground uppercase tracking-tight group-hover:text-[#E50914] transition-colors leading-snug">
                    {portalSettings?.card2_heading || "Ecosystem Showcases & Demo Days"}
                  </h4>
                </div>

              </div>
            </div>

            {/* Bottom spacer for balance */}
            <div className="hidden lg:block h-10" />
          </div>

        </div>

      </div>

      {/* ── Cookie Banner (Matching Screenshot 1 exactly) ── */}
      {showCookies && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-[#1A1A1A] text-white p-5 rounded-xl border border-white/10 shadow-2xl font-mono text-xs animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button
            onClick={handleDismissCookies}
            className="absolute top-2.5 right-2.5 text-white/40 hover:text-white transition-colors"
            aria-label="Close notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <p className="text-white/80 leading-relaxed pr-4 text-[11px] mb-4">
            We use third-party cookies to personalize content, ads, and analyze website traffic.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDismissCookies}
              className="flex-1 py-2 px-3 bg-white text-black font-bold rounded-lg text-center hover:bg-white/90 transition-colors cursor-pointer text-[10px] uppercase tracking-wider"
            >
              ACCEPT
            </button>
            <button
              onClick={handleDismissCookies}
              className="flex-1 py-2 px-3 bg-transparent border border-white/20 text-white font-bold rounded-lg text-center hover:bg-white/10 transition-colors cursor-pointer text-[10px] uppercase tracking-wider"
            >
              REJECT
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
