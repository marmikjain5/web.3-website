"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPublicEvents, type EventRow } from "@/app/actions/admin";
import { ArrowRight, Loader2 } from "lucide-react";
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
      className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 md:px-8 flex items-center justify-center z-20 overflow-hidden transition-colors duration-500 bg-background"
    >
      {/* Decorative glow blobs in light mode */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-green-200/30 rounded-full blur-3xl pointer-events-none dark:hidden" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-slate-300/30 rounded-full blur-3xl pointer-events-none dark:hidden" />

      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

        <div className="flex flex-col items-start text-left z-30 mb-8 lg:mb-0">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 bg-[#E50914]" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/70">
              COMMUNITY & COMPETITIONS
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-4 cyber-font text-[#1A1A1A] leading-none">
            FLAGSHIP<br />
            <span className="text-[#E50914]">EVENTS</span>
          </h2>
          <p className="font-mono text-sm md:text-base max-w-[28rem] text-[#1A1A1A]/70 leading-relaxed">
            Discover premier student-led hackathons, builder sprints, and exclusive developer workshops shifting the frontier of Web3.
          </p>
        </div>

        {/* Right Side Cards */}
        <div className="relative w-full flex justify-center lg:justify-end pr-0 lg:pr-8 pointer-events-auto">
          {isLoading ? (
            <div className="w-full max-w-[600px] h-[560px] rounded-xl bg-white border border-black/10 flex flex-col items-center justify-center text-[#1A1A1A]">
              <Loader2 className="w-8 h-8 animate-spin text-[#E50914] mb-4" />
              <p className="font-mono text-xs opacity-50 tracking-widest uppercase">Syncing to chain...</p>
            </div>
          ) : (
            <CardSwap
              width={600}
              height={560}
              cardDistance={40}
              verticalDistance={40}
              delay={2500}
              pauseOnHover={true}
              skewAmount={4}
            >
              {events.filter(e => e.status !== "closed").length > 0 ? (
                events.filter(e => e.status !== "closed").map((event) => {
                  return (
                    <Card
                      key={event.id}
                      className="flex flex-col justify-between p-0 overflow-hidden shadow-2xl bg-white border border-black/10"
                    >
                      <div className="w-full h-[220px] sm:h-[260px] lg:h-[295px] bg-black/[0.03] flex items-center justify-center border-b border-black/10 overflow-hidden">
                        <img
                          src={event.image_url || "/placeholder-event.png"}
                          alt={event.title}
                          loading="lazy"
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="p-5 sm:p-6 lg:p-8 flex flex-col flex-1">
                        <h2 className="text-2xl md:text-4xl font-black cyber-font leading-tight text-[#1A1A1A] line-clamp-2 break-words">
                          {event.title}
                        </h2>

                        <div className="flex flex-wrap justify-between items-center gap-2 mt-3 sm:mt-4">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-mono font-bold uppercase tracking-widest ${event.status === "open" ? "border-green-400/20 bg-green-400/10 text-green-400" :
                              "border-[#E50914]/20 bg-[#E50914]/10 text-[#E50914]"
                            }`}>
                            <span className={`w-2 h-2 rounded-full animate-ping ${event.status === "open" ? "bg-green-400" : "bg-[#E50914]"}`} />
                            {event.status === "open" ? "Registration Open" : "Coming Soon"}
                          </div>
                          <span className="font-mono text-xs text-[#1A1A1A]/50 whitespace-nowrap">
                            {event.date}
                          </span>
                        </div>

                        <p className="font-mono text-xs md:text-sm line-clamp-3 text-[#1A1A1A]/70 leading-relaxed mt-3 sm:mt-4">
                          {event.description}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-6">
                          {event.status === "open" ? (
                            <Link
                              href="/#incubation-hub"
                              className="cyber-btn px-6 py-3.5 w-full sm:flex-1 min-h-[44px] font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 group bg-[#E50914] hover:bg-[#e0151e] text-white shadow-[0_0_15px_rgba(255,30,39,0.35)] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                            >
                              <span>Register for event</span>
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          ) : (
                            <button
                              disabled
                              className="px-6 py-3.5 w-full sm:flex-1 min-h-[44px] font-mono text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 group bg-black/5 text-[#1A1A1A]/40 cursor-not-allowed"
                            >
                              Registration not open yet
                            </button>
                          )}
                          <Link
                            href="/events"
                            className="px-6 py-3.5 w-full sm:flex-1 min-h-[44px] border border-black/15 font-bold uppercase tracking-wider font-mono text-xs rounded-lg transition-all flex items-center justify-center gap-2 group text-[#1A1A1A] hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                          >
                            <span>Explore all events</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <Card className="flex flex-col items-center justify-center p-6 sm:p-8 shadow-2xl h-full text-center bg-white border border-black/10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-mono font-bold uppercase tracking-widest border-black/20 bg-black/5 text-[#1A1A1A]/50 mb-6">
                    Check Back Later
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black leading-tight mb-4 text-[#1A1A1A]">
                    No Upcoming Events
                  </h2>
                  <p className="text-sm text-[#1A1A1A]/70 mb-8 max-w-sm">
                    We are currently brewing up some exciting new hackathons and workshops. Stay tuned!
                  </p>
                  <Link
                    href="/events"
                    className="px-6 py-3.5 w-full min-h-[44px] border border-black/15 font-bold font-mono text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 text-[#1A1A1A] hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <span>View Past Events</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Card>
              )}
            </CardSwap>
          )}
        </div>
      </div>
    </section>
  );
}
