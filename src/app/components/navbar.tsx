"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { LogIn, LogOut, Loader2, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import MagneticButton from "@/components/MagneticButton";
import ScrambleText from "@/components/chaingpt/ScrambleText";

// ─────────────────────────────────────────────────────────────
// NAV TABS (Matching labs.chaingpt.org navigation)
// ─────────────────────────────────────────────────────────────
const NAV_TABS = [
  { label: "Events", href: "/events" },
  { label: "Projects", href: "/#portfolio" },
  { label: "Incubator", href: "/#incubation-hub" },
  { label: "Team", href: "/team" },
  { label: "FAQ", href: "/#faq" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setWithActive] = useState("Home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { theme, setTheme, resolvedTheme } = useTheme();
  const pathname = usePathname();
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      window.removeEventListener("scroll", onScroll);
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (pathname === "/") setWithActive("Home");
    else if (pathname.startsWith("/about")) setWithActive("About");
    else if (pathname.startsWith("/team")) setWithActive("Team");
    else if (pathname.startsWith("/events")) setWithActive("Our Programs");
    else if (pathname.startsWith("/contact")) setWithActive("Contact");
  }, [pathname]);

  if (!mounted) return null;

  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${window.location.pathname}`,
        queryParams: { prompt: "select_account" },
      },
    });
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
          scrolled
            ? "bg-[#ECEBE8]/95 backdrop-blur-md border-b border-black/10 shadow-sm py-2.5"
            : "bg-[#ECEBE8]/90 backdrop-blur-md border-b border-black/10 py-3.5"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4">
          
          {/* Brand Logo — web.3_ pixel logo */}
          <Link href="/" className="flex items-center gap-3 select-none group shrink-0">
            <Image
              src="/logos/web3-official-logo-transparent.png"
              alt="web.3_ read.write.own"
              width={140}
              height={50}
              priority
              className="h-9 sm:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </Link>

          {/* Center Navigation Links (labs.chaingpt.org layout) */}
          <ul className="hidden lg:flex items-center gap-6 list-none m-0 p-0 font-mono text-xs font-semibold">
            {NAV_TABS.map((tab) => (
              <li key={tab.label}>
                <Link
                  href={tab.href}
                  onClick={() => setWithActive(tab.label)}
                  className={`transition-colors duration-150 ${
                    active === tab.label
                      ? "text-[#E50914] font-bold"
                      : "text-foreground/75 hover:text-[#E50914]"
                  }`}
                >
                  <ScrambleText
                    text={tab.label}
                    triggerOnScroll={false}
                    triggerOnHover={true}
                  />
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            
            {/* ":: BMSIT&M Chapter" indicator */}
            <Link
              href="/#portfolio"
              className="hidden xl:flex items-center gap-1.5 font-mono text-xs font-semibold text-foreground/70 hover:text-[#E50914] transition-colors"
            >
              <span className="text-[#E50914] font-bold">::</span>
              <span>Our Ecosystem</span>
            </Link>

            {/* Desktop Auth State */}
            <div className="hidden sm:flex items-center border-l border-border pl-3">
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-mono text-foreground/40 uppercase">Signed in</span>
                    <span className="text-[10px] font-mono font-semibold max-w-[90px] truncate text-foreground/80">
                      {user.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="p-1.5 rounded-lg text-foreground/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Sign Out"
                  >
                    {isLoggingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-foreground/80 hover:text-[#E50914] hover:bg-foreground/[0.05] transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>
              )}
            </div>

            {/* Chamfered Brand Orange CTA: APPLY NOW */}
            <MagneticButton strength={0.25}>
              <Link
                href="/join"
                className="cyber-btn px-4 sm:px-5 py-2 sm:py-2.5 bg-[#E50914] hover:bg-[#e02e14] text-white font-mono text-[11px] sm:text-xs font-black uppercase tracking-wider shadow-[0_4px_16px_rgba(229,9,20,0.35)] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>APPLY NOW</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </MagneticButton>

            {/* Mobile Hamburger */}
            <button
              className="lg:hidden flex flex-col justify-center items-center gap-1 p-2 bg-transparent border-none cursor-pointer text-foreground"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-0.5 bg-[#E50914] rounded transition-all duration-300 ${menuOpen ? "translate-y-1.5 rotate-45" : ""}`} />
              <span className={`block w-5 h-0.5 bg-[#E50914] rounded transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-0.5 bg-[#E50914] rounded transition-all duration-300 ${menuOpen ? "-translate-y-1.5 -rotate-45" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile Full-Fidelity Cyber Drawer */}
        {menuOpen && (
          <div className="lg:hidden border-t border-border bg-[#ECEBE8]/98 backdrop-blur-xl px-5 py-5 space-y-4 font-mono text-sm shadow-2xl animate-in slide-in-from-top-2 duration-200">
            {/* Nav links with active pill */}
            <div className="space-y-1">
              {NAV_TABS.map((tab) => {
                const isActive = active === tab.label;
                return (
                  <Link
                    key={tab.label}
                    href={tab.href}
                    onClick={() => {
                      setWithActive(tab.label);
                      setMenuOpen(false);
                    }}
                    className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-[#E50914]/10 text-[#E50914] font-bold"
                        : "text-foreground/80 hover:text-[#E50914] hover:bg-foreground/[0.03]"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#E50914]" />}
                  </Link>
                );
              })}
            </div>

            {/* Ecosystem link */}
            <Link
              href="/#portfolio"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-foreground/70 hover:text-[#E50914]"
            >
              <span className="text-[#E50914]">::</span>
              <span>Our Ecosystem & Incubations</span>
            </Link>

            {/* Mobile Auth Button */}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              {user ? (
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-foreground/50">SIGNED IN AS</span>
                    <span className="text-xs font-bold truncate max-w-[180px]">{user.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-500 text-xs font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground/[0.05] text-xs font-bold text-foreground hover:text-[#E50914] w-full justify-center"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login with Google</span>
                </button>
              )}
            </div>

            {/* Primary Action Button: Apply Now */}
            <div className="pt-2">
              <Link
                href="/join"
                onClick={() => setMenuOpen(false)}
                className="cyber-btn w-full py-3 bg-[#E50914] text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <span>JOIN BMSIT WEB.3 CLUB</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Social Communities Dock */}
            <div className="pt-4 border-t border-border flex items-center justify-center gap-6 text-foreground/60">
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:text-[#E50914] transition-colors"
                title="Twitter / X"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
              <Link
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:text-[#E50914] transition-colors"
                title="Telegram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </Link>
              <Link
                href="https://medium.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:text-[#E50914] transition-colors font-serif font-black text-sm"
                title="Medium"
              >
                M
              </Link>
              <Link
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:text-[#E50914] transition-colors font-mono font-bold text-xs"
                title="LinkedIn"
              >
                in
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
