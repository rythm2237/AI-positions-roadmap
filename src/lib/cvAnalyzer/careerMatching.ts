import type { ProjectEvidenceAssessment } from "./projectEvidence.ts";

export type CareerReference = {
  slug: string;
  title: string;
  domain: string;
  description: string;
};

export type CareerEvidenceMatch = {
  careerSlug: string;
  title: string;
  score: number;
  match: number;
  evidenceSignals: string[];
  missingSignals: string[];
  confidence: "high" | "medium" | "low";
};

export type CareerEvidenceInput = {
  headline: string;
  summary: string;
  skills: string;
  experience: string;
  projects: string;
  source: string;
  projectEvidence: ProjectEvidenceAssessment;
};

type EvidenceConcept = {
  id: string;
  label: string;
  aliases: string[];
  careerTerms: string[];
};

// Concepts are role-agnostic. A Career's own canonical title, domain and description
// select the relevant concepts; no user or Career slug receives a fixed ranking.
const EVIDENCE_CONCEPTS: EvidenceConcept[] = [
  { id: "ai-automation", label: "AI automation", aliases: ["ai automation", "intelligent automation", "workflow automation", "process automation", "automation"], careerTerms: ["ai automation", "automation", "workflow"] },
  { id: "ai-agents", label: "AI agents", aliases: ["ai agents", "ai agent", "agentic ai", "multi-agent", "human-in-the-loop ai"], careerTerms: ["agent", "agents", "human-and-ai"] },
  { id: "business-ai", label: "business AI solutions", aliases: ["business ai", "business ai solutions", "ai solutions", "ai solution", "business problem definition"], careerTerms: ["business ai", "ai solution", "business needs", "business operations"] },
  { id: "workflow", label: "workflow and process design", aliases: ["workflow design", "workflow", "process design", "process mapping", "business process design", "process improvement"], careerTerms: ["workflow", "process redesign", "process"] },
  { id: "architecture", label: "solution and product architecture", aliases: ["product architecture", "solution architecture", "system architecture", "architecture", "solution design"], careerTerms: ["architecture", "solution framing", "design"] },
  { id: "integration", label: "AI and system integration", aliases: ["ai integration", "system integration", "api integration", "integration", "apis", "api", "webhooks", "webhook"], careerTerms: ["integration", "connect", "apis", "api", "systems"] },
  { id: "power-platform", label: "Microsoft Power Platform", aliases: ["power platform", "power automate", "power apps", "copilot studio", "dataverse", "microsoft 365 copilot"], careerTerms: ["microsoft 365", "copilot studio", "power platform", "workflow platforms"] },
  { id: "analytics", label: "operational analytics and BI", aliases: ["operational analytics", "power bi", "business intelligence", "dashboard", "decision-support", "decision support", "kpi", "analytics"], careerTerms: ["analytics", "dashboards", "insights", "data"] },
  { id: "data-analysis", label: "data analysis", aliases: ["data analysis", "data analytics", "forecasting", "data model", "data models", "reporting", "power bi", "sql"], careerTerms: ["analysis", "datasets", "data", "experiments", "reporting"] },
  { id: "product-building", label: "AI product delivery", aliases: ["ai product builder", "ai product", "product design", "product development", "production deployment", "launched", "deployed"], careerTerms: ["ai product", "products", "delivery", "launch"] },
  { id: "consulting", label: "consulting and discovery", aliases: ["consulting", "discovery", "requirements", "business analysis", "stakeholder", "workshop", "problem framing"], careerTerms: ["consult", "discovery", "requirements", "stakeholder", "advise"] },
  { id: "transformation", label: "digital and AI transformation", aliases: ["digital transformation", "ai transformation", "transformation", "change management", "adoption"], careerTerms: ["transformation", "change management", "adoption", "operating models"] },
  { id: "governance", label: "AI governance", aliases: ["ai governance", "responsible ai", "governance", "human-in-the-loop", "risk controls"], careerTerms: ["governance", "responsible", "risk"] },
  { id: "enterprise-strategy", label: "enterprise strategy", aliases: ["enterprise strategy", "operating model", "portfolio investment", "executive stakeholders", "enterprise architecture"], careerTerms: ["enterprise", "strategy", "operating model", "portfolio investment", "executive"] },
  { id: "operations", label: "business operations", aliases: ["business operations", "operational planning", "operations", "capacity planning", "warehouse movement", "process improvement"], careerTerms: ["operations", "operational"] },
  { id: "engineering", label: "production engineering", aliases: ["typescript", "javascript", "next.js", "python", "ci/cd", "testing", "production deployment"], careerTerms: ["engineering", "build", "deploy", "production", "applications"] },
  { id: "cloud", label: "cloud infrastructure", aliases: ["azure", "aws", "gcp", "cloud infrastructure", "terraform", "kubernetes", "docker"], careerTerms: ["cloud", "infrastructure"] },
  { id: "security", label: "security operations", aliases: ["cybersecurity", "security", "siem", "incident response", "vulnerability", "iam"], careerTerms: ["security", "cyber", "incident", "risk"] },
  { id: "marketing", label: "AI marketing", aliases: ["digital marketing", "marketing automation", "campaign", "content strategy", "seo", "audience"], careerTerms: ["marketing", "campaign", "content", "growth", "audience"] },
];

