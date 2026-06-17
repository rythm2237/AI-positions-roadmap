import Link from "next/link";
import type { Roadmap } from "@/types/roadmap";

interface ComingSoonRoadmapProps {
  roadmap: Roadmap;
}

export default function ComingSoonRoadmap({ roadmap }: ComingSoonRoadmapProps) {
  const previewSections = roadmap.phases.reduce(
    (total, phase) => total + phase.sections.length,
    0
  );

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-gray-100 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
              {roadmap.category}
            </span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              Coming Soon
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
              {roadmap.level}
            </span>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                {roadmap.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">
                {roadmap.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/#waitlist"
                  className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Join Waitlist
                </Link>
                <Link
                  href="/#roadmaps"
                  className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Browse Roadmaps
                </Link>
              </div>
            </div>

            <aside className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700">
                Roadmap Preview
              </h2>
              <dl className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-gray-500">Duration</dt>
                  <dd className="mt-1 text-sm font-bold text-gray-900">
                    {roadmap.duration}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Hours</dt>
                  <dd className="mt-1 text-sm font-bold text-gray-900">
                    {roadmap.totalEstimatedHours}h
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Phases</dt>
                  <dd className="mt-1 text-sm font-bold text-gray-900">
                    {roadmap.phases.length}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Sections</dt>
                  <dd className="mt-1 text-sm font-bold text-gray-900">
                    {previewSections}
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xl font-extrabold text-gray-900">
            What this roadmap will include
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {roadmap.phases.map((phase) => (
              <article
                key={phase.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                  Phase {phase.phaseNumber} · {phase.weekRange}
                </div>
                <h3 className="mt-2 text-base font-bold text-gray-900">
                  {phase.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {phase.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
