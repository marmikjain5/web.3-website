"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  splitBy?: "words" | "chars";
  once?: boolean;
  tag?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
}

export default function SplitText({
  text,
  className = "",
  delay = 0,
  stagger = 0.04,
  splitBy = "words",
  once = true,
  tag: Tag = "span",
}: SplitTextProps) {
  const ref = useRef<HTMLElement>(null);
  const animRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Split text into units
    const parts = splitBy === "chars" ? text.split("") : text.split(" ");
    const separator = splitBy === "chars" ? "" : " ";

    el.innerHTML = parts
      .map(
        (p) =>
          `<span class="split-unit" style="display:inline-block;overflow:hidden;vertical-align:bottom;"><span class="split-inner" style="display:inline-block;">${
            p === " " ? "&nbsp;" : p
          }</span></span>`
      )
      .join(separator);

    const units = el.querySelectorAll<HTMLSpanElement>(".split-inner");

    // Set initial state
    gsap.set(units, { y: "110%", rotate: 3, opacity: 0 });

    // Animate with ScrollTrigger
    animRef.current = gsap.to(units, {
      y: "0%",
      rotate: 0,
      opacity: 1,
      duration: 0.85,
      stagger,
      delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        once,
        onEnter: () => {
          // Add visible class for CSS fallback
          el.classList.add("text-revealed");
        },
      },
    });

    return () => {
      animRef.current?.kill();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger === el) st.kill();
      });
    };
  }, [text, delay, stagger, splitBy, once]);

  return (
    // @ts-expect-error dynamic tag
    <Tag ref={ref} className={`${className} split-text-container`} aria-label={text} />
  );
}

