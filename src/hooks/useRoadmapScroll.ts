// src/hooks/useRoadmapScroll.ts
// Custom hook that tracks which section anchor is currently in view.
// Used by RoadmapNavigation to highlight the active section.
// Block 3 addition — progressively enhances the sticky nav.

import { useState, useEffect } from "react";

const SECTION_IDS = ["overview", "timeline", "phases", "projects", "notes", "certificate"] as const;
type SectionId = (typeof SECTION_IDS)[number];

export function useRoadmapScroll(): SectionId | null {
  const [active, setActive] = useState<SectionId | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActive(visible[0].target.id as SectionId);
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      }
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return active;
}
