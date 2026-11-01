"use client";
import { useRef, useState, useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export default function ParallaxSection({ children, className = "", intensity = 20 }: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  const mouseX = useSpring(0, { stiffness: 50, damping: 20 });
  const mouseY = useSpring(0, { stiffness: 50, damping: 20 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [intensity * 0.3, -intensity * 0.3]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-intensity * 0.3, intensity * 0.3]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouse = (e: MouseEvent) => {
      if (isMobile) return;
      const { width, height, left, top } = el.getBoundingClientRect();
      mouseX.set((e.clientX - left) / width - 0.5);
      mouseY.set((e.clientY - top) / height - 0.5);
    };

    const handleLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
    };

    el.addEventListener("mousemove", handleMouse);
    el.addEventListener("mouseleave", handleLeave);

    return () => {
      el.removeEventListener("mousemove", handleMouse);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [mouseX, mouseY, isMobile]);

  return (
    <div ref={ref} className={`relative ${className}`} style={{ perspective: "1000px" }}>
      <motion.div style={isMobile ? {} : { rotateX, rotateY }} className="relative">
        {children}
      </motion.div>
    </div>
  );
}
