import { AI_INTEGRATION_SPECIALIST_MILESTONES } from "@/data/milestones/ai-integration-specialist";
import type { ResourceRequirement } from "@/types/resourceRequirement";

export const AI_INTEGRATION_SPECIALIST_RESOURCE_REQUIREMENTS: ResourceRequirement[] =
  AI_INTEGRATION_SPECIALIST_MILESTONES.map((milestone) => ({
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
      "code-lab",
      "case-study",
    ],
    preferredProviders: [],
    officialPreferred: true,
    freePreferred: true,
    estimatedDuration: {
      minMinutes: milestone.skillLevel === "Advanced" ? 240 : milestone.skillLevel === "Intermediate" ? 180 : 120,
      maxMinutes: milestone.skillLevel === "Advanced" ? 480 : milestone.skillLevel === "Intermediate" ? 360 : 240,
    },
    resourceIds: [],
  }));
