"use client";
// src/components/roadmap/ProjectsSection.tsx
// Portfolio projects section for each roadmap.
// Handles project completion toggle with localStorage persistence.

import { RoadmapProject, ProgressState, Difficulty } from "@/types/roadmap";
import { toggleProjectComplete } from "@/lib/roadmapProgress";

interface ProjectsSectionProps {
  projects: RoadmapProject[];
  slug: string;
  progress: ProgressState;
  onProgressUpdate: (updated: ProgressState) => void;
}

const difficultyColour: Record<Difficulty, string> = {
  Beginner: "bg-emerald-100 text-emerald-700",
  Intermediate: "bg-yellow-100 text-yellow-700",
  Advanced: "bg-red-100 text-red-700",
};

export default function ProjectsSection({
  projects,
  slug,
  progress,
  onProgressUpdate,
}: ProjectsSectionProps) {
  function handleToggle(projectId: string) {
    const updated = toggleProjectComplete(slug, projectId, progress);
    onProgressUpdate(updated);
  }

  const completedCount = (projects ?? []).filter((p) =>
    progress.completedProjects.includes(p.id)
  ).length;

  return (
    <section
      id="projects"
      className="bg-gray-50 border-t border-b border-gray-100 px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-1">
              Portfolio Projects
            </h2>
            <p className="text-sm text-gray-500">
              Real-world projects to build your portfolio and demonstrate
              job-ready skills.
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-2xl font-extrabold text-indigo-600">
              {completedCount}
            </span>
            <span className="text-sm text-gray-400">/{(projects ?? []).length} done</span>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(projects ?? []).map((project) => {
            const isCompleted = progress.completedProjects.includes(project.id);
            return (
              <article
                key={project.id}
                className={`relative flex flex-col rounded-2xl border p-5 transition-all ${
                  isCompleted
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-gray-200 bg-white hover:border-indigo-200 hover:shadow-md"
                }`}
              >
                {/* Completion badge */}
                {isCompleted && (
                  <div className="absolute top-4 right-4">
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      Done
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        difficultyColour[project.difficulty]
                      }`}
                    >
                      {project.difficulty}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
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
                      {project.estimatedTime}
                    </span>
                  </div>
                  <h3
                    className={`text-base font-bold ${
                      isCompleted ? "text-emerald-800" : "text-gray-900"
                    }`}
                  >
                    {project.title}
                  </h3>
                </div>

                {/* Scenario */}
                <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1">
                  {project.scenario}
                </p>

                {/* Skills */}
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Skills practiced
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-xs text-indigo-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Deliverables */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Deliverables
                  </p>
                  <ul className="flex flex-col gap-1">
                    {project.deliverables.map((d) => (
                      <li
                        key={d}
                        className="flex items-center gap-2 text-xs text-gray-600"
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0"
                          aria-hidden="true"
                        />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Toggle button */}
                <button
                  onClick={() => handleToggle(project.id)}
                  className={`w-full rounded-xl py-2.5 text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    isCompleted
                      ? "bg-emerald-500 text-white hover:bg-emerald-600"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  {isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
