"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Layers,
  Blocks,
  BrainCircuit,
  Code2,
  Shield,
  Trophy,
  GitBranch,
  Globe,
  Database,
  Terminal,
  Rocket,
  Sparkles,
  Smartphone,
  Network,
  Server,
  Users,
  Compass,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MagneticButton from "@/components/MagneticButton";
import ScrambleText from "./ScrambleText";
import {
  type ProjectRow,
  type ProjectsSettingsRow,
  DEFAULT_PROJECTS_SETTINGS,
  INITIAL_EXPLORATION_ENTRIES,
} from "@/lib/projects";

gsap.registerPlugin(ScrollTrigger);

interface PortfolioSectionProps {
  initialProjects?: ProjectRow[];
  settings?: ProjectsSettingsRow;
}

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

// Icon mapper for dynamic project icons
function ProjectIcon({
  iconName,
  symbol,
  className = "w-6 h-6",
}: {
  iconName?: string | null;
  symbol?: string | null;
  className?: string;
}) {
  switch (iconName) {
    case "Blocks":
      return <Blocks className={className} />;
    case "BrainCircuit":
      return <BrainCircuit className={className} />;
    case "Code2":
      return <Code2 className={className} />;
    case "Shield":
      return <Shield className={className} />;
    case "Trophy":
      return <Trophy className={className} />;
    case "GitBranch":
      return <GitBranch className={className} />;
    case "Globe":
      return <Globe className={className} />;
    case "Database":
      return <Database className={className} />;
    case "Terminal":
      return <Terminal className={className} />;
    case "Rocket":
      return <Rocket className={className} />;
    case "Sparkles":
      return <Sparkles className={className} />;
    case "Smartphone":
      return <Smartphone className={className} />;
    case "Network":
      return <Network className={className} />;
    case "Server":
      return <Server className={className} />;
    case "Layers":
    default:
      return symbol ? (
        <span className="text-xl font-bold leading-none select-none">{symbol}</span>
      ) : (
        <Layers className={className} />
      );
  }
}

