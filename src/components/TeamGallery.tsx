"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, X, ChevronLeft, ChevronRight, Maximize2, Camera } from "lucide-react";

export interface GalleryPhoto {
  id: string;
  src: string;
  fallbackSrc?: string;
  eventName: string;
  caption: string;
  alt: string;
  date?: string;
  spanClass?: string;
  aspectClass?: string;
}

export interface GalleryEvent {
  id: string;
  name: string;
  tagline?: string;
  date?: string;
  photos: GalleryPhoto[];
}

// Configurable event gallery catalog designed for effortless multi-event expansion
const GALLERY_EVENTS: GalleryEvent[] = [
  {
    id: "web3-event-01",
    name: "WEB.3 Community Event",
    tagline: "BUILD. LEARN. CONNECT.",
    date: "CAMPUS ARCHIVE",
    photos: [
      {
        id: "pic1",
        src: "/gallery/pic1.jpg",
        fallbackSrc: "/gallery/pic1.jpeg",
        eventName: "WEB.3 Community Event",
        caption: "Event Highlights",
        alt: "WEB.3 event participants and keynote in session",
        spanClass: "col-span-1 sm:col-span-2 lg:col-span-2 row-span-2",
        aspectClass: "aspect-[16/10] sm:aspect-[16/11]",
      },
      {
        id: "pic2",
        src: "/gallery/pic2.jpg",
        fallbackSrc: "/gallery/pic2.jpeg",
        eventName: "WEB.3 Community Event",
        caption: "Knowledge Sharing",
        alt: "Presentation and technical discussion during the event",
        spanClass: "col-span-1 sm:col-span-1 lg:col-span-1 row-span-1",
        aspectClass: "aspect-[4/3] sm:aspect-square",
      },
      {
        id: "pic3",
        src: "/gallery/pic3.jpg",
        fallbackSrc: "/gallery/pic3.jpeg",
        eventName: "WEB.3 Community Event",
        caption: "Community Moments",
        alt: "Attendee engagement and audience interaction",
        spanClass: "col-span-1 sm:col-span-1 lg:col-span-1 row-span-2",
        aspectClass: "aspect-[3/4] sm:aspect-[9/16] lg:aspect-[3/4]",
      },
      {
        id: "pic4",
        src: "/gallery/pic4.jpg",
        fallbackSrc: "/gallery/pic4.jpeg",
        eventName: "WEB.3 Community Event",
        caption: "Interactive Session",
        alt: "Student participants collaborating and discussing projects",
        spanClass: "col-span-1 sm:col-span-1 lg:col-span-1 row-span-1",
        aspectClass: "aspect-[4/3] sm:aspect-square",
      },
      {
        id: "pic5",
        src: "/gallery/pic5.jpeg",
        fallbackSrc: "/gallery/pic5.jpg",
        eventName: "WEB.3 Community Event",
        caption: "WEB.3 Community",
        alt: "Group session and collective gathering of community builders",
        spanClass: "col-span-1 sm:col-span-2 lg:col-span-2 row-span-1",
        aspectClass: "aspect-[16/9] sm:aspect-[21/9] lg:aspect-[16/8]",
      },
      {
        id: "pic6",
        src: "/gallery/pic6.jpeg",
        fallbackSrc: "/gallery/pic6.jpg",
        eventName: "WEB.3 Community Event",
        caption: "Builder Engagement",
        alt: "Attendees exchanging ideas and engaging during the event",
        spanClass: "col-span-1 sm:col-span-1 lg:col-span-1 row-span-1",
        aspectClass: "aspect-[4/3]",
      },
      {
        id: "pic7",
        src: "/gallery/pic7.jpg",
        fallbackSrc: "/gallery/pic7.jpeg",
        eventName: "WEB.3 Community Event",
        caption: "Campus Gathering",
        alt: "Community members at the campus venue",
        spanClass: "col-span-1 sm:col-span-1 lg:col-span-1 row-span-1",
        aspectClass: "aspect-[4/3]",
      },
    ],
  },
];

