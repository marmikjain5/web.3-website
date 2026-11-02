"use client";

import Link from "next/link";
import {
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import type { PublicSubmissionPortalSettings } from "@/lib/submissions";
import { OFFICIAL_CLUB_SOCIALS } from "@/lib/socials";
import MagneticButton from "@/components/MagneticButton";

interface JoinUsClientProps {
  initialSettings: PublicSubmissionPortalSettings;
}

export default function JoinUsClient({ initialSettings }: JoinUsClientProps) {
  const settings = initialSettings;

  const hasGoogleFormUrl = Boolean(
    settings.google_form_url && settings.google_form_url.trim().length > 0
  );
  const isOpen = settings.is_open;

  // Exact 3 states required:
  // 1. Open + Google Form URL (isOpen && hasGoogleFormUrl)
  // 2. Closed + Google Form URL (!isOpen && hasGoogleFormUrl)
  // 3. No Google Form URL (!hasGoogleFormUrl)
  const isStateOpenWithUrl = isOpen && hasGoogleFormUrl;
  const isStateClosedWithUrl = !isOpen && hasGoogleFormUrl;
  const isStateNoUrl = !hasGoogleFormUrl;

  const categoryLabels: Record<string, string> = {
    project_proposal: "PROJECT PROPOSALS",
    join_project: "JOIN A PROJECT TEAM",
    events: "CAMPUS EVENTS",
    hackathons: "HACKATHON TRACK",
  };

  const trackBadge =
    categoryLabels[settings.active_category] || "SUBMISSIONS PORTAL";

  const checklistItems = [
    settings.checklist_label_1,
    settings.checklist_label_2,
    settings.checklist_label_3,
    settings.checklist_label_4,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden py-24 sm:py-28 px-4 sm:px-6 lg:px-12 lab-grid-bg">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#E50914]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-8 sm:space-y-12">
        {/* Navigation Breadcrumb / Back Link */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-foreground/60 hover:text-[#E50914] transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>RETURN TO HOME</span>
          </Link>

          {/* Active Track Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/60 text-[10px] font-mono tracking-wider uppercase">
            <span
              className={`w-2 h-2 rounded-full ${
                isStateClosedWithUrl
                  ? "bg-red-500"
                  : isStateNoUrl
                  ? "bg-amber-400 animate-pulse"
                  : "bg-emerald-500 animate-pulse"
              }`}
            />
            <span className="text-foreground/80 font-bold">{trackBadge}</span>
          </div>
        </div>

        {/* Hero Header */}
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-[#E50914]/30 bg-[#E50914]/10 text-[#E50914] font-mono text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OFFICIAL WEB.3 SUBMISSION PORTAL</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-mono uppercase tracking-tight text-foreground">
            {settings.join_heading}
          </h1>

          <p className="font-mono text-xs sm:text-sm text-foreground/70 leading-relaxed max-w-2xl mx-auto">
            {settings.join_subtitle}
          </p>
        </div>

        {/* ── Main Dynamic Card Container ── */}
        <div className="relative rounded-2xl border border-border bg-card/85 p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-8">
          {/* Tech Corner Brackets */}
          <span className="tech-bracket-tl text-foreground/30" />
          <span className="tech-bracket-tr text-foreground/30" />
          <span className="tech-bracket-bl text-foreground/30" />
          <span className="tech-bracket-br text-foreground/30" />

          {/* ═══════════════════════════════════════════════════════════════════
             SHARED CATEGORY CONTENT: Displayed for both Open & Closed states
          ═══════════════════════════════════════════════════════════════════ */}
          {!isStateNoUrl && (
            <div className="space-y-8">
              {/* Feature Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl border border-border/80 bg-foreground/[0.02] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E50914] uppercase">
                    <span className="w-2 h-2 bg-[#E50914] inline-block" />
                    <span>{settings.card1_heading}</span>
                  </div>
                  <p className="font-mono text-xs text-foreground/75 leading-relaxed">
                    {settings.card1_desc}
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-border/80 bg-foreground/[0.02] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E50914] uppercase">
                    <span className="w-2 h-2 bg-[#E50914] inline-block" />
                    <span>{settings.card2_heading}</span>
                  </div>
                  <p className="font-mono text-xs text-foreground/75 leading-relaxed">
                    {settings.card2_desc}
                  </p>
                </div>
              </div>

              {/* Checklist Badges */}
              {checklistItems.length > 0 && (
                <div className="space-y-3">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/50 font-bold">
                    {settings.left_heading || "TRACK CHECKLIST & HIGHLIGHTS"}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {checklistItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-3 rounded-lg border border-border/60 bg-foreground/[0.015] text-xs font-mono text-foreground/80"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#E50914] shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
             STATE 1: OPEN + GOOGLE FORM URL
          ═══════════════════════════════════════════════════════════════════ */}
          {isStateOpenWithUrl && (
            <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-mono font-bold text-emerald-500 uppercase">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>APPLICATIONS ARE CURRENTLY OPEN</span>
                </div>
                <p className="font-mono text-xs text-foreground/60 max-w-md">
                  Submissions are managed securely via official Google Forms. Click below to start your application in a new tab.
                </p>
              </div>

              <MagneticButton strength={0.25}>
                <a
                  href={settings.google_form_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cyber-btn px-8 py-4 bg-[#E50914] hover:bg-[#c90812] text-white font-mono font-black text-xs uppercase tracking-widest shadow-[0_8px_32px_rgba(229,9,20,0.35)] transition-all flex items-center gap-2.5 cursor-pointer text-center justify-center w-full sm:w-auto"
                >
                  <span>{settings.cta_label}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </MagneticButton>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
             STATE 2: CLOSED + GOOGLE FORM URL
          ═══════════════════════════════════════════════════════════════════ */}
          {isStateClosedWithUrl && (
            <div className="pt-6 border-t border-border space-y-6 text-center">
              <div className="w-14 h-14 rounded-2xl border border-red-500/30 bg-red-500/10 flex items-center justify-center mx-auto text-red-500">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 font-mono text-[10px] font-bold tracking-widest uppercase">
                  <span>SUBMISSIONS CLOSED</span>
                </div>
                <h3 className="text-xl font-mono font-bold uppercase text-foreground">
                  APPLICATIONS ARE CURRENTLY PAUSED
                </h3>
                <p className="font-mono text-xs sm:text-sm text-foreground/70 leading-relaxed">
                  {settings.closing_text ||
                    "Submissions for this category are currently closed. Follow our official channels for the next cycle announcement."}
                </p>
              </div>

              {/* Social Channels Callout */}
              <div className="pt-4 border-t border-border/60 space-y-3">
                <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/50 font-bold">
                  STAY CONNECTED FOR REOPENING ANNOUNCEMENTS
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
                  {OFFICIAL_CLUB_SOCIALS.map((soc) => (
                    <a
                      key={soc.id}
                      href={soc.href}
                      target={soc.href.startsWith("http") ? "_blank" : undefined}
                      rel={soc.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-foreground/[0.02] hover:bg-foreground/[0.05] hover:border-[#E50914]/40 transition-all font-mono text-xs group"
                    >
                      <span className="font-bold text-foreground/80 group-hover:text-foreground">
                        {soc.name}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-foreground/40 group-hover:text-[#E50914] transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
             STATE 3: NO GOOGLE FORM URL (COMING SOON)
             Required text:
             - COMING SOON!
             - Opportunities are on their way.
             - You can apply really soon! Keep checking our socials for updates and announcements.
             - Clickable official social links.
          ═══════════════════════════════════════════════════════════════════ */}
          {isStateNoUrl && (
            <div className="space-y-8 text-center py-6">
              <div className="w-16 h-16 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-center mx-auto text-amber-500">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>

              <div className="space-y-3 max-w-xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 font-mono text-[10px] font-bold tracking-widest uppercase">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>COMING SOON!</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-mono font-black uppercase text-foreground">
                  Opportunities are on their way.
                </h2>

                <p className="font-mono text-xs sm:text-sm text-foreground/75 leading-relaxed">
                  You can apply really soon! Keep checking our socials for updates and announcements.
                </p>
              </div>

              {/* Clickable Official Social Links */}
              <div className="pt-6 border-t border-border space-y-4">
                <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/50 font-bold">
                  OFFICIAL COMMUNITY CHANNELS
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
                  {OFFICIAL_CLUB_SOCIALS.map((soc) => (
                    <a
                      key={soc.id}
                      href={soc.href}
                      target={soc.href.startsWith("http") ? "_blank" : undefined}
                      rel={soc.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="flex items-center justify-between p-4 rounded-xl border border-border/80 bg-foreground/[0.02] hover:bg-[#E50914]/5 hover:border-[#E50914]/40 transition-all font-mono text-xs group"
                    >
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-foreground group-hover:text-[#E50914] transition-colors">
                          {soc.name}
                        </span>
                        <span className="text-[10px] text-foreground/50">
                          {soc.label}
                        </span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-foreground/40 group-hover:text-[#E50914] transition-colors shrink-0 ml-2" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Informational Footer Note */}
        <div className="p-4 rounded-xl border border-border/60 bg-card/40 text-center font-mono text-[11px] text-foreground/50 max-w-xl mx-auto">
          WEB.3 BMSIT&M Council • Submissions processed through verified Google Forms for integrity and transparency.
        </div>
      </div>
    </div>
  );
}
