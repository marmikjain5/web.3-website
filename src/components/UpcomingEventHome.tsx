"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPublicEvents, type EventRow } from "@/app/actions/admin";
import { ArrowRight, Loader2, Calendar } from "lucide-react";
import CardSwap, { Card } from "./CardSwap";

export default function UpcomingEventHome() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getPublicEvents().then(data => {
      setEvents(data || []);
      setIsLoading(false);
    });
  }, []);

  return (
    <section
      id="events"
      className="relative w-full py-16 sm:py-20 lg:py-24 border-b border-border lab-grid-bg overflow-hidden transition-colors duration-500 bg-background"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

          {/* Left Column — Canonical Section Heading Block */}
          <div className="lg:col-span-5 flex flex-col items-start text-left mb-6 lg:mb-0">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">
                COMMUNITY &amp; COMPETITIONS
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black font-amiga tracking-tight text-foreground block max-w-full break-words leading-[1.08] mb-4 sm:mb-5">
              FLAGSHIP EVENTS
            </h2>
            <p className="font-sans text-base lg:text-lg text-foreground/70 leading-relaxed max-w-md">
              Discover premier student-led hackathons, builder sprints, and exclusive developer workshops shifting the frontier of Web3.
            </p>
          </div>

          {/* Right Column — 3D Stacked Cards Showcase */}
          <div className="lg:col-span-7 relative w-full flex justify-center lg:justify-end pointer-events-auto">
            {isLoading ? (
              <div className="w-full max-w-[580px] h-[480px] sm:h-[540px] rounded-2xl bg-card border border-border flex flex-col items-center justify-center text-foreground relative shadow-sm">
                <span className="tech-bracket-tl" />
                <span className="tech-bracket-tr" />
                <span className="tech-bracket-bl" />
                <span className="tech-bracket-br" />
                <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
                <p className="font-mono text-xs text-foreground/60 tracking-widest uppercase">
                  Syncing to chain...
                </p>
              </div>
            ) : (
              <CardSwap
                width={580}
                height={540}
                cardDistance={32}
                verticalDistance={24}
                delay={2500}
                pauseOnHover={true}
                skewAmount={2.5}
              >
                {events.filter(e => e.status !== "closed").length > 0 ? (
                  events.filter(e => e.status !== "closed").map((event) => {
                    return (
                      <Card
                        key={event.id}
                        className="flex flex-col justify-between p-0 overflow-hidden shadow-lg bg-card border border-border group relative rounded-2xl"
                      >
                        <span className="tech-bracket-tl" />
                        <span className="tech-bracket-tr" />
                        <span className="tech-bracket-bl" />
                        <span className="tech-bracket-br" />

                        {/* Aspect-Ratio Preserved Poster Frame with Blurred Ambience */}
                        <div className="relative w-full aspect-[16/10] sm:h-52 sm:aspect-auto bg-foreground/[0.03] border-b border-border overflow-hidden shrink-0 flex items-center justify-center">
                          {event.image_url ? (
                            <>
                              <img
                                src={event.image_url}
                                alt=""
                                aria-hidden="true"
                                className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-30 pointer-events-none select-none"
                              />
                              <img
                                src={event.image_url}
                                alt={event.title}
                                loading="lazy"
                                decoding="async"
                                className="relative z-10 w-full h-full object-contain p-2"
                              />
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-foreground/50 gap-2 p-4">
                              <Calendar className="w-8 h-8 opacity-60 text-accent" />
                              <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/60">
                                [ WEB.3 EVENT BRIEF ]
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Card Body & Information */}
                        <div className="p-5 sm:p-7 flex flex-col justify-between flex-1 min-w-0">
                          <div>
                            {/* Meta Row: Status Badge Left, Date Right */}
                            <div className="flex justify-between items-center gap-2 mb-3">
                              <div
                                className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider ${
                                  event.status === "open"
                                    ? "border-emerald-600/30 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400"
                                    : "border-accent/30 bg-accent/10 text-accent"
                                }`}
                              >
                                <span className="relative flex h-2 w-2">
                                  <span
                                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                      event.status === "open" ? "bg-emerald-500" : "bg-accent"
                                    }`}
                                  />
                                  <span
                                    className={`relative inline-flex rounded-full h-2 w-2 ${
                                      event.status === "open" ? "bg-emerald-500" : "bg-accent"
                                    }`}
                                  />
                                </span>
                                <span>{event.status === "open" ? "Registration Open" : "Coming Soon"}</span>
                              </div>
                              <span className="font-mono text-xs text-foreground/70 shrink-0">
                                {event.date}
                              </span>
                            </div>

                            {/* Title with Line Clamp Protection */}
                            <h3 className="text-xl sm:text-2xl font-black cyber-font leading-snug mb-2 text-foreground break-words line-clamp-2">
                              {event.title}
                            </h3>

                            {/* Description in Canonical Sans Body Font */}
                            <p className="font-sans text-sm sm:text-base text-foreground/70 leading-relaxed line-clamp-3 mb-4">
                              {event.description}
                            </p>
                          </div>

                          {/* Action Button Row */}
                          <div className="flex flex-col sm:flex-row gap-3 w-full mt-auto pt-2">
                            {event.status === "open" ? (
                              <Link
                                href="/#incubation-hub"
                                className="cyber-btn min-h-12 px-5 py-3 flex-1 font-mono text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 group bg-accent hover:bg-accent/90 text-white shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                              >
                                <span>Register for event</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </Link>
                            ) : (
                              <button
                                disabled
                                className="min-h-12 px-5 py-3 flex-1 font-mono text-xs font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 bg-foreground/5 text-foreground/40 cursor-not-allowed"
                              >
                                Registration not open yet
                              </button>
                            )}
                            <Link
                              href="/events"
                              className="min-h-12 px-5 py-3 flex-1 border border-foreground/20 text-foreground hover:bg-foreground/5 font-mono text-xs font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
                            >
                              <span>Explore all events</span>
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                ) : (
                  <Card className="flex flex-col items-center justify-center p-6 sm:p-10 shadow-lg h-full text-center bg-card border border-border rounded-2xl relative overflow-hidden">
                    <span className="tech-bracket-tl" />
                    <span className="tech-bracket-tr" />
                    <span className="tech-bracket-bl" />
                    <span className="tech-bracket-br" />

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-accent text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase mb-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                      <span>CHECK BACK LATER</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black leading-tight mb-3 text-foreground cyber-font">
                      No Upcoming Events
                    </h3>
                    <p className="font-sans text-sm sm:text-base text-foreground/70 mb-8 max-w-sm leading-relaxed">
                      We are currently brewing up some exciting new hackathons and workshops. Stay tuned!
                    </p>
                    <Link
                      href="/events"
                      className="cyber-btn min-h-12 px-6 py-3 font-mono font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                    >
                      <span>Explore Past Events</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Card>
                )}
              </CardSwap>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
