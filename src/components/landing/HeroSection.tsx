"use client";
// src/components/landing/HeroSection.tsx
// Premium futuristic hero — animated neural background, single CTA, particle field.

import { useEffect, useRef } from "react";
import Link from "next/link";

// ── Particle canvas ──────────────────────────────────────────────────────────
function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const nodes: { x: number; y: number; vx: number; vy: number; r: number; pulse: number }[] = [];
    const NODE_COUNT = 55;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update & draw nodes
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.02;
        if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;

        const alpha = 0.4 + 0.3 * Math.sin(n.pulse);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(129,140,248,${alpha})`;
        ctx.fill();

        // Glow
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
        grad.addColorStop(0, `rgba(99,102,241,${alpha * 0.5})`);
        grad.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx   = nodes[i].x - nodes[j].x;
          const dy   = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.25;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full opacity-60"
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    />
  );
}

// ── Stats row ────────────────────────────────────────────────────────────────
const stats = [
  { value: "10+",   label: "AI Career Paths" },
  { value: "500+",  label: "Learning Sections" },
  { value: "100+",  label: "Portfolio Projects" },
  { value: "60hrs", label: "Avg. Roadmap Length" },
];

// ── Trust badges ─────────────────────────────────────────────────────────────
const badges = [
  { icon: "⚡", label: "Role-based" },
  { icon: "🎯", label: "Project-driven" },
  { icon: "📊", label: "Progress tracking" },
  { icon: "🤖", label: "AI-powered" },
  { icon: "🚀", label: "Job-ready skills" },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-16 sm:px-6 lg:px-8">
      {/* ── Neural canvas bg ── */}
      <NeuralCanvas />

      {/* ── Radial glow orbs ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 h-[300px] w-[300px] rounded-full bg-violet-600/8 blur-[80px]" />
        <div className="absolute top-1/2 right-1/4 h-[250px] w-[250px] rounded-full bg-cyan-500/6 blur-[80px]" />
      </div>

      {/* ── Scan line ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"
        style={{ animation: "scan-line 6s linear infinite", top: 0 }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto max-w-5xl text-center">
        {/* Eyebrow pill */}
        <div className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-neural-pulse" />
          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-300">
            AI Career Operating System
          </span>
          <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-bold text-indigo-300">
            Beta
          </span>
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in-up delay-100 mt-2 font-display text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
          Your AI career
          <br />
          <span className="gradient-text text-glow">starts here.</span>
        </h1>

        {/* Subheadline */}
        <p className="animate-fade-in-up delay-200 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl">
          Discover your perfect AI role, follow a structured roadmap, build
          real portfolio projects, and become job-ready — guided by AI every
          step of the way.
        </p>

        {/* Single primary CTA */}
        <div className="animate-fade-in-up delay-300 mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/#roadmaps"
            className="animated-border btn-primary group relative flex items-center gap-2.5 px-8 py-4 text-base"
          >
            <svg className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Explore AI Careers
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link
            href="/cv-analyzer"
            className="btn-secondary group flex items-center gap-2 px-8 py-4 text-base"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Analyze My CV
          </Link>
        </div>

        {/* Trust badges */}
        <div className="animate-fade-in-up delay-400 mt-10 flex flex-wrap items-center justify-center gap-2">
          {badges.map((b) => (
            <span
              key={b.label}
              className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/4 px-3.5 py-1.5 text-xs font-medium text-slate-400 backdrop-blur-sm"
            >
              <span>{b.icon}</span>
              {b.label}
            </span>
          ))}
        </div>

        {/* Stats row */}
        <div className="animate-fade-in-up delay-500 mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className="glass-card rounded-2xl p-4 text-center card-hover"
            >
              <div className="font-display text-2xl font-bold gradient-text sm:text-3xl">
                {s.value}
              </div>
              <div className="mt-1 text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div className="animate-fade-in delay-700 absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
        <span className="text-xs text-slate-500">Scroll to explore</span>
        <div className="h-8 w-5 rounded-full border border-slate-600 flex items-start justify-center p-1">
          <div className="h-1.5 w-1 rounded-full bg-slate-500 animate-float" />
        </div>
      </div>
    </section>
  );
}
