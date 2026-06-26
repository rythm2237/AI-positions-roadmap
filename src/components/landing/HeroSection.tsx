"use client";
// src/components/landing/HeroSection.tsx
// AI Career OS v2.0 — Landing Scene
// Single primary CTA · Cinematic ambient canvas · OS-level identity
// Reduced motion aware · GPU-accelerated · WCAG AA compliant

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

// ══════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════

type NodeLayer = 0 | 1 | 2;

interface CanvasNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  pulse: number;
  color: [number, number, number];
  layer: NodeLayer;
  alpha: number;
  connected: boolean;
}

// ══════════════════════════════════════════════════════════════════════════
// AMBIENT NEURAL CANVAS — living neural network background
// ══════════════════════════════════════════════════════════════════════════

const PALETTE: [number, number, number][] = [
  [99,  102, 241], // indigo-500
  [139, 92,  246], // violet-500
  [6,   182, 212], // cyan-500
  [168, 85,  247], // purple-500
  [79,  70,  229], // indigo-600
  [129, 140, 248], // indigo-400
];

function AmbientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nodes: CanvasNode[] = [];

    const dpr = () => Math.min(window.devicePixelRatio ?? 1, 2);

    const resize = () => {
      const d = dpr();
      canvas.width  = canvas.offsetWidth  * d;
      canvas.height = canvas.offsetHeight * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
    };

    const populate = () => {
      nodes.length = 0;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const count = reducedMotion ? 0 : Math.min(64, Math.floor((w * h) / 11000));

      for (let i = 0; i < count; i++) {
        const layer = (i < count * 0.28 ? 0 : i < count * 0.65 ? 1 : 2) as NodeLayer;
        const speed = [0.08, 0.16, 0.28][layer];
        nodes.push({
          x:        Math.random() * w,
          y:        Math.random() * h,
          vx:       (Math.random() - 0.5) * speed,
          vy:       (Math.random() - 0.5) * speed,
          r:        [1.2, 1.8, 2.6][layer] + Math.random() * [0.9, 1.3, 1.6][layer],
          pulse:    Math.random() * Math.PI * 2,
          color:    PALETTE[Math.floor(Math.random() * PALETTE.length)],
          layer,
          alpha:    0,
          connected: false,
        });
      }
    };

    let onResize: () => void;
    onResize = () => { resize(); populate(); };
    window.addEventListener("resize", onResize, { passive: true });
    resize();
    populate();

    const draw = (ts: number) => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const t = ts * 0.001;

      // ── Connections ──────────────────────────────────────────────────
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx   = nodes[i].x - nodes[j].x;
          const dy   = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const max  = 130 + nodes[i].layer * 20;

          if (dist < max) {
            const a = (1 - dist / max) * 0.18;
            const [r, g, b] = nodes[i].color;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(${r},${g},${b},${a * nodes[i].alpha})`;
            ctx.lineWidth   = 0.6;
            ctx.stroke();
          }
        }
      }

      // ── Nodes ────────────────────────────────────────────────────────
      nodes.forEach((n) => {
        n.x    += n.vx;
        n.y    += n.vy;
        n.pulse += 0.014 + n.layer * 0.005;

        // Wrap edges with padding
        const pad = 16;
        if (n.x < -pad) n.x = w + pad;
        if (n.x > w + pad) n.x = -pad;
        if (n.y < -pad) n.y = h + pad;
        if (n.y > h + pad) n.y = -pad;

        // Fade in
        n.alpha = Math.min(n.alpha + 0.006, 1);

        const pulse  = 0.28 + 0.32 * Math.sin(n.pulse);
        const bright = 0.38 + n.layer * 0.3;
        const a      = pulse * bright * n.alpha;
        const [r, g, b] = n.color;

        // Outer glow
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 6);
        grd.addColorStop(0, `rgba(${r},${g},${b},${a * 0.5})`);
        grd.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 6, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(a * 1.6, 0.9)})`;
        ctx.fill();
      });

      // ── Drifting ambient gradient ─────────────────────────────────────
      const gx = w * 0.5 + Math.sin(t * 0.11) * w * 0.12;
      const gy = h * 0.3  + Math.cos(t * 0.08) * h * 0.08;
      const gr = ctx.createRadialGradient(gx, gy, 0, gx, gy, w * 0.55);
      gr.addColorStop(0,   "rgba(79,70,229,0.028)");
      gr.addColorStop(0.5, "rgba(124,58,237,0.015)");
      gr.addColorStop(1,   "transparent");
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, w, h);

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ pointerEvents: "none", opacity: 0.75, willChange: "transform" }}
      aria-hidden="true"
    />
  );
}

