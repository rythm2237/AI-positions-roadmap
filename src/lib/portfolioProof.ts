import type { CareerProject } from "@/types/careerWorkspace";
import type { ProjectReview, ProjectSubmission } from "@/lib/projectEvidence";
import { isQualifiedProjectReview } from "@/lib/projectEvidence";

export interface PortfolioCaseStudy {
  projectId: string;
  title: string;
  problem: string;
  approach: string;
  evidence: string;
  limitations: string;
  skills: string[];
  score: number;
  level: ProjectReview["level"];
  artifactUrl?: string;
  repositoryUrl?: string;
  recruiterSummary: string;
}

export interface ProofProfilePayload {
  version: 1;
  careerSlug: string;
  careerTitle: string;
  generatedAt: string;
  proofScore: number;
  jobReadyProjects: number;
  portfolioReadyProjects: number;
  caseStudies: PortfolioCaseStudy[];
}

export function buildCaseStudy(project: CareerProject, submission: ProjectSubmission, review: ProjectReview): PortfolioCaseStudy {
  return {
    projectId: project.id,
    title: project.title,
    problem: project.description,
    approach: submission.summary.trim(),
    evidence: submission.evidence.trim(),
    limitations: submission.limitations.trim(),
    skills: project.skills,
    score: review.overallScore,
    level: review.level,
    artifactUrl: submission.artifactUrl?.trim() || undefined,
    repositoryUrl: submission.repositoryUrl?.trim() || undefined,
    recruiterSummary: review.recruiterSummary,
  };
}

export function buildProofProfile(careerSlug: string, careerTitle: string, projects: CareerProject[], evidence: Record<string, { submission?: ProjectSubmission; review?: ProjectReview }>): ProofProfilePayload {
  const caseStudies = projects.flatMap((project) => {
    const item = evidence[project.id];
    if (!item?.submission || !item.review || !isQualifiedProjectReview(item.review)) return [];
    return [buildCaseStudy(project, item.submission, item.review)];
  });
  const proofScore = caseStudies.length ? Math.round(caseStudies.reduce((sum, item) => sum + item.score, 0) / caseStudies.length) : 0;
  return {
    version: 1,
    careerSlug,
    careerTitle,
    generatedAt: new Date().toISOString(),
    proofScore,
    jobReadyProjects: caseStudies.filter((item) => item.level === "job-ready").length,
    portfolioReadyProjects: caseStudies.length,
    caseStudies,
  };
}

export function encodeProofProfile(payload: ProofProfilePayload): string {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export function decodeProofProfile(value: string): ProofProfilePayload | null {
  try {
    const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    if (parsed?.version !== 1 || !Array.isArray(parsed.caseStudies)) return null;
    return parsed as ProofProfilePayload;
  } catch {
    return null;
  }
}
