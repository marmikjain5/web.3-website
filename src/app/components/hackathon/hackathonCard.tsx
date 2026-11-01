"use client";

import { useState } from "react";
import { HackathonEvent, EventMeta } from "@/data/events";
import SpotlightCard from "../ui/SpotlightCard";
import DecryptedText from "../ui/DecryptedText";
import AnimatedCounter from "../ui/AnimatedCounter";
import Magnet from "../ui/Magnet";
import { Maximize2, X, ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";

export type { HackathonEvent };

type Props = {
  event: HackathonEvent;
  onRegister: (e: EventMeta) => void;
  isPast?: boolean;
};

const STATUS_DOT: Record<string, string> = {
  open: "bg-[#FF5500]",
  soon: "bg-amber-400",
  closed: "bg-foreground/20",
};
const STATUS_LABEL: Record<string, string> = {
  open: "Active",
  soon: "Upcoming",
  closed: "Concluded",
};

const CHAIN_COLOR: Record<string, string> = {
  Ethereum: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  Solana: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  Polygon: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
  Chainlink: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  Arbitrum: "text-sky-500 bg-sky-500/10 border-sky-500/20",
};
const CHAIN_DOT: Record<string, string> = {
  Ethereum: "bg-blue-500",
  Solana: "bg-purple-500",
  Polygon: "bg-indigo-500",
  Chainlink: "bg-blue-400",
  Arbitrum: "bg-sky-500",
};

export default function HackathonCard({ event, onRegister, isPast }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const chainStyle = event.chain
    ? CHAIN_COLOR[event.chain] ?? "text-[#FF5500] bg-[#FF5500]/10 border-[#FF5500]/20"
    : null;
  const chainDot = event.chain
    ? CHAIN_DOT[event.chain] ?? "bg-[#FF5500]"
    : null;

  return (
    <SpotlightCard
      className={`rounded-2xl border transition-all duration-300 relative group overflow-hidden ${
        isPast
          ? "border-border/60 bg-card/60 opacity-80"
          : "border-border bg-card hover:border-[#FF5500]/50 shadow-sm"
      }`}
      spotlightColor={
        isPast ? "rgba(255,255,255,0.04)" : "rgba(255, 85, 0, 0.12)"
      }
    >
      {/* 4 Corner Markers */}
      <span className="tech-bracket-tl text-[#FF5500]" />
      <span className="tech-bracket-tr text-[#FF5500]" />
      <span className="tech-bracket-bl text-[#FF5500]" />
      <span className="tech-bracket-br text-[#FF5500]" />

      {/* ── Clickable header ─────────────────────────────────── */}
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((v) => !v);
          }
        }}
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left p-5 sm:p-6 cursor-pointer"
      >
        {/* Event Image */}
        <div
          className={`group/img relative w-full aspect-video rounded-xl mb-5 overflow-hidden border bg-foreground/[0.03] flex items-center justify-center ${
            isPast ? "border-border/40 opacity-60" : "border-border"
          }`}
        >
          <img
            src={event.imageUrl || "/placeholder-event.png"}
            alt={event.title}
            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFullscreen(true);
            }}
            className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/90 backdrop-blur-sm rounded-lg text-white opacity-0 group-hover/img:opacity-100 transition-all duration-200 cursor-pointer"
            title="View Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Top row: tags + status */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {event.chain && chainStyle && (
              <span
                className={`inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${chainStyle}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${chainDot}`} />
                {event.chain}
              </span>
            )}
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-border bg-foreground/[0.03] text-foreground/60"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  STATUS_DOT[event.status] || "bg-[#FF5500]"
                }`}
              />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-foreground/50">
                {STATUS_LABEL[event.status] || event.status}
              </span>
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 text-foreground/40 ${
                expanded ? "rotate-180 text-[#FF5500]" : ""
              }`}
            />
          </div>
        </div>

        {/* Title — DecryptedText on viewport entry */}
        <h3 className="text-xl sm:text-2xl font-bold font-mono leading-tight mb-1 text-foreground group-hover:text-[#FF5500] transition-colors">
          <DecryptedText
            text={event.title}
            speed={40}
            maxIterations={8}
            className="text-foreground"
            encryptedClassName="text-[#FF5500]"
          />
        </h3>
        <p className="text-sm leading-relaxed text-foreground/60 font-sans">
          {event.subtitle}
        </p>

        {/* Metadata row — monospace */}
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-4 font-mono text-xs text-foreground/50 border-t border-border pt-3">
          <span>{event.date}</span>
          <span>{event.location}</span>
          <span>
            {event.teamMin}–{event.teamMax} members
          </span>
        </div>
      </div>

      {/* ── Expandable details ────────────────────────────────── */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 flex flex-col gap-5 border-t border-border">
            {/* Description */}
            <p className="text-sm leading-relaxed text-foreground/75 font-sans">
              {event.description}
            </p>

            {/* Schedule — accordion, collapsed by default */}
            {event.agenda && event.agenda.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setScheduleOpen((v) => !v);
                  }}
                  className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider text-[#FF5500] hover:text-[#FF6611] transition-colors mb-1 cursor-pointer"
                >
                  Schedule Timeline
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      scheduleOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: scheduleOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-col gap-2 pt-2 border-l-2 border-[#FF5500]/30 pl-3 my-1">
                      {event.agenda.map((a, i) => (
                        <div
                          key={i}
                          className="flex items-baseline gap-4 text-xs font-mono"
                        >
                          <span className="text-[#FF5500] w-28 shrink-0 font-bold">
                            {a.time}
                          </span>
                          <span className="text-foreground/70">{a.item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Prize — AnimatedCounter */}
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-2">
                PRIZE POOL &amp; GRANTS
              </p>
              <span className="inline-flex items-center gap-2 font-mono text-base font-bold px-3.5 py-1.5 rounded-lg border border-[#FF5500]/30 bg-[#FF5500]/10 text-[#FF5500]">
                <AnimatedCounter text={event.prize} />
              </span>
            </div>

            {/* Sponsors */}
            {event.sponsors && event.sponsors.length > 0 && (
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-2">
                  ECOSYSTEM SPONSORS
                </p>
                <div className="flex flex-wrap gap-2">
                  {event.sponsors.map((s) => (
                    <span
                      key={s}
                      className="font-mono text-xs px-2.5 py-1 rounded-md border border-border bg-foreground/[0.04] text-foreground/70"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-t border-border bg-foreground/[0.01] gap-4">
        <span className="font-mono text-xs text-foreground/50 truncate">
          {event.chain ? `${event.chain} · ` : ""}
          {event.teamMin}–{event.teamMax} members
        </span>

        {isPast ? (
          <span className="font-mono text-xs text-foreground/40 px-3 py-1 bg-foreground/[0.04] rounded-md">
            TRACK CONCLUDED
          </span>
        ) : (
          <Magnet>
            <button
              disabled={event.status === "closed"}
              onClick={(e) => {
                e.stopPropagation();
                onRegister({
                  id: event.id,
                  title: event.title,
                  teamMin: event.teamMin,
                  teamMax: event.teamMax,
                });
              }}
              className="cyber-btn px-5 py-2 bg-[#FF5500] hover:bg-[#FF6611] text-white font-mono text-xs font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(255,85,0,0.35)] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              REGISTER →
            </button>
          </Magnet>
        )}
      </div>

      {fullscreen &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-md animate-in fade-in duration-200"
            onClick={(e) => {
              e.stopPropagation();
              setFullscreen(false);
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFullscreen(false);
              }}
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors z-[101] cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={event.imageUrl || "/placeholder-event.png"}
              alt={event.title}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            />
          </div>,
          document.body
        )}
    </SpotlightCard>
  );
}
