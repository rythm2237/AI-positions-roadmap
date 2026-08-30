import {
  buildRecruiterEvidence,
  evidenceFor,
  type CapabilityEvidence,
  type CareerEvidenceSource,
  type EvidenceContext,
  type ExperienceDurationBucket,
  type RecruiterEvidenceProfile,
} from "./careerEvidence.ts";
import {
  capabilityLabel,
  normalizeEvidenceText,
  resolveCareerRequirements,
  type CapabilityId,
  type CareerRequirementGroup,
} from "./careerRequirements.ts";
import type { ProjectEvidenceAssessment } from "./projectEvidence.ts";

export type CareerReference = { slug: string; title: string; domain: string; description: string };

export type CareerMatchDimensions = {
  roleRelevance: number;
  professionalEvidence: number;
  coreRequirements: number;
  trajectory: number;
  transferability: number;
};

export type CareerEvidenceSummary = {
  strongestEvidence: string[];
  transferableEvidence: string[];
  coreGaps: string[];
  supportingOpportunities: string[];
  limitingFactors: string[];
};

export type CareerProfessionalEvidence = {
  directDurationMonths: number;
  directDurationBucket: ExperienceDurationBucket;
  transferableDurationMonths: number;
  transferableDurationBucket: ExperienceDurationBucket;
  contexts: EvidenceContext[];
  implementationCount: number;
};

export type CareerEvidenceMatch = {
  careerSlug: string;
  title: string;
  score: number;
  match: number;
  dimensions: CareerMatchDimensions;
  evidenceSignals: string[];
  missingSignals: string[];
  evidenceSummary: CareerEvidenceSummary;
  professionalEvidence: CareerProfessionalEvidence;
  confidence: "high" | "medium" | "low";
};

export type CareerEvidenceInput = CareerEvidenceSource & { projectEvidence: ProjectEvidenceAssessment };

type GroupEvaluation = {
  group: CareerRequirementGroup;
  evidence: CapabilityEvidence | null;
  capabilityId: CapabilityId | null;
  quality: number;
};

// Core coverage also applies a score ceiling, so transferable or generic
// semantic evidence cannot replace essential Career requirements.
export const CAREER_MATCH_WEIGHTS: Readonly<CareerMatchDimensions> = {
  roleRelevance: 0.3,
  professionalEvidence: 0.25,
  coreRequirements: 0.25,
  trajectory: 0.1,
  transferability: 0.1,
};

const STOP_WORDS = new Set(["a", "an", "and", "ai", "as", "at", "for", "from", "in", "of", "on", "or", "the", "to", "with", "role", "specialist", "engineer", "consultant"]);

function clamp(value: number, maximum = 100) {
  return Math.max(0, Math.min(maximum, Math.round(value)));
}

function unique<T>(values: readonly T[]) {
  return [...new Set(values)];
}

function words(value: string) {
  return normalizeEvidenceText(value).split(" ").filter((word) => word.length >= 3 && !STOP_WORDS.has(word));
}

function titleSimilarity(target: string, career: CareerReference) {
  const targetWords = unique(words(target));
  const careerWords = unique(words(career.title));
  if (!targetWords.length || !careerWords.length) return 0;
  const overlap = targetWords.filter((word) => careerWords.includes(word)).length;
  return overlap / Math.max(targetWords.length, careerWords.length);
}

function roleIdentityEvidence(career: CareerReference, input: CareerEvidenceInput) {
  const identityWords = new Set(words(`${input.headline} ${input.summary}`));
  const careerWords = unique(words(career.title));
  if (!careerWords.length) return 0;
  return careerWords.filter((word) => identityWords.has(word)).length / careerWords.length;
}

