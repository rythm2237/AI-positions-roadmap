import { isDirectLearningDestination } from "@/lib/references/referenceDestinationPolicy";
import type {
  CareerAssessment,
  CareerQuizQuestion,
  CareerResource,
  CareerWorkspaceData,
} from "@/types/careerWorkspace";
import type {
  CareerResourceMapping,
  GeneratedLearningResource,
  GeneratedResourcePack,
} from "@/types/careerGeneration";
import type { ManagedCareerResource } from "@/lib/learning/adaptiveLearningContract";

function slugPart(value: string) {
  return value.toLocaleLowerCase("en").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "resource";
}

function resourceType(mode: GeneratedLearningResource["mode"]): CareerResource["type"] {
  if (mode === "video") return "Video";
  if (mode === "course") return "Course";
  if (mode === "practice") return "Practice";
  return "Documentation";
}

function verificationMetadata(generated: GeneratedLearningResource) {
  const verifiedAt = new Date();
  const reviewIntervalDays = generated.official ? 45 : 30;
  const nextReview = new Date(verifiedAt);
  nextReview.setUTCDate(nextReview.getUTCDate() + reviewIntervalDays);
  return {
    contentType: generated.contentType,
    isOfficial: generated.official,
    directDestinationVerified: true,
    verifiedAt: verifiedAt.toISOString(),
    reviewIntervalDays,
    nextReviewAt: nextReview.toISOString(),
    verificationSource: "ai-search+direct-destination-policy",
  };
}

function topicAssessment(
  slug: string,
  stageId: string,
  resource: CareerResource,
  generated: GeneratedLearningResource,
): CareerAssessment {
  const questions: CareerQuizQuestion[] = generated.assessmentSeeds.map((seed, index) => ({
    id: `${slug}-${resource.id}-q${index + 1}`,
    ...seed,
    difficulty: "Intermediate",
    relatedTopic: resource.title,
    referenceId: resource.id,
    status: "needs-review",
    lastReviewedAt: new Date().toISOString().slice(0, 10),
    version: 1,
  }));
  return {
    id: `${stageId}-${resource.id}-assessment`,
    title: `${resource.title} knowledge check`,
    description: `Five questions connecting this resource to the milestone outcomes and professional application.`,
    passingScore: 60,
    assessmentType: "topic",
    topicId: resource.id,
    topicLabel: resource.title,
    durationMinutes: 10,
    questionsPerAttempt: 5,
    officialPracticeLinks: [{ title: resource.title, url: resource.url }],
    questions,
  };
}

