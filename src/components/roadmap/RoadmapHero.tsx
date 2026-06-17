// src/components/roadmap/RoadmapHero.tsx
// Hero section for the roadmap detail page.
// Displays role title, category, level, duration, and status badge.

import Link from "next/link";
import { CareerPosition, DifficultyLevel } from "@/types/career";

const levelColour: Record<DifficultyLevel, string> = {
  Beginner: "bg-emerald-100 text-emerald-700",
  "Beginner to Intermediate": "bg-yellow-100 text-yellow-700",
  Intermediate: "bg-orange-100 text-orange-700",
  Advanced: "bg-red-100 text-red-700",
};

interface RoadmapHeroProps {
  position: CareerPosition;
}

export default function RoadmapHero({ position }: RoadmapHeroProps) {
  return (
    <section className="bg-white border-b border-gray-100 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors mb-8"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to all roadmaps
        </Link>

        {/* Category + status badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            {position.category}
          </span>
          {position.status === "mvp-ready" ? (
            <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
              MVP Ready
            </span>
          ) : (
            <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-500">
              Coming Soon
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          {position.title}
        </h1>

        {/* Description */}
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-600">
          {position.description}
        </p>

        {/* Meta row */}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${levelColour[position.level]}`}
          >
            {position.level}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            {position.duration}
          </span>
        </div>
      </div>
    </section>
  );
}
