"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, useSpring } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MagneticButton from "@/components/MagneticButton";

gsap.registerPlugin(ScrollTrigger);

export default function ResidencyBanner() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  
  // Spring-animated head rotation for smooth cursor tracking
  const rotateY = useSpring(0, { stiffness: 80, damping: 20 });
  const rotateX = useSpring(0, { stiffness: 80, damping: 20 });
  const eyeX = useSpring(0, { stiffness: 120, damping: 25 });
  const eyeY = useSpring(0, { stiffness: 120, damping: 25 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const nx = (e.clientX - cx) / cx;
      const ny = (e.clientY - cy) / cy;

      rotateY.set(nx * 18);
      rotateX.set(-ny * 12);
      eyeX.set(nx * 8);
      eyeY.set(ny * 6);
      setMousePos({ x: nx, y: ny });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [rotateY, rotateX, eyeX, eyeY]);

  // GSAP ScrollTrigger Entrance
  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      if (headlineRef.current) {
        gsap.from(headlineRef.current.children, {
          y: 40,
          opacity: 0,
          stagger: 0.12,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          },
        });
      }

      if (featuresRef.current) {
        gsap.from(featuresRef.current.children, {
          x: 30,
          opacity: 0,
          stagger: 0.15,
          duration: 0.8,
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
    <section
      id="residency"
      ref={sectionRef}
      className="relative w-full min-h-[90vh] flex items-center bg-[#E50914] text-white overflow-hidden border-y border-[#E05500]"
    >
      {/* Background Grid */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "100px 100px",
        }}
      />

      {/* Ambient top-right glow */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-white/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-black/15 rounded-full blur-3xl pointer-events-none" />

      {/* Corner accent squares & crosshairs */}
      <span className="absolute top-6 left-6 w-3 h-3 border border-white/60" />
      <span className="absolute top-6 right-6 w-3 h-3 border border-white/60" />
      <span className="absolute bottom-6 left-6 w-3 h-3 border border-white/60" />
      <span className="absolute bottom-6 right-6 w-3 h-3 border border-white/60" />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-16 w-full relative z-10 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* LEFT: Headline & Chamfered CTAs (Col 4) */}
          <div ref={headlineRef} className="lg:col-span-4 space-y-6">
            <div className="space-y-1">
              <h2 className="text-5xl sm:text-7xl md:text-8xl font-black font-sans tracking-tight leading-[0.88] text-white">
                WE BACK
              </h2>
              {/* Digital Block BUILDERS Typography in LabsAmiga */}
              <h2 className="text-5xl sm:text-7xl md:text-8xl font-black font-amiga tracking-wider leading-[0.88] text-white">
                BUILDERS
              </h2>
            </div>

            <p className="font-mono text-xs md:text-sm text-white/90 leading-relaxed uppercase tracking-wider max-w-sm">
              A CURATED, HIGH-TOUCH RESIDENCY DESIGNED TO TAKE WEB3 TEAMS FROM EARLY TRACTION TO FULLY LAUNCH-READY, WITH HANDS-ON SUPPORT ACROSS PRODUCT, TOKENOMICS, FUNDRAISING, AND GO-TO-MARKET.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <MagneticButton strength={0.25}>
                <Link
                  href="/join"
                  className="cyber-btn px-6 py-3.5 bg-white/20 hover:bg-white text-white hover:text-[#E50914] font-mono font-bold text-xs uppercase tracking-wider border border-white/40 shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-all flex items-center gap-2 inline-flex"
                >
                  <span>APPLY FOR RESIDENCY</span>
                </Link>
              </MagneticButton>

              <MagneticButton strength={0.2}>
                <Link
                  href="/about"
                  className="cyber-btn px-6 py-3.5 bg-transparent hover:bg-white/10 text-white font-mono font-bold text-xs uppercase tracking-wider border border-white/50 transition-all inline-flex"
                >
                  LEARN MORE
                </Link>
              </MagneticButton>
            </div>
          </div>

          {/* CENTER: TV Monitor Head (Cursor Tracking) (Col 4) */}
          <div className="lg:col-span-4 flex justify-center items-center py-4">
            <div className="relative flex flex-col items-center" style={{ perspective: "800px" }}>
              {/* Figure Body */}
              <div className="relative flex flex-col items-center">
                
                {/* TV Monitor Head - tracks cursor */}
                <motion.div
                  style={{
                    rotateY,
                    rotateX,
                    transformStyle: "preserve-3d",
                  }}
                  className="relative w-56 h-48 md:w-64 md:h-56"
                >
                  {/* TV outer casing */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#F0EDE8] via-[#E5E0DA] to-[#D4CFC8] shadow-[0_24px_60px_rgba(0,0,0,0.45)] border-4 border-[#C8C2BB]">
                    {/* Side speaker grill left */}
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-1.5 h-0.5 bg-[#B0A9A2] rounded-full" />
                      ))}
                    </div>
                    {/* Side knob right */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-[#C8C2BB] to-[#A0998F] border border-[#8A827A] shadow-inner" />
                    
                    {/* TV Screen area */}
                    <div className="absolute inset-4 rounded-xl bg-[#1A0800] border-2 border-[#3A2800] overflow-hidden shadow-inner">
                      {/* Screen glow background with brand orange */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#FFA040]/50 via-[#E50914]/70 to-[#D04000]/50 animate-pulse" />
                      
                      {/* Scanlines effect */}
                      <div
                        className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{
                          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)",
                        }}
                      />

                      {/* Wavy CRT distortion lines */}
                      <div className="absolute inset-0 flex flex-col justify-around px-4 opacity-75">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className="h-0.5 rounded-full bg-gradient-to-r from-transparent via-[#FFD080] to-transparent"
                            style={{
                              animation: `waveLine ${2 + i * 0.3}s ease-in-out infinite alternate`,
                              animationDelay: `${i * 0.4}s`,
                            }}
                          />
                        ))}
                      </div>

                      {/* Eyes (cursor-tracking pupils) */}
                      <div className="absolute inset-0 flex items-center justify-around px-6 pt-2">
                        <div className="w-8 h-8 rounded-full bg-white/15 border border-white/30 flex items-center justify-center overflow-hidden">
                          <motion.div
                            style={{ x: eyeX, y: eyeY }}
                            className="w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_8px_white]"
                          />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/15 border border-white/30 flex items-center justify-center overflow-hidden">
                          <motion.div
                            style={{ x: eyeX, y: eyeY }}
                            className="w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_8px_white]"
                          />
                        </div>
                      </div>

                      {/* Screen reflection glare */}
                      <div className="absolute top-2 left-2 w-14 h-7 bg-white/15 rounded-lg blur-sm pointer-events-none" />
                    </div>

                    {/* Bottom TV chin vents */}
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="w-1 h-2 bg-[#A09890] rounded-sm" />
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Neck connector */}
                <div className="w-6 h-8 bg-gradient-to-b from-[#E5E0DA] to-[#D0CBB8] border-x border-[#C0B8AE]" />

                {/* Shoulders and upper body */}
                <div className="w-36 h-6 bg-gradient-to-b from-[#DEDAD2] to-[#C8C3B8] rounded-t-3xl border border-[#B8B2A8]" />
                <div className="w-32 h-16 bg-gradient-to-b from-[#E8E4DC] to-[#D8D3CA] border-x border-b border-[#C8C3B8] rounded-b-xl flex items-center justify-center">
                  <div className="w-12 h-8 rounded-lg bg-[#1A0800]/40 border border-[#E50914]/50 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#E50914] shadow-[0_0_8px_#E50914] animate-pulse" />
                  </div>
                </div>

                <div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-white/40"
                  style={{ top: "calc(100% - 8px)" }}
                />
              </div>

              {/* Ambient radial aura */}
              <div
                className="absolute inset-0 rounded-full bg-white/15 blur-3xl pointer-events-none transition-transform duration-200"
                style={{
                  transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)`,
                }}
              />
            </div>
          </div>

          {/* RIGHT: Feature Points & Isometric Node (Col 4) */}
          <div ref={featuresRef} className="lg:col-span-4 space-y-6">
            <div className="space-y-4">
              {[
                {
                  title: "Hands-on support",
                  desc: "a team in the work with you, not watching from the sidelines.",
                },
                {
                  title: "Real network access",
                  desc: "the connections that actually open doors, not a contact list.",
                },
                {
                  title: "Customized growth plan",
                  desc: "a plan built around where your project is and where it's going.",
                },
              ].map((item) => (
                <div key={item.title} className="border-l-2 border-white/50 pl-5 py-1 hover:border-white transition-colors">
                  <h4 className="font-mono font-bold text-sm md:text-base text-white flex items-center gap-1.5 uppercase tracking-wide">
                    <span className="text-white/80">›</span> {item.title}
                  </h4>
                  <p className="font-mono text-xs text-white/85 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/25 text-xs font-mono text-white/85 leading-relaxed">
              Strategy, capital, and launch support, working alongside your team from day one
            </div>

            {/* Bottom-right bracketed widget with 3D isometric cog node */}
            <div className="border border-white/40 p-3.5 inline-flex items-center gap-3 font-mono text-xs text-white/90 bg-white/5 backdrop-blur-sm rounded-lg">
              <div className="w-8 h-8 relative">
                <div className="absolute inset-0 border border-white/60 rotate-45 scale-75" />
                <div className="absolute inset-0 border border-white/40 rotate-12 scale-90" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-white rounded-sm shadow-[0_0_8px_white]" />
                </div>
              </div>
              <span className="tracking-widest uppercase font-bold">ISO_NODE // ACTIVE</span>
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        @keyframes waveLine {
          0% { transform: scaleX(0.3) translateX(-20px); opacity: 0.3; }
          100% { transform: scaleX(1.2) translateX(20px); opacity: 0.9; }
        }
      `}</style>
    </section>
  );
}
