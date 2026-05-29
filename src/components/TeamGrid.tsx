"use client";
import MemberCard from "./MemberCard";
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
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.unobserve(el);
  }, [threshold]);
  return { ref, inView };
}

type Particle = {
  x: number; y: number;
  vx: number; vy: number;
  opacity: number;
  size: number;
  pulse: number;
  pulseSpeed: number;
};


export default function TeamGrid({ members }: { members: TeamMemberRow[] }) {
  const [selectedDept, setSelectedDept] = useState("all");
  const filteredMembers = selectedDept === "all"
    ? members
    : members.filter((m) => m.department?.toLowerCase() === selectedDept);
  const chunkedRows = chunkArray(filteredMembers, 3);

  const departments = ["all", ...Array.from(new Set(members.map((m) => m.department?.toLowerCase() || "other")))];

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
      ctx.strokeStyle = "rgba(205,239,51,0.028)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 32) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = -gridOffset; y < H; y += 32) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Moving aurora streaks in background
      const t = frameRef.current * 0.005;
      for (let i = 0; i < 3; i++) {
        const bx = W * (0.2 + i * 0.3 + Math.sin(t + i * 1.5) * 0.1);
        const by = H * (0.3 + Math.cos(t * 0.7 + i) * 0.25);
        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, 300 + i * 60);
        grad.addColorStop(0, `rgba(205,239,51,${0.04 + Math.sin(t + i) * 0.015})`);
        grad.addColorStop(0.5, `rgba(205,239,51,0.01)`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      }

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
        if (speed > 3) { p.vx = (p.vx / speed) * 3; p.vy = (p.vy / speed) * 3; }

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
        ctx.fillStyle = `rgba(205,239,51,${pulsedOpacity})`;
        ctx.fill();

        // Halo for bigger particles
        if (p.size > 1.8) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(205,239,51,${pulsedOpacity * 0.15})`;
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
            ctx.strokeStyle = `rgba(205,239,51,${(1 - d / 110) * 0.18})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      // Mouse proximity glow
      if (mx > 0) {
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, 260);
        grad.addColorStop(0, "rgba(205,239,51,0.10)");
        grad.addColorStop(0.5, "rgba(205,239,51,0.03)");
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
      ctx.strokeStyle = `rgba(32,34,33,${cornerAlpha})`;
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
        className="bg-background"
        style={{
          minHeight: "100vh",
          paddingTop: "170px",
          position: "relative",
          overflow: "hidden",
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
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(circle, rgba(205,239,51,0.35) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          zIndex: 0,
        }} />

        {/* Hex decorations */}
        {[
          { top: "8%", left: "4%", size: 160, delay: "0s" },
          { top: "62%", left: "88%", size: 110, delay: "1.5s" },
          { top: "33%", left: "91%", size: 75, delay: "0.8s" },
          { top: "80%", left: "2%", size: 85, delay: "2s" },
        ].map((h, i) => (
          <svg key={i} style={{
            position: "absolute", top: h.top, left: h.left,
            width: h.size, height: h.size,
            animation: `hexPulse 5s ease-in-out ${h.delay} infinite`,
            zIndex: 1, pointerEvents: "none",
          }} viewBox="0 0 100 100">
            <polygon points="50,2 93,26 93,74 50,98 7,74 7,26"
              fill="none" stroke="var(--accent)" strokeWidth="1" />
          </svg>
        ))}

        {/* Scanline */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1, overflow: "hidden" }}>
          <div style={{
            position: "absolute", left: 0, right: 0, height: "2px",
            background: "linear-gradient(to right, transparent, rgba(0,0,0,0.08), transparent)",
            animation: "scanline 9s linear infinite",
          }} />
        </div>

        {/* Live data ticker at top */}
        <div style={{
          position: "absolute",
          top: "110px",
          left: 0,
          right: 0,
          height: "28px",
          background: "var(--card-bg)",
          borderBottom: "1px solid rgba(0,0,0,0.3)",
          overflow: "hidden",
          zIndex: 3,
          display: "flex",
          alignItems: "center",
        }}>
          <div className="data-ticker-inner" style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "9px",
            color: "rgba(205,239,51,0.7)",
            letterSpacing: "0.1em",
          }}>
            {Array.from({ length: 2 }, () =>
              `◈ PROTOCOL_v3.1.4 ◈ NODES_ACTIVE: ${members.length.toString().padStart(2, "0")} ◈ CHAIN_STATUS: NOMINAL ◈ UPTIME: 99.97% ◈ BLOCK_HEIGHT: 8,421,337 ◈ LATENCY: 12ms ◈ SYNC: COMPLETE ◈ CONTRIBUTORS: VERIFIED ◈ `
            ).join("")}
          </div>
        </div>

        {/* ── HEADING ── */}
        <div
          style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "28px 24px 64px" }}
          onMouseMove={handleHeadingMove}
          onMouseLeave={() => setTilt({ x: 0, y: 0 })}
          onClick={triggerGlitch}
        >
          {/* Main heading — no tag above it */}
          <div style={{
            transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: "transform 0.2s ease-out",
            display: "inline-block",
            position: "relative",
            cursor: "pointer",
          }}>
            {glitching && (
              <>
                <div className="glitch-layer-1" aria-hidden="true"
                  style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(20px, 9vw, 96px)", fontWeight: 800 }}>
                  OUR TEAM
                </div>
                <div className="glitch-layer-2" aria-hidden="true"
                  style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(20px, 9vw, 96px)", fontWeight: 800 }}>
                  OUR TEAM
                </div>
              </>
            )}
            <h2
  style={{
    fontFamily: "'Syne', sans-serif",
    fontSize: "clamp(20px, 9vw, 96px)",
    fontWeight: 800,
    whiteSpace: "nowrap",
    margin: 0,
    lineHeight: 0.9,
    letterSpacing: "-0.03em",
    position: "relative",
  }}
