import type { CareerWorkspaceSectionId } from "@/types/careerWorkspace";

export const CAREER_NAV_ITEMS: ReadonlyArray<{ id: CareerWorkspaceSectionId; label: string }> = [
  { id: "hero", label: "Hero" },
  { id: "intelligence", label: "Market Intelligence" },
  { id: "roadmap", label: "Roadmap" },
  { id: "learning", label: "Learning" },
  { id: "project", label: "Project" },
  { id: "portfolio", label: "Portfolio" },
  { id: "jobs", label: "Jobs" },
  { id: "interview-brief", label: "Interview Brief" },
];

export function careerSectionHref(slug: string, section: CareerWorkspaceSectionId, stepId?: string) {
  if (section === "hero") return `/careers/${slug}`;
  if (section === "intelligence") return slug === "ai-engineer" ? "/career-intelligence/occupations/ai-ml-engineering" : "/career-intelligence";
  if (section === "learning") return `/careers/${slug}/learning${stepId ? `?step=${encodeURIComponent(stepId)}` : ""}`;
  return `/careers/${slug}?section=${section}`;
}
