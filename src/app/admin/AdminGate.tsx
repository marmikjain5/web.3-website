"use client";

import { useState } from "react";
import { verifyAdminPassword } from "@/app/actions/admin";
import { Lock, ShieldAlert, KeyRound, ArrowRight, Loader2, Terminal, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminGate() {
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await verifyAdminPassword(passcode);
      if (res.success) {
        // Refresh page so server component verifies cookie and loads dashboard
        router.refresh();
      } else {
        setError(res.error || "Access Denied: Invalid Security Passcode");
      }
    } catch (err: any) {
      setError(err?.message || "Verification request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative z-20">
      <div className="w-full max-w-md bg-card/90 backdrop-blur-xl border border-border p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF5500] to-transparent" />

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#FF5500]/10 border border-[#FF5500]/30 flex items-center justify-center mb-4 text-[#FF5500] shadow-[0_0_24px_rgba(255,85,0,0.25)]">
            <Lock className="w-8 h-8" />
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#FF5500] mb-1">
            <Terminal className="w-3.5 h-3.5" />
            <span>RESTRICTED_ACCESS // SEC_LVL_4</span>
          </div>
          <h1 className="text-2xl font-black font-mono tracking-tight text-foreground">
            ADMIN_CONTROL_GATE
          </h1>
          <p className="text-xs font-mono text-foreground/50 mt-1 max-w-xs">
            Enter authorized master access key to decrypt administrative portal.
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-6 p-3.5 rounded-lg bg-red-500/10 border border-red-500/25 flex items-center gap-3 text-red-500 text-xs font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Passcode Form */}
        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-foreground/40">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              type="password"
              placeholder="ENTER PASSCODE..."
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              required
              autoFocus
              className="w-full pl-10 pr-4 py-3 bg-foreground/[0.03] border border-border rounded-xl text-sm font-mono text-foreground focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !passcode.trim()}
            className="w-full py-3.5 px-6 rounded-xl bg-[#FF5500] hover:bg-[#FF6611] active:scale-[0.99] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,85,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>DECRYPTING CREDENTIALS...</span>
              </>
            ) : (
              <>
                <span>UNLOCK CONSOLE</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 pt-4 border-t border-border/60 flex items-center justify-between text-[10px] font-mono text-foreground/40">
          <span>PORTAL_VER: 2.6.4</span>
          <span>DEFAULT_KEY: web3labs2026</span>
        </div>
      </div>
    </div>
  );
}
