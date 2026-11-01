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
 * ScrambleText: Replicates the exact text scramble effect from labs.chaingpt.org
 * Uses the signature cipher charset "021ZROTXINSOPSEKN" to scramble characters
 * with digital flicker before resolving to the original string.
 */
export default function ScrambleText({
  text,
  className = "",
  as: Component = "span",
  triggerOnScroll = true,
  triggerOnHover = false,
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const elementRef = useRef<HTMLElement>(null);
  const hasAnimatedRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const startScramble = () => {
    let iteration = 0;
    const maxIterations = text.length * 3;
    const speed = 25; // ms per tick

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    let lastTime = performance.now();

    const tick = (now: number) => {
      if (now - lastTime >= speed) {
        lastTime = now;
        iteration += 0.8;

        const result = text
          .split("")
          .map((char, index) => {
            if (char === " " || char === "\n") return char;
            if (index < iteration / 2.5) {
              return text[index];
            }
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join("");

        setDisplayText(result);

        if (iteration >= maxIterations) {
          setDisplayText(text);
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
            // Short 150ms delay like labs.chaingpt.org
            setTimeout(startScramble, 150);
          }
        });
      },
      { threshold: 0.25 }
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

