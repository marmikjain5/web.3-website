"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrambleText from "./ScrambleText";

gsap.registerPlugin(ScrollTrigger);

export interface FaqItem {
  question: string;
  answer: string | React.ReactNode;
  category?: string;
}

interface FaqSectionProps {
  faqs?: FaqItem[];
}

const DEFAULT_FAQS: FaqItem[] = [
  {
    question: "Who can join the Web.3 Club, and is there any membership fee?",
    answer:
      "Membership is free and open to all BMSIT&M students across every engineering branch and semester. No prior experience is needed.",
    category: "Eligibility",
  },
  {
    question: "Do I need prior coding or blockchain experience to participate?",
    answer:
      "No prior experience is needed. Workshops and bootcamps start from fundamentals.",
    category: "Learning",
  },
  {
    question: "What technologies and technical tracks does the club focus on?",
    answer:
      "We focus on three tracks: Blockchain, Web Dev, and AI & ML. These cover Solidity, smart contracts, EVM, Rust, and ZK proofs; Next.js, TypeScript, and React; and LLMs, generative AI, and computer vision.",
    category: "Technologies",
  },
  {
    question: "How do student projects and peer mentoring work?",
    answer:
      "Students build dApps and open-source tooling alongside senior student peers. Members participate through pairing with senior student developers.",
    category: "Projects",
  },
  {
    question: "What kinds of workshops and learning sessions does the club organize?",
    answer:
      "We organize workshops, bootcamps, peer review, and campus demo days.",
    category: "Workshops",
  },
  {
    question: "Does the club participate in hackathons?",
    answer:
      "Yes, we organize team delegations to ETHIndia, Solana Renaissance, and Polygon Guilds.",
    category: "Hackathons",
  },
  {
    question: "How do I register for events or join the club?",
    answer: (
      <span>
        You can join via the{" "}
        <Link href="/join" className="underline">
          Join page
        </Link>
        . Community discussions take place on WhatsApp via the link in the navbar. Event registration is available through the Register for event button on event cards, which leads to{" "}
        <Link href="/#incubation-hub" className="underline">
          Registrations
        </Link>
        .
      </span>
    ),
    category: "Registrations",
  },
];