// ══════════════════════════════════════════════════════════════════════════
// AMBIENT ORBS — slow breathing light environment
// ══════════════════════════════════════════════════════════════════════════

function AmbientOrbs() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Primary — top center, main identity light */}
      <div
        className="absolute animate-ambient-glow"
        style={{
          top: "-18%", left: "50%", transform: "translateX(-50%)",
          width: "85vw", height: "70vh",
          background:
            "radial-gradient(ellipse, rgba(79,70,229,0.15) 0%, rgba(124,58,237,0.065) 42%, transparent 68%)",
          borderRadius: "50%",
          filter: "blur(52px)",
        }}
      />
      {/* Left — violet accent */}
      <div
        className="absolute animate-float-slow"
        style={{
          top: "22%", left: "-10%",
          width: "40vw", height: "48vh",
          background:
            "radial-gradient(ellipse, rgba(124,58,237,0.09) 0%, transparent 65%)",
          borderRadius: "50%",
          filter: "blur(68px)",
          animationDelay: "2.5s",
        }}
      />
      {/* Right — cyan accent */}
      <div
        className="absolute animate-float-slow"
        style={{
          top: "38%", right: "-8%",
          width: "34vw", height: "42vh",
          background:
            "radial-gradient(ellipse, rgba(6,182,212,0.07) 0%, transparent 65%)",
          borderRadius: "50%",
          filter: "blur(68px)",
          animationDelay: "5s",
        }}
      />
      {/* Bottom — grounding glow */}
      <div
        style={{
          position: "absolute",
          bottom: "-10%", left: "50%", transform: "translateX(-50%)",
          width: "58vw", height: "30vh",
          background:
            "radial-gradient(ellipse, rgba(79,70,229,0.07) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(60px)",
        }}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// STAT CARD
// ══════════════════════════════════════════════════════════════════════════

const STATS = [
  { value: "12+",  label: "AI Career Paths"    },
  { value: "500+", label: "Learning Modules"    },
  { value: "100+", label: "Portfolio Projects"  },
  { value: "60h",  label: "Avg. Roadmap Length" },
];

function StatCard({
  value,
  label,
  delay,
}: {
  value: string;
  label: string;
  delay: number;
}) {
  return (
    <div
      className="glass-card card-hover group relative flex flex-col items-center rounded-2xl px-4 py-5 text-center overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Hover glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(130px circle at 50% -10%, rgba(79,70,229,0.12), transparent)",
        }}
      />
      <div className="relative font-display text-[26px] font-bold gradient-text leading-none sm:text-[28px]">
        {value}
      </div>
      <div className="relative mt-1.5 text-[11px] font-medium text-slate-600 leading-tight">
        {label}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TRUSTED BY ROW — social proof signal
// ══════════════════════════════════════════════════════════════════════════

