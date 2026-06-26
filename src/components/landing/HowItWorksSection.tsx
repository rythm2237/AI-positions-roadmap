// src/components/landing/HowItWorksSection.tsx
// AI Career OS — OS-style process section.
// Step-by-step with connecting visual thread, premium icons, purposeful motion.

const steps = [
  {
    number: "01",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
    title: "Discover your AI role",
    description:
      "Browse 10+ AI career paths or use the CV Analyzer to receive a personalized recommendation based on your background, goals, and learning style.",
    accent: "from-indigo-500 to-violet-600",
    glow:   "rgba(99,102,241,0.35)",
    dim:    "rgba(99,102,241,0.06)",
  },
  {
    number: "02",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
    title: "Follow a structured roadmap",
    description:
      "Work through phase-by-phase learning built specifically for your chosen role. No guesswork — only what you need to become job-ready.",
    accent: "from-violet-500 to-purple-600",
    glow:   "rgba(139,92,246,0.35)",
    dim:    "rgba(139,92,246,0.06)",
  },
  {
    number: "03",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    title: "Build real portfolio projects",
    description:
      "Every roadmap includes hands-on projects you can showcase to employers as proof of your skills. Build real things, not just complete courses.",
    accent: "from-purple-500 to-pink-600",
    glow:   "rgba(168,85,247,0.35)",
    dim:    "rgba(168,85,247,0.06)",
  },
  {
    number: "04",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4" />
        <path d="M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: "Become job-ready",
    description:
      "Track your progress, complete milestones, earn certificates, and finish with a portfolio that proves you are ready for the AI job market.",
    accent: "from-cyan-500 to-blue-600",
    glow:   "rgba(6,182,212,0.35)",
    dim:    "rgba(6,182,212,0.06)",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative px-5 py-28 sm:px-8">
      {/* Top divider */}
      <div aria-hidden="true" className="section-divider absolute top-0 left-1/2 -translate-x-1/2 w-3/4" />

      <div className="mx-auto max-w-7xl">
        {/* ── Header ── */}
        <div className="mb-20 text-center">
          <div className="eyebrow mb-5">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            The Process
          </div>
          <h2 className="heading-lg text-white">
            From zero to{" "}
            <span className="gradient-text">job-ready.</span>
          </h2>
          <p className="body-md mx-auto mt-5 max-w-md">
            Four clear, guided steps — each building on the last.
          </p>
        </div>

        {/* ── Steps ── */}
        <div className="relative">
          {/* Connecting thread — desktop */}
          <div
            aria-hidden="true"
            className="absolute top-[52px] left-[12.5%] right-[12.5%] hidden h-px lg:block"
            style={{
              background: "linear-gradient(90deg, rgba(99,102,241,0.5), rgba(139,92,246,0.5), rgba(168,85,247,0.5), rgba(6,182,212,0.5))",
            }}
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className="glass-card card-hover group relative flex flex-col rounded-2xl p-6 animate-fade-in-up"
                style={{ animationDelay: `${i * 120}ms`, animationFillMode: "both" }}
              >
                {/* Hover glow */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(180px circle at 50% 0%, ${step.dim}, transparent 70%)` }}
                />

                {/* Icon — sits on the connection line on desktop */}
                <div
                  className={`relative z-10 mb-6 flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-gradient-to-br ${step.accent} text-white shrink-0`}
                  style={{ boxShadow: `0 8px 24px ${step.glow}` }}
                >
                  {step.icon}
                </div>

                {/* Step label */}
                <div className="label-sm mb-2">Step {step.number}</div>

                {/* Title */}
                <h3 className="text-[15px] font-bold text-white leading-snug group-hover:text-indigo-100 transition-colors duration-200">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="mt-3 text-[13px] leading-relaxed text-slate-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom callout ── */}
        <div className="mt-16 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:gap-6">
          <div className="flex items-center gap-2 text-[13px] text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px rgba(52,211,153,0.5)" }} />
            No prerequisites needed
          </div>
          <div className="hidden h-3 w-px bg-slate-700 sm:block" />
          <div className="flex items-center gap-2 text-[13px] text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" style={{ boxShadow: "0 0 6px rgba(99,102,241,0.5)" }} />
            Role-specific curriculum
          </div>
          <div className="hidden h-3 w-px bg-slate-700 sm:block" />
          <div className="flex items-center gap-2 text-[13px] text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" style={{ boxShadow: "0 0 6px rgba(34,211,238,0.5)" }} />
            AI-guided progression
          </div>
        </div>
      </div>
    </section>
  );
}
