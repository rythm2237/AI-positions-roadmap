import type { WorkspaceDifficulty } from "@/types/careerWorkspace";

export type RequiredLearningMode = "reading" | "video" | "course" | "practice";

export interface ResourceRequirement {
  id: string;
  careerSlug: string;
  milestoneId: string;
  topic: string;
  /** Core learning modes that must always be present. */
  requiredModes: RequiredLearningMode[];
  /**
   * Optional extension choices. New generated Careers use course-or-practice:
   * choose a direct hands-on Practice only when the topic has a genuine lab,
   * sandbox, executable notebook or guided exercise; otherwise choose Course.
   */
  adaptiveModes?: Array<"course" | "practice">;
  minimumAdaptiveModes?: number;
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