"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  once?: boolean;
}

/**
 * ScrollReveal — wraps children in a GSAP ScrollTrigger fade-up reveal.
 * Mobile: CSS-only fallback (no GSAP) for performance.
 */
export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  duration = 0.8,
  y = 36,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // On mobile use a simpler IntersectionObserver for performance
    if (isMobile) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            el.style.transition = `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`;
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
            if (once) observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      el.style.opacity = "0";
      el.style.transform = `translateY(${y * 0.5}px)`;
      observer.observe(el);
      return () => observer.disconnect();
    }

    // Desktop: GSAP
    gsap.set(el, { y, opacity: 0 });
    const anim = gsap.to(el, {
      y: 0,
      opacity: 1,
      duration,
      delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        once,
      },
    });

    return () => {
      anim.kill();
    };
  }, [delay, duration, y, once, isMobile]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

