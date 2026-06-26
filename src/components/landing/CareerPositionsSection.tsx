"use client";
// src/components/landing/CareerPositionsSection.tsx
// AI Career OS — Phase 1 Career Network exploration surface.
// All careers treated equally — no featured/hero career.
// Interactive cards with magnetic mouse-follow glow.
// Keyboard accessible. WCAG compliant.

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { careerPositions } from "@/data/careerRoadmaps";
import { CareerPosition, DifficultyLevel } from "@/types/career";

// ══════════════════════════════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════════════════════════════

const LEVEL_CONFIG: Record<DifficultyLevel, { color: string; bg: string; border: string }> = {
  "Beginner":                 { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  "Beginner to Intermediate": { color: "text-sky-400",     bg: "bg-sky-400/10",     border: "border-sky-400/20"     },
  "Intermediate":             { color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/20"   },
  "Advanced":                 { color: "text-rose-400",    bg: "bg-rose-400/10",    border: "border-rose-400/20"    },
};

const CATEGORY_CONFIG: Record<string, { icon: string; accent: string; glow: string }> = {
  "Automation":  { icon: "⚡", accent: "from-amber-500/18 to-orange-500/8",  glow: "rgba(245,158,11,0.18)"  },
  "Engineering": { icon: "⚙️", accent: "from-indigo-500/18 to-blue-500/8",   glow: "rgba(99,102,241,0.18)"  },
  "Research":    { icon: "🔬", accent: "from-violet-500/18 to-purple-500/8", glow: "rgba(139,92,246,0.18)"  },
  "Product":     { icon: "🎯", accent: "from-rose-500/18 to-pink-500/8",     glow: "rgba(244,63,94,0.18)"   },
  "Data":        { icon: "📊", accent: "from-cyan-500/18 to-teal-500/8",     glow: "rgba(6,182,212,0.18)"   },
  "Vision":      { icon: "👁️", accent: "from-blue-500/18 to-indigo-500/8",   glow: "rgba(59,130,246,0.18)"  },
  "Language":    { icon: "💬", accent: "from-emerald-500/18 to-green-500/8", glow: "rgba(16,185,129,0.18)"  },
  "Operations":  { icon: "🔧", accent: "from-slate-500/18 to-gray-500/8",    glow: "rgba(100,116,139,0.18)" },
  "Design":      { icon: "✨", accent: "from-pink-500/18 to-rose-500/8",     glow: "rgba(236,72,153,0.18)"  },
};

const DEFAULT_CAT = {
  icon: "🤖",
  accent: "from-indigo-500/18 to-violet-500/8",
  glow: "rgba(99,102,241,0.18)",
};

type FilterType = "all" | "available" | "coming-soon";

// ══════════════════════════════════════════════════════════════════════════
// CAREER CARD
// ══════════════════════════════════════════════════════════════════════════

function CareerCard({ position, index }: { position: CareerPosition; index: number }) {
  const isAvailable = position.status === "available";
  const level       = LEVEL_CONFIG[position.level];
  const cat         = CATEGORY_CONFIG[position.category] ?? DEFAULT_CAT;
  const cardRef     = useRef<HTMLElement>(null);

  // Magnetic mouse-follow glow
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
    card.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
  }, []);

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="glass-card card-hover group relative flex flex-col overflow-hidden rounded-2xl animate-fade-in-up"
      style={{
        animationDelay: `${index * 50}ms`,
        animationFillMode: "both",
        padding: "1.4rem 1.5rem 1.5rem",
      }}
    >
      {/* Mouse-follow glow — follows cursor within card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(280px circle at var(--mx, 50%) var(--my, 50%), ${cat.glow}, transparent 65%)`,
        }}
      />

      {/* Top edge accent line — appears on hover */}
      <div
        aria-hidden="true"
        className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${cat.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      {/* ── Header row ── */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {/* Category icon */}
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${cat.accent} text-[16px] border border-white/[0.05] transition-transform duration-300 group-hover:scale-110`}
            aria-hidden="true"
          >
            {cat.icon}
          </div>
          <span className="text-[10.5px] font-semibold uppercase tracking-widest text-slate-600">
            {position.category}
          </span>
        </div>

        {/* Status badge */}
        {isAvailable ? (
          <span className="status-live shrink-0 rounded-full bg-emerald-400/8 border border-emerald-400/18 px-2.5 py-1">
            Live
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-slate-800/50 border border-slate-700/25 px-2.5 py-1 text-[10.5px] font-medium text-slate-600">
            Soon
          </span>
        )}
      </div>

      {/* ── Title ── */}
      <h3 className="text-[15px] font-bold leading-snug text-white transition-colors duration-200 group-hover:text-indigo-100">
        {position.title}
      </h3>

      {/* ── Description ── */}
      <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-slate-500 text-clamp-3">
        {position.description}
      </p>

      {/* ── Meta ── */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold ${level.color} ${level.bg} ${level.border}`}
        >
          {position.level}
        </span>
        <span className="text-slate-700" aria-hidden="true">·</span>
        <span className="text-[11.5px] text-slate-600">{position.duration}</span>
      </div>

      {/* ── Skills ── */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {position.keySkills.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="rounded-lg bg-slate-800/45 border border-slate-700/25 px-2 py-0.5 text-[10.5px] text-slate-500"
          >
            {skill}
          </span>
        ))}
        {position.keySkills.length > 3 && (
          <span className="rounded-lg bg-slate-800/25 px-2 py-0.5 text-[10.5px] text-slate-700">
            +{position.keySkills.length - 3}
          </span>
        )}
      </div>

      {/* ── CTA ── */}
      <div className="mt-5">
        <Link
          href={`/roadmaps/${position.id}`}
          className={`group/btn flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[12.5px] font-semibold transition-all duration-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            isAvailable
              ? "bg-indigo-600/12 border border-indigo-500/22 text-indigo-300 hover:bg-indigo-600/28 hover:border-indigo-400/42 hover:text-indigo-200"
              : "border border-slate-700/25 bg-slate-800/25 text-slate-600 cursor-default"
          }`}
          tabIndex={isAvailable ? 0 : -1}
          aria-disabled={!isAvailable}
        >
          {isAvailable ? "View Roadmap" : "Coming Soon"}
          {isAvailable && (
            <svg
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5"
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
          )}
        </Link>
      </div>
    </article>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// FILTER TABS
// ══════════════════════════════════════════════════════════════════════════

const FILTERS: { value: FilterType; label: string }[] = [
  { value: "all",          label: "All Careers" },
  { value: "available",    label: "Live Now"     },
  { value: "coming-soon",  label: "Coming Soon"  },
];

function FilterTabs({
  active,
  onChange,
}: {
  active: FilterType;
  onChange: (f: FilterType) => void;
}) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-2xl glass-inset p-1.5"
      role="tablist"
      aria-label="Filter career paths"
    >
      {FILTERS.map((f) => (
        <button
          key={f.value}
          role="tab"
          aria-selected={active === f.value}
          onClick={() => onChange(f.value)}
          className={`rounded-xl px-4 py-2 text-[12px] font-semibold transition-all duration-200 ${
            active === f.value
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// SECTION
// ══════════════════════════════════════════════════════════════════════════

export default function CareerPositionsSection() {
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = careerPositions.filter((p) => {
    if (filter === "available")   return p.status === "available";
    if (filter === "coming-soon") return p.status !== "available";
    return true;
  });

  return (
    <section id="roadmaps" className="relative px-5 py-28 sm:px-8">
      {/* Top divider */}
      <div aria-hidden="true" className="section-divider absolute top-0 left-1/2 -translate-x-1/2 w-3/4" />

      {/* Ambient background glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: "60vw",
            height: "40vh",
            background: "radial-gradient(ellipse, rgba(79,70,229,0.065) 0%, transparent 70%)",
            filter: "blur(64px)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl">

        {/* ── Section header ── */}
        <div className="mb-16 text-center">
          <div className="eyebrow mb-5">
            <span
              className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0"
              style={{ animation: "neural-pulse 2.5s ease-in-out infinite" }}
              aria-hidden="true"
            />
            Career Network
          </div>

          <h2 className="heading-lg text-white">
            Every AI career,{" "}
            <span className="gradient-text">one system.</span>
          </h2>

          <p className="body-md mx-auto mt-5 max-w-lg">
            Structured paths built around specific AI roles —
            each with phases, projects, and progress tracking
            designed to make you job-ready.
          </p>

          {/* Filter tabs */}
          <div className="mt-9">
            <FilterTabs active={filter} onChange={setFilter} />
          </div>
        </div>

        {/* ── Career grid ── */}
        {filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((position, i) => (
              <CareerCard key={position.id} position={position} index={i} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-slate-600 text-[14px]">No careers match this filter.</p>
          </div>
        )}

        {/* ── CV Analyzer CTA banner ── */}
        <div className="mt-20 animated-border relative overflow-hidden rounded-3xl glass-elevated p-10 text-center sm:p-14">
          {/* Background glow */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ambient-glow"
              style={{
                width: "55%",
                height: "200%",
                background:
                  "radial-gradient(ellipse, rgba(79,70,229,0.11) 0%, transparent 65%)",
                filter: "blur(40px)",
              }}
            />
          </div>

          <div className="relative z-10">
            <div className="eyebrow mb-5 justify-center">
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
              </svg>
              AI-Powered Career Matching
            </div>

            <h3 className="heading-md text-white">
              Not sure which path is right for you?
            </h3>

            <p className="body-md mx-auto mt-4 max-w-md">
              Upload your CV and let AI analyze your background, skills,
              and experience — then generate a personalized career roadmap
              built exactly for you.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/cv-analyzer"
                className="btn-primary flex items-center gap-2.5 px-7 py-3.5 text-sm"
              >
                <svg
                  className="h-4 w-4 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
                </svg>
                Analyze My CV
              </Link>
              <Link
                href="/career-dashboard"
                className="btn-secondary flex items-center gap-2.5 px-7 py-3.5 text-sm"
              >
                <svg
                  className="h-4 w-4 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
