"use client";
// src/components/roadmap/RoadmapPageClient.tsx
// Client component that owns all interactive state for the roadmap page.
// Loaded by the server page.tsx — keeps server/client boundary clean.
// Block 3: wires in RoadmapProgressDashboard, RoadmapResetButton,
//           and RoadmapCertificatePreview.

import { useState, useEffect } from "react";
import { Roadmap, ProgressState } from "@/types/roadmap";
import { loadProgress, defaultProgress } from "@/lib/roadmapProgress";

import RoadmapNavigation from "./RoadmapNavigation";
import RoadmapHeader from "./RoadmapHeader";
import RoadmapVisualOverview from "./RoadmapVisualOverview";
import RoadmapTimeline from "./RoadmapTimeline";
import PhaseAccordion from "./PhaseAccordion";
import ProjectsSection from "./ProjectsSection";
import NotesSummaryPanel from "./NotesSummaryPanel";
import RoadmapProgressDashboard from "./RoadmapProgressDashboard";
import RoadmapResetButton from "./RoadmapResetButton";
import RoadmapCertificatePreview from "./RoadmapCertificatePreview";
import RoadmapVisualButton from "./RoadmapVisualButton";
import Footer from "@/components/landing/Footer";

interface RoadmapPageClientProps {
  roadmap: Roadmap;
}

export default function RoadmapPageClient({ roadmap }: RoadmapPageClientProps) {
  const [progress, setProgress] = useState<ProgressState>(defaultProgress());
  const [mounted, setMounted] = useState(false);

  // Load localStorage only after mount (SSR-safe)
  useEffect(() => {
    setProgress(loadProgress(roadmap.slug));
    setMounted(true);
  }, [roadmap.slug]);

  function handleProgressUpdate(updated: ProgressState) {
    setProgress(updated);
  }

  function handleReset(fresh: ProgressState) {
    setProgress(fresh);
  }

  // Don't render interactive elements until mounted (avoids hydration mismatch)
  if (!mounted) {
    return (
      <>
        <RoadmapNavigation />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div
              className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"
              aria-label="Loading"
            />
            <p className="text-sm text-gray-500">Loading your roadmap…</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <RoadmapNavigation />
      <main>
        {/* 1. Hero header + progress summary */}
        <RoadmapHeader
          roadmap={roadmap}
          progress={progress}
          resetSlot={
            <RoadmapResetButton slug={roadmap.slug} onReset={handleReset} />
          }
        />

        {/* 2. Visual overview */}
        <RoadmapVisualOverview phases={roadmap.phases} progress={progress} />

        {/* 3. Timeline */}
        <RoadmapTimeline
          phases={roadmap.phases}
          duration={roadmap.duration}
          progress={progress}
        />

        {/* 4. Phase accordions */}
        <section id="phases" className="bg-white px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">
              Phases &amp; Sections
            </h2>
            <p className="text-sm text-gray-500 mb-8">
              Work through each phase in order. Phase 1 is free — no account
              required.
            </p>
            <div className="flex flex-col gap-4">
              {(roadmap.phases ?? []).map((phase, idx) => (
                <PhaseAccordion
                  key={phase.id}
                  phase={phase}
                  slug={roadmap.slug}
                  isOpenDefault={idx === 0}
                  progress={progress}
                  onProgressUpdate={handleProgressUpdate}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 5. Projects */}
        <ProjectsSection
          projects={roadmap.projects}
          slug={roadmap.slug}
          progress={progress}
          onProgressUpdate={handleProgressUpdate}
        />

        {/* 6. Notes summary */}
        <NotesSummaryPanel roadmap={roadmap} progress={progress} />

        {/* 7. Completion certificate (only shown at 100%) */}
        <RoadmapCertificatePreview roadmap={roadmap} progress={progress} />
      </main>

      {/* 8. Floating progress dashboard (sticky bottom-right) */}
      <RoadmapProgressDashboard roadmap={roadmap} progress={progress} />
      <RoadmapVisualButton slug={roadmap.slug} />

      <Footer />
    </>
  );
}
