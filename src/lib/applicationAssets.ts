import type { CareerWorkspaceData } from "@/types/careerWorkspace";
import type { JobMatchInput, JobMatchResult } from "@/lib/jobMatch";
import type { ProjectReview } from "@/lib/projectEvidence";

export interface ApplicationAssetPack {
  targetRole: string;
  atsKeywords: string[];
  cvEvidenceBullets: string[];
  linkedinHeadline: string;
  linkedinAbout: string;
  coverLetterEvidence: string[];
  unsupportedGaps: string[];
  integrityNote: string;
}

export function buildApplicationAssetPack(
  career: CareerWorkspaceData,
  input: JobMatchInput,
  result: JobMatchResult,
  reviews: Record<string, ProjectReview>
): ApplicationAssetPack {
  const qualifiedProjects = career.projects.filter((project) => reviews[project.id]?.passed);
  const atsKeywords = result.matchedSkills.slice(0, 12);

  const cvEvidenceBullets = qualifiedProjects.slice(0, 4).map((project) => {
    const review = reviews[project.id];
    const supportedSkills = project.skills.filter((skill) =>
      result.matchedSkills.some((matched) => matched.toLowerCase() === skill.toLowerCase())
    );
    const skillText = supportedSkills.length ? ` Demonstrated: ${supportedSkills.join(", ")}.` : "";
    return `${project.title}: ${review.recruiterSummary}${skillText}`;
  });

  const headlineSkills = atsKeywords.slice(0, 3);
  const linkedinHeadline = headlineSkills.length
    ? `${career.title} | ${headlineSkills.join(" | ")}`
    : career.title;

  const evidenceSummary = qualifiedProjects.length
    ? `Portfolio evidence includes ${qualifiedProjects.slice(0, 3).map((item) => item.title).join(", ")}.`
    : "No reviewed project evidence is available yet.";
  const skillSummary = atsKeywords.length
    ? `Evidence currently aligns with ${atsKeywords.slice(0, 5).join(", ")}.`
    : "No JD-specific skill evidence has been matched yet.";
  const linkedinAbout = `${career.title} candidate building evidence through validated learning and reviewed project work. ${evidenceSummary} ${skillSummary}`;

  const coverLetterEvidence = [
    `Target role: ${input.title}${input.company ? ` at ${input.company}` : ""}.`,
    ...cvEvidenceBullets.slice(0, 3),
    ...(result.missingSkills.length
      ? [`Do not claim these gaps as experience: ${result.missingSkills.slice(0, 6).join(", ")}.`]
      : []),
  ];

  return {
    targetRole: input.title,
    atsKeywords,
    cvEvidenceBullets,
    linkedinHeadline,
    linkedinAbout,
    coverLetterEvidence,
    unsupportedGaps: result.missingSkills,
    integrityNote:
      "Use only claims supported by your reviewed project evidence and real work history. Do not convert JD requirements into experience you have not demonstrated.",
  };
}
