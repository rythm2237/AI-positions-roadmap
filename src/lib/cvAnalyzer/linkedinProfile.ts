export type ImportedProfileField =
  | "fullName"
  | "headline"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "languages";

export type ProfileFieldSource = "linkedin_pdf" | "cv_pdf" | "manual" | "linkedin_api_future";
export type ProfileFieldConfidence = "high" | "medium" | "low";

export type ProvenancedProfileField = {
  value: string;
  source: ProfileFieldSource;
  confidence: ProfileFieldConfidence;
};

export type LinkedInProfileImport = {
  profile: Partial<Record<ImportedProfileField, string>>;
  fields: Partial<Record<ImportedProfileField, ProvenancedProfileField>>;
  detectedSections: ImportedProfileField[];
  reviewItems: ImportedProfileField[];
  rawText: string;
};

type SectionKey = Exclude<ImportedProfileField, "fullName" | "headline"> | "contact" | "honors" | "courses" | "publications" | "volunteer";

const SECTION_ALIASES: Record<SectionKey, string[]> = {
  contact: ["contact", "contact info", "contact information"],
  summary: ["about", "summary"],
  experience: ["experience", "professional experience", "work experience"],
  education: ["education", "academic background"],
  skills: ["skills", "top skills", "featured skills", "key skills"],
  projects: ["projects", "selected projects", "project experience"],
  certifications: ["certifications", "licenses and certifications", "certificates"],
  languages: ["languages", "language proficiency"],
  honors: ["honors and awards", "honours and awards", "awards"],
  courses: ["courses"],
  publications: ["publications"],
  volunteer: ["volunteer experience", "volunteering"],
};

const PROFILE_SECTION_KEYS = new Set<ImportedProfileField>([
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "languages",
]);

const REQUIRED_REVIEW_FIELDS: ImportedProfileField[] = [
  "fullName",
  "headline",
  "summary",
  "experience",
  "education",
  "skills",
  "certifications",
];