const ACTION_VERBS = /\b(?:built|building|created|developed|designed|implemented|launched|deployed|architected|integrated|automated|analyzed|analysed|improved|validated|led|managed|delivered|defined)\b/i;
const STOP_WORDS = new Set(["a", "an", "and", "ai", "as", "at", "be", "for", "from", "in", "of", "on", "or", "the", "to", "with", "role", "systems", "solutions"]);

function normalize(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[–—]/g, "-")
    .replace(/[^a-z0-9+#.%/ -]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsPhrase(text: string, phrase: string) {
  const normalizedText = ` ${normalize(text)} `;
  const normalizedPhrase = normalize(phrase);
  return Boolean(normalizedPhrase) && normalizedText.includes(` ${normalizedPhrase} `);
}

function containsAny(text: string, phrases: string[]) {
  return phrases.some((phrase) => containsPhrase(text, phrase));
}

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

function words(value: string) {
  return normalize(value).split(" ").filter((word) => word.length >= 3 && !STOP_WORDS.has(word));
}

function recentExperience(experience: string) {
  const lines = experience.split("\n").filter(Boolean);
  const presentIndex = lines.findIndex((line) => /\b(?:present|current|now)\b/i.test(line));
  if (presentIndex >= 0) return lines.slice(Math.max(0, presentIndex - 1), presentIndex + 8).join("\n");
  return lines.slice(0, Math.max(6, Math.ceil(lines.length * 0.35))).join("\n");
}

function conceptDepth(text: string, concept: EvidenceConcept) {
  return text
    .split(/[\n.!?]+/)
    .some((sentence) => containsAny(sentence, concept.aliases) && ACTION_VERBS.test(sentence));
}

function careerConcepts(career: CareerReference) {
  const title = `${career.title} ${career.domain}`;
  const description = career.description;
  const selected = EVIDENCE_CONCEPTS
    .map((concept) => {
      const titleMatch = containsAny(title, concept.careerTerms);
      const descriptionMatch = containsAny(description, concept.careerTerms);
      return { concept, importance: titleMatch ? 1.45 : descriptionMatch ? 1 : 0 };
    })
    .filter((item) => item.importance > 0);

  if (selected.length >= 3) return selected;
  const fallback = EVIDENCE_CONCEPTS.filter((concept) => containsAny(`${title} ${description}`, concept.aliases))
    .map((concept) => ({ concept, importance: 0.85 }));
  return unique([...selected, ...fallback].map((item) => item.concept.id))
    .map((id) => [...selected, ...fallback].find((item) => item.concept.id === id)!)
    .slice(0, 8);
}

function titleSimilarity(target: string, career: CareerReference) {
  const targetWords = unique(words(target));
  const careerWords = unique(words(career.title));
  if (!targetWords.length || !careerWords.length) return 0;
  const overlap = targetWords.filter((word) => careerWords.includes(word)).length;
  return overlap / Math.max(targetWords.length, careerWords.length);
}

function matchConcept(concept: EvidenceConcept, input: CareerEvidenceInput) {
  const identityText = `${input.headline}\n${input.summary}`;
  const recent = recentExperience(input.experience);
  const channels = {
    identity: containsAny(identityText, concept.aliases),
    skills: containsAny(input.skills, concept.aliases),
    experience: containsAny(input.experience, concept.aliases),
    project: containsAny(`${input.projects}\n${input.summary}`, concept.aliases),
    recent: containsAny(recent, concept.aliases),
    depth: conceptDepth(`${input.experience}\n${input.projects}\n${input.summary}`, concept),
  };
  const score = Math.min(
    1,
    (channels.identity ? 0.24 : 0) +
      (channels.skills ? 0.16 : 0) +
      (channels.experience ? 0.24 : 0) +
      (channels.project ? 0.18 : 0) +
      (channels.recent ? 0.08 : 0) +
      (channels.depth ? 0.1 : 0),
  );
  return { channels, score };
}

function evidenceSummary(concept: EvidenceConcept, channels: ReturnType<typeof matchConcept>["channels"]) {
  if (channels.identity) return `Role identity: ${concept.label}`;
  if (channels.project && channels.depth) return `Product/project implementation: ${concept.label}`;
  if (channels.experience && channels.depth) return `Work implementation: ${concept.label}`;
  if (channels.experience) return `Experience evidence: ${concept.label}`;
  if (channels.skills) return `Direct skill evidence: ${concept.label}`;
  return `Supporting evidence: ${concept.label}`;
}

export function scoreCareerEvidence(career: CareerReference, input: CareerEvidenceInput): CareerEvidenceMatch {
  const concepts = careerConcepts(career);
  const evaluated = concepts.map(({ concept, importance }) => ({ concept, importance, ...matchConcept(concept, input) }));
  const totalImportance = evaluated.reduce((sum, item) => sum + item.importance, 0) || 1;
  const conceptCoverage = evaluated.reduce((sum, item) => sum + item.score * item.importance, 0) / totalImportance;
  const identityTerms = unique(words(career.title));
  const directIdentity = identityTerms.length
    ? identityTerms.filter((term) => containsPhrase(`${input.headline} ${input.summary}`, term)).length / identityTerms.length
    : 0;
  const catalogTerms = unique(words(`${career.title} ${career.description}`));
  const catalogCoverage = catalogTerms.length
    ? catalogTerms.filter((term) => containsPhrase(input.source, term)).length / catalogTerms.length
    : 0;
  const projectBonus = input.projectEvidence.confidence === "high" && evaluated.some((item) => item.channels.project) ? 5 : 0;
  const score = Math.max(0, Math.min(100, Math.round(8 + conceptCoverage * 72 + directIdentity * 10 + Math.min(5, catalogCoverage * 12) + projectBonus)));
  const matched = evaluated.filter((item) => item.score >= 0.32).sort((left, right) => right.score * right.importance - left.score * left.importance);
  const missing = evaluated.filter((item) => item.score < 0.28).sort((left, right) => right.importance - left.importance);
  const evidenceSignals = unique(matched.map((item) => evidenceSummary(item.concept, item.channels))).slice(0, 5);
  const missingSignals = missing.map((item) => `Limited evidence: ${item.concept.label}`).slice(0, 3);
  const channelCount = new Set(matched.flatMap((item) => Object.entries(item.channels).filter(([, present]) => present).map(([channel]) => channel))).size;
  const confidence = score >= 68 && channelCount >= 4 ? "high" : score >= 45 && channelCount >= 2 ? "medium" : "low";

  return {
    careerSlug: career.slug,
    title: career.title,
    score,
    match: score,
    evidenceSignals,
    missingSignals,
    confidence,
  };
}

export function rankCareerEvidence(careers: readonly CareerReference[], input: CareerEvidenceInput) {
  return careers
    .map((career) => scoreCareerEvidence(career, input))
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title));
}

export function resolveTargetCareer(targetPosition: string, careers: readonly CareerReference[]) {
  const normalizedTarget = normalize(targetPosition);
  const exact = careers.find((career) => normalize(career.title) === normalizedTarget || normalize(career.slug) === normalizedTarget);
  if (exact) return exact;
  const closest = careers
    .map((career) => ({ career, similarity: titleSimilarity(targetPosition, career) }))
    .sort((left, right) => right.similarity - left.similarity)[0];
  return closest && closest.similarity >= 0.5 ? closest.career : null;
}
