"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { ArrowRight, Info } from "lucide-react";
import HackathonCard from "./hackathon/hackathonCard";
import { getPublicEventsList } from "@/app/actions/events";
import { type EventRow } from "@/lib/events";

function toHackathonEvent(row: EventRow) {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    slug: row.slug,
    date: row.date,
    startDate: row.start_date,
    location: row.location,
    prize: row.prize,
    tags: row.tags || [],
    teamMin: row.team_min,
    teamMax: row.team_max,
    description: row.short_description || row.description,
    chain: row.chain ?? undefined,
    sponsors: row.sponsors || [],
    status: row.status,
    agenda: [],
    imageUrl: row.image_url ?? undefined,
  };
}

export default function Events() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [upcomingEvents, setUpcomingEvents] = useState<ReturnType<typeof toHackathonEvent>[]>([]);
  const [archivedEvents, setArchivedEvents] = useState<ReturnType<typeof toHackathonEvent>[]>([]);
  const [loaded, setLoaded] = useState(false);

  const sectionRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [chainHeight, setChainHeight] = useState(0);

  // Fetch published events from Server Action
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const res = await getPublicEventsList();
      if (!isMounted) return;
      if (res.success) {
        setUpcomingEvents(res.upcoming.map(toHackathonEvent));
        setArchivedEvents(res.archived.map(toHackathonEvent));
      }
      setLoaded(true);
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeEvents = activeTab === "upcoming" ? upcomingEvents : archivedEvents;
  const isPast = activeTab === "past";

  // ResizeObserver — dynamically compute SVG chain height
  useEffect(() => {
    const el = timelineRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setChainHeight(entry.contentRect.height);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [activeEvents, loaded]);

  // Scroll-driven path animation
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const pathLength = useTransform(scrollYProgress, [0.1, 0.85], [0, 1]);

  return (
    <section
      id="events"
      ref={sectionRef}
      className="relative max-w-5xl mx-auto px-5 sm:px-6 py-20 lab-grid-bg"
    >
      {/* ── Section header ─────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2.5 h-2.5 bg-[#FF5500] shadow-[0_0_8px_#FF5500]" />
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-[#FF5500]">
          INCUBATION_TRACKS &amp; COMPETITIONS
        </p>
      </div>

      <h2 className="text-3xl sm:text-5xl md:text-6xl font-black cyber-font text-foreground mb-3 leading-[1.1] tracking-tight">
        WHAT&apos;S HAPPENING{" "}
        <span className="text-[#FF5500]">ON-CHAIN</span>
      </h2>
      <p className="font-mono text-sm sm:text-base text-foreground/60 max-w-xl leading-relaxed mb-8">
        Hackathons, incubator sprints, and build-weeks — built for visionaries who ship on-chain. Explore event schedules, curricula and archives.
      </p>

      {/* ── Registration Information Directive ──────────────── */}
      <div className="p-4 sm:p-5 rounded-xl border border-[#FF5500]/30 bg-card shadow-sm mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-[#FF5500] shrink-0 mt-0.5" />
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
              INTERESTED IN PARTICIPATING? VISIT THE HOMEPAGE AND SCROLL TO THE REGISTRATION SECTION.
            </p>
            <p className="font-mono text-[11px] text-foreground/50 mt-0.5">
              Event registrations are managed exclusively via the official BMSIT&M incubation hub.
            </p>
          </div>
        </div>
        <Link
          href="/#incubation-hub"
          className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#FF5500] hover:text-[#FF6611] shrink-0 transition-colors cursor-pointer group"
        >
          <span>GO TO REGISTRATIONS</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* ── Tab bar (Upcoming / Archive) ────────────────────── */}
      <div className="flex gap-1 p-1 rounded-xl bg-card border border-border w-fit mb-14 font-mono shadow-sm">
        {(["upcoming", "past"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-xs font-bold px-5 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === tab
                ? "bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/40 shadow-[0_0_12px_rgba(255,85,0,0.15)]"
                : "text-foreground/50 hover:text-foreground border border-transparent"
            }`}
          >
            {tab === "upcoming"
              ? `UPCOMING (${upcomingEvents.length})`
              : `ARCHIVE (${archivedEvents.length})`}
          </button>
        ))}
      </div>

      {/* ── Timeline container ──────────────────────────────── */}
      <div ref={timelineRef} className="relative min-h-[200px]">
        {/* SVG chain axis */}
        {chainHeight > 0 && (
          <svg
            className="absolute left-[11px] md:left-1/2 md:-translate-x-px top-0 pointer-events-none z-0"
            width="2"
            height={chainHeight}
            viewBox={`0 0 2 ${chainHeight}`}
            preserveAspectRatio="none"
          >
            {/* Background track */}
            <path
              d={`M 1 0 L 1 ${chainHeight}`}
              stroke="rgba(255,85,0,0.12)"
              strokeWidth="2"
              fill="none"
            />
            {/* Scroll-animated fill */}
            <motion.path
              d={`M 1 0 L 1 ${chainHeight}`}
              stroke="rgba(255,85,0,0.5)"
              strokeWidth="2"
              fill="none"
              style={{ pathLength }}
            />
          </svg>
        )}

        {/* Loading state */}
        {!loaded && (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-2 border-[#FF5500]/30 border-t-[#FF5500] rounded-full animate-spin" />
          </div>
        )}

        {/* Event rows with AnimatePresence for tab switch */}
        {loaded && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === "upcoming" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeTab === "upcoming" ? 20 : -20 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="flex flex-col gap-12 md:gap-16"
            >
              {activeEvents.length > 0 ? (
                activeEvents.map((event, i) => (
                  <div
                    key={event.id}
                    className="grid grid-cols-[24px_1fr] md:grid-cols-[1fr_48px_1fr] items-start"
                  >
                    {/* Card */}
                    <div
                      className={
                        i % 2 === 0
                          ? "col-start-2 md:col-start-1 row-start-1"
                          : "col-start-2 md:col-start-3 row-start-1"
                      }
                    >
                      <HackathonCard event={event as any} isPast={isPast} />
                    </div>

                    {/* Center node — pulsing dot + connector */}
                    <div className="col-start-1 md:col-start-2 row-start-1 flex flex-col items-center relative pt-8">
                      <span className="relative flex h-3 w-3 z-10">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-[#FF5500]/40 animate-ping" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-[#FF5500] shadow-[0_0_8px_rgba(255,85,0,0.8)]" />
                      </span>

                      {/* Horizontal connector — desktop only */}
                      <div
                        className={`hidden md:block absolute top-[38px] h-px ${
                          i % 2 === 0
                            ? "right-[50%] left-[-8px] bg-gradient-to-r from-transparent to-[#FF5500]/30"
                            : "left-[50%] right-[-8px] bg-gradient-to-l from-transparent to-[#FF5500]/30"
                        }`}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 p-8 rounded-2xl border border-dashed border-border bg-card/50">
                  <p className="font-mono text-sm font-bold text-foreground/60 uppercase tracking-wider mb-1">
                    {activeTab === "upcoming"
                      ? "NO UPCOMING EVENTS RIGHT NOW."
                      : "NO ARCHIVED EVENTS AVAILABLE YET."}
                  </p>
                  <p className="font-mono text-xs text-foreground/40 max-w-sm mx-auto">
                    {activeTab === "upcoming"
                      ? "New builder sprints, hackathons and workshops are currently in preparation. Stay tuned!"
                      : "Completed event recaps and project showcases will appear here once tracks conclude."}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
