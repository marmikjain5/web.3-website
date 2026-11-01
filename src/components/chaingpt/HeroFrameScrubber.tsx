"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useSpring, useMotionValue } from "framer-motion";

interface HeroFrameScrubberProps {
  frameCount?: number;
  framePath?: string;
  className?: string;
  showTouchHint?: boolean;
}

/**
 * HeroFrameScrubber: Renders a high-performance <canvas> displaying an image sequence.
 * - Desktop: Smooth 60fps tracking driven by mouse cursor coordinates.
 * - Mobile & Touch: Interactive touch-drag scrubbing (horizontal swipe turns head left/right).
 * - Idle / Ambient: Naturally oscillates with a smooth organic sine wave when idle.
 */
export default function HeroFrameScrubber({
  frameCount = 85,
  framePath = "/hero-mouse-frames/frame_",
  className = "",
  showTouchHint = true,
}: HeroFrameScrubberProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Active interaction tracking
  const isInteractingRef = useRef(false);
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Spring-smoothed frame index for buttery 60fps tracking
  const rawFrame = useMotionValue(Math.floor((frameCount - 1) / 2));
  const smoothFrame = useSpring(rawFrame, { stiffness: 120, damping: 22 });

  // Detect touch device capability
  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        "ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          window.innerWidth < 1024
      );
    };
    checkTouch();
    window.addEventListener("resize", checkTouch);
    return () => window.removeEventListener("resize", checkTouch);
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

  // Handle pointer coordinate mapping (both mouse & touch)
  const handleCoordinate = useCallback(
    (clientX: number) => {
      isInteractingRef.current = true;
      setHasInteracted(true);

      const normalized = Math.max(0, Math.min(1, clientX / window.innerWidth));
      const targetFrame = Math.floor(normalized * (frameCount - 1));
      rawFrame.set(targetFrame);

      // Reset idle timer (2.5s)
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = setTimeout(() => {
        isInteractingRef.current = false;
      }, 2500);
    },
    [frameCount, rawFrame]
  );

  // Window-level mouse movement listener (works on all devices)
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      handleCoordinate(e.clientX);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [handleCoordinate]);

  // Touch & Pointer Drag listeners on the container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        handleCoordinate(e.touches[0].clientX);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        handleCoordinate(e.touches[0].clientX);
      }
    };

    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchstart", onTouchStart, { passive: true });

    return () => {
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchstart", onTouchStart);
    };
  }, [handleCoordinate]);

  // Organic Ambient Oscillation when idle
  useEffect(() => {
    if (!loaded) return;
    let raf: number;
    const center = (frameCount - 1) / 2;
    const amplitude = (frameCount - 1) * 0.40;

    const animate = (time: number) => {
      if (!isInteractingRef.current) {
        // Gentle organic sine wave oscillation at 0.24Hz
        const t = time / 1000;
        const target = center + Math.sin(t * 0.24 * Math.PI * 2) * amplitude;
        rawFrame.set(Math.max(0, Math.min(frameCount - 1, target)));
      }
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(raf);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, [loaded, frameCount, rawFrame]);

  // High-performance canvas render loop
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
    <div
      ref={containerRef}
      className={`relative select-none touch-pan-y cursor-ew-resize ${className}`}
    >
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

      {/* Mobile / Touch interactive guidance pill */}
      {showTouchHint && isTouchDevice && loaded && !hasInteracted && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none z-20 animate-bounce">
          <div className="px-3.5 py-1.5 rounded-full bg-black/50 border border-white/30 backdrop-blur-md text-white font-mono text-[10px] font-bold tracking-widest uppercase shadow-md flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-[#FFE600]">↔</span>
            <span>DRAG TO ROTATE</span>
          </div>
        </div>
      )}
    </div>
  );
}
