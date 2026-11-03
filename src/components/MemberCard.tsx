"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export type MemberCardProps = {
  name: string;
  role: string;
  description?: string;
  image?: string;
  socials?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
  };
};

export default function MemberCard({
  name,
  role,
  description,
  image,
  socials = {},
}: MemberCardProps) {
  const [showBio, setShowBio] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modal on Escape key and handle scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowBio(false);
    };
    if (showBio) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [showBio]);

  const defaultAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60";

  return (
    <>
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.2 }}
        className="relative bg-card border border-border p-5 rounded-2xl shadow-sm hover:shadow-xl hover:border-[#E50914]/60 transition-colors duration-300 flex flex-col justify-between group h-full"
      >
        {/* 4 Corner Markers */}
        <span className="tech-bracket-tl text-[#E50914]" />
        <span className="tech-bracket-tr text-[#E50914]" />
        <span className="tech-bracket-bl text-[#E50914]" />
        <span className="tech-bracket-br text-[#E50914]" />

        {/* Member Name & Role at Top */}
        <div className="text-center mb-4 select-none">
          <h3 className="font-mono font-bold text-base md:text-lg text-foreground tracking-tight group-hover:text-[#E50914] transition-colors line-clamp-1">
            {name}
          </h3>
          <span className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-foreground/50 block mt-0.5 truncate">
            {role}
          </span>
        </div>

        {/* Black & White Photo with Corner Bevels */}
        <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-foreground/[0.04] border border-border my-2">
          <img
            src={image || defaultAvatar}
            alt={name}
            className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500 ease-out"
            loading="lazy"
          />
        </div>

        {/* Bottom Bar: BIO + Trigger Button */}
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <button
            onClick={() => setShowBio(true)}
            className="flex items-center gap-1.5 font-mono text-xs font-bold text-foreground/70 hover:text-[#E50914] transition-colors cursor-pointer py-1"
          >
            <span>BIO</span>
            <Plus className="w-3.5 h-3.5 text-[#E50914] stroke-[3]" />
          </button>

          {/* Minimal Social Links */}
          <div className="flex items-center gap-2.5 text-foreground/40">
            {socials?.twitter && (
              <a
                href={socials.twitter}
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#E50914] transition-colors"
                title="Twitter / X"
              >
                <TwitterIcon className="w-3.5 h-3.5" />
              </a>
            )}
            {socials?.linkedin && (
              <a
                href={socials.linkedin}
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#E50914] transition-colors"
                title="LinkedIn"
              >
                <LinkedinIcon className="w-3.5 h-3.5" />
              </a>
            )}
            {socials?.github && (
              <a
                href={socials.github}
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#E50914] transition-colors"
                title="GitHub"
              >
                <GithubIcon className="w-3.5 h-3.5" />
              </a>
            )}
            {socials?.instagram && (
              <a
                href={socials.instagram}
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#E50914] transition-colors"
                title="Instagram"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </motion.div>

      {/* Bio Modal / Dossier Portaled to body to escape parent transform stacking contexts */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {showBio && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md"
                onClick={() => setShowBio(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, y: 15 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 15 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full max-w-lg bg-[#0c0d0e] border border-white/15 p-6 md:p-8 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden font-mono select-text"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="tech-bracket-tl text-[#E50914]" />
                  <span className="tech-bracket-tr text-[#E50914]" />
                  <span className="tech-bracket-bl text-[#E50914]" />
                  <span className="tech-bracket-br text-[#E50914]" />

                  <button
                    onClick={() => setShowBio(false)}
                    className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-[#E50914] rounded-lg border border-white/10 transition-colors cursor-pointer"
                    aria-label="Close dossier"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-white/20 bg-black/50 shrink-0">
                      <img
                        src={image || defaultAvatar}
                        alt={name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E50914] animate-pulse" />
                        <span className="text-[10px] font-mono font-bold tracking-widest text-[#E50914] uppercase">
                          // EXECUTIVE DOSSIER
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold font-mono text-white truncate tracking-tight">
                        {name}
                      </h3>
                      <span className="text-xs uppercase text-zinc-400 font-mono font-semibold tracking-wider block mt-0.5 truncate">
                        {role}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">
                        TRANSMISSION_DETAILS
                      </span>
                      <div className="flex items-center gap-2">
                        {socials?.twitter && (
                          <a
                            href={socials.twitter}
                            target="_blank"
                            rel="noreferrer"
                            className="text-zinc-400 hover:text-[#E50914] hover:bg-white/10 p-1.5 rounded transition-colors"
                            title="Twitter / X"
                          >
                            <TwitterIcon className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {socials?.linkedin && (
                          <a
                            href={socials.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="text-zinc-400 hover:text-[#E50914] hover:bg-white/10 p-1.5 rounded transition-colors"
                            title="LinkedIn"
                          >
                            <LinkedinIcon className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {socials?.github && (
                          <a
                            href={socials.github}
                            target="_blank"
                            rel="noreferrer"
                            className="text-zinc-400 hover:text-[#E50914] hover:bg-white/10 p-1.5 rounded transition-colors"
                            title="GitHub"
                          >
                            <GithubIcon className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {socials?.instagram && (
                          <a
                            href={socials.instagram}
                            target="_blank"
                            rel="noreferrer"
                            className="text-zinc-400 hover:text-[#E50914] hover:bg-white/10 p-1.5 rounded transition-colors"
                            title="Instagram"
                          >
                            <InstagramIcon className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      <p className="text-sm text-zinc-200 leading-relaxed font-sans whitespace-pre-line">
                        {description ||
                          "Core member of Web3 Labs driving incubator acceleration, tokenomics strategy, and partner integrations across the global decentralized ecosystem."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span className="flex items-center gap-2 font-bold text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      STATUS: ACTIVE_OPERATOR
                    </span>
                    <button
                      onClick={() => setShowBio(false)}
                      className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-[#E50914] text-white transition-colors cursor-pointer font-bold border border-white/10"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
