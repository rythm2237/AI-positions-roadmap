// src/components/landing/CareerPositionsSection.tsx
// Grid of career position cards generated from static data.
// All cards are uniform — no "MVP Ready" special treatment.

import Link from "next/link";
import { careerPositions } from "@/data/careerRoadmaps";
import { CareerPosition, DifficultyLevel } from "@/types/career";

const levelColour: Record<DifficultyLevel, string> = {
  Beginner: "bg-emerald-100 text-emerald-700",
  "Beginner to Intermediate": "bg-yellow-100 text-yellow-700",
  Intermediate: "bg-orange-100 text-orange-700",
  Advanced: "bg-red-100 text-red-700",
};

function CareerCard({ position }: { position: CareerPosition }) {
  const isAvailable = position.status === "mvp-ready";

  return (
    <article className="relative flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      {/* Category + availability */}
      <div className="mb-4 flex items-start justify-between gap-2">
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
          {position.category}
        </span>
        {isAvailable ? (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Available Now
          </span>
        ) : (
          <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-500">
            Coming Soon
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-gray-900">{position.title}</h3>

      {/* Description */}
      <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">
        {position.description}
      </p>

      {/* Meta row */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${levelColour[position.level]}`}
        >
          {position.level}
        </span>
        <span className="text-xs text-gray-400">·</span>
        <span className="text-xs text-gray-500">{position.duration}</span>
      </div>

      {/* Key skills */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {position.keySkills.map((skill) => (
          <span
            key={skill}
            className="rounded-md bg-gray-50 px-2 py-0.5 text-xs text-gray-500 border border-gray-100"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* CTA — same style for all, different label */}
      <div className="mt-5">
        <Link
          href={`/roadmaps/${position.id}`}
          className={`block w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            isAvailable
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          {isAvailable ? "View Roadmap" : "Preview Roadmap"}
        </Link>
      </div>
    </article>
  );
}

export default function CareerPositionsSection() {
  return (
    <section id="roadmaps" className="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose your AI career path
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600">
            Each roadmap is built around a specific role — so you learn exactly
            what you need to become job-ready, nothing more, nothing less.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {careerPositions.map((position) => (
            <CareerCard key={position.id} position={position} />
          ))}
        </div>
      </div>
    </section>
  );
}