>
              {"OUR TEAM".split("").map((char, i) => (
                <span key={i} className="letter-anim" style={{
                  animationDelay: `${i * 0.06}s`,
                  color: char === " " ? "transparent" : (i >= 4 ? "var(--accent)" : "var(--foreground)"),
                  display: char === " " ? "inline-block" : undefined,
                  width: char === " " ? "0.3em" : undefined,
                }}>
                  {char}
                </span>
              ))}
            </h2>
          </div>

          {/* Nodes active — bigger font */}
          <p style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "15px",
            color: "rgba(32,34,33,0.75)",
            letterSpacing: "0.15em",
            marginTop: "18px",
            animation: "fadeUp 0.8s 0.9s cubic-bezier(.22,1,.36,1) both, nodesBright 3s 1.7s ease-in-out infinite",
            textShadow: "0 0 12px rgba(205,239,51,0.3)",
          }}>
            {members.length.toString().padStart(2, "0")} NODES ACTIVE
          </p>

          <div style={{
            width: "80px", height: "1px", margin: "20px auto 0",
            background: "linear-gradient(to right, transparent, var(--accent), transparent)",
            animation: "fadeUp 0.8s 1s cubic-bezier(.22,1,.36,1) both",
          }} />
        </div>

        {/* Filters */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          flexWrap: "wrap",
          padding: "0 24px 40px",
          position: "relative",
          zIndex: 2,
        }}>
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              style={{
                background: selectedDept === dept ? "rgba(205,239,51,0.15)" : "transparent",
                color: selectedDept === dept ? "#CDEF33" : "rgba(255,255,255,0.4)",
                border: `1px solid ${selectedDept === dept ? "rgba(205,239,51,0.4)" : "rgba(255,255,255,0.1)"}`,
                padding: "6px 16px",
                borderRadius: "999px",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                cursor: "pointer",
                fontFamily: "'IBM Plex Mono', monospace",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (selectedDept !== dept) {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedDept !== dept) {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.4)";
                }
              }}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ position: "relative", zIndex: 2, padding: "0 24px 120px", maxWidth: "1100px", margin: "0 auto" }}>
          {chunkedRows.map((row, rowIdx) => (
            <RevealRow
              key={rowIdx}
              row={row}
              rowIdx={rowIdx}
            />
          ))}
        </div>

        {/* Bottom web3 status bar */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "40px",
          background: "var(--card-bg)",
          borderTop: "1px solid rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "32px",
          zIndex: 3,
          backdropFilter: "blur(4px)",
        }}>
          {[
            { label: "NETWORK", value: "MAINNET" },
            { label: "STATUS", value: "● LIVE" },
            { label: "EPOCH", value: "0x1A3F" },
          ].map(({ label, value }) => (
            <div key={label} style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "9px",
              letterSpacing: "0.1em",
              display: "flex",
              gap: "6px",
            }}>
              <span style={{ color: "rgba(217,217,217,0.4)" }}>{label}</span>
              <span style={{ color: value.startsWith("●") ? "var(--accent)" : "rgba(217,217,217,0.75)" }}>{value}</span>
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
      style={{ transitionDelay: `${rowIdx * 0.08}s`, marginBottom: "32px" }}
    >
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px",
      }}>
        {row.map((member, cardIdx) => (
          <div
            key={member.name}
            style={{
              opacity: inView ? 1 : 0.25,
              transform: inView ? "translateY(0) scale(1)" : "translateY(28px) scale(0.98)",
              transition: `opacity 0.65s cubic-bezier(.22,1,.36,1) ${cardIdx * 0.1 + rowIdx * 0.08}s, transform 0.65s cubic-bezier(.22,1,.36,1) ${cardIdx * 0.1 + rowIdx * 0.08}s`,
              height: "100%",
            }}
          >
            <MemberCardWrapper
              member={member}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Thin wrapper so we can intercept social icon hover events
function MemberCardWrapper({
  member,
}: {
  member: TeamMemberRow;
}) {
  return (
    <div
      style={{ position: "relative", height: "100%" }}
    >
      <MemberCard
        name={member.name}
        role={`${member.role} | ${member.department}`}
        description={member.description || ""}
        image={member.image_url || ""}
        socials={member.socials}
      />
    </div>
  );
}
