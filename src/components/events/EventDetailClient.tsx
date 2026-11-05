"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Trophy,
  Users,
  ExternalLink,
  BookOpen,
  Share2,
  Check,
  Maximize2,
  X,
  Sparkles,
  Info,
} from "lucide-react";
import { type EventDetail, type EventDayRow } from "@/lib/events";
import ScrambleText from "@/components/chaingpt/ScrambleText";
import MagneticButton from "@/components/MagneticButton";

// Ticker Component for Marquee Highlights
function EventTicker({
  items,
  reverse = false,
}: {
  items: string[];
  reverse?: boolean;
}) {
  if (!items || items.length === 0) return null;
  const content = items.map((item, idx) => (
    <span
      key={idx}
      className="inline-flex items-center text-xs font-mono uppercase tracking-[0.2em] text-foreground/80 px-4"
    >
      <span>{item}</span>
      <span className="w-1.5 h-1.5 rounded-full bg-[#E50914] ml-6 shrink-0" />
    </span>
  ));

  return (
    <div className="w-full bg-card/80 border-y border-border py-2.5 overflow-hidden relative select-none">
      <div
        className={`flex whitespace-nowrap animate-marquee ${
          reverse ? "direction-reverse" : ""
        }`}
      >
        <div className="flex shrink-0">{content}</div>
        <div className="flex shrink-0">{content}</div>
      </div>
    </div>
  );
}