export function applyAdaptiveResourcePack(
  workspace: CareerWorkspaceData,
  pack: GeneratedResourcePack,
): CareerWorkspaceData {
  const requirements = workspace.resourceRequirements ?? [];
  const targetRequirement = requirements.find((requirement) => requirement.id === pack.requirementId);
  if (!targetRequirement || targetRequirement.milestoneId !== pack.milestoneId) {
    throw new Error("CAREER_RESOURCE_REQUIREMENT_MISMATCH");
  }

  const registry = new Map<string, CareerResource>(
    workspace.globalResources.map((resource) => [resource.url.replace(/\/$/, "").toLocaleLowerCase("en"), resource]),
  );
  const generatedById = new Map<string, GeneratedLearningResource>();

  for (const generated of pack.resources) {
    if (/youtube\.com|youtu\.be/i.test(generated.canonicalUrl)) {
      throw new Error("CAREER_RESOURCE_DIRECT_YOUTUBE_REJECTED");
    }
    if (!isDirectLearningDestination({
      mode: generated.mode,
      url: generated.canonicalUrl,
      contentType: generated.contentType,
    })) {
      throw new Error(`CAREER_RESOURCE_DESTINATION_REJECTED:${generated.mode}`);
    }
    const canonical = generated.canonicalUrl.replace(/\/$/, "").toLocaleLowerCase("en");
    const existing = registry.get(canonical);
    const resource: CareerResource = existing ?? ({
      id: `${workspace.slug}-${slugPart(generated.provider)}-${slugPart(generated.title)}-${generated.mode}-${registry.size + 1}`,
      title: generated.title,
      type: resourceType(generated.mode),
      provider: generated.provider,
      cost: generated.cost,
      estimatedTime: generated.estimatedTime,
      whyUseful: generated.whyUseful,
      url: generated.canonicalUrl,
      priority: generated.priority,
      ...verificationMetadata(generated),
    } satisfies ManagedCareerResource);
    if (!existing) registry.set(canonical, resource);
    generatedById.set(resource.id, generated);
  }

  const selectedResourceIds = pack.resources
    .map((generated) => registry.get(generated.canonicalUrl.replace(/\/$/, "").toLocaleLowerCase("en"))?.id)
    .filter((id): id is string => Boolean(id));

  if (selectedResourceIds.length !== 3 || new Set(selectedResourceIds).size !== 3) {
    throw new Error("CAREER_RESOURCE_PACK_REGISTRY_INCOMPLETE");
  }

  const updatedRequirements = requirements.map((requirement) =>
    requirement.id === targetRequirement.id
      ? { ...requirement, resourceIds: selectedResourceIds }
      : requirement,
  );

  const resourceById = new Map([...registry.values()].map((resource) => [resource.id, resource]));
  const targetResources = selectedResourceIds
    .map((id) => resourceById.get(id))
    .filter((resource): resource is CareerResource => Boolean(resource));

  const journeyStages = workspace.journeyStages.map((stage) => {
    if (stage.id !== targetRequirement.milestoneId) return stage;
    const assessments = targetResources.flatMap((resource) => {
      const generated = generatedById.get(resource.id);
      return generated ? [topicAssessment(workspace.slug, stage.id, resource, generated)] : [];
    });
    return {
      ...stage,
      resources: targetResources,
      topicAssessments: assessments,
      estimatedEffort: stage.estimatedEffort ? {
        ...stage.estimatedEffort,
        minMinutes: stage.estimatedEffort.breakdown.activities.minMinutes
          + stage.estimatedEffort.breakdown.assessment.minMinutes
          + targetRequirement.estimatedDuration.minMinutes,
        maxMinutes: stage.estimatedEffort.breakdown.activities.maxMinutes
          + stage.estimatedEffort.breakdown.assessment.maxMinutes
          + targetRequirement.estimatedDuration.maxMinutes,
        breakdown: {
          ...stage.estimatedEffort.breakdown,
          resources: {
            minMinutes: targetRequirement.estimatedDuration.minMinutes,
            maxMinutes: targetRequirement.estimatedDuration.maxMinutes,
          },
        },
      } : stage.estimatedEffort,
    };
  });

  const previousMappings = workspace.resourceMappings ?? [];
  const mappingsByRequirement = new Map(previousMappings.map((mapping) => [mapping.requirementId, mapping]));
  const generatedMapping: CareerResourceMapping = {
    requirementId: targetRequirement.id,
    milestoneId: targetRequirement.milestoneId,
    reading: targetResources.find((resource) => ["Documentation", "Article"].includes(resource.type))?.id,
    video: targetResources.find((resource) => resource.type === "Video")?.id,
    course: targetResources.find((resource) => ["Course", "Learning Path"].includes(resource.type))?.id,
    practice: targetResources.find((resource) => ["Practice", "Exam"].includes(resource.type))?.id,
    status: "needs-review",
  };
  if (!generatedMapping.reading || !generatedMapping.video || !(generatedMapping.course || generatedMapping.practice)) {
    generatedMapping.status = "partial";
  }
  mappingsByRequirement.set(targetRequirement.id, generatedMapping);

  const resourceMappings = updatedRequirements.map((requirement) =>
    mappingsByRequirement.get(requirement.id) ?? {
      requirementId: requirement.id,
      milestoneId: requirement.milestoneId,
      status: "pending" as const,
    },
  );

  const referencedResourceIds = new Set(updatedRequirements.flatMap((requirement) => requirement.resourceIds));
  const globalResources = [...registry.values()].filter((resource) => referencedResourceIds.has(resource.id));

  return {
    ...workspace,
    journeyStages,
    globalResources,
    resourceRequirements: updatedRequirements,
    resourceMappings,
    generationMetadata: {
      model: workspace.generationMetadata?.model ?? "openai/gpt-5.4-mini",
      generatedAt: workspace.generationMetadata?.generatedAt ?? new Date().toISOString(),
      blueprintStatus: "reviewed",
      resourceStatus: resourceMappings.every((mapping) => mapping.status === "needs-review")
        ? "needs-review"
        : "generated",
    },
  };
}