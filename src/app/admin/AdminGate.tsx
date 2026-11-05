"use client";

import { useState, useEffect } from "react";
import { Lock, ShieldAlert, LogIn, ArrowRight, Loader2, Terminal, AlertCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

export default function AdminGate() {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    async function checkUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkUser();
  }, [supabase]);

  const handleLogin = async () => {
    setSigningIn(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/admin`,
          queryParams: { prompt: "select_account" },
        },
      });
    } catch {
      setSigningIn(false);
    }
  };

  const handleSwitchAccount = async () => {
    setSigningIn(true);
    try {
      await supabase.auth.signOut();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/admin`,
          queryParams: { prompt: "select_account" },
        },
      });
    } catch {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-3 sm:px-4 relative z-20">
      <div className="w-full max-w-md bg-card/90 backdrop-blur-xl border border-border p-5 sm:p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF5500] to-transparent" />

        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#FF5500]/10 border border-[#FF5500]/30 flex items-center justify-center mb-4 text-[#FF5500] shadow-[0_0_24px_rgba(255,85,0,0.25)]">
            {user ? <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8" /> : <Lock className="w-7 h-7 sm:w-8 sm:h-8" />}
          </div>
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-[#FF5500] mb-1">
            <Terminal className="w-3.5 h-3.5" />
            <span>{user ? "UNAUTHORIZED_ROLE // ACCESS_DENIED" : "RESTRICTED_ACCESS // SEC_LVL_4"}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-foreground">
            {user ? "ACCESS_DENIED" : "ADMIN_CONTROL_GATE"}
          </h1>
          <p className="text-xs font-mono text-foreground/50 mt-2 max-w-xs leading-relaxed">
            {user
              ? "Your authenticated account does not possess administrator privileges (profiles.role === 'admin')."
              : "Authentication required. Please sign in with an authorized administrator account to access the console."}
          </p>
        </div>

        {/* User state context badge if signed in */}
        {user && (
          <div className="mb-6 p-3.5 rounded-lg bg-red-500/10 border border-red-500/25 flex items-start gap-3 text-red-500 text-xs font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex flex-col min-w-0">
              <span className="font-bold">SIGNED IN AS:</span>
              <span className="text-foreground/80 truncate text-[11px]">{user.email}</span>
              <span className="text-[10px] text-foreground/40 mt-1">Status: Non-administrator role</span>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-3">
          {user ? (
            <>
              <button
                type="button"
                onClick={handleSwitchAccount}
                disabled={signingIn}
                className="w-full py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl bg-[#FF5500] hover:bg-[#FF6611] active:scale-[0.99] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,85,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[44px]"
              >
                {signingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AUTHENTICATING...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>SWITCH TO ADMIN ACCOUNT</span>
                  </>
                )}
              </button>

              <Link
                href="/"
                className="w-full py-3 px-4 sm:px-6 rounded-xl border border-border hover:bg-foreground/[0.05] text-foreground/70 hover:text-foreground font-mono text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px]"
              >
                <span>RETURN TO HOMEPAGE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleLogin}
                disabled={loading || signingIn}
                className="w-full py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl bg-[#FF5500] hover:bg-[#FF6611] active:scale-[0.99] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,85,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[44px]"
              >
                {signingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>INITIALIZING AUTHENTICATION...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>SIGN IN WITH GOOGLE</span>
                  </>
                )}
              </button>

              <Link
                href="/"
                className="w-full py-3 px-4 sm:px-6 rounded-xl border border-border hover:bg-foreground/[0.05] text-foreground/70 hover:text-foreground font-mono text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px]"
              >
                <span>RETURN TO HOMEPAGE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
