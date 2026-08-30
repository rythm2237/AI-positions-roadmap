import {
  CAPABILITIES,
  capabilityAppears,
  capabilityLabel,
  normalizeEvidenceText,
  type CapabilityId,
} from "./careerRequirements.ts";
import type { ProjectEvidenceAssessment } from "./projectEvidence.ts";

export type EvidenceContext =
  | "employed_role"
  | "independent_role"
  | "self_employed"
  | "implemented_project"
  | "project_description"
  | "certification"
  | "education"
  | "skills_list"
  | "summary_claim";

export type ExperienceDurationBucket = "unknown" | "<6 months" | "6–12 months" | "1–2 years" | "2–4 years" | "4+ years";

export type CapabilityEvidence = {
  capabilityId: CapabilityId;
  label: string;
  contexts: EvidenceContext[];
  quality: number;
  implementationCount: number;
  relevantMonths: number;
  durationBucket: ExperienceDurationBucket;
  recent: boolean;
  quantified: boolean;
};

export type RecruiterEvidenceProfile = {
  capabilities: Partial<Record<CapabilityId, CapabilityEvidence>>;
  channelCount: number;
  implementationCount: number;
  recentImplementationCount: number;
  quantifiedEvidenceCount: number;
};

export type CareerEvidenceSource = {
  headline: string;
  summary: string;
  skills: string;
  experience: string;
  projects: string;
  education: string;
  certifications: string;
  source: string;
  projectEvidence: ProjectEvidenceAssessment;
};

type ExperienceEntry = {
  text: string;
  context: Extract<EvidenceContext, "employed_role" | "independent_role" | "self_employed">;
  months: number;
  recent: boolean;
};

const CONTEXT_WEIGHT: Record<EvidenceContext, number> = {
  employed_role: 0.92,
  independent_role: 0.84,
  self_employed: 0.84,
  implemented_project: 1,
  project_description: 0.64,
  certification: 0.46,
  education: 0.44,
  skills_list: 0.3,
  summary_claim: 0.2,
};

const IMPLEMENTATION_VERBS = /\b(?:built|building|created|developed|designed|implemented|launched|deployed|architected|integrated|automated|validated|delivered|engineered|operated|led|managed|analyzed|analysed|improved|transformed)\b/i;
const QUANTIFIED_EVIDENCE = /(?:\b\d+(?:\.\d+)?\s*%|(?:€|\$|£)\s?\d|\b\d+(?:\.\d+)?\s*(?:hours?|days?|weeks?|months?|years?|users?|teams?|locations?|areas?|workflows?|projects?|reports?|dashboards?)\b|\b(?:reduced|increased|improved|saved|cut|grew)\s+(?:by\s+)?\d+)/i;
const MONTHS: Record<string, number> = { jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7, aug: 8, august: 8, sep: 9, september: 9, oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12 };

function unique<T>(values: readonly T[]) {
  return [...new Set(values)];
}

function monthIndex(year: number, month = 1) {
  return year * 12 + month - 1;
}

function parsePoint(value: string, fallbackMonth: number) {
  const normalized = normalizeEvidenceText(value);
  const year = Number(normalized.match(/\b(?:19|20)\d{2}\b/)?.[0] ?? 0);
  if (!year) return null;
  const monthName = Object.keys(MONTHS).find((name) => new RegExp(`\\b${name}\\b`, "i").test(normalized));
  return { year, month: monthName ? MONTHS[monthName] : fallbackMonth };
}

