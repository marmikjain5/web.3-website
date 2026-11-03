"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { socialLinks } from "@/data/footerData";

// Subtle ambient cubes placed along the perimeter to frame the central branding
const CUBES = [
  { size: 70, left: 8, top: 25, z: -150, rx: 35, ry: 45, delay: 0, duration: 6 },
  { size: 40, left: 88, top: 15, z: -300, rx: -25, ry: 15, delay: 1.2, duration: 8.5 },
  { size: 85, left: 14, top: 65, z: 80, rx: 15, ry: -35, delay: 0.5, duration: 7 },
  { size: 30, left: 82, top: 72, z: -80, rx: 55, ry: 45, delay: 2, duration: 9 },
  { size: 55, left: 92, top: 45, z: 40, rx: -15, ry: 25, delay: 1.8, duration: 11 },
  { size: 45, left: 5, top: 80, z: -200, rx: 10, ry: -10, delay: 0.8, duration: 7.5 },
  { size: 60, left: 78, top: 28, z: 120, rx: 45, ry: -25, delay: 2.5, duration: 9.5 },
  { size: 40, left: 18, top: 15, z: -180, rx: -45, ry: 35, delay: 1.5, duration: 6.5 },
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = !mounted || resolvedTheme !== "light";

  const themeStyle = {
    "--footer-bg": "var(--background)",
    "--footer-text": "var(--foreground)",
    "--footer-accent": "#BE4105",
    "--footer-secondary": isDark ? "#202221" : "#666666",
    
    "--cube-border": isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.12)",
    "--cube-front": isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
    "--cube-back": isDark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)",
    "--cube-right": isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.15)",
    "--cube-left": isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.6)",
    "--cube-top": isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.9)",
    "--cube-bottom": isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.25)",
  } as React.CSSProperties;

  return (
    <>
      <style>{`
        .footer-container {
          background-color: var(--footer-bg);
          color: var(--footer-text);
          transition: background-color 0.5s ease, color 0.5s ease;
        }
        
        .cube-scene {
          position: absolute;
          inset: 0;
          perspective: 1200px;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
        }
        
        .cube-anchor {
          position: absolute;
          transform-style: preserve-3d;
          pointer-events: none;
        }

        .cube-float-wrapper {
          position: absolute;
          transform-style: preserve-3d;
          animation: floatCubeVertical var(--duration, 8s) ease-in-out infinite alternate;
          animation-delay: var(--delay, 0s);
          will-change: transform;
        }

        .cube-rotate-wrapper {
          position: relative;
          transform-style: preserve-3d;
          animation: rotateCubeGentle var(--rot-duration, 10s) ease-in-out infinite alternate;
          animation-delay: var(--rot-delay, 0s);
          will-change: transform;
        }
        
        @keyframes floatCubeVertical {
          0% { transform: translateY(0); }
          100% { transform: translateY(-10px); }
        }

        @keyframes rotateCubeGentle {
          0% {
            transform: rotateX(var(--base-rx)) rotateY(var(--base-ry));
          }
          100% {
            transform: rotateX(calc(var(--base-rx) + 10deg)) rotateY(calc(var(--base-ry) + 14deg));
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cube-float-wrapper,
          .cube-rotate-wrapper {
            animation: none !important;
          }
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
          backdrop-filter: blur(1px);
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
          transition: color 0.25s ease;
        }
        .link-hover::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -3px;
          width: 100%;
          height: 2px;
          background-color: #BE4105;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .link-hover:hover {
          color: #BE4105;
        }
        .link-hover:hover::after {
          transform: scaleX(1);
        }
      `}</style>

      {/* Ticker Marquee Ribbon */}
      <div className="w-full bg-[#BE4105] text-white py-2 overflow-hidden border-t border-b border-[#963404] select-none z-30 relative">
        <div className="flex whitespace-nowrap ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
            <span key={idx} className="font-mono text-[11px] sm:text-xs font-bold tracking-widest uppercase mx-5 sm:mx-8 flex items-center gap-3 sm:gap-4">
              <span>{item}</span>
              <span className="w-1.5 h-1.5 bg-white/80 rounded-full inline-block" />
            </span>
          ))}
        </div>
      </div>

      <footer 
        className="footer-container relative w-full flex flex-col justify-end font-sans overflow-hidden border-t border-border/40" 
        style={themeStyle}
      >
        {/* Subtle grid background */}
        <div className="absolute inset-0 lab-grid-bg opacity-40 pointer-events-none" />

        {/* Ambient Geometric Cubes (Confined to Periphery to prevent text clashing) */}
        <div className="cube-scene">
          {CUBES.map((c, i) => (
            <div 
              key={i} 
              className={`cube-anchor ${i > 4 ? 'hidden md:block' : ''}`}
              style={{
                left: `${c.left}%`,
                top: `${c.top}%`,
                transform: `translate3d(0, 0, ${c.z}px)`,
                zIndex: c.z > 0 ? 5 : 1
              }}
            >
              <div 
                className="cube-float-wrapper"
                style={{ 
                  '--duration': `${c.duration}s`, 
                  '--delay': `${c.delay}s` 
                } as React.CSSProperties}
              >
                <div 
                  className="cube-rotate-wrapper"
                  style={{ 
                    '--rot-duration': `${(c.duration * 1.3).toFixed(1)}s`, 
                    '--rot-delay': `${(c.delay * 0.7).toFixed(1)}s`,
                    '--base-rx': `${c.rx}deg`,
                    '--base-ry': `${c.ry}deg`,
                  } as React.CSSProperties}
                >
                  <div 
                    className="cube"
                    style={{ 
                      '--size': `${c.size}px`,
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
            </div>
          ))}
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col justify-end w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-12 sm:pt-16 pb-8">
          
          {/* Top Quick Links & Status Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 pb-8 border-b border-border/60 text-xs font-mono">
            {/* Primary Navigation */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 sm:gap-6">
              <Link href="/contact" className="link-hover text-foreground/80 font-medium">
                :: Contact
              </Link>
              <Link href="/about" className="link-hover text-foreground/80 font-medium">
                :: About
              </Link>
              <Link href="/#incubation-hub" className="link-hover text-foreground/80 font-medium">
                :: Registrations
              </Link>
              <Link href="/events" className="link-hover text-foreground/80 font-medium">
                :: Events
              </Link>
            </div>

            {/* Center Status / Copyright */}
            <div className="text-center text-foreground/60 text-[10px] sm:text-[11px] tracking-widest uppercase">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
              STATUS: ONLINE // &copy; 2026 WEB.3_ BMSIT
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap justify-center md:justify-end gap-5 sm:gap-6 items-center">
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

          {/* Clean, Sleek Cyber Branding Display */}
          <div className="relative my-8 sm:my-10 py-8 sm:py-12 border border-border/60 bg-foreground/[0.015] backdrop-blur-sm rounded-2xl overflow-hidden">
            {/* Blueprint Technical Corner Crosshairs */}
            <span className="absolute top-3 left-3 font-mono text-xs text-[#BE4105]/80 select-none">+</span>
            <span className="absolute top-3 right-3 font-mono text-xs text-[#BE4105]/80 select-none">+</span>
            <span className="absolute bottom-3 left-3 font-mono text-xs text-[#BE4105]/80 select-none">+</span>
            <span className="absolute bottom-3 right-3 font-mono text-xs text-[#BE4105]/80 select-none">+</span>

            <div className="text-center select-none py-2 px-4 flex flex-col items-center justify-center">
              {/* Main Clean Typography */}
              <div className="flex items-baseline justify-center">
                <span className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-mono tracking-tight leading-none text-foreground drop-shadow-sm">
                  web.3
                </span>
                <span className="inline-block w-3 sm:w-5 md:w-7 h-2 sm:h-3 md:h-4 bg-[#BE4105] ml-2 sm:ml-3 animate-pulse align-baseline shadow-[0_0_12px_#BE4105]" />
              </div>

              {/* Tagline */}
              <div className="flex items-center gap-2 sm:gap-3 mt-4 sm:mt-5">
                <span className="h-[1px] w-6 sm:w-12 bg-border/80" />
                <span className="font-mono text-[10px] sm:text-xs md:text-sm tracking-[0.35em] sm:tracking-[0.45em] uppercase text-foreground/60 font-semibold">
                  read . write . own
                </span>
                <span className="h-[1px] w-6 sm:w-12 bg-border/80" />
              </div>

              {/* Sub-telemetry Pill */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[9px] sm:text-[10px] font-mono text-foreground/50 tracking-wider">
                <span className="px-2 py-0.5 border border-border/80 rounded bg-background/50">
                  NODE: BMS INSTITUTE OF TECHNOLOGY
                </span>
                <span className="px-2 py-0.5 border border-border/80 rounded bg-background/50 text-[#BE4105]">
                  PROTOCOL: INCUBATION // BUILDERS
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Micro Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] sm:text-[11px] font-mono text-foreground/40 pt-2">
            <div>BUILDING DECENTRALIZED FUTURES</div>
            <div>ALL SYSTEMS OPERATIONAL // LATENCY: 24ms</div>
          </div>

        </div>
      </footer>
    </>
  );
}
