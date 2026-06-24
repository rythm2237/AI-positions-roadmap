// src/components/roadmap/RecommendedCoursesSection.tsx
// Displays curated, verified course recommendations per roadmap.
// Real URLs to Udemy, DeepLearning.AI, Coursera, and free resources.

import { RecommendedCourse } from "@/types/roadmap";

interface RecommendedCoursesSectionProps {
  courses: RecommendedCourse[];
}

const providerColour: Record<string, string> = {
  Udemy: "bg-orange-100 text-orange-700",
  "DeepLearning.AI": "bg-blue-100 text-blue-700",
  Coursera: "bg-blue-100 text-blue-700",
  "Microsoft Learn": "bg-sky-100 text-sky-700",
  "n8n Academy": "bg-indigo-100 text-indigo-700",
  "Make Academy": "bg-purple-100 text-purple-700",
  YouTube: "bg-red-100 text-red-700",
  Free: "bg-emerald-100 text-emerald-700",
};

const levelColour: Record<string, string> = {
  Beginner: "bg-emerald-50 text-emerald-600",
  Intermediate: "bg-yellow-50 text-yellow-700",
  Advanced: "bg-red-50 text-red-600",
};

function CourseCard({ course }: { course: RecommendedCourse }) {
  const providerClass =
    providerColour[course.provider] ?? "bg-gray-100 text-gray-600";
  const levelClass = levelColour[course.level] ?? "bg-gray-100 text-gray-600";
  const isFree = course.price === "Free";

  return (
    <a
      href={course.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-indigo-200"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${providerClass}`}>
          {course.provider}
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
            isFree
              ? "bg-emerald-100 text-emerald-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {course.price}
        </span>
      </div>

      {/* Title */}
      <h4 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-indigo-700 transition-colors">
        {course.title}
      </h4>

      {/* Highlights */}
      <p className="mt-2 text-xs text-gray-500 leading-relaxed flex-1">
        {course.highlights}
      </p>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${levelClass}`}>
          {course.level}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
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
          ~{course.durationHours}h
        </span>
        <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:text-indigo-800">
          View course
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </span>
      </div>
    </a>
  );
}

export default function RecommendedCoursesSection({
  courses,
}: RecommendedCoursesSectionProps) {
  if (!courses || courses.length === 0) return null;

  return (
    <section
      id="courses"
      className="bg-gray-50 border-b border-gray-100 px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">
            Recommended Courses
          </h2>
          <p className="text-sm text-gray-500 max-w-2xl">
            Curated, verified courses from trusted platforms. These are the best
            resources to complement each phase of your roadmap — selected for
            quality, relevance, and value.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.url} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}
