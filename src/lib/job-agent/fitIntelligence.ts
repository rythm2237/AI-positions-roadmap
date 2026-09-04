import type { CanonicalJobCandidate } from "./contracts.ts";
import type { CareerEvidenceItem, FitConfidence, FitExplanation, JobClassification, NormalizedJobSearchIntent } from "../../types/jobAgent.ts";

export type EvidenceGroundedFit = { score: number; confidence: FitConfidence; classification: JobClassification; strengths: string[]; gaps: string[]; explanation: FitExplanation };
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9+#.]+/g, " ").replace(/\s+/g, " ").trim();
const tokens = (value: string) => new Set(normalize(value).split(" ").filter((part) => part.length > 2));
const overlapRatio = (a: string, b: string) => { const left = tokens(a); const right = tokens(b); if (!left.size || !right.size) return 0; return [...left].filter((part) => right.has(part)).length / Math.max(left.size, right.size); };
const demonstratedTypes = new Set(["work_implementation", "project_implementation", "quantified_achievement", "portfolio_artifact"]);

function skillMatch(skill: string, evidence: CareerEvidenceItem[]) {
  const target = normalize(skill);
  return evidence.filter((item) => {
    const label = normalize(item.label);
    return label === target || label.includes(target) || target.includes(label);
  }).sort((a, b) => (demonstratedTypes.has(b.evidenceType) ? 1 : 0) - (demonstratedTypes.has(a.evidenceType) ? 1 : 0) || b.confidence - a.confidence)[0];
}

function skillEvidenceWeight(evidence: CareerEvidenceItem | undefined) {
  if (!evidence) return 0;
  if (demonstratedTypes.has(evidence.evidenceType)) return Math.min(1, evidence.confidence);
  if (evidence.evidenceType === "certification") return Math.min(0.85, evidence.confidence);
  if (evidence.evidenceType === "user_claim") return Math.min(0.45, evidence.confidence);
  return Math.min(0.3, evidence.confidence);
}

