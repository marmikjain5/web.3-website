"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";

const CONTACTS = [
  {
    label: "Email Communication",
    value: "web3club@bmsit.in",
    href: "mailto:web3club@bmsit.in",
  },
  {
    label: "Direct Dispatch",
    value: "+91 8955015524",
    href: "tel:+918955015524",
  },
  {
    label: "Official Instagram",
    value: "@web.3.bmsit",
    href: "https://www.instagram.com/web.3.bmsit",
  },
];

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: "YOUR_WEB3FORMS_ACCESS_KEY",
          name: form.name,
          email: form.email,
          subject: form.subject || "New Inquiry - Web3 Labs",
          message: form.message,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-mono px-4 sm:px-6 md:px-16 pt-20 sm:pt-24 pb-16 lab-grid-bg relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#FF5500]/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Heading */}
      <div className="max-w-6xl mx-auto mb-10 sm:mb-12 border-b border-border pb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 bg-[#FF5500] shadow-[0_0_8px_#FF5500]" />
          <p className="text-[#FF5500] text-xs tracking-[0.25em] uppercase font-bold">
            ESTABLISH_UPLINK
          </p>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-7xl font-black cyber-font leading-none tracking-tight">
          CONNECT WITH <span className="text-[#FF5500]">LABS</span>
        </h1>
      </div>

      {/* Layout */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* LEFT: SEND MESSAGE FORM (7 Cols) */}
        <div className="lg:col-span-7 bg-card border border-border p-5 sm:p-6 md:p-8 rounded-2xl relative shadow-sm">
          <span className="tech-bracket-tl text-[#FF5500]" />
          <span className="tech-bracket-tr text-[#FF5500]" />
          <span className="tech-bracket-bl text-[#FF5500]" />
          <span className="tech-bracket-br text-[#FF5500]" />

          <div className="flex items-center justify-between mb-6 pb-3 border-b border-border">
            <span className="text-xs font-bold uppercase tracking-widest text-foreground/70">
              DISPATCH_TRANSMISSION
            </span>
            <span className="text-[10px] text-[#FF5500] font-bold">NODE_READY</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground/50 mb-1">
                  Full Name
                </label>
                <input
                  className="w-full bg-foreground/[0.03] border border-border px-4 py-3 text-sm rounded-lg focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] outline-none transition-all min-h-[44px]"
                  name="name"
                  placeholder="Vitalik Buterin"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground/50 mb-1">
                  Signal Address
                </label>
                <input
                  className="w-full bg-foreground/[0.03] border border-border px-4 py-3 text-sm rounded-lg focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] outline-none transition-all min-h-[44px]"
                  name="email"
                  type="email"
                  placeholder="builder@domain.xyz"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground/50 mb-1">
                Project / Subject
              </label>
              <input
                className="w-full bg-foreground/[0.03] border border-border px-4 py-3 text-sm rounded-lg focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] outline-none transition-all min-h-[44px]"
                name="subject"
                placeholder="Incubation inquiry / Advisory request"
                value={form.subject}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground/50 mb-1">
                Transmission Body
              </label>
              <textarea
                className="w-full bg-foreground/[0.03] border border-border px-4 py-3 text-sm rounded-lg focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] outline-none resize-none transition-all"
                name="message"
                rows={5}
                placeholder="Detail your protocol architecture, team background, or partnership goals..."
                value={form.message}
                onChange={handleChange}
                required
              />
            </div>

            <div className="pt-2 flex items-center gap-4 flex-wrap">
              <button
                type="submit"
                disabled={status === "sending"}
                className="cyber-btn w-full sm:w-auto px-8 py-3.5 bg-[#FF5500] hover:bg-[#FF6611] text-white font-mono text-xs font-bold uppercase tracking-wider shadow-[0_0_16px_rgba(255,85,0,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
              >
                <span>{status === "sending" ? "TRANSMITTING..." : "SEND MESSAGE"}</span>
                <Send className="w-3.5 h-3.5" />
              </button>

              {status === "success" && (
                <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>TRANSMISSION_DELIVERED</span>
                </div>
              )}
              {status === "error" && (
                <div className="flex items-center gap-2 text-rose-500 text-xs font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>ERROR: UPLINK_TIMEOUT</span>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* RIGHT: DIRECT CHANNELS (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#FF5500]" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/60">
              DIRECT PROTOCOL CHANNELS
            </h3>
          </div>

          <div className="space-y-3">
            {CONTACTS.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between border border-border bg-card p-4 sm:p-5 rounded-xl hover:border-[#FF5500]/60 hover:bg-foreground/[0.02] transition-all group shadow-sm relative overflow-hidden min-h-[44px]"
              >
                <span className="tech-bracket-tl text-[#FF5500]" />
                <span className="tech-bracket-tr text-[#FF5500]" />

                <div className="min-w-0 pr-2">
                  <p className="text-[10px] tracking-widest text-foreground/40 uppercase font-bold mb-1">
                    {c.label}
                  </p>
                  <p className="text-sm font-bold text-foreground group-hover:text-[#FF5500] transition-colors truncate">
                    {c.value}
                  </p>
                </div>
                <span className="text-foreground/30 group-hover:text-[#FF5500] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-sm font-bold shrink-0">
                  ↗
                </span>
              </a>
            ))}
          </div>

          {/* Verification Box */}
          <div className="p-4 sm:p-5 rounded-xl border border-border bg-foreground/[0.02] mt-6">
            <div className="flex items-center justify-between text-xs font-mono text-foreground/60 mb-2">
              <span>PGP_FINGERPRINT</span>
              <span className="text-[#FF5500]">VERIFIED</span>
            </div>
            <p className="font-mono text-[10px] text-foreground/40 break-all leading-relaxed">
              0x4B9E · 82A1 · F03C · E128 · 990B · 7712 · D38A · 104F
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
