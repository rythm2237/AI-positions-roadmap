// src/components/roadmap/RoadmapSkills.tsx
// Displays the key skills for a career position as styled tags.

interface RoadmapSkillsProps {
  skills: string[];
}

export default function RoadmapSkills({ skills }: RoadmapSkillsProps) {
  return (
    <section className="bg-gray-50 border-t border-b border-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
          Skills You&apos;ll Build
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          By the end of this roadmap, you&apos;ll be confident in all of the following areas.
        </p>

        <div className="flex flex-wrap gap-3">
          {skills.map((skill) => (
            <span
              key={skill}
              className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-medium text-indigo-700 shadow-sm"
            >
              {/* Checkmark icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-indigo-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
