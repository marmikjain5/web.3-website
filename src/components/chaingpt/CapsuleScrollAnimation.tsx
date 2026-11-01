"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { motion, useSpring } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface CapsuleScrollAnimationProps {
  frameCount?: number;
  framePath?: string;
  className?: string;
  triggerRef?: React.RefObject<HTMLElement | null>;
  mousePos?: { x: number; y: number };
}

/**
 * CapsuleScrollAnimation: Pure borderless animation canvas.
 * Renders the mechanical AI core descending and locking into the incubation capsule on scroll.
 * Completely borderless — seamlessly floats directly on the blueprint grid.
 */
export default function CapsuleScrollAnimation({
  frameCount = 145,
  framePath = "/final-capsule-frames/frame_",
  className = "",
  triggerRef,
  mousePos = { x: 0, y: 0 },
}: CapsuleScrollAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const [loaded, setLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { resolvedTheme } = useTheme();

  // Dynamic spring physics: subtle 3D tilt tracking cursor
  const rotateX = useSpring(0, { stiffness: 90, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 90, damping: 20 });
  const translateX = useSpring(0, { stiffness: 90, damping: 22 });

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Update spring positions on cursor movement
  useEffect(() => {
    if (isMobile) return;
    translateX.set(mousePos.x * 20);
    rotateY.set(mousePos.x * 10);
    rotateX.set(-mousePos.y * 8);
  }, [mousePos, isMobile, rotateX, rotateY, translateX]);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  // Preload all frames
  useEffect(() => {
    let cancelled = false;
    const images: HTMLImageElement[] = [];

    const promises = Array.from({ length: frameCount }, (_, i) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        const idx = String(i + 1).padStart(3, "0");
        img.src = `${framePath}${idx}.webp`;
        img.onload = () => resolve();
        img.onerror = () => resolve();
        images[i] = img;
      });
    });

    Promise.all(promises).then(() => {
      if (!cancelled) {
        framesRef.current = images;
        setLoaded(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [frameCount, framePath]);

  // Draw a specific frame on the canvas
  const drawFrame = useCallback(
    (index: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const clamped = Math.max(0, Math.min(frameCount - 1, Math.round(index)));
      const img = framesRef.current[clamped];
      if (!img) return;

      if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      currentFrameRef.current = clamped;
    },
    [frameCount]
  );

  // Desktop: GSAP ScrollTrigger scrub
  useEffect(() => {
    if (!loaded || isMobile) return;
    const targetEl = triggerRef?.current || sectionRef.current;
    if (!targetEl) return;

    // Draw initial frame
    drawFrame(0);

    const trigger = ScrollTrigger.create({
      trigger: targetEl,
      start: "top 70%",
      end: "bottom 20%",
      scrub: 0.6,
      onUpdate: (self) => {
        const targetFrame = Math.floor(self.progress * (frameCount - 1));
        drawFrame(targetFrame);
      },
    });

    return () => {
      trigger.kill();
    };
  }, [loaded, isMobile, frameCount, drawFrame, triggerRef]);

  // Interactive mouse wheel scrub on hover
  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? 3 : -3;
    const nextFrame = Math.max(0, Math.min(frameCount - 1, currentFrameRef.current + delta));
    drawFrame(nextFrame);
  };

  // Mobile: auto-play with IntersectionObserver
  useEffect(() => {
    if (!loaded || !isMobile || !sectionRef.current) return;

    let raf: number;
    let playing = false;
    let frame = 0;
    let lastTime = 0;
    const FPS = 22;
    const interval = 1000 / FPS;

    const animate = (time: number) => {
      if (!playing) return;
      if (time - lastTime >= interval) {
        drawFrame(frame);
        frame++;
        if (frame >= frameCount) frame = 0;
        lastTime = time;
      }
      raf = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          playing = true;
          raf = requestAnimationFrame(animate);
        } else {
          playing = false;
          if (raf) cancelAnimationFrame(raf);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(sectionRef.current);
    drawFrame(0);

    return () => {
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [loaded, isMobile, frameCount, drawFrame]);

  return (
    <div
      ref={sectionRef}
      onWheel={handleWheel}
      className={`relative w-full flex flex-col items-center justify-center select-none ${className}`}
      style={{ perspective: "1200px" }}
    >
      {/* ── Completely Borderless 3D Floating Animation Canvas ── */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          x: translateX,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full max-w-[520px] md:max-w-[580px] lg:max-w-[640px] flex items-center justify-center"
      >
        <div className="relative w-full aspect-[490/594] overflow-hidden flex items-center justify-center">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="font-mono text-xs opacity-40 tracking-widest uppercase animate-pulse">
                INITIALIZING CORE...
              </div>
            </div>
          )}

          <canvas
            ref={canvasRef}
            className={`w-full h-full object-contain pointer-events-none transition-all duration-300 ${
              isDark ? "brightness-95 contrast-105" : ""
            }`}
            style={{
              opacity: loaded ? 1 : 0,
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
