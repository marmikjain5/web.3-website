"use client";

import { useEffect, useRef, useState } from "react";

const SCRAMBLE_CHARS = "021ZROTXINSOPSEKN";

interface ScrambleTextProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "span" | "div";
  triggerOnScroll?: boolean;
  triggerOnHover?: boolean;
}

/**
 * ScrambleText: Replicates the signature cipher scramble effect from labs.chaingpt.org
 * Fast, crisp, self-resolving with guaranteed fallback to prevent any stuck or glitchy characters.
 */
export default function ScrambleText({
  text,
  className = "",
  as: Component = "span",
  triggerOnScroll = false,
  triggerOnHover = true,
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const elementRef = useRef<HTMLElement>(null);
  const hasAnimatedRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const startScramble = () => {
    // If headless / screenshot or reduced motion, stay unscrambled
    if (typeof window !== "undefined") {
      if (
        navigator.webdriver ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        setDisplayText(text);
        return;
      }
    }

    let iteration = 0;
    const maxIterations = Math.min(text.length * 2, 30);
    const speed = 20; // 20ms per tick -> resolves under 300ms

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    let lastTime = performance.now();

    // Guaranteed fallback: unconditionally resolve text after 400ms
    const safetyTimer = setTimeout(() => {
      setDisplayText(text);
    }, 400);

    const tick = (now: number) => {
      if (now - lastTime >= speed) {
        lastTime = now;
        iteration += 1.5;

        const result = text
          .split("")
          .map((char, index) => {
            if (char === " " || char === "\n") return char;
            if (index < iteration / 2) {
              return text[index];
            }
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join("");

        setDisplayText(result);

        if (iteration >= maxIterations) {
          setDisplayText(text);
          clearTimeout(safetyTimer);
          return;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    setDisplayText(text);
    if (!triggerOnScroll || !elementRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            hasAnimatedRef.current = true;
            setTimeout(startScramble, 100);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [text, triggerOnScroll]);

  return (
    <Component
      ref={elementRef as any}
      className={className}
      onMouseEnter={triggerOnHover ? startScramble : undefined}
    >
      {displayText}
    </Component>
  );
}
