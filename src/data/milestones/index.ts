import { CLOUD_ENGINEER_MILESTONES } from "@/data/milestones/cloud-engineer";
import type { CareerMilestone } from "@/types/careerMilestone";

const MILESTONES_BY_CAREER: Record<string, CareerMilestone[]> = {
  "cloud-engineer": CLOUD_ENGINEER_MILESTONES,
};

export function getCareerMilestones(careerSlug: string): CareerMilestone[] {
  return MILESTONES_BY_CAREER[careerSlug] ?? [];
}
