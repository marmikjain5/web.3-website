"use client";
import MemberCard from "./MemberCard";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import type { TeamMemberRow } from "@/app/actions/admin";

function chunkArray<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.unobserve(el);
  }, [threshold]);
  return { ref, inView };
}

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  size: number;
  pulse: number;
  pulseSpeed: number;
};

export default function TeamGrid({ members = [] }: { members?: TeamMemberRow[] }) {
  const [selectedDept, setSelectedDept] = useState("all");
  const safeMembers = members || [];
  const filteredMembers =
    selectedDept === "all"
      ? safeMembers
      : safeMembers.filter((m) => m.department?.toLowerCase() === selectedDept);
  const chunkedRows = chunkArray(filteredMembers, 3);

  const departments = [
    "all",
    ...Array.from(
      new Set(safeMembers.map((m) => m.department?.toLowerCase() || "other"))
    ),
  ];

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glitching, setGlitching] = useState(false);
  const glitchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -999, y: -999 });
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const frameRef = useRef(0);

  const initParticles = useCallback((w: number, h: number) => {
    particlesRef.current = Array.from({ length: 60 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      opacity: 0.1 + Math.random() * 0.3,
      size: 1 + Math.random() * 1.5,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.01 + Math.random() * 0.02,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initParticles(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const { width: W, height: H } = canvas;
      ctx.clearRect(0, 0, W, H);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      frameRef.current++;

      // Animated grid lines — subtle, scrolling
      const gridOffset = (frameRef.current * 0.3) % 32;
      ctx.strokeStyle = "rgba(255,85,0,0.035)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = -gridOffset; y < H; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Background is kept pure, clean & neutral (no reddish/orange tint)
      const t = frameRef.current * 0.005;

      particlesRef.current.forEach((p) => {
        p.pulse += p.pulseSpeed;
        const pulsedOpacity = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));

        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          const force = (140 - dist) / 140;
          p.vx += (dx / dist) * force * 0.7;
          p.vy += (dy / dist) * force * 0.7;
        }

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 3) {
          p.vx = (p.vx / speed) * 3;
          p.vy = (p.vy / speed) * 3;
        }

        p.vx *= 0.97;
        p.vy *= 0.97;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100,100,100,${pulsedOpacity * 0.4})`;
        ctx.fill();

        // Halo for bigger particles
        if (p.size > 1.8) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(100,100,100,${pulsedOpacity * 0.1})`;
          ctx.fill();
        }
      });

      // Draw lines between close particles
      const pts = particlesRef.current;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(0,0,0,${(1 - d / 110) * 0.05})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      // Mouse proximity glow
      if (mx > 0) {
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, 260);
        grad.addColorStop(0, "rgba(0,0,0,0.03)");
        grad.addColorStop(0.5, "rgba(0,0,0,0.005)");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      }
      // Animated corner data-readout lines
      const cornerSize = 60;
      const cornerPad = 24;
      const corners = [
        [cornerPad, cornerPad],
        [W - cornerPad, cornerPad],
        [cornerPad, H - cornerPad],
        [W - cornerPad, H - cornerPad],
      ] as const;
      const cornerAlpha = 0.22 + 0.08 * Math.sin(t * 2);
      ctx.strokeStyle = `rgba(0,0,0,${cornerAlpha * 0.15})`;
      ctx.lineWidth = 1;
      corners.forEach(([cx, cy]) => {
        const sx = cx === cornerPad ? 1 : -1;
        const sy = cy === cornerPad ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(cx, cy + sy * cornerSize * 0.5);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + sx * cornerSize * 0.5, cy);
        ctx.stroke();
      });
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [initParticles]);

  const handleSectionMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const handleSectionMouseLeave = () => {
    mouseRef.current = { x: -999, y: -999 };
  };

  const handleHeadingMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setTilt({ x: (0.5 - y) * 10, y: (x - 0.5) * 14 });
  };

  const triggerGlitch = () => {
    setGlitching(true);
    if (glitchTimer.current) clearTimeout(glitchTimer.current);
    glitchTimer.current = setTimeout(() => setGlitching(false), 600);
  };

  return (
    <>
      <section
        className="bg-background relative overflow-hidden"
        style={{
          minHeight: "100vh",
          paddingTop: "150px",
        }}
        onMouseMove={handleSectionMouseMove}
        onMouseLeave={handleSectionMouseLeave}
      >
        {/* Particle canvas */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Dot grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            backgroundImage:
              "radial-gradient(circle, var(--grid-line) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            zIndex: 0,
          }}
        />

        {/* Hex decorations */}
        {[
          { top: "8%", left: "4%", size: 160, delay: "0s" },
          { top: "62%", left: "88%", size: 110, delay: "1.5s" },
          { top: "33%", left: "91%", size: 75, delay: "0.8s" },
          { top: "80%", left: "2%", size: 85, delay: "2s" },
        ].map((h, i) => (
          <svg
            key={i}
            style={{
              position: "absolute",
              top: h.top,
              left: h.left,
              width: h.size,
              height: h.size,
              animation: `hexPulse 5s ease-in-out ${h.delay} infinite`,
              zIndex: 1,
              pointerEvents: "none",
            }}
            viewBox="0 0 100 100"
          >
            <polygon
              points="50,2 93,26 93,74 50,98 7,74 7,26"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1"
            />
          </svg>
        ))}

        {/* Scanline */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 1,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: "2px",
              background:
                "linear-gradient(to right, transparent, rgba(229,9,20,0.15), transparent)",
              animation: "scanline 9s linear infinite",
            }}
          />
        </div>

        {/* Live data ticker at top */}
        <div
          style={{
            position: "absolute",
            top: "90px",
            left: 0,
            right: 0,
            height: "28px",
            background: "var(--card-bg)",
            borderBottom: "1px solid var(--border)",
            overflow: "hidden",
            zIndex: 3,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            className="data-ticker-inner"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "9px",
              color: "rgba(229,9,20,0.85)",
              letterSpacing: "0.1em",
            }}
          >
            {Array.from({ length: 2 }, () =>
              `◈ PROTOCOL_v3.1.4 ◈ NODES_ACTIVE: ${safeMembers.length
                .toString()
                .padStart(
                  2,
                  "0"
                )} ◈ CHAIN_STATUS: NOMINAL ◈ UPTIME: 99.97% ◈ BLOCK_HEIGHT: 8,421,337 ◈ LATENCY: 12ms ◈ SYNC: COMPLETE ◈ CONTRIBUTORS: VERIFIED ◈ `
            ).join("")}
          </div>
        </div>

        {/* ── HERO BANNER (Matched to Reference) ── */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-10">
          <div 
            className="relative rounded-2xl overflow-hidden border border-border/70 shadow-[0_20px_50px_rgba(0,0,0,0.06)] bg-[#F4F3F0] transition-transform duration-300 group"
            style={{
              transform: `perspective(1000px) rotateX(${tilt.x * 0.35}deg) rotateY(${tilt.y * 0.35}deg)`,
            }}
            onMouseMove={handleHeadingMove}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
          >
            {/* Technical Corner Brackets */}
            <span className="absolute top-2 left-3 font-mono text-xs opacity-40 z-20 select-none">┌</span>
            <span className="absolute top-2 right-3 font-mono text-xs opacity-40 z-20 select-none">┐</span>
            <span className="absolute bottom-10 left-3 font-mono text-xs opacity-40 z-20 select-none">└</span>
            <span className="absolute bottom-10 right-3 font-mono text-xs opacity-40 z-20 select-none">┘</span>

            {/* Banner Image */}
            <div className="relative w-full aspect-[2/1] sm:aspect-[2.1/1] overflow-hidden">
              <Image
                src="/chaingpt-assets/team-hero-banner.png"
                alt="Our Team - Web3 Core Contributors"
                fill
                priority
                sizes="(max-width: 1200px) 100vw, 1100px"
                className="object-cover object-center select-none"
              />
            </div>

            {/* Bottom Telemetry HUD overlay */}
            <div className="px-5 py-3 bg-card/90 backdrop-blur-md border-t border-border flex items-center justify-between text-xs font-mono text-foreground/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E50914] animate-pulse shadow-[0_0_8px_#E50914]" />
                <span className="font-bold tracking-wider uppercase text-[11px] sm:text-xs">
                  SYS:TEAM_V2.4 // PROTOCOL:VERIFIED
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-foreground/40 hidden md:inline text-[11px]">
                  BLOCK_SYNC: 100%
                </span>
                <span className="px-2.5 py-1 rounded-md bg-foreground/5 border border-border/80 font-bold text-foreground text-[11px] sm:text-xs">
                  {safeMembers.length > 0 ? `${safeMembers.length.toString().padStart(2, "0")} ACTIVE NODES` : "STANDBY / 00 NODES"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        {safeMembers.length > 0 && departments.length > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            flexWrap: "wrap",
            padding: "0 24px 36px",
            position: "relative",
            zIndex: 2,
          }}
        >
          {departments.map((dept) => {
            const isSelected = selectedDept === dept;
            return (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className="font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-full transition-all duration-200 cursor-pointer"
                style={{
                  background: isSelected ? "rgba(229,9,20,0.15)" : "var(--card-bg)",
                  color: isSelected ? "#E50914" : "var(--foreground)",
                  border: `1px solid ${
                    isSelected ? "rgba(229,9,20,0.6)" : "var(--border)"
                  }`,
                  fontWeight: isSelected ? 700 : 500,
                  opacity: isSelected ? 1 : 0.75,
                }}
              >
                {dept}
              </button>
            );
          })}
        </div>

        )}

        {/* Grid */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            padding: "0 24px 120px",
            maxWidth: "1150px",
            margin: "0 auto",
          }}
        >
          {chunkedRows.length > 0 ? (
            chunkedRows.map((row, rowIdx) => (
              <RevealRow key={rowIdx} row={row} rowIdx={rowIdx} />
            ))
          ) : safeMembers.length === 0 ? (
            <div className="relative max-w-xl mx-auto my-8 p-8 sm:p-10 rounded-2xl border border-border bg-card/60 backdrop-blur-md text-center">
              <span className="tech-bracket-tl text-[#E50914]" />
              <span className="tech-bracket-tr text-[#E50914]" />
              <span className="tech-bracket-bl text-[#E50914]" />
              <span className="tech-bracket-br text-[#E50914]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#E50914] animate-pulse mx-auto mb-4 shadow-[0_0_12px_#E50914]" />
              <span className="text-[11px] font-mono text-[#E50914] uppercase tracking-widest font-bold block mb-2">
                SYS:DIRECTORY // ROSTER_OFFLINE
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-mono text-foreground uppercase tracking-tight mb-3">
                Team Roster Temporarily Unavailable
              </h3>
              <p className="font-mono text-xs sm:text-sm text-foreground/60 leading-relaxed mb-6">
                The core contributor directory is currently updating or offline in this environment. Active member profiles will populate once the roster registry is synchronized.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-foreground/5 border border-border font-mono text-[11px] text-foreground/50">
                <span>DIRECTORY_STATUS: AWAITING_DATABASE_SYNC</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 font-mono text-sm text-foreground/40">
              No team members found in this division.
            </div>
          )}
        </div>

        {/* Bottom web3 status bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "40px",
            background: "var(--card-bg)",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "32px",
            zIndex: 3,
            backdropFilter: "blur(6px)",
          }}
        >
          {[
            { label: "NETWORK", value: "MAINNET" },
            { label: "STATUS", value: "● LIVE" },
            { label: "EPOCH", value: "0x1A3F" },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "9px",
                letterSpacing: "0.1em",
                display: "flex",
                gap: "6px",
              }}
            >
              <span style={{ color: "var(--foreground)", opacity: 0.4 }}>
                {label}
              </span>
              <span
                style={{
                  color: value.startsWith("●") ? "var(--accent)" : "var(--foreground)",
                  opacity: value.startsWith("●") ? 1 : 0.8,
                  fontWeight: 600,
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function RevealRow({
  row,
  rowIdx,
}: {
  row: TeamMemberRow[];
  rowIdx: number;
}) {
  const { ref, inView } = useInView(0.12);
  return (
    <div
      ref={ref}
      className={`row-reveal${inView ? " visible" : ""}`}
      style={{ transitionDelay: `${rowIdx * 0.08}s`, marginBottom: "28px" }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
        }}
      >
        {row.map((member, cardIdx) => (
          <div
            key={member.id || member.name}
            style={{
              opacity: inView ? 1 : 0.25,
              transform: inView
                ? "translateY(0) scale(1)"
                : "translateY(28px) scale(0.98)",
              transition: `opacity 0.65s cubic-bezier(.22,1,.36,1) ${
                cardIdx * 0.1 + rowIdx * 0.08
              }s, transform 0.65s cubic-bezier(.22,1,.36,1) ${
                cardIdx * 0.1 + rowIdx * 0.08
              }s`,
              height: "100%",
            }}
          >
            <MemberCardWrapper member={member} />
          </div>
        ))}
      </div>
    </div>
  );
}

function MemberCardWrapper({ member }: { member: TeamMemberRow }) {
  const roleText = member.department
    ? `${member.role} | ${member.department.toUpperCase()}`
    : member.role;

  return (
    <div style={{ position: "relative", height: "100%" }}>
      <MemberCard
        name={member.name}
        role={roleText}
        description={member.description || ""}
        image={member.image_url || ""}
        socials={member.socials}
      />
    </div>
  );
}
