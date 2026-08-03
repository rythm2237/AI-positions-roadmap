export type MilestoneSkillLevel = "Beginner" | "Intermediate" | "Advanced";

export interface CareerMilestone {
  id: string;
  careerSlug: string;
  stageId: string;
  order: number;
  title: string;
  summary: string;
  skillLevel: MilestoneSkillLevel;
  learningOutcomes: string[];
  skills: string[];
  practicalTask: string;
  deliverables: string[];
  assessmentScope: string[];
  resourceRequirementIds: string[];
}
