import { isDirectLearningDestination } from "@/lib/references/referenceDestinationPolicy";
import type { CareerResource, CareerWorkspaceData } from "@/types/careerWorkspace";
import type { CareerResourceMapping } from "@/types/careerGeneration";
import type { ResourceRequirement } from "@/types/resourceRequirement";

export type AdaptiveResourceMetadata = {
  contentType?: string;
  isOfficial?: boolean;
  directDestinationVerified?: boolean;
  verifiedAt?: string;
  reviewIntervalDays?: number;
  nextReviewAt?: string;
  verificationSource?: string;
};

export type ManagedCareerResource = CareerResource & AdaptiveResourceMetadata;

export function adaptResourceRequirement(requirement: ResourceRequirement): ResourceRequirement {
  return {
    ...requirement,
    requiredModes: ["reading", "video"],
    adaptiveModes: ["course", "practice"],
    minimumAdaptiveModes: 1,
    allowedContentTypes: Array.from(new Set([
      ...requirement.allowedContentTypes,
      "documentation",
      "article",
      "official-course",
      "guided-module",
      "video-course",
      "hands-on-lab",
      "interactive-course",
      "exercise-track",
      "notebook",
      "sandbox",
    ])),
  };
}

export function adaptCareerWorkspaceLearningContract(workspace: CareerWorkspaceData): CareerWorkspaceData {
  const resourceRequirements = (workspace.resourceRequirements ?? []).map(adaptResourceRequirement);
  const mapSections = workspace.mapSections.map((section) =>
    section.id === "learning"
      ? {
          ...section,
          summary: "Mapped direct Reading and Video resources plus a relevant Course or genuine hands-on Practice.",
        }
      : section,
  );
  return { ...workspace, resourceRequirements, mapSections };
}

export function mappingHasAdaptiveCoverage(mapping?: CareerResourceMapping) {
  return Boolean(mapping?.reading && mapping.video && (mapping.course || mapping.practice));
}

export function resourceMode(resource: CareerResource): "reading" | "video" | "course" | "practice" {
  if (resource.type === "Video") return "video";
  if (resource.type === "Practice" || resource.type === "Exam") return "practice";
  if (resource.type === "Course" || resource.type === "Learning Path") return "course";
  return "reading";
}

export function resourcePassesDirectDestinationGate(resource: CareerResource) {
  const managed = resource as ManagedCareerResource;
  const mode = resourceMode(resource);
  const contentType = managed.contentType
    ?? (mode === "practice" ? "hands-on-lab" : mode === "course" ? "official-course" : mode === "video" ? "video" : "documentation");
  return isDirectLearningDestination({ mode, url: resource.url, contentType });
}

export function resourceIsFresh(resource: CareerResource, nowOrIndex?: Date | number) {
  const managed = resource as ManagedCareerResource;
  if (!managed.nextReviewAt) return true;
  const now = nowOrIndex instanceof Date ? nowOrIndex : new Date();
  const nextReview = new Date(managed.nextReviewAt);
  return Number.isFinite(nextReview.getTime()) && nextReview.getTime() >= now.getTime();
}

export function requirementHasAdaptiveResources(
  requirement: ResourceRequirement,
  mapping: CareerResourceMapping | undefined,
  resources: CareerResource[],
) {
  if (!mappingHasAdaptiveCoverage(mapping)) return false;
  const ids = [mapping?.reading, mapping?.video, mapping?.course, mapping?.practice].filter((id): id is string => Boolean(id));
  const selected = ids.map((id) => resources.find((resource) => resource.id === id)).filter((resource): resource is CareerResource => Boolean(resource));
  return selected.length >= 3
    && selected.every(resourcePassesDirectDestinationGate)
    && selected.every((resource) => resourceIsFresh(resource));
}