export default function FaqSection({ faqs = DEFAULT_FAQS }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  const list = faqs.length > 0 ? faqs : DEFAULT_FAQS;

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.0,
          ease: "expo.out",
          scrollTrigger: { trigger: headingRef.current, start: "top 85%", once: true },
        }
      );

      gsap.fromTo(
        widgetRef.current,
        { scale: 0.9, opacity: 0, rotate: -5 },
        {
          scale: 1,
          opacity: 1,
          rotate: 0,
          duration: 0.85,
          ease: "back.out(1.5)",
          scrollTrigger: { trigger: widgetRef.current, start: "top 82%", once: true },
        }
      );

      gsap.fromTo(
        listRef.current?.children ?? [],
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: listRef.current, start: "top 80%", once: true },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-20 border-b border-border lab-grid-bg overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* LEFT — Heading + 3D widget */}
          <div className="lg:col-span-4 space-y-6 lg:space-y-8">
            <div ref={headingRef}>
              <ScrambleText
                text="FAQ"
                as="h2"
                className="text-6xl sm:text-7xl md:text-8xl font-black font-amiga tracking-tight text-foreground block"
              />
            </div>

            {/* 3D Connector Widget - responsive sizing, never overlapping */}
            <div
              ref={widgetRef}
              className="relative w-40 h-40 sm:w-44 sm:h-44 md:w-48 md:h-48 bg-card border border-border rounded-2xl p-4 flex flex-col justify-between items-center shadow-sm group hover:border-[#E50914]/50 transition-colors opacity-0"
            >
              <span className="tech-bracket-tl" />
              <span className="tech-bracket-tr" />
              <span className="tech-bracket-bl" />
              <span className="tech-bracket-br" />

              <div className="w-full flex justify-between text-[10px] font-mono text-foreground/40">
                <span>QUERY_ENGINE</span>
                <span>SEC_V4</span>
              </div>

              {/* Web3 Cryptographic Query Engine Vector Graphic */}
              <div
                className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center select-none"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                >
                  {/* Outer Segmented Cryptographic Ring */}
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="44"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="6 8 2 8"
                    className="text-foreground/20"
                    style={{ transformOrigin: "50px 50px" }}
                    animate={shouldReduceMotion ? undefined : { rotate: 360 }}
                    transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                  />

                  {/* Cardinal Crosshair Ticks */}
                  <line x1="50" y1="2" x2="50" y2="7" stroke="currentColor" strokeWidth="1" className="text-foreground/40" />
                  <line x1="50" y1="93" x2="50" y2="98" stroke="currentColor" strokeWidth="1" className="text-foreground/40" />
                  <line x1="2" y1="50" x2="7" y2="50" stroke="currentColor" strokeWidth="1" className="text-foreground/40" />
                  <line x1="93" y1="50" x2="98" y2="50" stroke="currentColor" strokeWidth="1" className="text-foreground/40" />

                  {/* Counter-Rotating Inner Orbital Ring with Network Nodes */}
                  <motion.g
                    style={{ transformOrigin: "50px 50px" }}
                    animate={shouldReduceMotion ? undefined : { rotate: -360 }}
                    transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeDasharray="2 4"
                      className="text-foreground/30"
                    />
                    {/* Orbital Vertex Nodes */}
                    <circle cx="50" cy="22" r="2" fill="currentColor" className="text-foreground/60" />
                    <circle cx="78" cy="50" r="2.5" fill="#E50914" />
                    <circle cx="50" cy="78" r="2" fill="currentColor" className="text-foreground/60" />
                    <circle cx="22" cy="50" r="1.5" fill="currentColor" className="text-foreground/40" />
                  </motion.g>

                  {/* Central Web3 Isometric Polyhedral Block */}
                  <motion.g
                    animate={shouldReduceMotion ? undefined : { y: [-2, 2, -2] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {/* Isometric Top Face */}
                    <polygon
                      points="50,36 63,43.5 50,51 37,43.5"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinejoin="round"
                      className="text-foreground/10"
                    />
                    {/* Isometric Left Face */}
                    <polygon
                      points="37,43.5 50,51 50,65 37,57.5"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinejoin="round"
                      className="text-foreground/5"
                    />
                    {/* Isometric Right Face with Club Accent */}
                    <polygon
                      points="50,51 63,43.5 63,57.5 50,65"
                      fill="#E50914"
                      fillOpacity="0.12"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinejoin="round"
                      className="text-foreground/40"
                    />
                    {/* Isometric Wireframe Seams */}
                    <line x1="50" y1="51" x2="50" y2="65" stroke="currentColor" strokeWidth="1" className="text-foreground/40" />
                    <line x1="50" y1="51" x2="37" y2="43.5" stroke="currentColor" strokeWidth="1" className="text-foreground/40" />
                    <line x1="50" y1="51" x2="63" y2="43.5" stroke="currentColor" strokeWidth="1" className="text-foreground/40" />

                    {/* Glowing Core Vertex */}
                    <motion.circle
                      cx="50"
                      cy="51"
                      r="2"
                      fill="#E50914"
                      animate={shouldReduceMotion ? undefined : { opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </motion.g>
                </svg>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-mono text-[#E50914]">
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-[#E50914]"
                  animate={shouldReduceMotion ? undefined : { opacity: [1, 0, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                />
                <span>KNOWLEDGE_BASE_ONLINE</span>
              </div>
            </div>
          </div>

          {/* RIGHT — FAQ Accordion */}
          <div className="lg:col-span-8">
            {/* Header: title and subtitle sharing the same left edge as each other and the list below */}
            <div className="space-y-4 mb-8 sm:mb-10">
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-lg md:text-xl font-bold uppercase tracking-wider text-foreground">
                  Most Common Questions
                </h3>
                <span className="w-2.5 h-2.5 bg-foreground inline-block" />
              </div>
              <p className="font-mono text-xs text-foreground/50">
                No worries — here you can find all the answers
              </p>
            </div>

            <div ref={listRef} className="space-y-3">
              {list.map((item, idx) => {
                const isOpen = openIndex === idx;
                const buttonId = `faq-btn-${idx}`;
                const panelId = `faq-panel-${idx}`;

                return (
                  <div
                    key={idx}
                    className={`rounded-xl border transition-colors duration-200 overflow-hidden ${
                      isOpen
                        ? "bg-card border-[#E50914] shadow-[0_4px_20px_rgba(255,30,39,0.1)]"
                        : "bg-card/50 border-border hover:border-foreground/20"
                    }`}
                  >
                    <button
                      id={buttonId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      className="w-full text-left p-4 sm:p-5 grid grid-cols-[1.75rem_1fr_2.75rem] items-center gap-3 sm:gap-4 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 min-h-[44px]"
                    >
                      <span className="font-mono text-xs font-bold text-[#E50914] shrink-0 self-center">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="font-mono text-sm md:text-base font-bold text-foreground break-words min-w-0">
                        {item.question}
                      </span>
                      <div className="w-11 h-11 flex items-center justify-end shrink-0">
                        <motion.div
                          className="w-7 h-7 rounded-lg bg-foreground/[0.04] border border-border flex items-center justify-center text-foreground/70"
                          animate={shouldReduceMotion ? undefined : { rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {isOpen ? (
                            <Minus className="w-4 h-4 text-[#E50914]" aria-hidden="true" />
                          ) : (
                            <Plus className="w-4 h-4" aria-hidden="true" />
                          )}
                        </motion.div>
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={panelId}
                          role="region"
                          aria-labelledby={buttonId}
                          key="content"
                          initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={shouldReduceMotion ? { height: 0, opacity: 0 } : { height: 0, opacity: 0 }}
                          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                          className="overflow-hidden"
                        >
                          <div className="pl-[calc(1rem+1.75rem+0.75rem)] sm:pl-[calc(1.25rem+1.75rem+1rem)] pr-4 sm:pr-5 pb-5 pt-1 border-t border-border/50 font-mono text-xs md:text-sm text-foreground/70 leading-relaxed break-words">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
