import { createHash } from "node:crypto";
import { extractMasterCvSkills } from "../cvAnalyzer/masterCvEvidence.ts";
import type { CareerEvidenceItem, EvidenceSourceType, EvidenceType } from "../../types/jobAgent.ts";
import type { Profile } from "../../types/identity.ts";

const actionVerb = /\b(achieved|automated|built|created|delivered|designed|developed|implemented|improved|integrated|launched|led|managed|optimized|reduced|scaled|streamlined|transformed)\b/i;
const metric = /(?:\b\d+(?:\.\d+)?\s*(?:%|hours?|days?|users?|customers?|projects?|workflows?|teams?|countries?)\b|[$€£]\s?\d)/i;

function fingerprint(sourceType: EvidenceSourceType, sourceId: string | null, evidenceType: EvidenceType, label: string, value: string) {
  return createHash("sha256").update([sourceType, sourceId ?? "", evidenceType, label.toLowerCase(), value.toLowerCase()].join("|")).digest("hex");
}

function item(sourceType: EvidenceSourceType, sourceId: string | null, evidenceType: EvidenceType, label: string, value: string, confidence: number, durationMonths: number | null, provenance: Record<string, unknown>): CareerEvidenceItem {
  return { sourceType, sourceId, evidenceType, label, value, confidence, durationMonths, provenance, fingerprint: fingerprint(sourceType, sourceId, evidenceType, label, value) };
}

export function evidenceFromProfile(profile: Profile): CareerEvidenceItem[] {
  const result: CareerEvidenceItem[] = [];
  if (profile.current_position) result.push(item("profile", profile.id, "role_history", "Current role", profile.current_position, 0.8, null, { field: "current_position", userProvided: true, durationNotInferred: true }));
  if (profile.years_experience !== null) result.push(item("profile", profile.id, "role_history", "Total professional experience", `${profile.years_experience} years`, 0.85, Math.round(profile.years_experience * 12), { field: "years_experience", userProvided: true, scope: "total_experience" }));
  profile.skills.forEach((skill) => result.push(item("profile", profile.id, "user_claim", skill, skill, 0.65, null, { field: "skills", userProvided: true })));
  profile.certificates.forEach((certificate) => result.push(item("certification", profile.id, "certification", certificate, certificate, 0.9, null, { field: "certificates", userProvided: true })));
  profile.languages.forEach((language) => result.push(item("language", profile.id, "language", language, language, 0.9, null, { field: "languages", userProvided: true })));
  return result;
}

export function evidenceFromMasterCv(resumeId: string, resumeText: string): CareerEvidenceItem[] {
  const lines = resumeText.replace(/\u0000/g, " ").split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length >= 3);
  const skills = extractMasterCvSkills(resumeText);
  const result: CareerEvidenceItem[] = [];
  for (const skill of skills) {
    const contexts = lines.filter((line) => line.toLowerCase().includes(skill.toLowerCase())).slice(0, 3);
    const demonstrated = contexts.find((line) => actionVerb.test(line));
    const value = demonstrated ?? contexts[0] ?? skill;
    const evidenceType: EvidenceType = demonstrated ? (metric.test(demonstrated) ? "quantified_achievement" : "work_implementation") : "skill_mention";
    result.push(item("master_cv", resumeId, evidenceType, skill, value, demonstrated ? 0.9 : 0.62, null, { lineExcerpt: value.slice(0, 500), parser: "master-cv-evidence-v1" }));
  }
  return result;
}

export function mergeEvidence(...collections: CareerEvidenceItem[][]) {
  const merged = new Map<string, CareerEvidenceItem>();
  for (const evidence of collections.flat()) {
    const key = `${evidence.label.toLowerCase()}|${evidence.evidenceType}`;
    const existing = merged.get(key);
    if (!existing || evidence.confidence > existing.confidence) merged.set(key, evidence);
  }
  return [...merged.values()];
}

const values = (value: string, limit = 30) => [...new Set(value.split(/[,;\n]+/).map((entry) => entry.trim()).filter((entry) => entry.length >= 2))].slice(0, limit);

export function evidenceFromCvAnalyzer(input: { sourceId: string; skills: string; languages: string; certifications: string; projects: string; experience: string; overall: number; strengths: string[] }): CareerEvidenceItem[] {
  const source = "cv_analyzer" as const;
  const result: CareerEvidenceItem[] = [];
  values(input.skills).forEach((skill) => result.push(item(source, input.sourceId, "skill_mention", skill, skill, 0.7, null, { field: "skills", explicitlySaved: true })));
  values(input.languages, 15).forEach((language) => result.push(item(source, input.sourceId, "language", language, language, 0.85, null, { field: "languages", explicitlySaved: true })));
  values(input.certifications, 20).forEach((certificate) => result.push(item(source, input.sourceId, "certification", certificate, certificate, 0.85, null, { field: "certifications", explicitlySaved: true })));
  values(input.projects, 20).forEach((project, index) => result.push(item(source, input.sourceId, actionVerb.test(project) ? "project_implementation" : "user_claim", `Project evidence ${index + 1}`, project.slice(0, 700), actionVerb.test(project) ? 0.82 : 0.6, null, { field: "projects", explicitlySaved: true })));
  values(input.experience, 30).filter((line) => actionVerb.test(line)).forEach((line, index) => result.push(item(source, input.sourceId, metric.test(line) ? "quantified_achievement" : "work_implementation", `Experience evidence ${index + 1}`, line.slice(0, 700), metric.test(line) ? 0.9 : 0.8, null, { field: "experience", explicitlySaved: true })));
  result.push(item(source, input.sourceId, "assessment_result", "CV Analyzer score", `${Math.max(0, Math.min(100, Math.round(input.overall)))}/100`, 0.75, null, { strengths: input.strengths.slice(0, 10), explicitlySaved: true, analyzerVersion: "semantic-cv-v1" }));
  return result;
}
