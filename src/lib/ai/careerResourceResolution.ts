import type { CareerWorkspaceData, CareerResource } from "@/types/careerWorkspace";
import type { CareerResourceMapping } from "@/types/careerGeneration";
import type { ResourceRequirement } from "@/types/resourceRequirement";
import { isDirectLearningDestination } from "@/lib/references/referenceDestinationPolicy";

export type RegistryResource = {
  id: string;
  canonical_url: string;
  mode: "reading" | "video" | "course" | "practice";
  title: string;
  provider: string;
  content_type: string;
  cost: "Free" | "Paid" | "Free/Paid";
  is_official: boolean;
  direct_destination_verified: boolean;
  status: "active" | "needs_review" | "broken" | "replaced" | "retired";
  verified_at: string | null;
  next_review_at: string | null;
  source_metadata: Record<string, unknown>;
};

export type ResolvedResourceAssignment = {
  requirementId: string;
  milestoneId: string;
  mode: RegistryResource["mode"];
  resourceId: string;
};

const stopWords = new Set(["and", "the", "for", "with", "from", "into", "this", "that", "your", "role", "career", "skill", "skills", "learn", "learning", "understand", "demonstrate", "apply", "build", "use", "using"]);

function tokens(value: string) {
  return new Set(value.toLocaleLowerCase("en").replace(/[^a-z0-9]+/g, " ").split(/\s+/).filter((token) => token.length > 2 && !stopWords.has(token)));
}

function candidateScore(requirement: ResourceRequirement, resource: RegistryResource) {
  const intent = tokens([requirement.topic, ...requirement.requiredLearningOutcomes].join(" "));
  const metadata = resource.source_metadata && typeof resource.source_metadata === "object"
    ? JSON.stringify(resource.source_metadata)
    : "";
  const evidence = tokens(`${resource.title} ${resource.provider} ${resource.content_type} ${resource.canonical_url} ${metadata}`);
  if (!intent.size || !evidence.size) return 0;
  let matches = 0;
  for (const token of intent) if (evidence.has(token)) matches += 1;
  return matches / intent.size;
}

function typeForMode(mode: RegistryResource["mode"]): CareerResource["type"] {
  if (mode === "video") return "Video";
  if (mode === "course") return "Course";
  if (mode === "practice") return "Practice";
  return "Documentation";
}

function toCareerResource(resource: RegistryResource): CareerResource {
  const metadata = resource.source_metadata ?? {};
  const estimatedTime = typeof metadata.estimatedTime === "string" ? metadata.estimatedTime : "30–60 minutes";
  const whyUseful = typeof metadata.whyUseful === "string" ? metadata.whyUseful : `Supports this milestone through ${resource.title}.`;
  const priority = metadata.priority === "Essential" ? "Essential" : "Recommended";
  return {
    id: resource.id,
    title: resource.title,
    type: typeForMode(resource.mode),
    provider: resource.provider,
    cost: resource.cost,
    estimatedTime,
    whyUseful,
    url: resource.canonical_url,
    priority,
  };
}

function verifiedAndRelevant(resource: RegistryResource, requirement: ResourceRequirement, now: number) {
  if (resource.status !== "active" || !resource.direct_destination_verified || !resource.verified_at) return false;
  if (resource.next_review_at && Date.parse(resource.next_review_at) < now) return false;
  if (!isDirectLearningDestination({ mode: resource.mode, url: resource.canonical_url, contentType: resource.content_type })) return false;
  const score = candidateScore(requirement, resource);
  const topicTerms = tokens(requirement.topic);
  const minimumScore = topicTerms.size < 3 ? 0.5 : 0.28;
  return score >= minimumScore;
}

/**
 * Resolve from the canonical DB catalog only. This function never creates
 * resources or links; weak matches stay explicit gaps for Admin curation.
 */
export function resolveExistingResources(
  workspace: CareerWorkspaceData,
  catalog: RegistryResource[],
  now = Date.now(),
) {
  const requirements = workspace.resourceRequirements ?? [];
  const resourceById = new Map<string, RegistryResource>();
  const assignments: ResolvedResourceAssignment[] = [];
  const mappings: CareerResourceMapping[] = [];
  const updatedRequirements = requirements.map((requirement) => {
    const eligible = catalog.filter((item) => verifiedAndRelevant(item, requirement, now));
    const selected = new Map<RegistryResource["mode"], RegistryResource>();
    for (const mode of requirement.requiredModes) {
      const best = eligible.filter((item) => item.mode === mode).sort((a, b) => candidateScore(requirement, b) - candidateScore(requirement, a))[0];
      if (best) selected.set(mode, best);
    }
    const adaptiveModes = requirement.adaptiveModes ?? [];
    const adaptiveCount = requirement.minimumAdaptiveModes ?? (adaptiveModes.length ? 1 : 0);
    for (const mode of adaptiveModes) {
      if (selected.size >= requirement.requiredModes.length + adaptiveCount) break;
      const best = eligible.filter((item) => item.mode === mode && ![...selected.values()].some((row) => row.id === item.id))
        .sort((a, b) => candidateScore(requirement, b) - candidateScore(requirement, a))[0];
      if (best) selected.set(mode, best);
    }

    for (const [mode, resource] of selected) {
      resourceById.set(resource.id, resource);
      assignments.push({ requirementId: requirement.id, milestoneId: requirement.milestoneId, mode, resourceId: resource.id });
    }
    const mapping: CareerResourceMapping = {
      requirementId: requirement.id,
      milestoneId: requirement.milestoneId,
      ...(selected.get("reading") ? { reading: selected.get("reading")!.id } : {}),
      ...(selected.get("video") ? { video: selected.get("video")!.id } : {}),
      ...(selected.get("course") ? { course: selected.get("course")!.id } : {}),
      ...(selected.get("practice") ? { practice: selected.get("practice")!.id } : {}),
      status: selected.size ? "needs-review" : "pending",
    };
    mappings.push(mapping);

    const ids = [...new Set([...requirement.resourceIds, ...[...selected.values()].map((resource) => resource.id)])];
    return { ...requirement, resourceIds: ids };
  });

  const finalMappings = mappings;
  const resolvedWorkspace: CareerWorkspaceData = {
    ...workspace,
    globalResources: [...resourceById.values()].map(toCareerResource),
    resourceRequirements: updatedRequirements,
    resourceMappings: finalMappings,
    generationMetadata: {
      model: workspace.generationMetadata?.model ?? "unknown",
      generatedAt: workspace.generationMetadata?.generatedAt ?? new Date().toISOString(),
      blueprintStatus: "generated",
      resourceStatus: resourceById.size ? "needs-review" : "pending",
    },
  };

  return { workspace: resolvedWorkspace, assignments, resourceReuseCount: resourceById.size };
}