export default function EventDetailClient({ event }: { event: EventDetail }) {
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [activeGalleryImg, setActiveGalleryImg] = useState<string | null>(null);

  const days: EventDayRow[] = event.days || [];
  const activeDay = days[activeDayIdx] || null;

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isUpcoming = event.event_classification === "upcoming";
  const isArchived = event.event_classification === "archived";

  return (
    <div className="w-full min-h-screen bg-background text-foreground pb-28 lab-grid-bg">
      {/* ── Top Ticker (if ticker items exist) ── */}
      {event.ticker_items && event.ticker_items.length > 0 && (
        <EventTicker items={event.ticker_items} />
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* ── Top Navigation Bar ── */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-foreground/60 hover:text-[#FF5500] transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>ALL EVENTS</span>
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card/60 hover:border-[#FF5500]/50 text-foreground/70 hover:text-foreground font-mono text-xs transition-colors cursor-pointer"
            title="Copy event link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400">LINK COPIED</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>SHARE</span>
              </>
            )}
          </button>
        </div>

        {/* ── HERO BANNER & HEADER ── */}
        <div className="relative rounded-2xl border border-border bg-card p-6 sm:p-10 mb-8 overflow-hidden shadow-xl">
          {/* Technical Corner Brackets */}
          <span className="tech-bracket-tl text-[#FF5500]" />
          <span className="tech-bracket-tr text-[#FF5500]" />
          <span className="tech-bracket-bl text-[#FF5500]" />
          <span className="tech-bracket-br text-[#FF5500]" />

          {/* Background Poster Blur (Optional) */}
          {event.image_url && (
            <div
              className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
              style={{
                backgroundImage: `url(${event.image_url})`,
                backgroundSize: "cover",
              }}
            />
          )}

          <div className="relative z-10">
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border border-[#FF5500]/30 bg-[#FF5500]/10 text-[#FF5500]">
                {event.event_category || "HACKATHON"}
              </span>

              {isUpcoming ? (
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-green-500/30 bg-green-500/10 text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  UPCOMING EVENT
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-foreground/20 bg-foreground/5 text-foreground/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground/40" />
                  ARCHIVED EVENT
                </span>
              )}

              {event.status === "open" && isUpcoming && (
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-green-500/40 bg-green-500/10 text-green-400">
                  REGISTRATIONS OPEN
                </span>
              )}
              {event.status === "closed" && (
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-foreground/20 bg-foreground/5 text-foreground/40">
                  REGISTRATIONS CONCLUDED
                </span>
              )}

              {event.chain && (
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-blue-500/30 bg-blue-500/10 text-blue-400">
                  {event.chain}
                </span>
              )}
            </div>

            {/* Event Title */}
            <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-black font-amiga text-foreground tracking-tight mb-3 break-words">
              <ScrambleText text={event.title} as="span" />
            </h1>

            {/* Subtitle */}
            {event.subtitle && (
              <p className="font-mono text-sm sm:text-lg text-foreground/70 max-w-3xl leading-relaxed mb-6">
                {event.subtitle}
              </p>
            )}

            {/* Quick Meta Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-border/80 font-mono text-xs">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-[#FF5500] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase text-foreground/40 block">DATES</span>
                  <span className="font-bold text-foreground">{event.date}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#FF5500] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase text-foreground/40 block">VENUE</span>
                  <span className="font-bold text-foreground">{event.location || "Main Campus / TBA"}</span>
                </div>
              </div>

              {event.prize && (
                <div className="flex items-start gap-3">
                  <Trophy className="w-4 h-4 text-[#FF5500] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase text-foreground/40 block">PRIZE POOL</span>
                    <span className="font-bold text-[#FF5500]">{event.prize}</span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-[#FF5500] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase text-foreground/40 block">TEAM SIZE</span>
                  <span className="font-bold text-foreground">
                    {event.team_min}–{event.team_max} Members
                  </span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-6 pt-4 border-t border-border/40">
                {event.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="font-mono text-[10px] uppercase px-2 py-0.5 rounded border border-border bg-foreground/[0.02] text-foreground/60"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── REGISTRATION DIRECTIVE BANNER (Only for Upcoming events) ── */}
        {isUpcoming && (
          <div className="p-5 sm:p-6 rounded-2xl border border-[#FF5500]/40 bg-[#FF5500]/5 shadow-[0_0_24px_rgba(255,85,0,0.1)] mb-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500] animate-pulse" />
                <span className="font-mono text-xs font-black uppercase tracking-widest text-[#FF5500]">
                  OFFICIAL REGISTRATION NOTICE
                </span>
              </div>
              <p className="font-mono text-xs sm:text-sm text-foreground/90 font-medium">
                INTERESTED IN PARTICIPATING? VISIT THE HOMEPAGE AND SCROLL TO THE REGISTRATION SECTION.
              </p>
              <p className="font-mono text-[11px] text-foreground/50">
                All participant registrations for WEB.3 initiatives are unified under the official incubation hub.
              </p>
            </div>

            <MagneticButton strength={0.2}>
              <Link
                href="/#incubation-hub"
                className="cyber-btn px-6 py-3.5 bg-[#FF5500] hover:bg-[#FF6611] text-white font-mono text-xs font-bold uppercase tracking-wider shadow-[0_0_16px_rgba(255,85,0,0.35)] shrink-0 transition-all text-center flex items-center justify-center cursor-pointer w-full sm:w-auto min-h-[44px]"
              >
                GO TO REGISTRATIONS →
              </Link>
            </MagneticButton>
          </div>
        )}

        {/* ── OVERVIEW & DETAILED DESCRIPTION ── */}
        {(event.detailed_description || event.description) && (
          <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 bg-[#FF5500]" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-foreground/50">
                EVENT OVERVIEW
              </h3>
            </div>
            <p className="font-mono text-sm sm:text-base text-foreground/80 leading-relaxed whitespace-pre-line">
              {event.detailed_description || event.description}
            </p>

            {/* Objectives */}
            {event.objectives && event.objectives.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground/60 mb-3">
                  CORE OBJECTIVES
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {event.objectives.map((obj, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-3 rounded-xl border border-border/60 bg-foreground/[0.02]"
                    >
                      <span className="text-[#FF5500] font-mono text-xs font-bold mt-0.5">0{i + 1}.</span>
                      <p className="font-mono text-xs text-foreground/75 leading-relaxed">{obj}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── CURRICULUM / LEARNING OUTCOMES CARDS ── */}
        {event.learning_outcomes && event.learning_outcomes.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-[#FF5500]" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-foreground/70">
                YOU WILL LEARN &amp; EXPLORE
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {event.learning_outcomes.map((card, i) => (
                <div
                  key={i}
                  className={`p-5 rounded-xl border relative transition-all duration-300 group ${
                    card.accent
                      ? "border-[#FF5500]/40 bg-card hover:border-[#FF5500] shadow-[0_0_16px_rgba(255,85,0,0.1)]"
                      : "border-border bg-card hover:border-foreground/30"
                  }`}
                >
                  <span className="tech-bracket-tl text-foreground/30" />
                  <span className="tech-bracket-tr text-foreground/30" />

                  <p
                    className={`font-mono font-bold text-sm mb-1.5 uppercase tracking-wide ${
                      card.accent ? "text-[#FF5500]" : "text-foreground group-hover:text-[#FF5500]"
                    }`}
                  >
                    {card.title}
                  </p>
                  <p className="font-mono text-xs text-foreground/60 leading-relaxed">
                    {card.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DYNAMIC MULTI-DAY SCHEDULE ── */}
        {days.length > 0 && (
          <div className="mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#FF5500]" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-foreground/70">
                  EVENT SCHEDULE &amp; TIMELINE
                </h3>
              </div>

              {/* Day selection tabs */}
              <div className="flex gap-1.5 p-1 rounded-xl bg-card border border-border font-mono text-xs overflow-x-auto max-w-full">
                {days.map((d, i) => (
                  <button
                    key={d.id || i}
                    onClick={() => setActiveDayIdx(i)}
                    className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      activeDayIdx === i
                        ? "bg-[#FF5500] text-white shadow-[0_0_10px_rgba(255,85,0,0.3)]"
                        : "text-foreground/50 hover:text-foreground"
                    }`}
                  >
                    {d.label || `Day ${i + 1}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Day Card */}
            {activeDay && (
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
                <div className="border-b border-border pb-4 mb-6">
                  <h4 className="font-mono font-bold text-lg text-foreground mb-1">
                    {activeDay.heading}
                  </h4>
                  <div className="flex flex-wrap gap-4 font-mono text-xs text-foreground/50">
                    {activeDay.event_date && <span>📅 {activeDay.event_date}</span>}
                    {activeDay.venue && <span>📍 {activeDay.venue}</span>}
                  </div>
                </div>

                {/* Slots timeline */}
                <div className="space-y-4">
                  {activeDay.slots && activeDay.slots.length > 0 ? (
                    activeDay.slots.map((slot, sIdx) => (
                      <div
                        key={slot.id || sIdx}
                        className={`flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6 p-4 rounded-xl border transition-all ${
                          slot.is_highlight
                            ? "border-[#FF5500]/30 bg-[#FF5500]/5"
                            : slot.is_break
                            ? "border-border/40 bg-foreground/[0.01] opacity-75"
                            : "border-border bg-foreground/[0.02]"
                        }`}
                      >
                        {/* Time Slot */}
                        <div className="font-mono text-xs font-bold text-foreground/70 sm:w-32 shrink-0 flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              slot.is_highlight
                                ? "bg-[#FF5500] shadow-[0_0_8px_#FF5500]"
                                : slot.is_break
                                ? "bg-foreground/20"
                                : "bg-foreground/50"
                            }`}
                          />
                          <span>{slot.time_slot}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-mono text-sm font-bold leading-snug ${
                              slot.is_highlight
                                ? "text-[#FF5500]"
                                : slot.is_break
                                ? "text-foreground/50 italic"
                                : "text-foreground"
                            }`}
                          >
                            {slot.title}
                          </p>
                          {slot.description && (
                            <p className="font-mono text-xs text-foreground/60 mt-1">
                              {slot.description}
                            </p>
                          )}
                          {slot.sub_topics && slot.sub_topics.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {slot.sub_topics.map((sub, j) => (
                                <p
                                  key={j}
                                  className="font-mono text-xs text-foreground/60 flex items-center gap-1.5"
                                >
                                  <span className="text-[#FF5500]">—</span>
                                  <span>{sub}</span>
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="font-mono text-xs text-foreground/40 italic">
                      Detailed time slots for this day will be announced shortly.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── EVENT GALLERY (If images exist) ── */}
        {event.gallery && event.gallery.length > 0 && (
          <div className="mb-10">
            <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-foreground/70 mb-4">
              EVENT GALLERY
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {event.gallery.map((img, i) => (
                <div
                  key={img.id || i}
                  onClick={() => setActiveGalleryImg(img.image_url)}
                  className="relative aspect-video rounded-xl overflow-hidden border border-border group cursor-pointer"
                >
                  <img
                    src={img.image_url}
                    alt={img.caption || `Event photo ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                  {img.caption && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/70 p-1.5 text-center font-mono text-[10px] text-white/80 truncate">
                      {img.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SPEAKERS & MENTORS (If exist) ── */}
        {event.speakers && event.speakers.length > 0 && (
          <div className="mb-10">
            <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-foreground/70 mb-4">
              SPEAKERS &amp; MENTORS
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {event.speakers.map((spk, i) => (
                <div
                  key={spk.id || i}
                  className="p-4 rounded-xl border border-border bg-card flex items-center gap-4"
                >
                  {spk.image_url ? (
                    <img
                      src={spk.image_url}
                      alt={spk.name}
                      className="w-12 h-12 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-foreground/[0.05] flex items-center justify-center font-mono font-bold text-foreground/60">
                      {spk.name[0]}
                    </div>
                  )}
                  <div>
                    <h5 className="font-mono font-bold text-sm text-foreground">{spk.name}</h5>
                    <p className="font-mono text-xs text-foreground/50">
                      {spk.role} {spk.company && `· ${spk.company}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── EXTERNAL RESOURCES & DOCUMENTATION ── */}
        {event.resources && event.resources.length > 0 && (
          <div className="p-6 rounded-2xl border border-border bg-card">
            <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-foreground/70 mb-4">
              RESOURCES &amp; DOCUMENTATION
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {event.resources.map((res, i) => (
                <Link
                  key={i}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border hover:border-[#FF5500]/50 hover:bg-foreground/[0.02] transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-foreground/50 group-hover:text-[#FF5500] transition-colors" />
                    <span className="font-mono text-xs font-bold text-foreground/80 group-hover:text-foreground">
                      {res.title}
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-foreground/40 group-hover:text-[#FF5500] transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Ticker (Reverse) ── */}
      {event.ticker_items && event.ticker_items.length > 0 && (
        <div className="mt-16">
          <EventTicker items={event.ticker_items} reverse />
        </div>
      )}

      {/* ── Fullscreen Lightbox Modal ── */}
      {activeGalleryImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 p-4 sm:p-8 flex items-center justify-center backdrop-blur-md"
          onClick={() => setActiveGalleryImg(null)}
        >
          <button
            onClick={() => setActiveGalleryImg(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={activeGalleryImg}
            alt="Fullscreen preview"
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}