function parseDuration(text: string) {
  const current = new Date();
  const normalized = text.replace(/[–—]/g, "-");
  const match = normalized.match(/((?:(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+)?(?:19|20)\d{2})\s*(?:-|to)\s*((?:(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+)?(?:19|20)\d{2}|present|current|now)/i);
  if (!match) return { months: 0, recent: false };
  const start = parsePoint(match[1], 1);
  const isPresent = /present|current|now/i.test(match[2]);
  const end = isPresent ? { year: current.getUTCFullYear(), month: current.getUTCMonth() + 1 } : parsePoint(match[2], 12);
  if (!start || !end) return { months: 0, recent: isPresent };
  const months = Math.max(1, monthIndex(end.year, end.month) - monthIndex(start.year, start.month) + 1);
  return { months, recent: isPresent || end.year >= current.getUTCFullYear() - 1 };
}

export function durationBucket(months: number): ExperienceDurationBucket {
  if (!months) return "unknown";
  if (months < 6) return "<6 months";
  if (months < 12) return "6–12 months";
  if (months < 24) return "1–2 years";
  if (months < 48) return "2–4 years";
  return "4+ years";
}

function experienceContext(header: string): ExperienceEntry["context"] {
  if (/\b(?:self-employed|self employed|freelance|freelancer)\b/i.test(header)) return "self_employed";
  if (/\b(?:independent|founder|owner)\b/i.test(header)) return "independent_role";
  return "employed_role";
}

function splitExperience(experience: string): ExperienceEntry[] {
  const lines = experience.replace(/\r/g, "").split("\n").map((line) => line.trim()).filter(Boolean);
  const entries: string[][] = [];
  let current: string[] = [];
  for (const line of lines) {
    const startsEntry = /(?:19|20)\d{2}\s*(?:-|to|–|—)\s*(?:(?:19|20)\d{2}|present|current|now)/i.test(line);
    if (startsEntry && current.length) {
      entries.push(current);
      current = [];
    }
    current.push(line);
  }
  if (current.length) entries.push(current);
  return entries.map((linesInEntry) => {
    const text = linesInEntry.join("\n");
    const duration = parseDuration(text);
    return { text, context: experienceContext(linesInEntry[0] ?? text), ...duration };
  });
}

function sentences(text: string) {
  return text.split(/\n|(?<=[.!?])\s+/).map((sentence) => sentence.trim()).filter(Boolean);
}

function qualityForContexts(contexts: EvidenceContext[], implementationCount: number) {
  const weights = unique(contexts).map((context) => CONTEXT_WEIGHT[context]).sort((left, right) => right - left);
  if (!weights.length) return 0;
  return Math.min(1, weights[0] + Math.min(0.18, weights.slice(1).reduce((sum, value) => sum + value * 0.08, 0)) + (implementationCount >= 2 ? 0.08 : 0));
}

export function buildRecruiterEvidence(input: CareerEvidenceSource): RecruiterEvidenceProfile {
  const experienceEntries = splitExperience(input.experience);
  const projectSentences = sentences(`${input.projects}\n${input.experience}\n${input.summary}`);
  const currentYear = new Date().getUTCFullYear();
  const recentProjectText = new RegExp(`\\b(?:${currentYear}|${currentYear - 1})\\b|\\b(?:present|current|now)\\b`, "i").test(input.projects);
  const capabilities: Partial<Record<CapabilityId, CapabilityEvidence>> = {};

  for (const capabilityId of Object.keys(CAPABILITIES) as CapabilityId[]) {
    const contexts: EvidenceContext[] = [];
    let implementationCount = 0;
    let relevantMonths = 0;
    let recent = false;
    let quantified = false;

    if (capabilityAppears(input.summary, capabilityId)) contexts.push("summary_claim");
    if (capabilityAppears(input.skills, capabilityId)) contexts.push("skills_list");
    if (capabilityAppears(input.education, capabilityId)) contexts.push("education");
    if (capabilityAppears(input.certifications, capabilityId)) contexts.push("certification");
    if (capabilityAppears(input.projects, capabilityId)) contexts.push("project_description");

    for (const entry of experienceEntries) {
      if (!capabilityAppears(entry.text, capabilityId)) continue;
      contexts.push(entry.context);
      relevantMonths = Math.max(relevantMonths, entry.months);
      recent ||= entry.recent;
      quantified ||= QUANTIFIED_EVIDENCE.test(entry.text);
    }

    for (const sentence of projectSentences) {
      if (!capabilityAppears(sentence, capabilityId) || !IMPLEMENTATION_VERBS.test(sentence)) continue;
      implementationCount += 1;
      contexts.push("implemented_project");
      quantified ||= QUANTIFIED_EVIDENCE.test(sentence);
      const containingEntry = experienceEntries.find((entry) => entry.text.includes(sentence));
      recent ||= containingEntry?.recent ?? false;
      recent ||= recentProjectText && input.projects.includes(sentence);
    }

    if (!contexts.length) continue;
    const distinctContexts = unique(contexts);
    capabilities[capabilityId] = {
      capabilityId,
      label: capabilityLabel(capabilityId),
      contexts: distinctContexts,
      quality: qualityForContexts(distinctContexts, implementationCount),
      implementationCount,
      relevantMonths,
      durationBucket: durationBucket(relevantMonths),
      recent,
      quantified,
    };
  }

  const values = Object.values(capabilities) as CapabilityEvidence[];
  return {
    capabilities,
    channelCount: new Set(values.flatMap((value) => value.contexts)).size,
    implementationCount: values.reduce((sum, value) => sum + value.implementationCount, 0),
    recentImplementationCount: values.filter((value) => value.recent).reduce((sum, value) => sum + value.implementationCount, 0),
    quantifiedEvidenceCount: values.filter((value) => value.quantified).length,
  };
}

export function evidenceFor(profile: RecruiterEvidenceProfile, capabilityId: CapabilityId) {
  return profile.capabilities[capabilityId] ?? null;
}
