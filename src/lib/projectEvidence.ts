import type { CareerProject } from "@/types/careerWorkspace";

export type ProjectCriterionId = "problem" | "implementation" | "evidence" | "quality" | "reflection";

export interface ProjectRubricCriterion {
  id: ProjectCriterionId;
  label: string;
  description: string;
  weight: number;
}

export interface ProjectSubmission {
  projectId: string;
  summary: string;
  artifactUrl?: string;
  repositoryUrl?: string;
  evidence: string;
  limitations: string;
  submittedAt: string;
}

export interface ProjectCriterionReview {
  id: ProjectCriterionId;
  score: number;
  feedback: string;
}

export interface ProjectReview {
  projectId: string;
  overallScore: number;
  passed: boolean;
  level: "needs-work" | "portfolio-ready" | "job-ready";
  criteria: ProjectCriterionReview[];
  strengths: string[];
  improvements: string[];
  recruiterSummary: string;
  reviewedAt: string;
  reviewer: "ai" | "fallback";
}

export const PROJECT_PASSING_SCORE = 70;
export const PROJECT_JOB_READY_SCORE = 85;

export const PROJECT_RUBRIC: ProjectRubricCriterion[] = [
  { id: "problem", label: "Problem framing", description: "Defines the business/user problem, constraints, and success criteria clearly.", weight: 15 },
  { id: "implementation", label: "Implementation", description: "Shows technically credible decisions and demonstrates the career-relevant skills claimed by the project.", weight: 30 },
  { id: "evidence", label: "Evidence", description: "Provides inspectable outputs, measurements, repository/artifact links, or other verifiable evidence.", weight: 25 },
  { id: "quality", label: "Professional quality", description: "Communicates assumptions, structure, testing/validation, usability, and maintainability at a professional standard.", weight: 20 },
  { id: "reflection", label: "Reflection", description: "Explains limitations, trade-offs, lessons learned, and realistic next improvements.", weight: 10 },
];

export function validateProjectSubmission(project: CareerProject, submission: ProjectSubmission): string[] {
  const errors: string[] = [];
  if (submission.projectId !== project.id) errors.push("Submission does not match this project.");
  if (submission.summary.trim().length < 80) errors.push("Explain what you built and why in at least 80 characters.");
  if (submission.evidence.trim().length < 80) errors.push("Provide concrete evidence or results in at least 80 characters.");
  if (submission.limitations.trim().length < 30) errors.push("Describe limitations or trade-offs in at least 30 characters.");
  if (!submission.artifactUrl?.trim() && !submission.repositoryUrl?.trim()) errors.push("Add at least one artifact or repository URL.");
  return errors;
}

export function projectReviewLevel(score: number): ProjectReview["level"] {
  if (score >= PROJECT_JOB_READY_SCORE) return "job-ready";
  if (score >= PROJECT_PASSING_SCORE) return "portfolio-ready";
  return "needs-work";
}

export function isQualifiedProjectReview(review: ProjectReview | undefined): boolean {
  return Boolean(review?.passed && review.overallScore >= PROJECT_PASSING_SCORE);
}

export function projectEvidenceStorageKey(careerSlug: string): string {
  return `career_project_evidence__${careerSlug}`;
}