export function calculateEvidenceGroundedFit(job: CanonicalJobCandidate, intent: NormalizedJobSearchIntent, evidence: CareerEvidenceItem[]): EvidenceGroundedFit {
  const targets = [intent.primaryTargetRole, ...intent.soft.marketTitleVariants, ...intent.soft.secondaryRoles, ...intent.soft.adjacentRoles];
  const roleSimilarity = Math.max(0, ...targets.map((target) => overlapRatio(job.title, target)));
  const titleExact = targets.some((target) => normalize(job.title).includes(normalize(target)) || normalize(target).includes(normalize(job.title)));
  const role = titleExact ? 25 : Math.round(roleSimilarity * 18);
  const requiredMatches = job.requiredSkills.map((skill) => ({ skill, evidence: skillMatch(skill, evidence) }));
  const preferredMatches = job.preferredSkills.map((skill) => ({ skill, evidence: skillMatch(skill, evidence) }));
  const demonstrated = evidence.filter((item) => demonstratedTypes.has(item.evidenceType));
  const body = normalize(`${job.title} ${job.description}`);
  const demonstratedMatches = demonstrated.filter((item) => body.includes(normalize(item.label)));
  const demonstratedScore = Math.min(20, demonstratedMatches.reduce((sum, item) => sum + (item.evidenceType === "quantified_achievement" ? 6 : 4), 0));
  const requiredScore = job.requiredSkills.length ? Math.round(requiredMatches.reduce((sum, match) => sum + skillEvidenceWeight(match.evidence), 0) / job.requiredSkills.length * 10) : 5;
  const preferredScore = job.preferredSkills.length ? Math.round(preferredMatches.reduce((sum, match) => sum + skillEvidenceWeight(match.evidence), 0) / job.preferredSkills.length * 5) : 3;
  const roleHistory = evidence.find((item) => item.evidenceType === "role_history" && item.durationMonths !== null);
  const experience = roleHistory?.durationMonths ? Math.min(10, Math.round(roleHistory.durationMonths / 12)) : demonstrated.length ? 6 : 2;
  const seniority = job.seniority ? 4 : 2;
  const industry = intent.soft.targetIndustries.some((item) => body.includes(normalize(item))) ? 5 : intent.soft.targetIndustries.length ? 1 : 3;
  const languages = job.requiredLanguages.length ? (job.requiredLanguages.every((language) => evidence.some((item) => item.evidenceType === "language" && normalize(item.label).includes(normalize(language)))) ? 5 : 0) : 3;
  const geography = intent.hard.countries.some((country) => normalize(job.country ?? job.location ?? "").includes(normalize(country))) ? 5 : 2;
  const workplace = intent.hard.workplaceModels.includes(job.workplaceModel) ? 3 : job.workplaceModel === "unknown" ? 1 : 0;
  const salary = job.salaryMax !== null && intent.hard.salary.minimum !== null && job.currency === intent.hard.salary.currency ? (job.salaryMax >= intent.hard.salary.minimum ? 3 : 0) : 1;
  const trajectory = roleSimilarity >= 0.5 && demonstratedMatches.length ? 4 : 1;
  const score = Math.max(0, Math.min(100, role + demonstratedScore + requiredScore + preferredScore + experience + seniority + industry + languages + geography + workplace + salary + trajectory));
  const completeness = [job.descriptionComplete, job.country, job.workplaceModel !== "unknown", job.requiredSkills.length > 0, evidence.length > 0, demonstrated.length > 0].filter(Boolean).length;
  const confidence: FitConfidence = completeness >= 5 ? "high" : completeness >= 3 ? "medium" : "low";
  const classification: JobClassification = score >= 82 ? "strong_match" : score >= 68 ? "good_match" : score >= 52 ? "worth_reviewing" : "stretch";
  const strongest = demonstratedMatches.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  const missingEvidence = requiredMatches.filter((match) => !match.evidence).map((match) => match.skill);
  const strengths = [role >= 20 ? "Strong target-role alignment" : null, strongest.length ? `Demonstrated evidence: ${strongest.map((item) => item.label).join(", ")}` : null, requiredMatches.some((match) => match.evidence) ? "Required skills supported by profile evidence" : null].filter((item): item is string => Boolean(item));
  const gaps = [role < 12 ? "Role alignment is limited" : null, !demonstratedMatches.length ? "No demonstrated implementation evidence matched" : null, ...missingEvidence.map((skill) => `Missing evidence: ${skill}`)].filter((item): item is string => Boolean(item));
  return {
    score, confidence, classification, strengths, gaps,
    explanation: {
      dimensions: { roleRelevance: role, demonstratedEvidence: demonstratedScore, experienceDepth: experience, requiredSkills: requiredScore, preferredSkills: preferredScore, seniority, industry, language: languages, geography, workplace, salary, careerTrajectory: trajectory },
      strongestEvidence: strongest.map((item) => ({ evidenceId: item.id, label: item.label, source: item.sourceType, contribution: item.evidenceType === "quantified_achievement" ? 6 : 4 })),
      missingEvidence,
      transferableEvidence: demonstratedMatches.filter((item) => item.evidenceType === "project_implementation" || item.evidenceType === "portfolio_artifact").map((item) => ({ evidenceId: item.id, label: item.label, source: item.sourceType })),
      whyRankedHere: [role >= 20 ? "The vacancy title aligns with a confirmed target role." : "The vacancy has partial semantic overlap with target roles.", demonstratedMatches.length ? `${demonstratedMatches.length} demonstrated evidence item(s) matched the vacancy.` : "Title similarity was not treated as professional evidence.", confidence === "low" ? "Incomplete vacancy or profile evidence limits confidence." : "The ranking uses multiple verified dimensions."],
      scoringVersion: "evidence-fit-v1",
    },
  };
}
