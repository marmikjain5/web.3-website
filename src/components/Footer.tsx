"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { socialLinks } from "@/data/footerData";

// Subtle ambient cubes placed along the perimeter inside the card to frame the central branding.
// Positions and sizes clamped to prevent overflowing small mobile viewports.
// Guaranteed margin >= half cube size + float amplitude from every edge of the card,
// with ample clearance from central typography to ensure zero overlap.
const CUBES = [
  { size: 34, left: 8, top: 20, z: -100, rx: 35, ry: 45, delay: 0, duration: 6, floatAmp: -5, rotAmpX: 10, rotAmpY: 12 },
  { size: 34, left: 92, top: 20, z: 80, rx: 45, ry: -25, delay: 2.5, duration: 9.5, floatAmp: -5, rotAmpX: 14, rotAmpY: -10 },
  { size: 26, left: 6, top: 48, z: -150, rx: 10, ry: -10, delay: 0.8, duration: 7.5, floatAmp: -4, rotAmpX: 8, rotAmpY: -12 },
  { size: 26, left: 94, top: 48, z: -60, rx: 55, ry: 45, delay: 2, duration: 9, floatAmp: -4, rotAmpX: 12, rotAmpY: 8 },
  { size: 28, left: 16, top: 24, z: 60, rx: 15, ry: -35, delay: 0.5, duration: 7, floatAmp: -5, rotAmpX: 12, rotAmpY: -10 },
  { size: 28, left: 84, top: 24, z: 40, rx: -15, ry: 25, delay: 1.8, duration: 11, floatAmp: -4, rotAmpX: -8, rotAmpY: 14 },
  { size: 22, left: 10, top: 76, z: -80, rx: -45, ry: 35, delay: 1.5, duration: 6.5, floatAmp: -3, rotAmpX: -10, rotAmpY: 12 },
  { size: 22, left: 90, top: 76, z: -180, rx: -25, ry: 15, delay: 1.2, duration: 8.5, floatAmp: -3, rotAmpX: -10, rotAmpY: 10 },
];

const TICKER_ITEMS = [
  "DECENTRALIZED ARCHITECTURE",
  "READ. WRITE. OWN",
  "LEARN BY BUILDING",
  "LAYER-1 & LAYER-2 ECOSYSTEMS",
  "ZERO-KNOWLEDGE INFRASTRUCTURE",
  "GLOBAL BUILDER NETWORK",
  "WEB.3_ ECOSYSTEM",
];

const emptySubscribe = () => () => {};

