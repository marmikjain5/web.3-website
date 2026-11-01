"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { EventMeta } from "@/data/events";
import HackathonCard from "./hackathon/hackathonCard";
import RegistrationTerminal from "@/components/RegistrationTerminal";
import { getPublicEvents, type EventRow } from "@/app/actions/admin";

// ── Map a Supabase EventRow to the shape HackathonCard expects ──

function toHackathonEvent(row: EventRow) {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    date: row.date,
    startDate: row.start_date,
    location: row.location,
    prize: row.prize,
    tags: row.tags,
    teamMin: row.team_min,
    teamMax: row.team_max,
    description: row.description,
    chain: row.chain ?? undefined,
    sponsors: row.sponsors,
    status: row.status,
    agenda: [],           // agenda not stored in DB yet
    imageUrl: row.image_url ?? undefined,
  };
}

// ─────────────────────────────────────────────────────────────
// Events section — vertical blockchain timeline layout
// ─────────────────────────────────────────────────────────────

export default function Events() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [modalEvent, setModalEvent] = useState<(EventMeta & { id: string }) | null>(null);
  const [allEvents, setAllEvents] = useState<ReturnType<typeof toHackathonEvent>[]>([]);
  const [loaded, setLoaded] = useState(false);

  const sectionRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [chainHeight, setChainHeight] = useState(0);

  const now = useMemo(() => Date.now(), []);

  // Fetch events from Supabase
  useEffect(() => {
    const load = async () => {
      const rows = await getPublicEvents();
      setAllEvents(rows.map(toHackathonEvent));
      setLoaded(true);
    };
    load();
  }, []);

  const { upcoming, past } = useMemo(() => {
    const up: ReturnType<typeof toHackathonEvent>[] = [];
    const pa: ReturnType<typeof toHackathonEvent>[] = [];
    allEvents.forEach((e) => {
      if (new Date(e.startDate).getTime() > now) up.push(e);
      else pa.push(e);
    });
    up.sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    pa.sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
    return { upcoming: up, past: pa };
  }, [now, allEvents]);

  const activeEvents = activeTab === "upcoming" ? upcoming : past;
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
  }, []);

  // Scroll-driven path animation
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const pathLength = useTransform(scrollYProgress, [0.1, 0.85], [0, 1]);

  return (
    <>
      <section
        id="events"
        ref={sectionRef}
        className="relative max-w-5xl mx-auto px-5 sm:px-6 py-24 lab-grid-bg"
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
        <p className="font-mono text-sm sm:text-base text-foreground/60 max-w-xl leading-relaxed mb-10">
          Hackathons, incubator sprints, and build-weeks — built for visionaries who ship on-chain. Expand a card for details, then register directly.
        </p>

        {/* ── Tab bar (Upcoming / Past) ──────────────────────── */}
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
                ? `UPCOMING (${upcoming.length})`
                : `ARCHIVE (${past.length})`}
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
                        <HackathonCard
                          event={event as any}
                          onRegister={(e) => setModalEvent({ ...e, id: event.id })}
                          isPast={isPast}
                        />
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
                  <div className="text-center py-20">
                    <p className="font-mono text-sm text-foreground/40">
                      No {activeTab} events registered.
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* ── Registration modal ───────────────────────────────── */}
      {modalEvent && (
        <RegistrationTerminal
          eventId={modalEvent.id}
          eventName={modalEvent.title}
          onClose={() => setModalEvent(null)}
        />
      )}
    </>
  );
}
