"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MagneticButton from "@/components/MagneticButton";
import ScrambleText from "./ScrambleText";

gsap.registerPlugin(ScrollTrigger);

interface PortfolioSectionProps {
  incubationCount?: number;
}

const PROJECTS = [
  {
    name: "LUMOZ",
    category: "Modular ZK Compute",
    symbol: "◎",
    fundsRaised: "$10M+",
    socialGrowth: "450K+",
    athRoi: "18.4x",
    partnerships: "35+",
    link: "https://lumoz.org",
  },
  {
    name: "HANA",
    category: "Privacy Layer / Keystore",
    symbol: "❖",
    fundsRaised: "$8.5M",
    socialGrowth: "220K+",
    athRoi: "12.6x",
    partnerships: "20+",
    link: "https://hana.network",
  },
  {
    name: "ATLAS",
    category: "DePIN Infrastructure",
    symbol: "▲",
    fundsRaised: "$6.2M",
    socialGrowth: "180K+",
    athRoi: "9.8x",
    partnerships: "18+",
    link: "https://atlas.io",
  },
  {
    name: "DECRYPTO",
    category: "Developer Campus & Hackathons",
    symbol: "◆",
    fundsRaised: "Ecosystem Grant",
    socialGrowth: "10K+",
    athRoi: "Community First",
    partnerships: "15+",
    link: "/events",
  },
  {
    name: "AETHIR",
    category: "Distributed Cloud GPU",
    symbol: "⬡",
    fundsRaised: "$32M+",
    socialGrowth: "600K+",
    athRoi: "24.5x",
    partnerships: "60+",
    link: "https://aethir.com",
  },
  {
    name: "IO.NET",
    category: "AI Cluster Network",
    symbol: "■",
    fundsRaised: "$40M+",
    socialGrowth: "800K+",
    athRoi: "28.0x",
    partnerships: "80+",
    link: "https://io.net",
  },
];

