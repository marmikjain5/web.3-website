"use client";

import Link from "next/link";
import { Crosshair } from "lucide-react";

export default function CyberSidebar() {
  return (
    <aside
      aria-label="Social and Network Links"
      className="hidden lg:flex fixed right-4 top-1/2 -translate-y-1/2 z-40 flex-col items-center bg-card/80 backdrop-blur-md border border-border rounded-xl shadow-lg p-2 gap-4 text-foreground/60 transition-all duration-300 hover:border-[#E50914]/40"
    >
      {/* Reticle / Crosshair Indicator */}
      <div className="p-2 text-foreground/40 hover:text-[#E50914] transition-colors cursor-crosshair">
        <Crosshair className="w-4 h-4 animate-[spin_20s_linear_infinite]" />
      </div>

      <div className="w-4 h-px bg-border" />

      {/* X / Twitter */}
      <Link
        href="https://twitter.com"
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 hover:text-[#E50914] hover:scale-110 transition-all"
        title="Follow on X"
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </Link>

      {/* Telegram */}
      <Link
        href="https://t.me"
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 hover:text-[#E50914] hover:scale-110 transition-all"
        title="Join Telegram Community"
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      </Link>

      {/* Medium */}
      <Link
        href="https://medium.com"
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 hover:text-[#E50914] hover:scale-110 transition-all font-serif font-black text-sm"
        title="Read Medium Articles"
      >
        M
      </Link>

      {/* LinkedIn */}
      <Link
        href="https://linkedin.com"
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 hover:text-[#E50914] hover:scale-110 transition-all font-mono font-bold text-xs"
        title="Connect on LinkedIn"
      >
        in
      </Link>
    </aside>
  );
}
