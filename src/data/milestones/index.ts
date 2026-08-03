import { AI_INTEGRATION_SPECIALIST_MILESTONES } from "@/data/milestones/ai-integration-specialist";
import { CLOUD_ENGINEER_MILESTONES } from "@/data/milestones/cloud-engineer";
import type { CareerMilestone } from "@/types/careerMilestone";

const MILESTONES_BY_CAREER: Record<string, CareerMilestone[]> = {
  "ai-integration-specialist": AI_INTEGRATION_SPECIALIST_MILESTONES,
  "cloud-engineer": CLOUD_ENGINEER_MILESTONES,
};

export function getCareerMilestones(careerSlug: string): CareerMilestone[] {
  return MILESTONES_BY_CAREER[careerSlug] ?? [];
}
