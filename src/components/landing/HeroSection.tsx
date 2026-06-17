// src/components/landing/HeroSection.tsx
// Full-width hero with headline, supporting text, CTAs, and trust badges.

import Link from "next/link";

const trustBadges = [
  "Role-based",
  "Project-driven",
  "Progress tracking",
  "AI-ready skills",
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      {/* Subtle background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-start justify-center"
      >
        <div className="h-[500px] w-[900px] rounded-full bg-indigo-100/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        {/* Eyebrow */}
        <span className="mb-4 inline-block rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-700">
          AI Career Platform
        </span>

        {/* Headline */}
        <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
          Build your future AI career
          <br className="hidden sm:block" />
          <span className="text-indigo-600"> with guided roadmaps.</span>
        </h1>

        {/* Supporting text */}
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
          Choose a role, follow a structured learning path, build real portfolio
          projects, and track your progress step by step.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="#roadmaps"
            className="w-full rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-md transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Explore Roadmaps
          </Link>
          <Link
            href="#preview"
            className="w-full rounded-xl border border-gray-300 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Preview AI Automation Specialist
          </Link>
        </div>

        {/* Trust badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {trustBadges.map((badge) => (
            <span
              key={badge}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 shadow-sm"
            >
              {/* Simple checkmark indicator */}
              <span className="h-2 w-2 rounded-full bg-indigo-500" aria-hidden="true" />
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
