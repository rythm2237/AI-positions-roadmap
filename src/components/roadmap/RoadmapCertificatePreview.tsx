"use client";
// src/components/roadmap/RoadmapCertificatePreview.tsx
// Completion certificate preview shown when the user reaches 100% overall.
// Displayed as a congratulations banner at the bottom of the roadmap page.
// Print-friendly layout — can be screenshot or printed.

import { Roadmap, ProgressState } from "@/types/roadmap";
import { calculateProgress } from "@/lib/roadmapUtils";
import { useRef } from "react";

interface RoadmapCertificatePreviewProps {
  roadmap: Roadmap;
  progress: ProgressState;
}

export default function RoadmapCertificatePreview({
  roadmap,
  progress,
}: RoadmapCertificatePreviewProps) {
  const certRef = useRef<HTMLDivElement>(null);

  const totalSections = (roadmap.phases ?? []).reduce(
    (acc, p) => acc + (p.sections ?? []).length,
    0
  );
  const totalProjects = (roadmap.projects ?? []).length;
  const totalTests = totalSections + (roadmap.phases ?? []).length;

  const overallPct = calculateProgress(
    roadmap.slug,
    progress,
    totalSections,
    totalProjects,
    totalTests
  );

  // Only show when fully complete
  if (overallPct < 100) return null;

  const completedDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function handlePrint() {
    window.print();
  }

  return (
    <section
      id="certificate"
      className="bg-gradient-to-br from-indigo-50 to-purple-50 border-t border-indigo-100 px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-4xl">
        {/* Announcement */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-emerald-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-sm font-bold text-emerald-700">
              Roadmap Complete!
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            🎉 Congratulations!
          </h2>
          <p className="text-base text-gray-600 max-w-xl mx-auto">
            You have completed the full{" "}
            <strong>{roadmap.title}</strong> roadmap. Here is your
            completion certificate.
          </p>
        </div>

        {/* Certificate card */}
        <div
          ref={certRef}
          className="relative rounded-3xl border-2 border-indigo-200 bg-white shadow-xl overflow-hidden print:shadow-none print:border-gray-300"
        >
          {/* Decorative top bar */}
          <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          <div className="px-8 py-10 sm:px-14 sm:py-12 text-center">
            {/* Logo / brand */}
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-6">
              AI Career Roadmaps
            </p>

            {/* Certificate title */}
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-2">
              Certificate of Completion
            </p>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gray-200" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-indigo-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="6" />
                <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
              </svg>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Roadmap name */}
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 leading-tight">
              {roadmap.title}
            </h3>

            {/* Meta */}
            <p className="text-sm text-gray-500 mb-1">
              {roadmap.duration} · {totalSections} sections ·{" "}
              {totalProjects} projects · {roadmap.totalEstimatedHours}h
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center gap-4 mt-6 mb-8">
              <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-5 py-3 text-center">
                <div className="text-2xl font-extrabold text-indigo-700">
                  {totalSections}
                </div>
                <div className="text-xs text-indigo-500 mt-0.5">
                  Sections Completed
                </div>
              </div>
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-5 py-3 text-center">
                <div className="text-2xl font-extrabold text-emerald-700">
                  {totalProjects}
                </div>
                <div className="text-xs text-emerald-500 mt-0.5">
                  Projects Built
                </div>
              </div>
              <div className="rounded-xl bg-purple-50 border border-purple-100 px-5 py-3 text-center">
                <div className="text-2xl font-extrabold text-purple-700">
                  100%
                </div>
                <div className="text-xs text-purple-500 mt-0.5">
                  Overall Score
                </div>
              </div>
            </div>

            {/* Date */}
            <p className="text-xs text-gray-400">
              Completed on {completedDate}
            </p>

            {/* Decorative bottom note */}
            <p className="mt-6 text-xs text-gray-400 italic">
              This certificate confirms the holder has completed all phases,
              sections, tests, and portfolio projects of this roadmap.
            </p>
          </div>

          {/* Decorative bottom bar */}
          <div className="h-1.5 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400" />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 print:hidden"
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
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print / Save as PDF
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 print:hidden"
          >
            Explore More Roadmaps
          </a>
        </div>
      </div>
    </section>
  );
}
