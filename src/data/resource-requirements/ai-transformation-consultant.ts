import { AI_TRANSFORMATION_CONSULTANT_MILESTONES } from "@/data/milestones/ai-transformation-consultant";
import type { ResourceRequirement } from "@/types/resourceRequirement";

const preferredProviders = [
  "Microsoft Learn",
  "Google Cloud",
  "AWS",
  "OECD",
  "NIST",
  "World Economic Forum",
  "Prosci",
  "Harvard Business Review",
  "MIT Sloan Management Review",
];

export const AI_TRANSFORMATION_CONSULTANT_RESOURCE_REQUIREMENTS: ResourceRequirement[] =
  AI_TRANSFORMATION_CONSULTANT_MILESTONES.map((milestone) => ({
    id: milestone.resourceRequirementIds[0],
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
      "case-study",
      "interactive-lab",
      "framework",
      "research-report",
    ],
    preferredProviders,
    officialPreferred: true,
    freePreferred: true,
    estimatedDuration: {
      minMinutes: milestone.skillLevel === "Beginner" ? 90 : milestone.skillLevel === "Intermediate" ? 150 : 210,
      maxMinutes: milestone.skillLevel === "Beginner" ? 180 : milestone.skillLevel === "Intermediate" ? 300 : 420,
    },
    resourceIds: [],
  }));
