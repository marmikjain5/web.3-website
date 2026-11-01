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
  { label: "Programs", href: "/events" },
  { label: "Portfolio", href: "/#portfolio" },
  { label: "Residency", href: "/#residency" },
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
              className="h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
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
          <div className="flex items-center gap-4 shrink-0">
            
            {/* ":: Our Ecosystem" indicator from Screenshot 1 */}
            <Link
              href="/#portfolio"
              className="hidden xl:flex items-center gap-1.5 font-mono text-xs font-semibold text-foreground/70 hover:text-[#E50914] transition-colors"
            >
              <span className="text-[#E50914] font-bold">::</span>
              <span>Our Ecosystem</span>
            </Link>

            {/* Auth State */}
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
                className="cyber-btn px-5 py-2.5 bg-[#E50914] hover:bg-[#e02e14] text-white font-mono text-xs font-black uppercase tracking-wider shadow-[0_4px_16px_rgba(229,9,20,0.35)] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>APPLY NOW</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </MagneticButton>

            {/* Mobile Hamburger */}
            <button
              className="lg:hidden flex flex-col gap-1 p-2 bg-transparent border-none cursor-pointer text-foreground"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-0.5 bg-[#E50914] rounded transition-all duration-300 ${menuOpen ? "translate-y-1.5 rotate-45" : ""}`} />
              <span className={`block w-5 h-0.5 bg-[#E50914] rounded transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-0.5 bg-[#E50914] rounded transition-all duration-300 ${menuOpen ? "-translate-y-1.5 -rotate-45" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div className="lg:hidden border-t border-border bg-card px-6 py-4 space-y-3 font-mono text-sm shadow-xl">
            {NAV_TABS.map((tab) => (
              <Link
                key={tab.label}
                href={tab.href}
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-foreground/80 hover:text-[#E50914] transition-colors"
              >
                {tab.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border flex justify-between items-center">
              <Link
                href="/events"
                onClick={() => setMenuOpen(false)}
                className="cyber-btn px-4 py-2 bg-[#E50914] text-white font-bold text-xs uppercase"
              >
                APPLY NOW
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
