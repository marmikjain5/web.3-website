"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

interface IncubationCapsuleProps {
  variant?: "hero" | "full" | "network";
  className?: string;
}

export default function IncubationCapsule({ variant = "hero", className = "" }: IncubationCapsuleProps) {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll-linked kinetic transforms
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const armY = useTransform(scrollYProgress, [0, 1], [-18, 35]);
  const cubeRotateY = useTransform(scrollYProgress, [0, 1], [-15, 25]);
  const cubeRotateX = useTransform(scrollYProgress, [0, 1], [10, -10]);
  const coreScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1.05, 0.98]);

  // Spring for smooth robot head tracking
  const headRotateY = useSpring(0, { stiffness: 80, damping: 20 });
  const headRotateX = useSpring(0, { stiffness: 80, damping: 20 });
  const eyeX = useSpring(0, { stiffness: 120, damping: 25 });
  const eyeY = useSpring(0, { stiffness: 120, damping: 25 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);
      const x = Math.max(-1, Math.min(1, dx));
      const y = Math.max(-1, Math.min(1, dy));

      setMouseOffset({ x, y });

      if (variant === "full") {
        headRotateY.set(x * 15);
        headRotateX.set(-y * 10);
        eyeX.set(x * 5);
        eyeY.set(y * 4);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [variant, headRotateY, headRotateX, eyeX, eyeY]);

  const mouseRotateY = mouseOffset.x * 12;
  const mouseRotateX = -mouseOffset.y * 10;

  // ─── FULL VARIANT: Cute White Robot in Glass Cylinder (BeyondCapital section) ───
  if (variant === "full") {
    return (
      <div
        ref={containerRef}
        className={`relative flex flex-col items-center justify-center select-none ${className}`}
        style={{ perspective: "800px" }}
      >
        {/* Glass Cylinder Container */}
        <div className="relative w-52 md:w-60" style={{ height: "420px" }}>
          
          {/* Top cap of cylinder */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 md:w-52 h-6 bg-gradient-to-b from-[#F0F0F0] to-[#D8D8D8] dark:from-[#2A2A2A] dark:to-[#1A1A1A] rounded-full border border-[#C0C0C0] dark:border-[#3A3A3A] shadow-md z-20" />

          {/* Glass tube body */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-44 md:w-52 rounded-3xl overflow-hidden z-10"
            style={{ top: "12px", bottom: "20px" }}
          >
            {/* Glass tint */}
            <div className="absolute inset-0 bg-white/8 dark:bg-white/5 backdrop-blur-sm" />
            {/* Left glass sheen */}
            <div className="absolute left-2 top-0 bottom-0 w-4 bg-gradient-to-r from-white/25 to-transparent pointer-events-none" />
            {/* Right glass sheen */}
            <div className="absolute right-2 top-0 bottom-0 w-3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
            {/* Glass border */}
            <div className="absolute inset-0 border border-[#E0E0E0] dark:border-[#303030] rounded-3xl pointer-events-none" />
          </div>

          {/* Bottom ring base (orange accent) */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-44 md:w-52 z-20">
            <div className="h-4 bg-gradient-to-b from-[#FF1E27] to-[#CC0009] rounded-b-3xl shadow-[0_4px_16px_rgba(255,30,39,0.6)]" />
            <div className="h-2 mx-4 bg-[#FF1E27]/30 rounded-b-full blur-sm" />
          </div>

          {/* Floating Robot inside the capsule */}
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-1/2 -translate-x-1/2 z-15 flex flex-col items-center"
            style={{ top: "50px" }}
          >
            {/* Robot Head (tracks cursor) */}
            <motion.div
              style={{
                rotateY: headRotateY,
                rotateX: headRotateX,
                transformStyle: "preserve-3d",
              }}
              className="relative w-20 h-20 md:w-24 md:h-24"
            >
              {/* Head outer casing - white rounded square */}
              <div className="absolute inset-0 rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-[#E0E0E0]">
                {/* Orange border ring inner */}
                <div className="absolute inset-1.5 rounded-xl border-2 border-[#FF1E27] bg-[#0D0D0D] flex flex-col items-center justify-center gap-1.5 overflow-hidden">
                  {/* Screen glow */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A]" />
                  
                  {/* Robot Eyes */}
                  <div className="relative z-10 flex gap-3 items-center">
                    {/* Left eye */}
                    <div className="w-3.5 h-3.5 rounded-full bg-white/10 border border-white/30 flex items-center justify-center overflow-hidden">
                      <motion.div
                        style={{ x: eyeX, y: eyeY }}
                        className="w-2 h-2 rounded-full bg-white"
                      />
                    </div>
                    {/* Right eye */}
                    <div className="w-3.5 h-3.5 rounded-full bg-white/10 border border-white/30 flex items-center justify-center overflow-hidden">
                      <motion.div
                        style={{ x: eyeX, y: eyeY }}
                        className="w-2 h-2 rounded-full bg-white"
                      />
                    </div>
                  </div>
                  
                  {/* Mouth / status bar */}
                  <div className="relative z-10 w-6 h-0.5 bg-[#FF1E27]/60 rounded-full" />
                </div>
                
                {/* Ear nubs */}
                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-5 rounded-l-sm bg-[#EAEAEA] border border-[#DCDCDC]" />
                <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-5 rounded-r-sm bg-[#EAEAEA] border border-[#DCDCDC]" />
              </div>
            </motion.div>

            {/* Robot Neck */}
            <div className="w-5 h-4 bg-white border-x border-[#E0E0E0] shadow-sm" />

            {/* Robot Body */}
            <div className="w-16 md:w-20 bg-white rounded-2xl border border-[#E0E0E0] shadow-md px-2 pt-2 pb-3 flex flex-col items-center gap-1">
              {/* Chest panel */}
              <div className="w-10 h-7 rounded-lg bg-[#0D0D0D] border border-[#FF1E27]/40 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#FF1E27] shadow-[0_0_6px_#FF1E27] animate-pulse" />
              </div>
              {/* Hip */}
              <div className="w-12 h-2 bg-[#F0F0F0] rounded-full border border-[#E0E0E0]" />
            </div>

            {/* Robot Arms */}
            <div className="absolute top-[80px] md:top-[88px] left-1/2 -translate-x-1/2 w-28 md:w-32 flex justify-between pointer-events-none">
              {/* Left arm */}
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-4 h-10 bg-white rounded-full border border-[#E0E0E0] shadow-sm" />
                <div className="w-3.5 h-6 bg-white rounded-full border border-[#E0E0E0] shadow-sm" />
              </div>
              {/* Right arm */}
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-4 h-10 bg-white rounded-full border border-[#E0E0E0] shadow-sm" />
                <div className="w-3.5 h-6 bg-white rounded-full border border-[#E0E0E0] shadow-sm" />
              </div>
            </div>

            {/* Robot Legs (partially visible) */}
            <div className="flex gap-3 mt-1">
              <div className="w-5 h-12 bg-white rounded-b-2xl border border-[#E0E0E0] shadow-sm" />
              <div className="w-5 h-12 bg-white rounded-b-2xl border border-[#E0E0E0] shadow-sm" />
            </div>
          </motion.div>

          {/* Base orange glow */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#FF1E27]/40 blur-xl rounded-full pointer-events-none z-5" />
        </div>
      </div>
    );
  }

  // ─── HERO VARIANT: Articulated Robotic Arm Mechanism (default) ───
  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-center select-none pointer-events-auto ${className}`}
    >
      {/* ── Articulated Robotic Arm Mechanism (Hanging from ceiling) ── */}
      <motion.div
        style={{ y: armY }}
        className="relative flex flex-col items-center z-20 w-72 md:w-80"
      >
        {/* Top Hydraulic Ceiling Conduit & Cable Feeds */}
        <div className="relative flex flex-col items-center">
          {/* Ceiling Mount Flange */}
          <div className="w-28 h-4 bg-gradient-to-b from-[#E2E5EB] to-[#C0C5CF] dark:from-[#2B2F3A] dark:to-[#171920] rounded-b-lg border-b border-x border-white/50 dark:border-white/10 shadow-md flex items-center justify-center">
            <div className="w-16 h-1 bg-black/20 rounded-full" />
          </div>

          {/* Ribbed Flexible Cable Conduits */}
          <div className="w-14 h-12 flex justify-between px-1.5 py-0.5">
            <div className="w-2.5 h-full bg-[#CBD0DB] dark:bg-[#1E222A] rounded-sm border-x border-black/10 flex flex-col justify-around py-0.5">
              <span className="w-full h-0.5 bg-black/20" />
              <span className="w-full h-0.5 bg-black/20" />
              <span className="w-full h-0.5 bg-black/20" />
              <span className="w-full h-0.5 bg-black/20" />
            </div>
            <div className="w-3.5 h-full bg-[#B8BFCB] dark:bg-[#14161C] rounded-sm border-x border-black/15 flex flex-col justify-around py-0.5">
              <span className="w-full h-0.5 bg-black/20" />
              <span className="w-full h-0.5 bg-black/20" />
              <span className="w-full h-0.5 bg-black/20" />
              <span className="w-full h-0.5 bg-black/20" />
            </div>
            <div className="w-2.5 h-full bg-[#CBD0DB] dark:bg-[#1E222A] rounded-sm border-x border-black/10 flex flex-col justify-around py-0.5">
              <span className="w-full h-0.5 bg-black/20" />
              <span className="w-full h-0.5 bg-black/20" />
              <span className="w-full h-0.5 bg-black/20" />
              <span className="w-full h-0.5 bg-black/20" />
            </div>
          </div>

          {/* Main Upper Pneumatic Joint Cylinder */}
          <div className="w-24 h-16 bg-gradient-to-b from-[#F2F4F7] via-[#E4E7ED] to-[#CBD1DC] dark:from-[#2E3340] dark:via-[#20242D] dark:to-[#171A21] rounded-xl border border-white/80 dark:border-white/15 shadow-lg flex flex-col items-center justify-between p-1.5 relative">
            <div className="w-16 h-2 bg-[#BDC4CF] dark:bg-[#12141A] rounded-full border border-black/10" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#9EA6B5] to-[#DCE0E8] dark:from-[#111317] dark:to-[#363C4A] border-2 border-white/60 dark:border-white/20 shadow-inner flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[#5C6473] dark:bg-[#090A0D] border border-white/30" />
            </div>
            <div className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-[#FF1E27] animate-pulse shadow-[0_0_6px_#FF1E27]" />
          </div>

          {/* Mechanical Shoulder Linkage Bar */}
          <div className="w-32 h-5 bg-[#D4D9E2] dark:bg-[#1D212A] border-x-2 border-y border-black/15 flex items-center justify-around px-2 relative z-10 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-black/30 dark:bg-black/60" />
            <span className="text-[8px] font-mono font-bold tracking-widest text-black/40 dark:text-white/30">WEB3_CLUB</span>
            <span className="w-2 h-2 rounded-full bg-black/30 dark:bg-black/60" />
          </div>
        </div>

        {/* ── Articulated Clamping Jaws Holding the AI Core ── */}
        <div className="relative w-64 md:w-72 flex items-center justify-between -mt-1 z-20">
          
          {/* Left Mechanical Clamp Arm */}
          <div className="w-14 h-48 bg-gradient-to-r from-[#F0F2F6] via-[#E2E6EE] to-[#CBD1DC] dark:from-[#2B303C] dark:via-[#1F232C] dark:to-[#15171E] rounded-l-2xl border-y border-l border-white/70 dark:border-white/15 shadow-xl flex flex-col justify-between p-2 relative">
            <div className="w-4 h-8 bg-[#A8B0BE] dark:bg-[#111318] rounded-md border border-black/10" />
            <div className="w-2 h-16 bg-[#FF1E27]/40 rounded-full blur-[1px] ml-auto mr-1" />
            <div className="w-5 h-10 bg-[#353B47] dark:bg-[#0D0F13] rounded-r-md border border-white/10 ml-auto" />
          </div>

          {/* ── Center Incubated Glowing AI Holographic Cube ── */}
          <motion.div
            style={{
              rotateY: cubeRotateY,
              rotateX: cubeRotateX,
              scale: coreScale,
              transformStyle: "preserve-3d",
            }}
            animate={{
              rotateY: [mouseRotateY - 3, mouseRotateY + 3],
              rotateX: [mouseRotateX - 2, mouseRotateX + 2],
            }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 4,
              ease: "easeInOut",
            }}
            className="relative w-36 h-36 md:w-40 md:h-40 rounded-2xl bg-[#090B0F] border-2 border-white/20 dark:border-white/10 shadow-[0_0_40px_rgba(255,30,39,0.45),inset_0_0_25px_rgba(255,30,39,0.3)] flex items-center justify-center overflow-hidden p-2 group cursor-pointer"
          >
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(#FF1E27 1.5px, transparent 1.5px), linear-gradient(to right, rgba(255,30,39,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,30,39,0.15) 1px, transparent 1px)",
                backgroundSize: "16px 16px, 8px 8px, 8px 8px",
              }}
            />
            <div className="absolute inset-1 rounded-xl bg-gradient-to-tr from-[#990008] via-[#FF1E27] to-[#FFAA00] opacity-80 blur-[8px] animate-pulse" />
            <div className="relative w-full h-full bg-[#0D0F15]/90 rounded-xl border border-white/30 flex flex-col items-center justify-center z-10 backdrop-blur-[2px]">
              <span className="tech-bracket-tl" />
              <span className="tech-bracket-tr" />
              <span className="tech-bracket-bl" />
              <span className="tech-bracket-br" />
              <div className="flex items-center justify-center">
                <span className="cyber-font text-5xl md:text-6xl font-black text-white drop-shadow-[0_0_16px_rgba(255,30,39,0.9)] tracking-tighter select-none">
                  AI
                </span>
              </div>
              <div className="mt-1 font-mono text-[9px] font-bold text-[#FF1E27] tracking-widest uppercase">
                CORE_ACTIVE
              </div>
            </div>
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent pointer-events-none rounded-t-xl" />
          </motion.div>

          {/* Right Mechanical Clamp Arm */}
          <div className="w-14 h-48 bg-gradient-to-l from-[#F0F2F6] via-[#E2E6EE] to-[#CBD1DC] dark:from-[#2B303C] dark:via-[#1F232C] dark:to-[#15171E] rounded-r-2xl border-y border-r border-white/70 dark:border-white/15 shadow-xl flex flex-col justify-between p-2 relative">
            <div className="w-4 h-8 bg-[#A8B0BE] dark:bg-[#111318] rounded-md border border-black/10 ml-auto" />
            <div className="w-2 h-16 bg-[#FF1E27]/40 rounded-full blur-[1px] mr-auto ml-1" />
            <div className="w-5 h-10 bg-[#353B47] dark:bg-[#0D0F13] rounded-l-md border border-white/10 mr-auto" />
          </div>
        </div>

        {/* Lower Hydraulic Piston Shaft Assembly */}
        <div className="w-28 h-8 bg-gradient-to-b from-[#CBD1DC] to-[#E2E6EE] dark:from-[#171A21] dark:to-[#252A35] rounded-b-xl border-b border-x border-black/15 shadow-md flex items-center justify-center -mt-1">
          <div className="w-14 h-1.5 bg-[#8C94A4] dark:bg-[#0C0E12] rounded-full border border-black/10" />
        </div>
      </motion.div>
    </div>
  );
}
