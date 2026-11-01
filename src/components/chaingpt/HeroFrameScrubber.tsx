"use client";

import { useRef, useState, useEffect } from "react";
import { useSpring, useMotionValue } from "framer-motion";

interface HeroFrameScrubberProps {
  frameCount?: number;
  framePath?: string;
  className?: string;
}

/**
 * HeroFrameScrubber: Renders a high-performance <canvas> displaying an image sequence.
 * The displayed frame is driven by the user's mouse X position (cursor-driven face tracking).
 * On mobile/touch devices, it auto-oscillates with a smooth organic sine wave.
 */
export default function HeroFrameScrubber({
  frameCount = 85,
  framePath = "/hero-mouse-frames/frame_",
  className = "",
}: HeroFrameScrubberProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Spring-smoothed frame index for buttery 60fps tracking
  const rawFrame = useMotionValue(Math.floor(frameCount / 2));
  const smoothFrame = useSpring(rawFrame, { stiffness: 110, damping: 22 });

  // Detect mobile / touch
  useEffect(() => {
    const check = () =>
      setIsMobile(window.innerWidth < 1024 || "ontouchstart" in window);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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

  // Desktop: Mouse tracking across full window → frame index
  useEffect(() => {
    if (isMobile) return;

    const handleMouse = (e: MouseEvent) => {
      // Map mouse X from 0..windowWidth to 0..(frameCount-1)
      const normalized = Math.max(0, Math.min(1, e.clientX / window.innerWidth));
      const targetFrame = Math.floor(normalized * (frameCount - 1));
      rawFrame.set(targetFrame);
    };

    window.addEventListener("mousemove", handleMouse, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [isMobile, frameCount, rawFrame]);

  // Mobile / Touch: Gentle ambient oscillation
  useEffect(() => {
    if (!isMobile || !loaded) return;
    let raf: number;
    const center = (frameCount - 1) / 2;
    const amplitude = (frameCount - 1) * 0.42;

    const animate = (time: number) => {
      // Gentle sine wave oscillation at 0.28Hz
      const t = time / 1000;
      const target = center + Math.sin(t * 0.28 * Math.PI * 2) * amplitude;
      rawFrame.set(Math.max(0, Math.min(frameCount - 1, target)));
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [isMobile, loaded, frameCount, rawFrame]);

  // Canvas render loop
  useEffect(() => {
    if (!loaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let raf: number;
    let lastDrawn = -1;

    const draw = () => {
      const frameIdx = Math.round(smoothFrame.get());
      const clamped = Math.max(0, Math.min(frameCount - 1, frameIdx));

      if (clamped !== lastDrawn && framesRef.current[clamped]) {
        const img = framesRef.current[clamped];
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          // Only resize canvas if dimensions actually changed (prevents GPU context resets)
          if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
          }
          ctx.drawImage(img, 0, 0);
          lastDrawn = clamped;
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [loaded, frameCount, smoothFrame]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Loading indicator */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="font-mono text-xs text-white/70 tracking-widest uppercase animate-pulse">
            INITIALIZING 3D TELEMETRY...
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover object-[center_35%] select-none pointer-events-none"
        style={{
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.6s ease",
        }}
      />
    </div>
  );
}