function normalizeHeading(value: string) {
  return value
    .normalize("NFKC")
    .replace(/\u00a0/g, " ")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[–—]/g, "-")
    .replace(/[^\p{L}\p{N}+# -]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const NORMALIZED_ALIAS_TO_SECTION = new Map<string, SectionKey>();
for (const [section, aliases] of Object.entries(SECTION_ALIASES) as [SectionKey, string[]][]) {
  for (const alias of aliases) NORMALIZED_ALIAS_TO_SECTION.set(normalizeHeading(alias), section);
}

function detectHeading(value: string) {
  const normalized = normalizeHeading(value.replace(/[:|•·]+$/g, ""));
  if (!normalized || normalized.length > 64 || normalized.split(" ").length > 7) return null;
  return NORMALIZED_ALIAS_TO_SECTION.get(normalized) ?? null;
}

function isPageNoise(line: string) {
  return (
    /^--?\s*\d+\s+(?:of|\/)\s+\d+\s*--?$/i.test(line) ||
    /^page\s+\d+(?:\s+of\s+\d+)?$/i.test(line) ||
    /^\d+\s*\/\s*\d+$/.test(line) ||
    /^linkedin$/i.test(line)
  );
}

function logicalLines(text: string) {
  const physical = text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim())
    .filter((line) => line && !isPageNoise(line));
  const result: string[] = [];

  for (let index = 0; index < physical.length; index += 1) {
    const line = physical[index];
    const wrapped = physical[index + 1] ? `${line} ${physical[index + 1]}` : "";
    if (!detectHeading(line) && wrapped && detectHeading(wrapped)) {
      result.push(wrapped);
      index += 1;
    } else {
      result.push(line);
    }
  }
  return result;
}

function looksLikeContact(line: string) {
  return (
    /\b[\w.+-]+@[\w.-]+\.\p{L}{2,}\b/iu.test(line) ||
    /linkedin\.com\/in\//i.test(line) ||
    /https?:\/\//i.test(line) ||
    /\+?\d[\d\s().-]{7,}/.test(line)
  );
}

function looksLikeLocation(line: string) {
  if (line.length > 70 || /\d/.test(line)) return false;
  return (
    /\b(?:area|region|county|metropolitan|hungary|slovakia|germany|france|united kingdom|united states)\b/i.test(line) ||
    /^[\p{L}.' -]+,\s*[\p{L}.' -]+$/u.test(line) ||
    /^(?:budapest|bratislava|london|paris|berlin|vienna)$/i.test(line)
  );
}

function looksLikeName(line: string) {
  const normalized = line.normalize("NFKC").trim();
  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length < 2 || parts.length > 5 || normalized.length < 4 || normalized.length > 70) return false;
  if (looksLikeContact(normalized) || detectHeading(normalized) || /\d/.test(normalized)) return false;
  if (!parts.every((part) => /^[\p{L}][\p{L}'’.\-]*$/u.test(part))) return false;
  if (/\b(?:skills?|certifications?|experience|education|company|university|manager|engineer|consultant|specialist|developer|planner|independent|profile)\b/i.test(normalized)) return false;
  return true;
}

function identityScore(lines: string[], index: number, aboutIndex: number) {
  const line = lines[index];
  let score = 0;
  if (looksLikeName(line)) score += 5;
  if (line.split(/\s+/).every((part) => /^\p{Lu}/u.test(part))) score += 2;
  if (aboutIndex >= 0 && index < aboutIndex) score += Math.max(0, 5 - Math.floor((aboutIndex - index) / 2));
  const next = lines[index + 1] ?? "";
  const afterNext = lines[index + 2] ?? "";
  if (next && !looksLikeContact(next) && !looksLikeLocation(next) && !detectHeading(next) && next.length >= 8) score += 2;
  if (looksLikeLocation(next) || looksLikeLocation(afterNext)) score += 2;
  return score;
}

function findIdentity(lines: string[]) {
  const aboutIndex = lines.findIndex((line) => detectHeading(line) === "summary");
  const candidates = lines
    .map((line, index) => ({ line, index, score: identityScore(lines, index, aboutIndex) }))
    .filter((candidate) => candidate.score >= 5)
    .sort((left, right) => right.score - left.score || left.index - right.index);
  const best = candidates[0];
  if (!best) return { fullName: "", headline: "", nameIndex: -1, headlineIndex: -1 };

  let headlineIndex = -1;
  for (let index = best.index + 1; index <= Math.min(lines.length - 1, best.index + 4); index += 1) {
    const line = lines[index];
    if (detectHeading(line)) break;
    if (looksLikeContact(line) || looksLikeLocation(line) || looksLikeName(line) || line.length < 5) continue;
    headlineIndex = index;
    break;
  }

  return {
    fullName: best.line,
    headline: headlineIndex >= 0 ? lines[headlineIndex] : "",
    nameIndex: best.index,
    headlineIndex,
  };
}

function confidenceForSection(section: ImportedProfileField, value: string): ProfileFieldConfidence {
  const words = value.split(/\s+/).filter(Boolean).length;
  if (section === "fullName") return words >= 2 ? "high" : "low";
  if (section === "headline") return words >= 3 ? "high" : "medium";
  if (section === "summary" || section === "experience") return words >= 20 ? "high" : "medium";
  return words >= 2 ? "high" : "medium";
}

export function parseLinkedInProfileText(text: string): LinkedInProfileImport {
  const rawText = text.replace(/\u0000/g, "").trim();
  const lines = logicalLines(rawText);
  const identity = findIdentity(lines);
  const identityIndexes = new Set([identity.nameIndex, identity.headlineIndex].filter((index) => index >= 0));
  const buckets = new Map<SectionKey, string[]>();
  let current: SectionKey | null = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const heading = detectHeading(line);
    if (heading) {
      current = heading;
      if (!buckets.has(heading)) buckets.set(heading, []);
      continue;
    }
    if (!current || identityIndexes.has(index)) continue;
    if (index >= identity.nameIndex && index <= identity.nameIndex + 3 && looksLikeLocation(line)) continue;
    buckets.get(current)?.push(line);
  }

  const profile: Partial<Record<ImportedProfileField, string>> = {};
  if (identity.fullName) profile.fullName = identity.fullName;
  if (identity.headline) profile.headline = identity.headline;

  for (const [section, values] of buckets.entries()) {
    if (!PROFILE_SECTION_KEYS.has(section as ImportedProfileField)) continue;
    const key = section as ImportedProfileField;
    const value = values.filter(Boolean).join(key === "skills" ? ", " : "\n").trim();
    if (value) profile[key] = value;
  }

  const fields: LinkedInProfileImport["fields"] = {};
  for (const [key, value] of Object.entries(profile) as [ImportedProfileField, string][]) {
    fields[key] = { value, source: "linkedin_pdf", confidence: confidenceForSection(key, value) };
  }

  const detectedSections = (Object.keys(profile) as ImportedProfileField[]).filter((key) => !["fullName", "headline"].includes(key));
  const reviewItems = REQUIRED_REVIEW_FIELDS.filter((key) => !profile[key]);

  return { profile, fields, detectedSections, reviewItems, rawText };
}

export const LINKEDIN_SECTION_ALIASES = SECTION_ALIASES;