function evaluateGroup(group: CareerRequirementGroup, profile: RecruiterEvidenceProfile): GroupEvaluation {
  const candidates = group.capabilities
    .map((capabilityId) => ({ capabilityId, evidence: evidenceFor(profile, capabilityId) }))
    .filter((item): item is { capabilityId: CapabilityId; evidence: CapabilityEvidence } => Boolean(item.evidence))
    .sort((left, right) => right.evidence.quality - left.evidence.quality || right.evidence.implementationCount - left.evidence.implementationCount);
  const best = candidates[0];
  return { group, evidence: best?.evidence ?? null, capabilityId: best?.capabilityId ?? null, quality: best?.evidence.quality ?? 0 };
}

function average(values: readonly number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function directCapabilityEvidence(capabilities: readonly CapabilityId[], profile: RecruiterEvidenceProfile) {
  return unique(capabilities).map((capabilityId) => evidenceFor(profile, capabilityId)).filter((item): item is CapabilityEvidence => Boolean(item));
}

function durationPoints(months: number) {
  if (!months) return 0;
  if (months < 6) return 4;
  if (months < 12) return 8;
  if (months < 24) return 12;
  if (months < 48) return 16;
  return 20;
}

function professionalDimension(evidence: readonly CapabilityEvidence[]) {
  if (!evidence.length) return 0;
  const quality = average(evidence.map((item) => item.quality).sort((left, right) => right - left).slice(0, 6));
  const months = Math.max(...evidence.map((item) => item.relevantMonths));
  const implementationCount = evidence.reduce((sum, item) => sum + item.implementationCount, 0);
  const quantifiedCount = evidence.filter((item) => item.quantified).length;
  const contexts = new Set(evidence.flatMap((item) => item.contexts));
  return clamp(5 + quality * 52 + durationPoints(months) + Math.min(12, implementationCount * 2.5) + Math.min(7, quantifiedCount * 2) + Math.min(4, Math.max(0, contexts.size - 1)));
}

function trajectoryDimension(coreEvidence: readonly CapabilityEvidence[], supporting: readonly CapabilityEvidence[], identity: number) {
  const recentCore = coreEvidence.filter((item) => item.recent);
  const recentSupporting = supporting.filter((item) => item.recent);
  if (!recentCore.length) return clamp(12 + identity * 18 + average(recentSupporting.map((item) => item.quality)) * 20);
  const quality = average(recentCore.map((item) => item.quality));
  const recentImplementations = recentCore.reduce((sum, item) => sum + item.implementationCount, 0);
  const recentCoverage = recentCore.length / Math.max(1, coreEvidence.length);
  const supportingContribution = average(recentSupporting.map((item) => item.quality)) * 8;
  return clamp(28 + quality * 35 + recentCoverage * 17 + Math.min(10, recentImplementations * 2.5) + supportingContribution + identity * 5);
}

function transferabilityDimension(transferable: readonly CapabilityEvidence[]) {
  if (!transferable.length) return 0;
  const quality = average(transferable.map((item) => item.quality));
  const months = Math.max(...transferable.map((item) => item.relevantMonths));
  const implementations = transferable.reduce((sum, item) => sum + item.implementationCount, 0);
  return clamp(18 + quality * 52 + durationPoints(months) + Math.min(10, implementations * 2));
}

function coreScore(groups: readonly GroupEvaluation[]) {
  if (!groups.length) return { score: 0, coverage: 0 };
  const coverage = groups.filter((item) => item.evidence).length / groups.length;
  const quality = average(groups.map((item) => item.quality));
  return { score: clamp(coverage * 65 + quality * 35), coverage };
}

function roleRelevance(groups: readonly GroupEvaluation[], supporting: readonly CapabilityEvidence[], identity: number) {
  return clamp(average(groups.map((item) => item.quality)) * 70 + average(supporting.map((item) => item.quality)) * 20 + identity * 10);
}

function scoreCeiling(coreCoverage: number, minimumCoreCoverage: number, coreRequirements: number) {
  if (coreCoverage === 0) return 42;
  if (coreCoverage < 0.25) return 50;
  if (coreCoverage < minimumCoreCoverage * 0.75) return 62;
  if (coreCoverage < minimumCoreCoverage) return 72;
  if (coreRequirements < 60) return 84;
  return 96;
}

function contextLabel(contexts: readonly EvidenceContext[]) {
  if (contexts.includes("implemented_project")) return contexts.includes("employed_role") ? "Work implementation" : contexts.some((context) => context === "independent_role" || context === "self_employed") ? "Independent implementation" : "Implemented project";
  if (contexts.includes("employed_role")) return "Professional experience";
  if (contexts.includes("independent_role") || contexts.includes("self_employed")) return "Independent professional work";
  if (contexts.includes("project_description")) return "Project evidence";
  if (contexts.includes("certification")) return "Certification evidence";
  if (contexts.includes("education")) return "Education evidence";
  if (contexts.includes("skills_list")) return "Skills-list evidence";
  return "Summary claim";
}

function evidenceDescription(evidence: CapabilityEvidence) {
  const duration = evidence.durationBucket === "unknown" ? "" : ` (${evidence.durationBucket})`;
  return `${contextLabel(evidence.contexts)}: ${evidence.label}${duration}`;
}

function longestDuration(evidence: readonly CapabilityEvidence[]) {
  return evidence.length ? evidence.reduce((best, item) => item.relevantMonths > best.relevantMonths ? item : best) : null;
}

function professionalMetadata(direct: readonly CapabilityEvidence[], transferable: readonly CapabilityEvidence[]): CareerProfessionalEvidence {
  const longestDirect = longestDuration(direct);
  const longestTransferable = longestDuration(transferable);
  return {
    directDurationMonths: longestDirect?.relevantMonths ?? 0,
    directDurationBucket: longestDirect?.durationBucket ?? "unknown",
    transferableDurationMonths: longestTransferable?.relevantMonths ?? 0,
    transferableDurationBucket: longestTransferable?.durationBucket ?? "unknown",
    contexts: unique(direct.flatMap((item) => item.contexts)),
    implementationCount: direct.reduce((sum, item) => sum + item.implementationCount, 0),
  };
}

function confidenceFor(dimensions: CareerMatchDimensions, coreCoverage: number, minimumCoreCoverage: number, metadata: CareerProfessionalEvidence): CareerEvidenceMatch["confidence"] {
  if (coreCoverage >= minimumCoreCoverage && dimensions.roleRelevance >= 65 && dimensions.professionalEvidence >= 60 && metadata.contexts.length >= 2 && metadata.implementationCount >= 2 && metadata.directDurationMonths >= 12) return "high";
  if (coreCoverage >= minimumCoreCoverage * 0.75 && dimensions.roleRelevance >= 48 && (dimensions.professionalEvidence >= 38 || dimensions.trajectory >= 65) && metadata.contexts.length >= 1) return "medium";
  return "low";
}

export function scoreCareerEvidence(career: CareerReference, input: CareerEvidenceInput): CareerEvidenceMatch {
  const requirements = resolveCareerRequirements(career);
  const recruiterEvidence = buildRecruiterEvidence(input);
  const groups = requirements.core.map((item) => evaluateGroup(item, recruiterEvidence));
  const supporting = directCapabilityEvidence(requirements.supporting, recruiterEvidence);
  const transferable = directCapabilityEvidence(requirements.transferable, recruiterEvidence);
  const identityEvidence = directCapabilityEvidence(requirements.directCapabilities, recruiterEvidence);
  const coreEvidence = groups.map((item) => item.evidence).filter((item): item is CapabilityEvidence => Boolean(item));
  const directEvidence = unique([...coreEvidence, ...supporting]);
  const identity = roleIdentityEvidence(career, input);
  const core = coreScore(groups);
  const dimensions: CareerMatchDimensions = {
    roleRelevance: roleRelevance(groups, supporting, identity),
    professionalEvidence: professionalDimension(directEvidence),
    coreRequirements: core.score,
    trajectory: trajectoryDimension(coreEvidence, supporting, identity),
    transferability: transferabilityDimension(transferable),
  };
  const weighted = Object.entries(CAREER_MATCH_WEIGHTS).reduce((sum, [dimension, weight]) => sum + dimensions[dimension as keyof CareerMatchDimensions] * weight, 0);
  const score = clamp(weighted, scoreCeiling(core.coverage, requirements.minimumCoreCoverage, dimensions.coreRequirements));
  const coreGaps = groups.filter((item) => !item.evidence).map((item) => item.group.label);
  const supportingOpportunities = requirements.supporting.filter((capabilityId) => !evidenceFor(recruiterEvidence, capabilityId)).map(capabilityLabel);
  const missingSignals = unique([
    ...coreGaps.map((gap) => `Limited direct evidence: ${gap}`),
    ...supportingOpportunities.map((opportunity) => `Limited supporting evidence: ${opportunity}`),
  ]).slice(0, 4);
  const strongestEvidence = directEvidence.toSorted((left, right) => right.quality - left.quality || right.relevantMonths - left.relevantMonths).map(evidenceDescription).slice(0, 4);
  const transferableEvidence = transferable.toSorted((left, right) => right.quality - left.quality || right.relevantMonths - left.relevantMonths).map((item) => `Transferable: ${item.label}${item.durationBucket === "unknown" ? "" : ` (${item.durationBucket})`}`).slice(0, 3);
  const metadata = professionalMetadata(identityEvidence, transferable);
  const confidence = confidenceFor(dimensions, core.coverage, requirements.minimumCoreCoverage, metadata);
  const limitingFactors: string[] = [];
  if (dimensions.roleRelevance >= 65 && metadata.directDurationMonths > 0 && metadata.directDurationMonths < 12) {
    limitingFactors.push(`Direct ${career.title} evidence is recent but shorter than one year.`);
  } else if (confidence === "medium" && !coreGaps.length) {
    if (!metadata.directDurationMonths) limitingFactors.push(`Direct ${career.title} evidence is relevant, but its duration is not clearly dated enough for high confidence.`);
    else if (metadata.implementationCount < 2) limitingFactors.push(`Career relevance is strong, but the CV shows limited repeated ${career.title} implementation evidence.`);
    else limitingFactors.push(`Direct ${career.title} evidence is strong, but not yet established enough across time for high confidence.`);
  } else if (confidence === "low" && !coreGaps.length) {
    limitingFactors.push(`The current evidence does not yet support medium recruiter confidence for ${career.title}.`);
  }
  const evidenceSignals = strongestEvidence.length ? strongestEvidence : transferableEvidence;
  return {
    careerSlug: career.slug,
    title: career.title,
    score,
    match: score,
    dimensions,
    evidenceSignals,
    missingSignals,
    evidenceSummary: {
      strongestEvidence,
      transferableEvidence,
      coreGaps: unique(coreGaps).slice(0, 4),
      supportingOpportunities: unique(supportingOpportunities).slice(0, 4),
      limitingFactors: unique(limitingFactors).slice(0, 3),
    },
    professionalEvidence: metadata,
    confidence,
  };
}

export function rankCareerEvidence(careers: readonly CareerReference[], input: CareerEvidenceInput) {
  return careers.map((career) => scoreCareerEvidence(career, input)).sort((left, right) => right.score - left.score || right.dimensions.coreRequirements - left.dimensions.coreRequirements || left.title.localeCompare(right.title));
}

export function resolveTargetCareer(targetPosition: string, careers: readonly CareerReference[]) {
  const normalizedTarget = normalizeEvidenceText(targetPosition);
  const exact = careers.find((career) => normalizeEvidenceText(career.title) === normalizedTarget || normalizeEvidenceText(career.slug) === normalizedTarget);
  if (exact) return exact;
  const closest = careers.map((career) => ({ career, similarity: titleSimilarity(targetPosition, career) })).sort((left, right) => right.similarity - left.similarity)[0];
  return closest && closest.similarity >= 0.5 ? closest.career : null;
}
