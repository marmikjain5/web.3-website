"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { Sparkles, Bot, Disc3, ShieldAlert } from "lucide-react";

interface CoinCapsuleChamberProps {
  className?: string;
  defaultMode?: "gold_coin" | "red_coin" | "robot";
  showControls?: boolean;
}

export default function CoinCapsuleChamber({
  className = "",
  defaultMode = "gold_coin",
  showControls = true,
}: CoinCapsuleChamberProps) {
  const [activeAsset, setActiveAsset] = useState<"gold_coin" | "red_coin" | "robot">(defaultMode);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tilt parallax springs
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(0, { stiffness: 120, damping: 18 });
  const rotateY = useSpring(0, { stiffness: 120, damping: 18 });
  const coinOffsetX = useSpring(0, { stiffness: 90, damping: 15 });
  const coinOffsetY = useSpring(0, { stiffness: 90, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    rotateY.set(x * 14); // Tilt up to 14 deg horizontally
    rotateX.set(-y * 12); // Tilt up to 12 deg vertically
    coinOffsetX.set(x * 12);
    coinOffsetY.set(y * 8);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    coinOffsetX.set(0);
    coinOffsetY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      style={{ perspective: 1000 }}
    >
      {/* ── Main 3D Tilting Stage ── */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full max-w-[280px] sm:max-w-[320px] md:max-w-[340px] aspect-[1080/2162] flex items-center justify-center"
      >
        {/* Background Conduit Pipe Segment (extending seamlessly) */}
        <div
          className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[70%] opacity-25 pointer-events-none z-0"
          style={{
            backgroundImage: "url('/chaingpt-assets/pipe_segment.webp')",
            backgroundRepeat: "repeat-y",
            backgroundSize: "contain",
            backgroundPosition: "center",
          }}
        />

        {/* Ambient Backlight Glow behind the floating asset */}
        <div
          className={`absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-56 h-48 sm:h-56 rounded-full blur-3xl pointer-events-none transition-colors duration-700 z-5 ${
            activeAsset === "gold_coin"
              ? "bg-[#FF7A00]/25 shadow-[0_0_80px_#FF7A00]"
              : activeAsset === "red_coin"
              ? "bg-[#E50914]/30 shadow-[0_0_80px_#E50914]"
              : "bg-blue-500/20 shadow-[0_0_80px_rgba(59,130,246,0.3)]"
          }`}
        />

        {/* ── Floating Inside Asset (Coin or Robot) - Perfectly Centered in Chamber Glass ── */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-[76%] aspect-square flex items-center justify-center z-10 pointer-events-none"
          style={{
            top: activeAsset === "robot" ? "37%" : "34.5%",
          }}
        >
          <motion.div
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              x: coinOffsetX,
              y: coinOffsetY,
            }}
            className="w-full h-full flex items-center justify-center"
          >
            {activeAsset === "gold_coin" && (
              <video
                key="gold_coin"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="w-full h-full object-contain filter drop-shadow-[0_12px_32px_rgba(255,122,0,0.4)]"
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
            )}

            {activeAsset === "red_coin" && (
              <video
                key="red_coin"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="w-full h-full object-contain filter drop-shadow-[0_12px_32px_rgba(229,9,20,0.45)]"
              >
                <source
                  src="/chaingpt-assets/LABS_coin_CHROME_VP9_red.webm"
                  type="video/webm"
                />
                <source
                  src="/chaingpt-assets/LABS_coin_SAFARI_HEVC.mp4"
                  type='video/mp4; codecs="hvc1"'
                />
              </video>
            )}

            {activeAsset === "robot" && (
              <video
                key="robot"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="w-full h-full object-contain filter drop-shadow-[0_12px_32px_rgba(229,9,20,0.35)]"
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
            )}
          </motion.div>
        </div>

        {/* ── Futuristic Incubation Capsule Glass & Frame Overlay ── */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-20 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/chaingpt-assets/labs_CABIN.webp"
            alt="Futuristic Incubation Capsule Chamber"
            className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.18)]"
          />
        </div>

        {/* Digital Spec Tag Indicator (Bottom Left of Capsule) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 font-mono text-[9px] text-foreground/40 whitespace-nowrap tracking-widest uppercase flex items-center gap-1.5 bg-background/80 px-2.5 py-1 rounded-md border border-border/60 backdrop-blur-sm shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] animate-pulse" />
          <span>POD_STATUS: 100% SECURE</span>
        </div>
      </motion.div>

      {/* ── Interactive Mode Switcher (Allows user to inspect Gold Coin / Red Coin / Robot) ── */}
      {showControls && (
        <div className="mt-4 flex items-center gap-1.5 p-1 bg-card/80 border border-border rounded-xl backdrop-blur-sm z-30 shadow-xs">
          <button
            onClick={() => setActiveAsset("gold_coin")}
            className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeAsset === "gold_coin"
                ? "bg-[#FF7A00] text-white shadow-[0_0_12px_rgba(255,122,0,0.4)]"
                : "text-foreground/60 hover:text-foreground hover:bg-foreground/[0.04]"
            }`}
          >
            <Disc3 className="w-3 h-3" />
            <span>GOLD COIN</span>
          </button>

          <button
            onClick={() => setActiveAsset("red_coin")}
            className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeAsset === "red_coin"
                ? "bg-[#E50914] text-white shadow-[0_0_12px_rgba(229,9,20,0.4)]"
                : "text-foreground/60 hover:text-foreground hover:bg-foreground/[0.04]"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>RED COIN</span>
          </button>

          <button
            onClick={() => setActiveAsset("robot")}
            className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeAsset === "robot"
                ? "bg-foreground text-background shadow-xs"
                : "text-foreground/60 hover:text-foreground hover:bg-foreground/[0.04]"
            }`}
          >
            <Bot className="w-3 h-3" />
            <span>AI AGENT</span>
          </button>
        </div>
      )}
    </div>
  );
}

