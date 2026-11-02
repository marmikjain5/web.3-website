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
import { SOCIAL_URLS } from "@/lib/socials";

// ─────────────────────────────────────────────────────────────
// NAV TABS
// ─────────────────────────────────────────────────────────────
const NAV_TABS = [
  { label: "Events", href: "/events" },
  { label: "Projects", href: "/#portfolio" },
  { label: "Registrations", href: "/#incubation-hub" },
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { theme, setTheme, resolvedTheme } = useTheme();
  const pathname = usePathname();
  const [supabase] = useState(() => createClient());

  const checkUserRole = async (currentUser: User | null) => {
    if (!currentUser) {
      setIsAdmin(false);
      return;
    }
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUser.id)
        .single();
      if (!error && profile?.role === "admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      await checkUserRole(user);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_: AuthChangeEvent, session: Session | null) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        await checkUserRole(currentUser);
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
    else if (pathname.startsWith("/events")) setWithActive("Events");
    else if (pathname.startsWith("/laboratory")) setWithActive("Resources");
    else if (pathname.startsWith("/contact")) setWithActive("Contact");
    else if (pathname.startsWith("/admin")) setWithActive("Admin Portal");
  }, [pathname]);

  if (!mounted) return null;

  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setMenuOpen(false);
  };

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
    setIsAdmin(false);
    setUser(null);
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
          <Link
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-3 select-none group shrink-0"
          >
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
            
            {/* Admin Portal indicator (visible ONLY to authorized administrators) */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden xl:flex items-center gap-1.5 font-mono text-xs font-semibold text-foreground/70 hover:text-[#E50914] transition-colors"
              >
                <span className="text-[#E50914] font-bold">::</span>
                <span>Admin Portal</span>
              </Link>
            )}

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
                    className="p-1.5 rounded-lg text-foreground/40 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
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

            {/* Admin Portal link (visible ONLY to authorized administrators) */}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-[#E50914] hover:bg-foreground/[0.03]"
              >
                <span className="text-[#E50914]">::</span>
                <span>Admin Portal</span>
              </Link>
            )}

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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-500 text-xs font-bold cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground/[0.05] text-xs font-bold text-foreground hover:text-[#E50914] w-full justify-center cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login with Google</span>
                </button>
              )}
            </div>

            {/* Social Communities Dock */}
            <div className="pt-4 border-t border-border flex items-center justify-center gap-6 text-foreground/60">
              <Link
                href={SOCIAL_URLS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:text-[#E50914] transition-colors"
                title="Instagram"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </Link>
              <Link
                href={SOCIAL_URLS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:text-[#E50914] transition-colors"
                title="WhatsApp Community"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7.02 8.48 7.02 9.68C7.02 10.88 7.89 12.04 8.02 12.21C8.14 12.38 9.73 14.83 12.16 15.88C12.74 16.13 13.19 16.28 13.54 16.39C14.12 16.57 14.65 16.55 15.07 16.49C15.54 16.42 16.51 15.9 16.71 15.33C16.92 14.76 16.92 14.28 16.86 14.17C16.79 14.07 16.63 14.01 16.39 13.89C16.14 13.77 14.92 13.17 14.69 13.09C14.47 13.01 14.3 12.97 14.14 13.21C13.97 13.46 13.51 14.01 13.37 14.17C13.23 14.33 13.09 14.35 12.85 14.23C12.6 14.11 11.81 13.85 10.87 13.02C10.14 12.37 9.65 11.57 9.51 11.32C9.37 11.08 9.49 10.95 9.62 10.83C9.73 10.72 9.87 10.54 10 10.39C10.12 10.23 10.16 10.11 10.24 9.95C10.32 9.78 10.28 9.64 10.22 9.52C10.16 9.4 9.69 8.24 9.49 7.77C9.3 7.3 9.11 7.37 8.96 7.36C8.82 7.35 8.68 7.33 8.53 7.33Z" />
                </svg>
              </Link>
              <Link
                href={SOCIAL_URLS.contact}
                className="p-2 hover:text-[#E50914] transition-colors"
                title="Contact"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </Link>
              <Link
                href={SOCIAL_URLS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:text-[#E50914] transition-colors font-mono font-bold text-xs"
                title="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