export default function TeamGallery() {
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [unrenderableImages, setUnrenderableImages] = useState<Record<string, boolean>>({});

  // Flatten active photos based on selected event
  const allPhotos = GALLERY_EVENTS.flatMap((ev) => ev.photos);
  const activePhotos = (
    selectedEventId === "all"
      ? allPhotos
      : GALLERY_EVENTS.find((ev) => ev.id === selectedEventId)?.photos || []
  ).filter((p) => !unrenderableImages[p.id]);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const prevPhoto = useCallback(() => {
    setLightboxIndex((curr) =>
      curr !== null ? (curr === 0 ? activePhotos.length - 1 : curr - 1) : null
    );
  }, [activePhotos.length]);

  const nextPhoto = useCallback(() => {
    setLightboxIndex((curr) =>
      curr !== null ? (curr === activePhotos.length - 1 ? 0 : curr + 1) : null
    );
  }, [activePhotos.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevPhoto();
      if (e.key === "ArrowRight") nextPhoto();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, prevPhoto, nextPhoto]);

  const activePhoto =
    lightboxIndex !== null && activePhotos[lightboxIndex]
      ? activePhotos[lightboxIndex]
      : null;

  return (
    <section className="relative w-full py-16 sm:py-24 bg-background text-foreground overflow-hidden">
      {/* ── Responsive Grayscale Control Styles ── */}
      <style>{`
        /* Mobile and Touchscreen Devices: Always display in full color by default */
        .gallery-photo-img {
          filter: grayscale(0%);
        }

        /* Desktop Devices with Precise Mouse Hover: Grayscale by default, color on hover */
        @media (hover: hover) and (pointer: fine) {
          .gallery-photo-img {
            filter: grayscale(100%);
            transition: filter 0.5s ease-out, transform 0.5s ease-out;
          }
          .group:hover .gallery-photo-img {
            filter: grayscale(0%);
            transform: scale(1.05);
          }
        }
      `}</style>

      {/* Background Subtle Ambience */}
      <div className="absolute inset-0 lab-grid-bg opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[320px] bg-[#E50914]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 bg-[#E50914] shadow-[0_0_8px_#E50914]" />
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-[#E50914]">
                BUILD. LEARN. CONNECT.
              </p>
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black cyber-font tracking-tight text-foreground uppercase">
              LIFE AT <span className="text-[#E50914]">WEB.3_</span>
            </h2>
            <p className="font-mono text-xs sm:text-sm text-foreground/60 max-w-xl mt-2 leading-relaxed">
              Moments from our campus events, technical meetups, and community interactions at BMSIT&amp;M.
            </p>
          </div>

          {/* Roster Link */}
          <div className="shrink-0">
            <Link
              href="/team"
              className="cyber-btn inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-foreground/[0.04] hover:bg-[#E50914] text-foreground hover:text-white border border-border hover:border-[#E50914] font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm group min-h-[44px]"
            >
              <span>MEET THE CORE TEAM</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Telemetry & Filter Bar */}
        <div className="mb-8 px-4 py-3 rounded-xl border border-border bg-card/70 backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#E50914]" />
              <span className="font-bold text-foreground tracking-wider uppercase text-[11px]">
                EVENT HIGHLIGHTS
              </span>
            </div>
            <span className="text-foreground/30">•</span>
            <span className="text-foreground/50 text-[11px]">
              {activePhotos.length} PHOTOGRAPHS
            </span>
          </div>

          {/* Expandable Event Selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedEventId("all")}
              className={`px-3 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                selectedEventId === "all"
                  ? "bg-[#E50914]/15 text-[#E50914] font-bold border border-[#E50914]/40"
                  : "text-foreground/60 hover:text-foreground hover:bg-foreground/[0.04] border border-transparent"
              }`}
            >
              All Photos
            </button>
            {GALLERY_EVENTS.map((ev) => (
              <button
                key={ev.id}
                onClick={() => setSelectedEventId(ev.id)}
                className={`px-3 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                  selectedEventId === ev.id
                    ? "bg-[#E50914]/15 text-[#E50914] font-bold border border-[#E50914]/40"
                    : "text-foreground/60 hover:text-foreground hover:bg-foreground/[0.04] border border-transparent"
                }`}
              >
                {ev.name}
              </button>
            ))}
          </div>
        </div>

        {/* Asymmetric Photo Collage Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
          {activePhotos.map((photo, index) => {
            const hasFailedInitial = failedImages[photo.id];
            const imgSrc =
              hasFailedInitial && photo.fallbackSrc
                ? photo.fallbackSrc
                : photo.src;

            return (
              <div
                key={photo.id}
                onClick={() => openLightbox(index)}
                className={`group relative rounded-2xl overflow-hidden border border-border bg-card hover:border-[#E50914]/70 transition-all duration-300 shadow-sm hover:shadow-xl cursor-pointer ${photo.spanClass || ""}`}
              >
                {/* Tech Corner Brackets */}
                <span className="tech-bracket-tl text-[#E50914] z-20 opacity-40 group-hover:opacity-100 transition-opacity" />
                <span className="tech-bracket-tr text-[#E50914] z-20 opacity-40 group-hover:opacity-100 transition-opacity" />
                <span className="tech-bracket-bl text-[#E50914] z-20 opacity-40 group-hover:opacity-100 transition-opacity" />
                <span className="tech-bracket-br text-[#E50914] z-20 opacity-40 group-hover:opacity-100 transition-opacity" />

                {/* Photo Stage */}
                <div
                  className={`relative w-full h-full min-h-[220px] ${photo.aspectClass || "aspect-[4/3]"} overflow-hidden bg-foreground/[0.03]`}
                >
                  <Image
                    src={imgSrc}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="gallery-photo-img object-cover object-center group-hover:scale-105"
                    onError={() => {
                      if (!hasFailedInitial && photo.fallbackSrc) {
                        setFailedImages((prev) => ({ ...prev, [photo.id]: true }));
                      } else {
                        // Mark unrenderable so broken image icon doesn't display
                        setUnrenderableImages((prev) => ({ ...prev, [photo.id]: true }));
                      }
                    }}
                  />

                  {/* Gentle Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-75 group-hover:opacity-90 transition-opacity" />

                  {/* Corner Expand Indicator */}
                  <div className="absolute top-3 right-3 z-10 w-7 h-7 rounded-lg bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/70 group-hover:text-white group-hover:border-[#E50914] group-hover:bg-[#E50914] transition-all">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>

                  {/* Neutral Caption Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-10 text-white font-mono flex flex-col justify-end">
                    <span className="text-[10px] text-[#E50914] font-bold tracking-widest uppercase">
                      {photo.eventName}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base leading-snug group-hover:text-white transition-colors line-clamp-1 mt-0.5">
                      {photo.caption}
                    </h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Core Contributors Navigation Callout */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <span className="tech-bracket-tl text-[#E50914]" />
          <span className="tech-bracket-tr text-[#E50914]" />
          <span className="tech-bracket-bl text-[#E50914]" />
          <span className="tech-bracket-br text-[#E50914]" />

          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#E50914] uppercase tracking-wider">
              <span>// OPERATOR_DIRECTORY</span>
            </div>
            <h4 className="text-xl sm:text-2xl font-bold font-mono text-foreground uppercase tracking-tight">
              Looking for our Core Contributors?
            </h4>
            <p className="font-mono text-xs sm:text-sm text-foreground/60 max-w-xl">
              Meet the executive council, technical leads, and organizers behind WEB.3 BMSIT&amp;M.
            </p>
          </div>

          <Link
            href="/team"
            className="cyber-btn px-6 py-3.5 bg-[#E50914] hover:bg-[#b80710] text-white font-mono text-xs font-bold uppercase tracking-widest shadow-[0_4px_16px_rgba(229,9,20,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 min-h-[44px] relative z-20 w-full sm:w-auto text-center"
          >
            <span>VIEW FULL TEAM ROSTER</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {activePhoto && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100000] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200"
          onClick={closeLightbox}
        >
          {/* Header Bar */}
          <div
            className="flex items-center justify-between w-full max-w-6xl mx-auto py-2 border-b border-white/10 font-mono text-xs text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse" />
              <span className="font-bold tracking-wider uppercase text-white/90">
                {activePhoto.eventName}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-white/50 text-[11px]">
                FRAME {(lightboxIndex + 1).toString().padStart(2, "0")} /{" "}
                {activePhotos.length.toString().padStart(2, "0")}
              </span>
              <button
                onClick={closeLightbox}
                className="p-2 rounded-lg bg-white/10 hover:bg-[#E50914] text-white transition-colors cursor-pointer"
                aria-label="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Stage Image — Always Full Color in Lightbox */}
          <div
            className="relative flex-1 w-full max-w-6xl mx-auto my-4 flex items-center justify-center min-h-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Button */}
            <button
              onClick={prevPhoto}
              className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-black/60 hover:bg-[#E50914] text-white border border-white/20 transition-all cursor-pointer backdrop-blur-sm"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="relative w-full h-full max-h-[78vh] flex items-center justify-center rounded-xl overflow-hidden border border-white/15 bg-black/50">
              <Image
                src={
                  failedImages[activePhoto.id] && activePhoto.fallbackSrc
                    ? activePhoto.fallbackSrc
                    : activePhoto.src
                }
                alt={activePhoto.alt}
                fill
                priority
                sizes="100vw"
                className="object-contain filter-none"
              />
            </div>

            {/* Next Button */}
            <button
              onClick={nextPhoto}
              className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-black/60 hover:bg-[#E50914] text-white border border-white/20 transition-all cursor-pointer backdrop-blur-sm"
              aria-label="Next photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Footer Bar */}
          <div
            className="w-full max-w-6xl mx-auto pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-white text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                {activePhoto.caption}
              </h3>
              <p className="text-white/60 text-xs mt-0.5 font-sans">
                {activePhoto.alt}
              </p>
            </div>
            <div className="text-[11px] text-white/40 shrink-0 self-start sm:self-center">
              KEYBOARD: [← PREV] [→ NEXT] [ESC CLOSE]
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