function TrustRow() {
  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
      {/* Avatar stack */}
      <div className="flex -space-x-2.5" aria-hidden="true">
        {["A", "S", "J", "P", "M"].map((initial, i) => (
          <div
            key={initial}
            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#03050e] bg-gradient-to-br from-indigo-500 to-violet-600 text-[10px] font-bold text-white"
            style={{ zIndex: 5 - i }}
          >
            {initial}
          </div>
        ))}
      </div>
      <p className="text-[12px] text-slate-600">
        <span className="font-semibold text-slate-400">240+</span> professionals already on the waitlist
      </p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// HERO SECTION
// ══════════════════════════════════════════════════════════════════════════

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 55);
    return () => clearTimeout(t);
  }, []);

  const cls = (delay: number) =>
    `transition-all duration-700 ${
      loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
    }`;

  return (
    <section
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 pt-28 pb-24 sm:px-8"
      aria-label="AI Career OS — Hero"
    >
      {/* ── Background environment ── */}
      <AmbientCanvas />
      <AmbientOrbs />

      {/* ── Horizontal scan line — very subtle ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(129,140,248,0.2) 50%, transparent 100%)",
          animation: "scan-line 14s linear infinite",
        }}
      />

      {/* ── Main content ── */}
      <div className="relative z-10 mx-auto w-full max-w-4xl text-center">

        {/* Eyebrow */}
        <div
          className={`${cls(80)} eyebrow mb-8 justify-center`}
          style={{ transitionDelay: "80ms" }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0"
            style={{ animation: "neural-pulse 2.5s ease-in-out infinite" }}
          />
          AI Career Operating System
          <span className="ml-1 rounded-full bg-indigo-500/14 px-2 py-0.5 text-[9.5px] font-bold text-indigo-300 border border-indigo-500/18">
            Beta
          </span>
        </div>

        {/* Headline — large, confident, OS-level identity */}
        <h1
          className={`${cls(160)} heading-xl text-white`}
          style={{ transitionDelay: "160ms" }}
        >
          Build your future{" "}
          <br className="hidden sm:block" />
          <span className="gradient-text text-glow">in AI.</span>
        </h1>

        {/* Supporting paragraph — short, purposeful */}
        <p
          className={`${cls(240)} body-lg mx-auto mt-7 max-w-[500px]`}
          style={{ transitionDelay: "240ms" }}
        >
          Discover the AI career that fits you. Follow a structured path.
          Build real projects. Become job-ready.
        </p>

        {/* ── Single primary CTA ── */}
        <div
          className={`${cls(320)} mt-12 flex flex-col items-center gap-5`}
          style={{ transitionDelay: "320ms" }}
        >
          <Link
            href="/#roadmaps"
            className="animated-border btn-primary group relative flex items-center gap-3 px-10 py-4 text-[15px]"
          >
            {/* Inner shimmer */}
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-[14px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 55%)",
              }}
            />
            {/* Network icon */}
            <svg
              className="h-[17px] w-[17px] shrink-0 transition-transform duration-300 group-hover:scale-110"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="5"  r="2" />
              <circle cx="5"  cy="19" r="2" />
              <circle cx="19" cy="19" r="2" />
              <path d="M12 7v4M12 11l-5 6M12 11l5 6" />
            </svg>
            <span className="relative">Explore Career Network</span>
            <svg
              className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          {/* Trust signal */}
          <TrustRow />
        </div>

        {/* ── Stats row ── */}
        <div
          className={`${cls(440)} mt-16 grid grid-cols-2 gap-3 sm:grid-cols-4`}
          style={{ transitionDelay: "440ms" }}
          aria-label="Platform statistics"
        >
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} {...stat} delay={i * 60} />
          ))}
        </div>
      </div>

      {/* ── Bottom scroll indicator ── */}
      <div
        className={`${cls(600)} absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2`}
        style={{ transitionDelay: "600ms" }}
        aria-hidden="true"
      >
        <div
          className="flex h-8 w-5 items-start justify-center rounded-full border border-slate-700/50 p-1"
          style={{ background: "rgba(255,255,255,0.025)" }}
        >
          <div
            className="h-1.5 w-1 rounded-full bg-indigo-400/60"
            style={{ animation: "float-slow 2s ease-in-out infinite" }}
          />
        </div>
        <span className="text-[10px] font-medium uppercase tracking-widest text-slate-700">
          Scroll
        </span>
      </div>
    </section>
  );
}
