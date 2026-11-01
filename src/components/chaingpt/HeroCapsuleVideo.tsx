"use client";

import { useRef, useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, useSpring } from "framer-motion";
import { Play, Pause } from "lucide-react";

interface HeroCapsuleVideoProps {
  className?: string;
  mousePos?: { x: number; y: number };
}

export default function HeroCapsuleVideo({
  className = "",
  mousePos = { x: 0, y: 0 },
}: HeroCapsuleVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  // Dynamic spring physics: capsule follows mouse left & right smoothly
  const rotateX = useSpring(0, { stiffness: 120, damping: 22 });
  const rotateY = useSpring(0, { stiffness: 120, damping: 22 });
  const translateX = useSpring(0, { stiffness: 110, damping: 24 });
  const translateY = useSpring(0, { stiffness: 110, damping: 24 });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Follow mouse left and right across the section with fluid responsiveness
  useEffect(() => {
    // When mouse moves right (positive x), capsule translates right and tilts towards cursor
    translateX.set(mousePos.x * 65);
    translateY.set(mousePos.y * 25);
    rotateY.set(mousePos.x * 22);
    rotateX.set(-mousePos.y * 14);
  }, [mousePos, rotateX, rotateY, translateX, translateY]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const isDark = !mounted || resolvedTheme !== "light";
  // Light mode: industrial white ceramic capsule | Dark mode: dark titanium capsule
  const videoSrc = isDark ? "/hero-animation-dark.mp4" : "/hero-animation.mp4";

  return (
    <div
      className={`relative flex flex-col items-center select-none ${className}`}
      style={{ perspective: "1400px" }}
    >
      {/* Ambient Radial Accent Glow behind capsule */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] md:w-[500px] h-[380px] md:h-[500px] rounded-full blur-3xl pointer-events-none -z-10 transition-opacity duration-700"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.03) 50%, transparent 70%)"
            : "radial-gradient(circle, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.02) 50%, transparent 70%)",
        }}
      />

      {/* ── 3D Floating & Mouse-Following Viewport ── */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          x: translateX,
          y: translateY,
          transformStyle: "preserve-3d",
        }}
        className={`relative w-full max-w-[480px] md:max-w-[540px] lg:max-w-[580px] rounded-2xl overflow-hidden border transition-all duration-300 shadow-[0_24px_60px_rgba(0,0,0,0.3)] hover:shadow-[0_28px_70px_rgba(0,0,0,0.15)] ${
          isDark
            ? "bg-[#111215]/95 border-[#26282E] text-white hover:border-[#E50914]/60"
            : "bg-[#F4F3F0]/95 border-[#D8D6D0] text-[#1A1A1A] hover:border-[#E50914]/60"
        }`}
      >
        {/* Technical Corner Brackets matching Screenshot 3 */}
        <span className="absolute top-1.5 left-2 font-mono text-xs opacity-40">┌</span>
        <span className="absolute top-1.5 right-2 font-mono text-xs opacity-40">┐</span>
        <span className="absolute bottom-1.5 left-2 font-mono text-xs opacity-40">└</span>
        <span className="absolute bottom-1.5 right-2 font-mono text-xs opacity-40">┘</span>

        {/* ── Top HUD Telemetry Bar (Screenshot 3) ── */}
        <div
          className={`flex items-center justify-between px-4 py-2.5 border-b font-mono text-[11px] z-20 relative ${
            isDark ? "border-[#26282E] bg-white/[0.02]" : "border-[#D8D6D0] bg-black/[0.02]"
          }`}
        >
          {/* Orange Dot + Capsule Identifier */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E50914] shadow-[0_0_8px_#E50914] animate-pulse" />
            <span className="font-bold tracking-wider uppercase">INCUBATION_CAPSULE_V3</span>
          </div>

          {/* Telemetry Metrics */}
          <div className="hidden sm:flex items-center gap-4 opacity-70 text-[10px] uppercase tracking-widest font-mono">
            <span>CORE: ZK_ACTIVE</span>
            <span>TEMP: 38.6°C</span>
            <span className="text-[#E50914] font-bold opacity-100">[SYNCED]</span>
          </div>

          {/* Play/Pause Control */}
          <button
            onClick={togglePlay}
            className="p-1 rounded opacity-60 hover:opacity-100 hover:text-[#E50914] transition-all cursor-pointer"
            title={isPlaying ? "Pause animation" : "Play animation"}
            aria-label={isPlaying ? "Pause animation" : "Play animation"}
          >
            {isPlaying ? (
              <span className="font-mono text-xs font-bold tracking-tighter">00</span>
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
          </button>
        </div>

        {/* ── Raw Video Viewport (Clean, No Distorting Filters) ── */}
        <div className="relative w-full aspect-[1144/626] overflow-hidden bg-black/5">
          <video
            ref={videoRef}
            key={videoSrc}
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover object-center transition-opacity duration-300"
          />

          {/* 4 Corner Square Indicators (Screenshot 3) */}
          <span className="absolute top-3 left-3 w-2 h-2 bg-[#E50914] rounded-[1px] pointer-events-none shadow-[0_0_6px_#E50914]" />
          <span className="absolute top-3 right-3 w-2 h-2 bg-[#E50914] rounded-[1px] pointer-events-none shadow-[0_0_6px_#E50914]" />
          <span className="absolute bottom-3 left-3 w-2 h-2 bg-[#E50914] rounded-[1px] pointer-events-none shadow-[0_0_6px_#E50914]" />
          <span className="absolute bottom-3 right-3 w-2 h-2 bg-[#E50914] rounded-[1px] pointer-events-none shadow-[0_0_6px_#E50914]" />

          {/* HUD Overlaid Labels: BACKING & TOMORROW (Screenshot 3) */}
          <div className="absolute bottom-2.5 left-8 font-mono text-[10px] font-bold tracking-widest uppercase opacity-70 pointer-events-none">
            BACKING
          </div>
          <div className="absolute bottom-2.5 right-8 font-mono text-[10px] font-bold tracking-widest uppercase opacity-70 pointer-events-none">
            TOMORROW
          </div>
        </div>

        {/* ── Bottom HUD Metadata Bar (Screenshot 3) ── */}
        <div
          className={`flex items-center justify-between px-4 py-2 border-t font-mono text-[10px] z-20 relative ${
            isDark ? "border-[#26282E] bg-white/[0.02]" : "border-[#D8D6D0] bg-black/[0.02]"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-[#E50914] font-bold tracking-widest flex items-center gap-1.5">
              <span>◆</span> MECHANICAL_CORE
            </span>
            <span className="hidden sm:inline opacity-50 uppercase tracking-wider">
              ARCH: NEURAL_ZK
            </span>
          </div>

          <div className="flex items-center gap-2 opacity-70 font-mono text-[9px] tracking-wider">
            <span>FPS: 60</span>
            <span>•</span>
            <span className="border border-current px-1 py-0.5 rounded text-[8px] font-semibold">
              1080p_HDR
            </span>
          </div>
        </div>
      </motion.div>

      {/* Under-Capsule Subtitle & Interactive Status */}
      <div className="mt-4 flex items-center gap-2.5 font-mono text-xs opacity-60">
        <span className="w-1.5 h-1.5 rounded-full bg-[#E50914]" />
        <span className="text-[10px] md:text-[11px] tracking-widest uppercase">
          FULL-CYCLE VENTURE INCUBATION // MOUSE TRACKING ACTIVE
        </span>
      </div>
    </div>
  );
}

