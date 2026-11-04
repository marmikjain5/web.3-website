"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("chaingpt_cookie_consent");
    if (!consent) {
      // Small delay for smooth entrance
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (choice: "accepted" | "rejected") => {
    localStorage.setItem("chaingpt_cookie_consent", choice);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 md:bottom-6 md:right-6 z-50 w-auto sm:w-[380px] max-w-[calc(100vw-2rem)] bg-[#101217]/95 dark:bg-[#0A0C10]/95 backdrop-blur-xl border border-white/15 dark:border-white/10 rounded-lg shadow-2xl p-4 md:p-5 flex flex-col gap-4 text-white font-mono"
        >
          {/* Top Row: Notice Text & Dismiss Button */}
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs text-white/90 leading-relaxed font-mono">
              We use third-party cookies to personalize content, ads, and analyze website traffic.
            </p>
            <button
              onClick={() => handleConsent("rejected")}
              className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer shrink-0"
              aria-label="Dismiss cookie notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons Row matching labs.chaingpt.org layout */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => handleConsent("accepted")}
              className="px-5 py-2 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider rounded-md hover:bg-white/90 transition-all shadow-[0_0_12px_rgba(255,255,255,0.35)] cursor-pointer"
            >
              ACCEPT
            </button>
            <button
              onClick={() => handleConsent("rejected")}
              className="cyber-btn px-5 py-2 bg-black/60 border border-white/20 text-white font-mono font-bold text-xs uppercase tracking-wider hover:bg-white/10 hover:border-white/40 transition-all cursor-pointer"
            >
              REJECT
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
