"use client";
// src/components/roadmap/RoadmapNavigation.tsx
// Sticky in-page navigation for the roadmap page.
// Block 3: active section highlighting via IntersectionObserver.

import Link from "next/link";
import { useState } from "react";
import { useRoadmapScroll } from "@/hooks/useRoadmapScroll";

const navItems = [
  { label: "Overview", href: "#overview", id: "overview" },
  { label: "Timeline", href: "#timeline", id: "timeline" },
  { label: "Phases", href: "#phases", id: "phases" },
  { label: "Projects", href: "#projects", id: "projects" },
  { label: "Courses", href: "#courses", id: "courses" },
  { label: "Career", href: "#career-readiness", id: "career-readiness" },
  { label: "Notes", href: "#notes", id: "notes" },
];

export default function RoadmapNavigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeSection = useRoadmapScroll();

  return (
    <nav
      className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm"
      aria-label="Roadmap navigation"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Back link */}
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors shrink-0"
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
            <span className="hidden sm:inline">All Roadmaps</span>
          </Link>

          {/* Desktop jump links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </a>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden flex items-center gap-1.5 text-sm font-medium text-gray-600 px-2 py-1 rounded"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
            Jump to
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-2 flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
