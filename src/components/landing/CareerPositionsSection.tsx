"use client";
// src/components/landing/CareerPositionsSection.tsx
// Premium dark AI career grid — all positions treated equally.

import Link from "next/link";
import { careerPositions } from "@/data/careerRoadmaps";
import { CareerPosition, DifficultyLevel } from "@/types/career";

const levelConfig: Record<DifficultyLevel, { color: string; bg: string; border: string }> = {
  "Beginner":                { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  "Beginner to Intermediate":{ color: "text-yellow-400",  bg: "bg-yellow-400/10",  border: "border-yellow-400/20" },
  "Intermediate":            { color: "text-orange-400",  bg: "bg-orange-400/10",  border: "border-orange-400/20" },
  "Advanced":                { color: "text-red-400",     bg: "bg-red-400/10",     border: "border-red-400/20" },
};

const categoryIcons: Record<string, string> = {
  "Automation":   "⚡",
  "Engineering":  "⚙️",
  "Research":     "🔬",
  "Product":      "🎯",
  "Data":         "📊",
  "Vision":       "👁️",
  "Language":     "💬",
  "Operations":   "🔧",
  "Design":       "✨",
};

function CareerCard({ position, index }: { position: CareerPosition; index: number }) {
  const isAvailable = position.status === "available";
  const level       = levelConfig[position.level];
  const icon        = categoryIcons[position.category] ?? "🤖";

  return (
    <article
      className="glass-card card-hover group relative flex flex-col rounded-2xl p-6 animate-fade-in-up"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both" }}
    >
      {/* Top row */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-lg border border-indigo-500/20 group-hover:bg-indigo-500/25 transition-colors">
            {icon}
          </div>
          <span className="text-xs font-medium text-slate-500">{position.category}</span>
        </div>

        {isAvailable ? (
          <span className="flex items-center gap-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 text-xs font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-neural-pulse" />
            Live
          </span>
        ) : (
          <span className="rounded-full bg-slate-700/50 border border-slate-600/30 px-2.5 py-1 text-xs font-medium text-slate-500">
            Coming Soon
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-white leading-snug group-hover:text-indigo-200 transition-colors">
        {position.title}
      </h3>

      {/* Description */}
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500 text-clamp-3">
        {position.description}
      </p>

      {/* Meta */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${level.color} ${level.bg} ${level.border}`}>
          {position.level}
        </span>
        <span className="text-slate-600">·</span>
        <span className="text-xs text-slate-500">{position.duration}</span>
      </div>

      {/* Skills */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {position.keySkills.slice(0, 4).map((skill) => (
          <span
            key={skill}
            className="rounded-md bg-slate-800/60 border border-slate-700/40 px-2 py-0.5 text-xs text-slate-400"
          >
            {skill}
          </span>
        ))}
        {position.keySkills.length > 4 && (
          <span className="rounded-md bg-slate-800/40 px-2 py-0.5 text-xs text-slate-600">
            +{position.keySkills.length - 4}
          </span>
        )}
      </div>

      {/* CTA */}
      <div className="mt-5">
        <Link
          href={`/roadmaps/${position.id}`}
          className={`group/btn flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-dark-900 ${
            isAvailable
              ? "bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/35 hover:border-indigo-400/50 hover:text-indigo-200"
              : "border border-slate-700/40 bg-slate-800/40 text-slate-500 hover:bg-slate-800/60"
          }`}
        >
          {isAvailable ? "View Roadmap" : "Preview"}
          <svg
            className={`h-3.5 w-3.5 transition-transform ${isAvailable ? "group-hover/btn:translate-x-0.5" : ""}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>

      {/* Hover glow */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(99,102,241,0.04), transparent 60%)" }} />
    </article>
  );
}

export default function CareerPositionsSection() {
  return (
    <section id="roadmaps" className="relative px-4 py-24 sm:px-6 lg:px-8">
      {/* Section bg glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/8 px-4 py-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">AI Career Paths</span>
          </div>
          <h2 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Choose your{" "}
            <span className="gradient-text">AI career path</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-500">
            Every roadmap is built around a specific role — structured phases,
            real projects, and progress tracking designed to make you job-ready.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {careerPositions.map((position, i) => (
            <CareerCard key={position.id} position={position} index={i} />
          ))}
        </div>

        {/* CV Analyzer CTA banner */}
        <div className="mt-16 animated-border relative overflow-hidden rounded-2xl glass-card p-8 text-center">
          {/* Background glow */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-indigo-600/15 blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-500/15 border border-indigo-500/25 px-4 py-1.5">
              <span className="text-lg">🤖</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-indigo-300">AI-Powered</span>
            </div>
            <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Not sure which path is right for you?
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400 sm:text-base">
              Upload your CV and let AI analyze your background, skills, and experience
              to recommend the perfect AI career path with a personalized roadmap.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/cv-analyzer" className="btn-primary flex items-center gap-2 px-6 py-3 text-sm">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Analyze My CV
              </Link>
              <Link href="/career-dashboard" className="btn-secondary flex items-center gap-2 px-6 py-3 text-sm">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
                </svg>
                Career Analyzer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
