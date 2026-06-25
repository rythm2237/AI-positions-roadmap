// src/components/landing/HowItWorksSection.tsx
// Premium dark step-by-step process section.

const steps = [
  {
    number: "01",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Choose your AI role",
    description:
      "Browse 10+ AI career paths. Use the AI Career Analyzer to get a personalized recommendation based on your background and goals.",
    accent: "from-indigo-500 to-violet-500",
    glow: "rgba(99,102,241,0.3)",
  },
  {
    number: "02",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Follow a structured roadmap",
    description:
      "Work through phase-by-phase lessons built specifically for your role. No guesswork, no filler — just what you need to become job-ready.",
    accent: "from-violet-500 to-purple-500",
    glow: "rgba(139,92,246,0.3)",
  },
  {
    number: "03",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Build real portfolio projects",
    description:
      "Every roadmap includes hands-on projects you can showcase to employers as proof of your skills. Build real things, not just complete courses.",
    accent: "from-purple-500 to-pink-500",
    glow: "rgba(168,85,247,0.3)",
  },
  {
    number: "04",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Become job-ready",
    description:
      "Track progress, complete quizzes, earn certificates, and finish with a portfolio that proves you're ready for the AI job market.",
    accent: "from-cyan-500 to-blue-500",
    glow: "rgba(6,182,212,0.3)",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative px-4 py-24 sm:px-6 lg:px-8">
      {/* Top divider */}
      <div aria-hidden="true" className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/8 px-4 py-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest text-violet-400">The Process</span>
          </div>
          <h2 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            How it <span className="gradient-text">works</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-500">
            From zero to job-ready in four clear, guided steps.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Connection line (desktop) */}
          <div
            aria-hidden="true"
            className="absolute top-10 left-[12.5%] right-[12.5%] hidden h-px lg:block"
            style={{ background: "linear-gradient(90deg, rgba(99,102,241,0.4), rgba(139,92,246,0.4), rgba(168,85,247,0.4), rgba(6,182,212,0.4))" }}
          />

          {steps.map((step, i) => (
            <div
              key={step.number}
              className="glass-card card-hover group relative flex flex-col rounded-2xl p-6 animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both" }}
            >
              {/* Icon */}
              <div
                className={`relative mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${step.accent} text-white shadow-lg z-10`}
                style={{ boxShadow: `0 8px 24px ${step.glow}` }}
              >
                {step.icon}
              </div>

              {/* Step number */}
              <div className="mb-2 font-display text-xs font-bold tracking-widest text-slate-600 uppercase">
                Step {step.number}
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors">
                {step.title}
              </h3>

              {/* Description */}
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {step.description}
              </p>

              {/* Hover glow */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(200px circle at 50% 0%, ${step.glow.replace("0.3", "0.06")}, transparent 70%)` }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
