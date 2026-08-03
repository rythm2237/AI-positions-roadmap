import type { WorkspaceDifficulty } from "@/types/careerWorkspace";

export type RequiredLearningMode = "reading" | "video" | "practice";

export interface ResourceRequirement {
  id: string;
  careerSlug: string;
  milestoneId: string;
  topic: string;
  requiredModes: ["reading", "video", "practice"];
  requiredLearningOutcomes: string[];
  skillLevel: WorkspaceDifficulty;
  allowedContentTypes: string[];
  preferredProviders?: string[];
  officialPreferred: boolean;
  freePreferred: boolean;
  estimatedDuration: {
    minMinutes: number;
    maxMinutes: number;
  };
  resourceIds: string[];
}
