import { CLOUD_ENGINEER_MILESTONES } from "@/data/milestones/cloud-engineer";
import type { ResourceRequirement } from "@/types/resourceRequirement";

const providersByStage: Record<string, string[]> = {
  "cloud-engineer-stage-1": ["AWS", "Microsoft Learn", "Google Cloud"],
  "cloud-engineer-stage-2": ["AWS", "Microsoft Learn", "Google Cloud"],
  "cloud-engineer-stage-3": ["AWS", "Microsoft Learn", "Google Cloud", "Cloud Security Alliance"],
  "cloud-engineer-stage-4": ["AWS", "Microsoft Learn", "Google Cloud"],
  "cloud-engineer-stage-5": ["HashiCorp", "GitHub", "AWS", "Microsoft Learn", "Google Cloud"],
  "cloud-engineer-stage-6": ["Kubernetes", "Docker", "AWS", "Microsoft Learn", "Google Cloud"],
  "cloud-engineer-stage-7": ["Google SRE", "OpenTelemetry", "AWS", "Microsoft Learn", "Google Cloud"],
  "cloud-engineer-stage-8": ["FinOps Foundation", "AWS", "Microsoft Learn", "Google Cloud"],
  "cloud-engineer-stage-9": ["AWS", "Microsoft Learn", "Google Cloud", "HashiCorp", "Kubernetes"],
  "cloud-engineer-stage-10": ["AWS", "Microsoft Learn", "Google Cloud"],
};

const durationByLevel = {
  Beginner: { minMinutes: 90, maxMinutes: 180 },
  Intermediate: { minMinutes: 150, maxMinutes: 300 },
  Advanced: { minMinutes: 210, maxMinutes: 420 },
} as const;

export const CLOUD_ENGINEER_RESOURCE_REQUIREMENTS: ResourceRequirement[] =
  CLOUD_ENGINEER_MILESTONES.map((milestone) => ({
    id: `${milestone.id}-resource-requirement`,
    careerSlug: milestone.careerSlug,
    milestoneId: milestone.id,
    topic: milestone.title,
    requiredModes: ["reading", "video", "practice"],
    requiredLearningOutcomes: milestone.learningOutcomes,
    skillLevel: milestone.skillLevel,
    allowedContentTypes: [
      "documentation",
      "guided-module",
      "video-series",
      "interactive-lab",
      "sandbox",
      "reference-architecture",
      "case-study",
    ],
    preferredProviders: providersByStage[milestone.stageId] ?? [],
    officialPreferred: true,
    freePreferred: true,
    estimatedDuration: durationByLevel[milestone.skillLevel],
    resourceIds: [],
  }));
