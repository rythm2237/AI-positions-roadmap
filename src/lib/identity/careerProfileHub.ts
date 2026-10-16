import type { Profile } from "@/types/identity";
import { emptyKnowledge, importKnowledge, type Knowledge } from "@/lib/applicationStudio/knowledge.mjs";

export const CAREER_SECTIONS = [
  { kind: "header", title: "Personal details", required: true, hint: "Contact information and professional links" },
  { kind: "summary", title: "Professional summary", required: true, hint: "Your career identity and objectives" },
  { kind: "experience", title: "Work experience", required: true, hint: "Roles, dates, responsibilities and measurable outcomes" },
  { kind: "skills", title: "Skills & expertise", required: true, hint: "Technical, industry, business and transferable skills" },
  { kind: "education", title: "Education", required: true, hint: "Degrees, institutions and dates" },
  { kind: "certifications", title: "Certifications", required: false, hint: "Issuers, credential dates, links and IDs" },
  { kind: "development", title: "Training & courses", required: false, hint: "Course provider, status and learned capabilities" },
  { kind: "projects", title: "Projects & portfolio", required: false, hint: "Your role, tools, links, implementation status and evidence" },
  { kind: "languages", title: "Languages", required: true, hint: "Languages and proficiency levels" },
  { kind: "additional", title: "Achievements & awards", required: false, hint: "Awards, publications and measurable results" },
  { kind: "other", title: "Other career information", required: false, hint: "Relevant professional facts not yet categorised" },
] as const;

export type CareerSectionKind = (typeof CAREER_SECTIONS)[number]["kind"];
export type ProfileFact = { id: string; entityId: string; kind: string; label: string; text: string; verification: string; sourceType: string };

function activeClaims(knowledge: Knowledge) {
  const declined = new Set(knowledge.declined);
  return knowledge.claims.filter((claim) => claim.confirmed && !claim.retracted && !declined.has(claim.id));
}

export function factsBySection(knowledge: Knowledge): Record<string, ProfileFact[]> {
  const groups: Record<string, ProfileFact[]> = Object.fromEntries(CAREER_SECTIONS.map(({ kind }) => [kind, []]));
  const entities = new Map(knowledge.entities.map((entity) => [entity.id, entity]));
  for (const claim of activeClaims(knowledge)) {
    const entity = entities.get(claim.entityId);
    const kind = entity && groups[entity.kind] ? entity.kind : "other";
    groups[kind].push({
      id: claim.id, entityId: claim.entityId, kind,
      label: entity?.label || "", text: String(claim.original || ""),
      verification: claim.verification || "candidate-reported",
      sourceType: claim.sourceType || "interview",
    });
  }
  return groups;
}

export function previewCareerImport(knowledge: Knowledge, text: string, label: string) {
  const next = importKnowledge(knowledge, { text, type: "cv", label });
  const before = new Set(knowledge.claims.map((claim) => claim.id));
  const newClaims = next.claims.filter((claim) => !before.has(claim.id));
  const newClaimIds = new Set(newClaims.map((claim) => claim.id));
  const groups = factsBySection(next);
  return {
    next,
    added: newClaims.length,
    unchanged: next.revision === knowledge.revision,
    groups: Object.fromEntries(Object.entries(groups).map(([kind, facts]) => [kind, facts.filter((fact) => newClaimIds.has(fact.id))])),
  };
}

export function careerProfileScores(profile: Partial<Profile>, knowledge: Knowledge = emptyKnowledge(), hasResume = false) {
  const groups = factsBySection(knowledge);
  const present: Record<string, boolean> = {
    header: Boolean(profile.name || groups.header.length),
    summary: Boolean(profile.current_position || groups.summary.length),
    experience: groups.experience.length > 0,
    skills: Boolean(profile.skills?.length || groups.skills.length),
    education: groups.education.length > 0,
    certifications: Boolean(profile.certificates?.length || groups.certifications.length),
    development: groups.development.length > 0,
    projects: groups.projects.length > 0,
    languages: Boolean(profile.languages?.length || groups.languages.length),
    additional: groups.additional.length > 0,
    other: groups.other.length > 0,
  };
  const essentials = CAREER_SECTIONS.filter((section) => section.required);
  const complete = essentials.filter((section) => present[section.kind]).length;
  const completeness = Math.round((complete / essentials.length) * 100);
  const active = activeClaims(knowledge);
  const withSource = active.filter((claim) => claim.sourceId && knowledge.sources.some((source) => source.id === claim.sourceId)).length;
  const confirmed = active.filter((claim) => claim.verification === "candidate-confirmed").length;
  const evidence = active.length ? Math.round(100 * (withSource * 0.5 + confirmed * 0.5) / active.length) : 0;
  const readiness = Math.round(100 * [present.header, present.summary, present.skills, present.experience || present.education, hasResume || active.length > 0].filter(Boolean).length / 5);
  return { completeness, evidence, readiness, present, missing: essentials.filter((section) => !present[section.kind]).map((section) => section.title) };
}

export function candidateKnowledgeForCV(knowledge: Knowledge): string {
  const groups = factsBySection(knowledge);
  return CAREER_SECTIONS.flatMap(({ kind, title }) => groups[kind].length
    ? [title, ...groups[kind].map((fact) => fact.text)]
    : []).join("\n").slice(0, 100_000);
}