export default function PortfolioSection({
  initialProjects,
  settings = DEFAULT_PROJECTS_SETTINGS,
}: PortfolioSectionProps) {
  // Use initialProjects if provided; otherwise fallback to initial 6 exploration cards
  const projects: ProjectRow[] =
    initialProjects && initialProjects.length > 0
      ? initialProjects
      : INITIAL_EXPLORATION_ENTRIES.map((entry, idx) => ({
          ...entry,
          id: `seed-exploration-${idx}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

  const [page, setPage] = useState(0);
  const pageSize = 3;
  const maxPage = Math.max(0, Math.ceil(projects.length / pageSize) - 1);

  // Clamp active page if project count changes
  useEffect(() => {
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [page, maxPage]);

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const conduitRef = useRef<HTMLDivElement>(null);

  const visibleProjects = projects.slice(page * pageSize, (page + 1) * pageSize);

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
                {settings.subtitle || "EXPLORE. EXPERIMENT. CREATE."}
              </span>
            </div>
            <ScrambleText
              text={settings.heading || "OUR PROJECTS"}
              as="h2"
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-amiga tracking-tight text-foreground block max-w-full break-words"
            />
          </div>

          {/* Right Stat Widget: All Projects [ count ] */}
          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <div className="bg-card border border-border p-6 rounded-2xl flex items-center justify-between gap-8 min-w-[240px] shadow-sm relative group hover:border-[#E50914]/50 transition-colors">
              <span className="tech-bracket-tl" />
              <span className="tech-bracket-tr" />
              <span className="tech-bracket-bl" />
              <span className="tech-bracket-br" />

              <div>
                <span className="block font-mono text-xs font-bold text-foreground/50 uppercase">
                  Active Showcase
                </span>
                <span className="font-mono text-4xl md:text-5xl font-black text-foreground">
                  {projects.length}
                </span>
              </div>

              <div className="w-12 h-12 rounded-xl bg-foreground text-background flex items-center justify-center group-hover:bg-[#E50914] group-hover:text-white transition-all shadow-sm">
                <Compass className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Network Conduit Schematic */}
        <div ref={conduitRef} className="relative py-6 mb-8 hidden md:block">
          <div className="w-full h-16 border-y border-dashed border-border flex items-center justify-around relative">
            <div className="flex items-center gap-3 bg-card px-4 py-1.5 rounded-full border border-border text-xs font-mono text-foreground/70">
              <span className="w-2 h-2 rounded-full bg-[#E50914] animate-ping" />
              <span>ACTIVE_SHOWCASE_NODES: {projects.length}</span>
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
              <span>[ COMMUNITY_TECHNOLOGY_GRID ]</span>
            </div>
          </div>
        </div>

        {/* Empty State vs Cards Grid */}
        {projects.length === 0 ? (
          <div className="min-h-[320px] flex items-center justify-center py-16 px-4">
            <div className="max-w-2xl w-full p-8 sm:p-12 rounded-2xl bg-card border border-border shadow-sm text-center relative overflow-hidden">
              <span className="tech-bracket-tl text-[#E50914]" />
              <span className="tech-bracket-tr text-[#E50914]" />
              <span className="tech-bracket-bl text-[#E50914]" />
              <span className="tech-bracket-br text-[#E50914]" />

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#E50914]/30 bg-[#E50914]/10 text-[#E50914] text-[10px] font-mono font-bold tracking-widest uppercase mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E50914] animate-pulse" />
                <span>{settings.empty_status || "AWAITING FIRST BUILD"}</span>
              </div>

              <h3 className="font-mono font-black text-2xl sm:text-3xl text-foreground uppercase tracking-tight mb-3">
                {settings.empty_heading || "THE NEXT BIG IDEA STARTS HERE."}
              </h3>

              <p className="font-mono text-xs sm:text-sm text-foreground/70 leading-relaxed max-w-lg mx-auto mb-6">
                {settings.empty_description ||
                  "We're creating a space for ideas, experiments and projects built by the WEB.3 community. Check back as our builders bring their ideas to life."}
              </p>

              {settings.show_cta && settings.cta_text && (
                <Link
                  href={settings.cta_url || "/join"}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E50914] hover:bg-[#b80710] text-white font-mono font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all cursor-pointer group"
                >
                  <span>{settings.cta_text}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {visibleProjects.map((project) => {
                  const isExploration = project.entry_type === "exploration";

                  return (
                    <motion.div
                      key={project.id || project.slug || project.title}
                      whileHover={{ y: -6, borderColor: "rgba(229, 9, 20, 0.5)" }}
                      transition={{ duration: 0.2 }}
                      className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative"
                    >
                      <span className="tech-bracket-tl" />
                      <span className="tech-bracket-tr" />
                      <span className="tech-bracket-bl" />
                      <span className="tech-bracket-br" />

                      {/* Optional Project Thumbnail */}
                      {project.image_url && (
                        <div className="relative w-full aspect-video bg-foreground/[0.03] border-b border-border overflow-hidden">
                          <Image
                            src={project.image_url}
                            alt={project.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      {/* Card Header */}
                      <div className="p-6 border-b border-border flex items-start justify-between bg-foreground/[0.01] gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-[#E50914]/10 border border-[#E50914]/20 flex items-center justify-center text-[#E50914] shrink-0 group-hover:scale-110 transition-transform">
                            <ProjectIcon iconName={project.icon_name} symbol={project.symbol} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-mono font-black text-lg sm:text-xl text-foreground group-hover:text-[#E50914] transition-colors truncate">
                              {project.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="inline-block px-2 py-0.5 rounded border border-[#E50914]/30 bg-[#E50914]/10 text-[#E50914] text-[9px] font-mono font-bold uppercase tracking-wider">
                                {isExploration ? "EXPLORATION AREA" : project.category || "STUDENT PROJECT"}
                              </span>
                              {project.is_featured && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-mono text-amber-500 font-bold uppercase">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  <span>FEATURED</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Direct action link if provided */}
                        {(project.demo_url || project.github_url || project.docs_url) && (
                          <Link
                            href={project.demo_url || project.github_url || project.docs_url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground/50 hover:text-[#E50914] hover:border-[#E50914] transition-colors shrink-0"
                            title="Open external link"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        )}
                      </div>

                      {/* Card Body — Narrative Description */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <p className="font-mono text-xs sm:text-sm text-foreground/75 leading-relaxed">
                          {project.description}
                        </p>

                        {/* Technology Tags */}
                        {project.tags && project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {project.tags.map((tag) => (
                              <span
                                key={tag}
                                className="font-mono text-[10px] text-foreground/70 bg-foreground/[0.04] border border-border px-2.5 py-1 rounded-md"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Card Footer: Metadata, Contributors & Links */}
                      <div className="p-4 bg-foreground/[0.02] border-t border-border flex items-center justify-between text-xs font-mono text-foreground/50">
                        {isExploration ? (
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[10px] font-mono text-foreground/45 uppercase tracking-wider">
                              :: LEARNING &amp; BUILDING TRACK
                            </span>
                            <span className="text-[10px] font-mono text-[#E50914] uppercase font-bold">
                              OPEN TO ALL
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            {/* Contributors count */}
                            {project.contributors && project.contributors.length > 0 ? (
                              <div className="flex items-center gap-1.5 text-[11px] text-foreground/60">
                                <Users className="w-3.5 h-3.5 text-[#E50914]" />
                                <span>
                                  {project.contributors.length}{" "}
                                  {project.contributors.length === 1 ? "Contributor" : "Contributors"}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-foreground/40 uppercase">
                                WEB.3 ECOSYSTEM
                              </span>
                            )}

                            {/* Action icons */}
                            <div className="flex items-center gap-2">
                              {project.github_url && (
                                <Link
                                  href={project.github_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-foreground/50 hover:text-foreground transition-colors"
                                  title="GitHub Repository"
                                >
                                  <GithubIcon className="w-4 h-4" />
                                </Link>
                              )}
                              {project.docs_url && (
                                <Link
                                  href={project.docs_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-foreground/50 hover:text-foreground transition-colors"
                                  title="Documentation"
                                >
                                  <BookOpen className="w-4 h-4" />
                                </Link>
                              )}
                              {project.demo_url && (
                                <Link
                                  href={project.demo_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-foreground/50 hover:text-[#E50914] transition-colors"
                                  title="Live Demo"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Link>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Carousel Pagination Controls (Shown when there is more than 1 page) */}
        {projects.length > 0 && (
          <div className="mt-8 flex items-center justify-between pt-4 border-t border-border">
            <span className="font-mono text-xs text-foreground/50">
              SHOWING {projects.length === 0 ? 0 : page * pageSize + 1} -{" "}
              {Math.min((page + 1) * pageSize, projects.length)} OF {projects.length} ENTRIES
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
                  disabled={page >= maxPage}
                  className="p-2.5 rounded-lg border border-border bg-card hover:text-[#E50914] hover:border-[#E50914] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </MagneticButton>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
