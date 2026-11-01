"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ACCENT = "#E50914";
const DURATION = 600;

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(true);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  const tick = useCallback((now: number) => {
    if (!startRef.current) startRef.current = now;
    const elapsed = now - startRef.current;
    const pct = Math.min(elapsed / DURATION, 1);
    const eased = 1 - Math.pow(1 - pct, 3);
    setProgress(Math.round(eased * 100));

    if (pct < 1) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      setTimeout(() => {
        setShow(false);
        onComplete();
      }, 150);
    }
  }, [onComplete]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [tick]);

  const SVG_H = 220;
  const fillY = SVG_H - (progress / 100) * SVG_H;
  const waveAmp = 12;
  const waveTopY = fillY - waveAmp;

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {show && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#ECEBE8]"
        >
          {/* Liquid-fill text via SVG clipPath */}
          <div className="select-none w-[88vw] max-w-2xl" aria-hidden>
            <svg
              viewBox={`0 0 840 ${SVG_H}`}
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto overflow-visible"
            >
              <defs>
                <clipPath id="tc">
                  <text
                    x="420"
                    y="180"
                    textAnchor="middle"
                    fontFamily="'Courier New', monospace, system-ui"
                    fontWeight="900"
                    fontSize="180"
                    letterSpacing="-4"
                  >
                    web.3_
                  </text>
                </clipPath>
              </defs>

              {/* Ghost outline */}
              <text
                x="420"
                y="180"
                textAnchor="middle"
                fontFamily="'Courier New', monospace, system-ui"
                fontWeight="900"
                fontSize="180"
                letterSpacing="-4"
                fill="none"
                stroke="rgba(0,0,0,0.15)"
                strokeWidth="2"
              >
                web.3_
              </text>

              {/* All fill content clipped to letter shapes */}
              <g clipPath="url(#tc)">
                <rect
                  x="0"
                  y={fillY + waveAmp}
                  width="840"
                  height={SVG_H}
                  fill={ACCENT}
                />

                <g transform={`translate(0, ${waveTopY})`}>
                  <path fill={ACCENT}>
                    <animate
                      attributeName="d"
                      dur="1.6s"
                      repeatCount="indefinite"
                      calcMode="spline"
                      keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
                      values={`
                        M0,${waveAmp} Q105,0 210,${waveAmp} T420,${waveAmp} T630,${waveAmp} T840,${waveAmp} V${SVG_H + waveAmp * 2} H0 Z;
                        M0,${waveAmp} Q105,${waveAmp * 2} 210,${waveAmp} T420,${waveAmp} T630,${waveAmp} T840,${waveAmp} V${SVG_H + waveAmp * 2} H0 Z;
                        M0,${waveAmp} Q105,0 210,${waveAmp} T420,${waveAmp} T630,${waveAmp} T840,${waveAmp} V${SVG_H + waveAmp * 2} H0 Z
                      `}
                    />
                  </path>
                </g>
              </g>
            </svg>
          </div>

          {/* Counter + progress bar */}
          <div className="mt-6 flex flex-col items-center gap-3 w-56">
            <span className="font-mono text-xs text-foreground/60 tracking-widest uppercase">
              INITIALIZING //{" "}
              <span style={{ color: ACCENT }} className="font-bold">{progress}%</span>
            </span>

            <div className="w-full h-1 bg-foreground/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ width: `${progress}%`, backgroundColor: ACCENT }}
                transition={{ duration: 0.08 }}
              />
            </div>

            <span className="font-mono text-[10px] text-foreground/40 tracking-[0.3em] uppercase">
              read . write . own
            </span>
          </div>

          {/* Corner branding */}
          <span className="absolute bottom-6 left-6 font-mono text-[10px] text-foreground/30 tracking-widest uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#E50914]" />
            web.3_ ecosystem
          </span>
          <span className="absolute bottom-6 right-6 font-mono text-[10px] text-foreground/30 tracking-widest uppercase">
            Est. 2024
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