export default function PortfolioSection({ incubationCount = 14 }: PortfolioSectionProps) {
  const [page, setPage] = useState(0);
  const pageSize = 3;
  const maxPage = Math.ceil(PROJECTS.length / pageSize) - 1;

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const conduitRef = useRef<HTMLDivElement>(null);

  const visibleProjects = PROJECTS.slice(page * pageSize, (page + 1) * pageSize);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.from(headerRef.current.children, {
          y: 35,
          opacity: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        });
      }

      if (conduitRef.current) {
        gsap.from(conduitRef.current, {
          scaleX: 0,
          opacity: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: conduitRef.current,
            start: "top 85%",
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full py-20 border-b border-border lab-grid-bg overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Top Header Block */}
        <div ref={headerRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end border-b border-border pb-8 mb-12">
          
          {/* Left Title Box */}
          <div className="lg:col-span-8 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-foreground" />
              <span className="font-mono text-xs md:text-sm font-bold uppercase tracking-widest text-foreground/70">
                Our Incubations
              </span>
            </div>
            <ScrambleText
              text="PORTFOLIO"
              as="h2"
              className="text-5xl sm:text-7xl md:text-8xl font-black font-amiga tracking-tight text-foreground block"
            />
          </div>

          {/* Right Stat Widget: All Projects [ 14 ] -> */}
          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <div className="bg-card border border-border p-6 rounded-2xl flex items-center justify-between gap-8 min-w-[240px] shadow-sm relative group hover:border-[#E50914]/50 transition-colors">
              <span className="tech-bracket-tl" />
              <span className="tech-bracket-tr" />
              <span className="tech-bracket-bl" />
              <span className="tech-bracket-br" />

              <div>
                <span className="block font-mono text-xs font-bold text-foreground/50 uppercase">
                  All Projects
                </span>
                <span className="font-mono text-4xl md:text-5xl font-black text-foreground">
                  {incubationCount}
                </span>
              </div>

              <div className="w-12 h-12 rounded-xl bg-foreground text-background flex items-center justify-center group-hover:bg-[#E50914] group-hover:text-white transition-all shadow-sm">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Network Conduit Schematic */}
        <div ref={conduitRef} className="relative py-6 mb-8 hidden md:block">
          <div className="w-full h-16 border-y border-dashed border-border flex items-center justify-around relative">
            <div className="flex items-center gap-3 bg-card px-4 py-1.5 rounded-full border border-border text-xs font-mono text-foreground/70">
              <span className="w-2 h-2 rounded-full bg-[#E50914] animate-ping" />
              <span>ACTIVE_PIPELINE_NODES: {PROJECTS.length}</span>
            </div>
            
            {/* Animated Laser Gradient Conduit */}
            <div className="w-1/3 h-0.5 relative overflow-hidden bg-foreground/10 rounded-full">
              <motion.div
                className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#E50914] to-transparent"
                animate={{ x: ["-100%", "300%"] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-[#E50914]">
              <span>[ REAL_TIME_METRICS_SYNCED ]</span>
            </div>
          </div>
        </div>

        {/* 4-Quadrant Metric Cards Grid with AnimatePresence */}
        <div className="min-h-[260px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {visibleProjects.map((project) => (
                <motion.div
                  key={project.name}
                  whileHover={{ y: -6, borderColor: "rgba(229, 9, 20, 0.5)" }}
                  transition={{ duration: 0.2 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Card Header with Brand Logo & Category */}
                  <div className="p-6 border-b border-border flex items-center justify-between bg-foreground/[0.01]">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl text-[#E50914] font-bold">{project.symbol}</span>
                      <div>
                        <h3 className="font-mono font-black text-xl text-foreground group-hover:text-[#E50914] transition-colors">
                          {project.name}
                        </h3>
                        <span className="font-mono text-[10px] text-foreground/50 uppercase tracking-wider">
                          {project.category}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={project.link}
                      target={project.link.startsWith("http") ? "_blank" : undefined}
                      rel={project.link.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground/50 hover:text-[#E50914] hover:border-[#E50914] transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* 4-Quadrant Matrix */}
                  <div className="grid grid-cols-2 divide-x divide-y divide-border bg-card/60">
                    <div className="p-4 flex flex-col justify-center">
                      <span className="font-mono text-base font-bold text-foreground">
                        {project.fundsRaised}
                      </span>
                      <span className="font-mono text-[10px] text-foreground/50 uppercase tracking-wider mt-0.5">
                        Funds Raised
                      </span>
                    </div>

                    <div className="p-4 flex flex-col justify-center border-t-0">
                      <span className="font-mono text-base font-bold text-foreground">
                        {project.socialGrowth}
                      </span>
                      <span className="font-mono text-[10px] text-foreground/50 uppercase tracking-wider mt-0.5">
                        Social Growth
                      </span>
                    </div>

                    <div className="p-4 flex flex-col justify-center">
                      <span className="font-mono text-base font-bold text-[#E50914]">
                        {project.athRoi}
                      </span>
                      <span className="font-mono text-[10px] text-foreground/50 uppercase tracking-wider mt-0.5">
                        ATH ROI
                      </span>
                    </div>

                    <div className="p-4 flex flex-col justify-center">
                      <span className="font-mono text-base font-bold text-foreground">
                        {project.partnerships}
                      </span>
                      <span className="font-mono text-[10px] text-foreground/50 uppercase tracking-wider mt-0.5">
                        Partnerships
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Pagination Controls */}
        <div className="mt-8 flex items-center justify-between pt-4 border-t border-border">
          <span className="font-mono text-xs text-foreground/40">
            SHOWING {page * pageSize + 1} - {Math.min((page + 1) * pageSize, PROJECTS.length)} OF {PROJECTS.length} PROJECTS
          </span>

          <div className="flex items-center gap-2">
            <MagneticButton strength={0.3}>
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2.5 rounded-lg border border-border bg-card hover:text-[#E50914] hover:border-[#E50914] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </MagneticButton>

            <MagneticButton strength={0.3}>
              <button
                onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
                disabled={page === maxPage}
                className="p-2.5 rounded-lg border border-border bg-card hover:text-[#E50914] hover:border-[#E50914] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </MagneticButton>
          </div>
        </div>

      </div>
    </section>
  );
}
