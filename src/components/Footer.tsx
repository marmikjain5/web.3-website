"use client";

import { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { socialLinks } from "@/data/footerData";

const CUBES = [
  { size: 80, left: 15, top: 30, z: -200, rx: 35, ry: 45, delay: 0, duration: 18 },
  { size: 45, left: 85, top: 20, z: -400, rx: -25, ry: 15, delay: 2, duration: 22 },
  { size: 110, left: 25, top: 60, z: 150, rx: 15, ry: -35, delay: 1, duration: 25 },
  { size: 35, left: 75, top: 70, z: -100, rx: 55, ry: 45, delay: 3, duration: 20 },
  { size: 65, left: 65, top: 40, z: 50, rx: -15, ry: 25, delay: 0.5, duration: 15 },
  { size: 55, left: 10, top: 75, z: -300, rx: 10, ry: -10, delay: 4, duration: 24 },
  { size: 90, left: 45, top: 25, z: -50, rx: 70, ry: 20, delay: 1.5, duration: 19 },
  { size: 40, left: 55, top: 85, z: -150, rx: -35, ry: -45, delay: 2.5, duration: 17 },
  { size: 75, left: 80, top: 55, z: 200, rx: 45, ry: -25, delay: 1.2, duration: 21 },
  { size: 50, left: 35, top: 15, z: -250, rx: -45, ry: 35, delay: 3.5, duration: 16 },
  { size: 100, left: 90, top: 80, z: 300, rx: 25, ry: 15, delay: 0.8, duration: 23 },
  { size: 60, left: 20, top: 45, z: -100, rx: 15, ry: 65, delay: 2.2, duration: 18 },
  { size: 30, left: 40, top: 65, z: -350, rx: -15, ry: -25, delay: 4.5, duration: 14 },
  { size: 85, left: 5, top: 50, z: 100, rx: 35, ry: 5, delay: 1.8, duration: 20 },
  { size: 45, left: 60, top: 15, z: -180, rx: -25, ry: 55, delay: 2.8, duration: 22 },
  { size: 70, left: 70, top: 90, z: 50, rx: 5, ry: -45, delay: 0.3, duration: 19 },
];

const TICKER_ITEMS = [
  "DECENTRALIZED ARCHITECTURE",
  "READ. WRITE. OWN",
  "INCUBATION COHORT 2026",
  "LAYER-1 & LAYER-2 ECOSYSTEMS",
  "ZERO-KNOWLEDGE INFRASTRUCTURE",
  "GLOBAL BUILDER NETWORK",
  "WEB.3_ ECOSYSTEM",
];

export default function Footer() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    
    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      
      if (rect.top < window.innerHeight + 100) {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = (e.clientY / window.innerHeight) * 2 - 1;
        
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          setMousePos({ x, y });
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const isDark = !mounted || resolvedTheme !== "light";

  const themeStyle = {
    "--footer-bg": "var(--background)",
    "--footer-text": "var(--foreground)",
    "--footer-accent": "#E50914",
    "--footer-secondary": isDark ? "#202221" : "#666666",
    "--bg-opacity": isDark ? "0.2" : "0.5",
    
    "--cube-border": isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.15)",
    "--cube-front": isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.05)",
    "--cube-back": isDark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.02)",
    "--cube-right": isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.25)",
    "--cube-left": isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)",
    "--cube-top": isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,1)",
    "--cube-bottom": isDark ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.4)",
  } as React.CSSProperties;

  return (
    <>
      <style>{`
        .footer-container {
          background-color: var(--footer-bg);
          color: var(--footer-text);
          transition: background-color 0.5s ease, color 0.5s ease;
        }
        
        .bg-web3-text {
          position: absolute;
          top: 45%;
          left: 50%;
          font-size: clamp(6rem, 25vw, 28rem);
          font-weight: 900;
          line-height: 1;
          opacity: var(--bg-opacity);
          background: linear-gradient(to bottom, var(--footer-text) 0%, transparent 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          pointer-events: none;
          user-select: none;
          white-space: nowrap;
          z-index: 1;
          transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          font-family: 'Space Grotesk', system-ui, sans-serif;
        }
        
        .cube-scene {
          position: absolute;
          inset: 0;
          perspective: 1000px;
          pointer-events: none;
          z-index: 2;
          overflow: hidden;
        }
        
        .cube-parallax-layer {
          position: absolute;
          transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .cube-wrapper {
          position: absolute;
          transform-style: preserve-3d;
          animation: floatCube var(--duration) ease-in-out infinite alternate;
          animation-delay: var(--delay);
        }
        
        @keyframes floatCube {
          0% { transform: translateY(0) rotateX(0deg) rotateY(0deg); }
          100% { transform: translateY(-120px) rotateX(15deg) rotateY(25deg); }
        }
        
        .cube {
          position: relative;
          width: var(--size);
          height: var(--size);
          transform-style: preserve-3d;
        }
        
        .cube-face {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 1px solid var(--cube-border);
          backdrop-filter: blur(2px);
        }
        
        .face-front  { transform: translateZ(calc(var(--size) / 2)); background: var(--cube-front); }
        .face-back   { transform: rotateY(180deg) translateZ(calc(var(--size) / 2)); background: var(--cube-back); }
        .face-right  { transform: rotateY(90deg) translateZ(calc(var(--size) / 2)); background: var(--cube-right); }
        .face-left   { transform: rotateY(-90deg) translateZ(calc(var(--size) / 2)); background: var(--cube-left); }
        .face-top    { transform: rotateX(90deg) translateZ(calc(var(--size) / 2)); background: var(--cube-top); }
        .face-bottom { transform: rotateX(-90deg) translateZ(calc(var(--size) / 2)); background: var(--cube-bottom); }
        
        .link-hover {
          position: relative;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        .link-hover::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -4px;
          width: 100%;
          height: 2px;
          background-color: var(--footer-accent);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .link-hover:hover {
          color: var(--footer-accent);
          text-shadow: 0 0 12px rgba(255, 30, 39, 0.4);
        }
        .link-hover:hover::after {
          transform: scaleX(1);
        }
      `}</style>

      {/* Ticker Marquee Ribbon */}
      <div className="w-full bg-[#E50914] text-white py-2 overflow-hidden border-t border-b border-[#CC0009] select-none z-30 relative">
        <div className="flex whitespace-nowrap ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
            <span key={idx} className="font-mono text-xs font-bold tracking-widest uppercase mx-6 flex items-center gap-4">
              <span>{item}</span>
              <span className="w-1.5 h-1.5 bg-white rounded-full inline-block" />
            </span>
          ))}
        </div>
      </div>

      <footer 
        ref={containerRef} 
        className="footer-container relative w-full min-h-[70vh] flex flex-col justify-end font-sans overflow-hidden" 
        style={themeStyle}
      >
        
        {/* Top Gradient Fade to blend with page above */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none mix-blend-normal opacity-100" />

        {/* Background Layer: Large web.3_ Typography */}
        <div 
          className="bg-web3-text font-mono tracking-tight" 
          style={{ 
            transform: `translate(calc(-50% + ${mousePos.x * -30}px), calc(-50% + ${mousePos.y * -30}px))` 
          }}
        >
          web.3_
        </div>

        {/* Mid Layer: Floating Geometric Cubes */}
        <div className="cube-scene">
          {CUBES.map((c, i) => {
            const pX = (mousePos.x * (c.z + 800)) / 40;
            const pY = (mousePos.y * (c.z + 800)) / 40;
            
            return (
              <div 
                key={i} 
                className={`cube-parallax-layer ${i > 7 ? 'hidden md:block' : ''}`}
                style={{
                  left: `${c.left}%`,
                  top: `${c.top}%`,
                  transform: `translate3d(${pX}px, ${pY}px, ${c.z}px)`,
                  zIndex: c.z > 0 ? 10 : 1
                }}
              >
                <div 
                  className="cube-wrapper"
                  style={{ 
                    '--duration': `${c.duration}s`, 
                    '--delay': `${c.delay}s` 
                  } as React.CSSProperties}
                >
                  <div 
                    className="cube"
                    style={{ 
                      '--size': `${c.size}px`,
                      transform: `rotateX(${c.rx}deg) rotateY(${c.ry}deg)`
                    } as React.CSSProperties}
                  >
                    <div className="cube-face face-front"></div>
                    <div className="cube-face face-back"></div>
                    <div className="cube-face face-right"></div>
                    <div className="cube-face face-left"></div>
                    <div className="cube-face face-top"></div>
                    <div className="cube-face face-bottom"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Foreground Layer: Minimal UI */}
        <div className="relative z-20 flex flex-col justify-end w-full px-6 md:px-12 lg:px-20 pb-8 pt-16">
          
          {/* Top Info Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-border/60 text-xs font-mono">
            <div className="flex items-center gap-6">
              <Link href="/contact" className="hover:text-[#E50914] transition-colors">
                Contact
              </Link>
              <Link href="/about" className="hover:text-[#E50914] transition-colors">
                Manifesto
              </Link>
              <Link href="/events" className="hover:text-[#E50914] transition-colors">
                Incubation Program
              </Link>
            </div>

            <div className="text-foreground/60 text-[11px] font-mono tracking-widest uppercase">
              © 2026 WEB.3_ — READ.WRITE.OWN
            </div>

            <div className="flex gap-6 items-center">
              {socialLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  className="link-hover text-xs font-mono uppercase tracking-wider text-foreground/70"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Giant Cyber WEB.3_ Display Block with Pixel Underscore & Corner Brackets */}
          <div className="relative my-8 py-8 border border-border/80 bg-foreground/[0.01] rounded-xl overflow-hidden">
            {/* 4 Red Coordinate Squares */}
            <span className="absolute top-2 left-2 w-3 h-3 bg-[#E50914] shadow-[0_0_10px_#E50914]" />
            <span className="absolute top-2 right-2 w-3 h-3 bg-[#E50914] shadow-[0_0_10px_#E50914]" />
            <span className="absolute bottom-2 left-2 w-3 h-3 bg-[#E50914] shadow-[0_0_10px_#E50914]" />
            <span className="absolute bottom-2 right-2 w-3 h-3 bg-[#E50914] shadow-[0_0_10px_#E50914]" />

            <div className="text-center select-none overflow-hidden py-4 flex flex-col items-center justify-center">
              <div className="flex items-baseline justify-center">
                <span className="text-[14vw] font-black cyber-font tracking-tight leading-none text-foreground/90 font-mono">
                  web.3
                </span>
                <span className="inline-block w-[4vw] h-[2vw] bg-[#E50914] ml-2 animate-pulse align-baseline shadow-[0_0_16px_#E50914]" />
              </div>
              <span className="font-mono text-xs md:text-sm tracking-[0.4em] uppercase text-foreground/50 mt-3">
                read . write . own
              </span>
            </div>
          </div>

        </div>
      </footer>
    </>
  );
}