export default function Footer() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const { resolvedTheme } = useTheme();

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
          z-index: 0;
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
          100% { transform: translateY(var(--float-amp, -10px)); }
        }

        @keyframes rotateCubeGentle {
          0% {
            transform: rotateX(var(--base-rx)) rotateY(var(--base-ry));
          }
          100% {
            transform: rotateX(calc(var(--base-rx) + var(--rot-amp-x, 10deg))) rotateY(calc(var(--base-ry) + var(--rot-amp-y, 14deg)));
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cube-float-wrapper,
          .cube-rotate-wrapper,
          .ticker-track {
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

        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .ticker-track {
          display: flex;
          width: max-content;
          animation: ticker var(--ticker-duration, 28s) linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
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

        {/* Content Container - unified container sharing same padding and max-w as other sections */}
        <div className="relative z-10 flex flex-col justify-end w-full max-w-7xl mx-auto px-4 md:px-8 pt-6 sm:pt-8 pb-6">
          
          {/* Top Navigation & Status/Socials Bar */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-border/60 text-xs font-mono">
            {/* Primary Navigation - stacked vertically to the left */}
            <div className="grid grid-cols-2 gap-x-4 md:flex md:flex-col md:gap-0 items-start">
              <Link 
                href="/contact" 
                className="link-hover text-foreground/80 font-medium min-h-[44px] inline-flex items-center px-1 whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                :: Contact
              </Link>
              <Link 
                href="/about" 
                className="link-hover text-foreground/80 font-medium min-h-[44px] inline-flex items-center px-1 whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                :: About
              </Link>
              <Link 
                href="/#incubation-hub" 
                className="link-hover text-foreground/80 font-medium min-h-[44px] inline-flex items-center px-1 whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                :: Registrations
              </Link>
              <Link 
                href="/events" 
                className="link-hover text-foreground/80 font-medium min-h-[44px] inline-flex items-center px-1 whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                :: Events
              </Link>
            </div>

            {/* Right Side - Status and Socials stacked vertically on the right */}
            <div className="flex flex-col items-start md:items-end">
              <div className="text-foreground/60 text-[10px] sm:text-[11px] tracking-widest uppercase min-h-[44px] inline-flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                STATUS: ONLINE // &copy; 2026 WEB.3_ BMSIT
              </div>
              <div className="flex flex-row md:flex-col items-center md:items-end gap-x-6 md:gap-0">
                {socialLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    className="link-hover text-xs font-mono uppercase tracking-wider text-foreground/70 min-h-[44px] inline-flex items-center px-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Clean, Sleek Cyber Branding Display */}
          <div className="relative my-5 sm:my-6 py-5 sm:py-7 border border-border/60 bg-foreground/[0.015] backdrop-blur-sm rounded-2xl overflow-hidden">
            {/* Ambient Geometric Cubes (Confined inside the Card boundary to prevent visible slicing) */}
            <div className="cube-scene">
              {CUBES.map((c, i) => (
                <div 
                  key={i} 
                  className={`cube-anchor hidden sm:block ${i >= 4 ? "hidden md:block" : ""}`}
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
                      '--delay': `${c.delay}s`,
                      '--float-amp': `${c.floatAmp}px`
                    } as React.CSSProperties}
                  >
                    <div 
                      className="cube-rotate-wrapper"
                      style={{ 
                        '--rot-duration': `${(c.duration * 1.3).toFixed(1)}s`, 
                        '--rot-delay': `${(c.delay * 0.7).toFixed(1)}s`,
                        '--base-rx': `${c.rx}deg`,
                        '--base-ry': `${c.ry}deg`,
                        '--rot-amp-x': `${c.rotAmpX}deg`,
                        '--rot-amp-y': `${c.rotAmpY}deg`,
                      } as React.CSSProperties}
                    >
                      <div 
                        className="cube"
                        style={{ 
                          '--size': `${c.size}px`,
                        } as React.CSSProperties}
                      >
                        <div className="cube-face face-front" />
                        <div className="cube-face face-back" />
                        <div className="cube-face face-right" />
                        <div className="cube-face face-left" />
                        <div className="cube-face face-top" />
                        <div className="cube-face face-bottom" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Blueprint Technical Corner Crosshairs */}
            <span className="absolute top-3 left-3 font-mono text-xs text-[#BE4105]/80 select-none z-10">+</span>
            <span className="absolute top-3 right-3 font-mono text-xs text-[#BE4105]/80 select-none z-10">+</span>
            <span className="absolute bottom-3 left-3 font-mono text-xs text-[#BE4105]/80 select-none z-10">+</span>
            <span className="absolute bottom-3 right-3 font-mono text-xs text-[#BE4105]/80 select-none z-10">+</span>

            <div className="relative z-10 text-center select-none py-1 px-4 flex flex-col items-center justify-center">
              {/* Main Clean Typography with responsive clamp sizing */}
              <div className="flex items-baseline justify-center">
                <span className="text-[clamp(2.5rem,8vw,6.5rem)] font-black font-mono tracking-tight leading-none text-foreground drop-shadow-sm">
                  web.3
                </span>
                <span className="inline-block w-[clamp(0.65rem,1.8vw,1.5rem)] h-[clamp(0.45rem,1vw,0.85rem)] bg-[#BE4105] ml-2 sm:ml-3 animate-pulse align-baseline shadow-[0_0_12px_#BE4105]" />
              </div>

              {/* Sub-telemetry Pills directly beneath on same alignment axis */}
              <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-2 text-[9px] sm:text-[10px] font-mono text-foreground/50 tracking-wider">
                <span className="px-2 py-0.5 border border-border/80 rounded bg-background/50">
                  NODE: BMS INSTITUTE OF TECHNOLOGY
                </span>
                <span className="px-2 py-0.5 border border-border/80 rounded bg-background/50 text-[#BE4105]">
                  PROTOCOL: LEARN // BUILD // SHIP
                </span>
              </div>

              {/* Tagline follows at consistent spacing */}
              <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4">
                <span className="h-[1px] w-6 sm:w-12 bg-border/80" />
                <span className="font-mono text-[10px] sm:text-xs md:text-sm tracking-[0.35em] sm:tracking-[0.45em] uppercase text-foreground/60 font-semibold">
                  read . write . own
                </span>
                <span className="h-[1px] w-6 sm:w-12 bg-border/80" />
              </div>
            </div>
          </div>

          {/* Bottom Micro Footer - stacks on mobile, splits left/right from md */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-[10px] sm:text-[11px] font-mono text-foreground/40 pt-2 text-center md:text-left">
            <div>BUILDING DECENTRALIZED FUTURES</div>
            <div>ALL SYSTEMS OPERATIONAL // LATENCY: 24ms</div>
          </div>

        </div>
      </footer>
    </>
  );
}
