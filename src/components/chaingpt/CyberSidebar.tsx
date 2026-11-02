"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crosshair, Mail } from "lucide-react";
import { SOCIAL_URLS } from "@/lib/socials";

export default function CyberSidebar() {
  const pathname = usePathname();

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <aside
      aria-label="Social and Network Links"
      className="hidden lg:flex fixed right-4 top-1/2 -translate-y-1/2 z-40 flex-col items-center bg-card/80 backdrop-blur-md border border-border rounded-xl shadow-lg p-2 gap-4 text-foreground/60 transition-all duration-300 hover:border-[#E50914]/40"
    >
      {/* 1. Home (Animated Crosshair) */}
      <Link
        href="/"
        onClick={handleHomeClick}
        className="p-2 text-foreground/60 hover:text-[#E50914] hover:scale-110 transition-all cursor-pointer"
        title="Home"
        aria-label="Navigate to Home"
      >
        <Crosshair className="w-4 h-4 animate-[spin_20s_linear_infinite]" />
      </Link>

      {/* 2. Instagram */}
      <Link
        href={SOCIAL_URLS.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 hover:text-[#E50914] hover:scale-110 transition-all"
        title="Instagram"
        aria-label="Follow on Instagram"
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      </Link>

      {/* 3. WhatsApp */}
      <Link
        href={SOCIAL_URLS.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 hover:text-[#E50914] hover:scale-110 transition-all"
        title="WhatsApp Community"
        aria-label="Join WhatsApp Community"
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7.02 8.48 7.02 9.68C7.02 10.88 7.89 12.04 8.02 12.21C8.14 12.38 9.73 14.83 12.16 15.88C12.74 16.13 13.19 16.28 13.54 16.39C14.12 16.57 14.65 16.55 15.07 16.49C15.54 16.42 16.51 15.9 16.71 15.33C16.92 14.76 16.92 14.28 16.86 14.17C16.79 14.07 16.63 14.01 16.39 13.89C16.14 13.77 14.92 13.17 14.69 13.09C14.47 13.01 14.3 12.97 14.14 13.21C13.97 13.46 13.51 14.01 13.37 14.17C13.23 14.33 13.09 14.35 12.85 14.23C12.6 14.11 11.81 13.85 10.87 13.02C10.14 12.37 9.65 11.57 9.51 11.32C9.37 11.08 9.49 10.95 9.62 10.83C9.73 10.72 9.87 10.54 10 10.39C10.12 10.23 10.16 10.11 10.24 9.95C10.32 9.78 10.28 9.64 10.22 9.52C10.16 9.4 9.69 8.24 9.49 7.77C9.3 7.3 9.11 7.37 8.96 7.36C8.82 7.35 8.68 7.33 8.53 7.33Z" />
        </svg>
      </Link>

      {/* 4. Mail */}
      <Link
        href={SOCIAL_URLS.contact}
        className="p-2 hover:text-[#E50914] hover:scale-110 transition-all"
        title="Contact Us"
        aria-label="Contact Us"
      >
        <Mail className="w-4 h-4" />
      </Link>

      {/* 5. LinkedIn */}
      <Link
        href={SOCIAL_URLS.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 hover:text-[#E50914] hover:scale-110 transition-all"
        title="LinkedIn"
        aria-label="Connect on LinkedIn"
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </Link>
    </aside>
  );
}
