"use client";

import { useEffect } from "react";

const SCRAMBLE_CHARS = "021zrotxinsmopsweknm";

/**
 * ChainHoverScramble:
 * Implements the signature ChainGPT Labs hover scramble effect across all
 * interactive buttons, links, and elements with [data-scramble] or [scramble-link].
 */
export default function ChainHoverScramble() {
  useEffect(() => {
    // Only on pointer devices
    if (typeof window === "undefined" || window.innerWidth < 768) return;

    const activeTimers = new Map<HTMLElement, { rafId: number; originalText: string }>();

    const scrambleElement = (el: HTMLElement) => {
      // Find the text target: either the element itself or a child with [scramble-text]
      const textNode = (el.querySelector("[scramble-text]") as HTMLElement) || el;
      if (!textNode || !textNode.textContent) return;

      // Do not scramble if it's already running
      if (activeTimers.has(textNode)) {
        cancelAnimationFrame(activeTimers.get(textNode)!.rafId);
      }

      const originalText = textNode.dataset.originalText || textNode.textContent.trim();
      textNode.dataset.originalText = originalText;

      let iteration = 0;
      const maxIterations = originalText.length * 2.2;
      let lastTime = performance.now();

      const tick = (now: number) => {
        if (now - lastTime >= 30) {
          lastTime = now;
          iteration += 1.2;

          textNode.textContent = originalText
            .split("")
            .map((char, index) => {
              if (char === " " || char === "\n" || char === "/" || char === ">" || char === "<") {
                return char;
              }
              if (index < iteration / 2.2) {
                return originalText[index];
              }
              return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
            })
            .join("");

          if (iteration >= maxIterations) {
            textNode.textContent = originalText;
            activeTimers.delete(textNode);
            return;
          }
        }

        const rafId = requestAnimationFrame(tick);
        activeTimers.set(textNode, { rafId, originalText });
      };

      const rafId = requestAnimationFrame(tick);
      activeTimers.set(textNode, { rafId, originalText });
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest(
        "[scramble-link], [data-scramble], .cyber-btn, .scramble-hover"
      ) as HTMLElement | null;

      if (target) {
        scrambleElement(target);
      }
    };

    document.addEventListener("mouseover", handleMouseEnter, { passive: true });

    return () => {
      document.removeEventListener("mouseover", handleMouseEnter);
      activeTimers.forEach(({ rafId, originalText }, node) => {
        cancelAnimationFrame(rafId);
        node.textContent = originalText;
      });
      activeTimers.clear();
    };
  }, []);

  return null;
}

