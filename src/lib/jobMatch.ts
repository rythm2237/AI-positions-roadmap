import type { CareerWorkspaceData, CareerWorkspaceProgress } from "@/types/careerWorkspace";
import { getJobReadinessReport } from "@/lib/jobReadiness";

export type ApplyDecision = "apply" | "conditional" | "build-gap";

export interface JobMatchInput {
  title: string;
  company?: string;
  description: string;
}

export interface JobMatchResult {
  matchScore: number;
  decision: ApplyDecision;
  titleRelevance: number;
  readinessScore: number;
  requiredSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  evidenceProjects: string[];
  reasons: string[];
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9+#.\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function careerSkillUniverse(career: CareerWorkspaceData): string[] {
  return unique([
    ...career.projects.flatMap((project) => project.skills),
    ...career.journeyStages.flatMap((stage) => [stage.title, ...(stage.topicAssessments ?? []).map((a) => a.topicLabel ?? a.title)]),
  ]).filter((skill) => skill.length >= 2);
}

export function analyzeJobMatch(
  career: CareerWorkspaceData,
  progress: CareerWorkspaceProgress,
  input: JobMatchInput
): JobMatchResult {
  const readiness = getJobReadinessReport(career, progress);
  const jd = normalize(`${input.title} ${input.description}`);
  const skillUniverse = careerSkillUniverse(career);
  const requiredSkills = skillUniverse.filter((skill) => jd.includes(normalize(skill)));

  const qualifiedProjects = career.projects.filter((project) => progress.completedProjects.includes(project.id));
  const demonstratedSkills = unique(qualifiedProjects.flatMap((project) => project.skills));
  const matchedSkills = requiredSkills.filter((skill) => demonstratedSkills.some((known) => normalize(known) === normalize(skill)));
  const missingSkills = requiredSkills.filter((skill) => !matchedSkills.includes(skill));

  const skillCoverage = requiredSkills.length === 0 ? 50 : Math.round((matchedSkills.length / requiredSkills.length) * 100);
  const titleTokens = unique(normalize(career.title).split(" ").filter((token) => token.length > 2));
  const titleText = normalize(input.title);
  const titleHits = titleTokens.filter((token) => titleText.includes(token)).length;
  const titleRelevance = titleTokens.length ? Math.round((titleHits / titleTokens.length) * 100) : 50;
  const matchScore = Math.round(skillCoverage * 0.55 + readiness.score * 0.25 + titleRelevance * 0.2);

  const decision: ApplyDecision =
    matchScore >= 75 && readiness.band === "application-ready"
      ? "apply"
      : matchScore >= 60 && readiness.band !== "building"
        ? "conditional"
        : "build-gap";

  const reasons = [
    `${skillCoverage}% of career-specific skills detected in this JD are backed by qualified project evidence.`,
    `Current evidence-based job readiness is ${readiness.score}% (${readiness.band}).`,
    `${titleRelevance}% title relevance to the selected career path.`,
  ];

  if (requiredSkills.length === 0) {
    reasons.push("No explicit career-specific skill terms were detected, so the skill component is intentionally neutral rather than inferred.");
  }

  return {
    matchScore,
    decision,
    titleRelevance,
    readinessScore: readiness.score,
    requiredSkills,
    matchedSkills,
    missingSkills,
    evidenceProjects: qualifiedProjects.map((project) => project.title),
    reasons,
  };
}

export function jobMatchStorageKey(careerSlug: string): string {
  return `career_job_matches__${careerSlug}`;
}
