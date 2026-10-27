import type { CareerResource } from "@/types/careerWorkspace";
import type { ResolvedReference, ReferenceLearningMode } from "@/types/reference";
import { resolveReference } from "@/lib/references/referenceResolver";

function modeFor(resource: CareerResource): ReferenceLearningMode {
  if (resource.type === "Video") return "video";
  if (resource.type === "Course" || resource.type === "Learning Path") return "course";
  if (resource.type === "Practice" || resource.type === "Exam") return "practice";
  return "reading";
}

export function resolveWorkspaceResource(resource: CareerResource): ResolvedReference | null {
  const metadata = resource.registryMetadata;
  if (metadata) {
    return {
      id: resource.id,
      title: resource.title,
      provider: resource.provider,
      description: resource.whyUseful,
      type: metadata.contentType,
      canonicalUrl: resource.url,
      url: resource.url,
      isOfficial: metadata.isOfficial,
      topics: [],
      skillLevels: [],
      languages: metadata.language ? [metadata.language] : [],
      priority: resource.priority,
      access: resource.cost,
      durationLabel: resource.estimatedTime,
      segments: [],
      learningOptions: resource.learningOptions,
      status: metadata.status,
      lastVerifiedAt: metadata.verifiedAt,
      reviewIntervalDays: metadata.reviewIntervalDays ?? 30,
      nextReviewAt: metadata.nextReviewAt ?? metadata.verifiedAt,
      available: metadata.status === "active",
      warning: metadata.status === "active" ? undefined : `This resource is ${metadata.status}.`,
    };
  }
  const reference = resolveReference(resource.id, true);
  if (reference) return reference;
  return null;
}

export function resolveWorkspaceStageResources(resources: CareerResource[], careerResources: CareerResource[]) {
  return resources
    .map((resource) => {
      const canonical = careerResources.find((candidate) => candidate.id === resource.id) ?? resource;
      return resolveWorkspaceResource(canonical);
    })
    .filter((resource): resource is ResolvedReference => Boolean(resource));
}

