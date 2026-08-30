import {
  rankCareerEvidence,
  resolveTargetCareer,
  scoreCareerEvidence,
  type CareerEvidenceMatch,
  type CareerMatchDimensions,
  type CareerReference,
} from "./careerMatching.ts";
import { assessProjectEvidence, type ProjectEvidenceAssessment } from "./projectEvidence.ts";

export type SemanticCVProfile = {
  fullName: string;
  headline: string;
  targetPosition: string;
  openToSuggestions: boolean;
  summary: string;
  experience: string;
  education: string;
  skills: string;
  projects: string;
  certifications: string;
  languages: string;
  weeklyHours: string;
  linkedinUrl: string;
};

export type { CareerReference };

export type SemanticScoreRow = { label: string; score: number; note: string };

export type CVFreshness = {
  status: "current" | "possibly-outdated" | "outdated" | "unknown";
  latestExperienceYear: number | null;
  ageYears: number | null;
  recommendationConfidence: "high" | "medium" | "low";
  message: string;
};

export type SemanticCareerMatch = CareerEvidenceMatch & { weeks: string };

export type SemanticCVAnalysis = {
  overall: number;
  verdict: string;
  alignmentMode: "discovery" | "targeted";
  rows: SemanticScoreRow[];
  strengths: string[];
  gaps: string[];
  nextActions: string[];
  matches: SemanticCareerMatch[];
  freshness: CVFreshness;
  projectEvidence: ProjectEvidenceAssessment;
};

type SectionKey = "summary" | "experience" | "skills" | "education" | "projects" | "certifications" | "languages";

type ParsedCV = {
  sections: Record<SectionKey, string>;
  header: string;
  explicitSections: Set<SectionKey>;
  summaryInferred: boolean;
  wordCount: number;
};

const SECTION_ALIASES: Record<SectionKey, string[]> = {
  summary: ["about", "summary", "professional summary", "profile", "professional profile", "career profile", "about me", "objective", "career objective", "executive summary"],
  experience: ["experience", "work experience", "professional experience", "employment history", "career history", "work history", "employment"],
  skills: ["skills", "top skills", "featured skills", "key skills", "technical skills", "core skills", "competencies", "core competencies", "tools and technologies", "technologies", "expertise"],
  education: ["education", "academic background", "academic history", "education and training", "qualifications"],
  projects: ["projects", "selected projects", "key projects", "portfolio", "personal projects", "professional projects"],
  certifications: ["certifications", "certificates", "licenses and certifications", "certificates and licenses", "professional certifications"],
  languages: ["languages", "language skills", "language proficiency"],
};

const ACTION_VERBS = [
  "achieved", "automated", "built", "building", "created", "delivered", "designed", "developed", "drove",
  "enabled", "established", "implemented", "improved", "increased", "launched", "led", "managed",
  "migrated", "optimized", "orchestrated", "reduced", "redesigned", "resolved", "scaled", "streamlined",
  "transformed", "integrated", "analyzed", "analysed", "deployed", "coordinated", "owned", "introduced",
];

const OUTCOME_TERMS = [
  "accuracy", "adoption", "cost", "efficiency", "growth", "kpi", "quality", "revenue", "roi", "saved",
  "saving", "sla", "throughput", "time saved", "productivity", "performance", "conversion", "cycle time",
  "lead time", "utilization", "utilisation", "availability", "reliability", "compliance", "risk reduction",
  "reduced", "increased", "improved", "accelerated",
];

const SKILL_GROUPS: Record<string, string[]> = {
  data: ["sql", "power bi", "tableau", "excel", "dax", "power query", "python", "pandas", "statistics", "data analysis", "data analytics", "dashboard", "reporting", "data modeling", "data modelling", "etl", "fabric", "databricks", "spark", "dbt", "airflow", "data warehouse", "forecasting"],
  automation: ["ai automation", "power platform", "power automate", "power apps", "copilot studio", "n8n", "make.com", "zapier", "uipath", "rpa", "workflow automation", "process automation", "webhook", "webhooks", "rest api", "api", "apis", "dataverse"],
  ai: ["artificial intelligence", "business ai", "human-in-the-loop ai", "generative ai", "llm", "llms", "openai", "anthropic", "prompt engineering", "rag", "retrieval augmented generation", "embeddings", "vector database", "ai agents", "agents", "machine learning", "scikit-learn", "pytorch", "transformers", "model evaluation"],
  productConsulting: ["ai product", "product architecture", "stakeholder management", "stakeholder", "requirements", "business analysis", "business analyst", "consulting", "discovery", "workshop", "product strategy", "roadmap", "user research", "change management", "adoption", "digital transformation", "process mapping", "process analysis", "solution design", "business case", "value realization", "value realisation"],
  engineering: ["javascript", "typescript", "react", "next.js", "nextjs", "node.js", "nodejs", "git", "github", "docker", "kubernetes", "terraform", "azure", "aws", "gcp", "ci/cd", "linux", "oauth", "json", "microservices"],
  security: ["cybersecurity", "security", "siem", "soc", "incident response", "vulnerability management", "iam", "identity", "threat detection", "cloud security", "zero trust", "compliance"],
  marketingContent: ["seo", "geo", "content strategy", "content marketing", "campaign", "crm", "segmentation", "lifecycle", "marketing automation", "google analytics", "analytics", "experimentation", "a/b testing", "editorial"],
};

function clamp(value: number, maximum = 100) {
  return Math.max(0, Math.min(maximum, Math.round(value)));
}

function normalize(value: string) {
  return value
    .normalize("NFKC")
    .replace(/\u00a0/g, " ")
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9+#.%/ -]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizedHeading(value: string) {
  return normalize(value.replace(/[:|•·]+$/g, ""));
}

function words(value: string) {
  return normalize(value).split(" ").filter(Boolean);
}

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

function countPhrase(text: string, phrase: string) {
  const normalizedText = ` ${normalize(text)} `;
  const normalizedPhrase = normalize(phrase);
  if (!normalizedPhrase) return 0;
  const needle = ` ${normalizedPhrase} `;
  let count = 0;
  let cursor = 0;
  while (true) {
    const index = normalizedText.indexOf(needle, cursor);
    if (index < 0) break;
    count += 1;
    cursor = index + needle.length;
  }
  return count;
}

function detectHeading(line: string): SectionKey | null {
  const heading = normalizedHeading(line);
  if (!heading || heading.length > 64 || heading.split(" ").length > 7) return null;
  for (const [key, aliases] of Object.entries(SECTION_ALIASES) as [SectionKey, string[]][]) {
    if (aliases.some((alias) => normalize(alias) === heading)) return key;
  }
  return null;
}

function isPageNoise(line: string) {
  return /^--?\s*\d+\s+(?:of|\/)\s+\d+\s*--?$/i.test(line) || /^page\s+\d+(?:\s+of\s+\d+)?$/i.test(line) || /^\d+\s*\/\s*\d+$/.test(line);
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
    const joined = physical[index + 1] ? `${line} ${physical[index + 1]}` : "";
    if (!detectHeading(line) && joined && detectHeading(joined)) {
      result.push(joined);
      index += 1;
    } else {
      result.push(line);
    }
  }
  return result;
}

function parseCV(text: string): ParsedCV {
  const cleaned = text.replace(/\u0000/g, "").trim();
  const lines = logicalLines(cleaned);
  const buckets: Record<SectionKey, string[]> = { summary: [], experience: [], skills: [], education: [], projects: [], certifications: [], languages: [] };
  const header: string[] = [];
  const explicitSections = new Set<SectionKey>();
  let current: SectionKey | null = null;

  for (const line of lines) {
    const heading = detectHeading(line);
    if (heading) {
      current = heading;
      explicitSections.add(heading);
      continue;
    }
    if (current) buckets[current].push(line);
    else header.push(line);
  }

  let summaryInferred = false;
  if (!buckets.summary.length && header.length) {
    const candidates = header.filter((line, index) => {
      if (index < 2 && words(line).length <= 8) return false;
      if (/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i.test(line) || /linkedin\.com|github\.com|https?:\/\//i.test(line)) return false;
      if (/\+?\d[\d\s().-]{7,}/.test(line)) return false;
      return words(line).length >= 6;
    });
    const inferred = candidates.join(" ").slice(0, 900).trim();
    if (words(inferred).length >= 18) {
      buckets.summary.push(inferred);
      summaryInferred = true;
    }
  }

  return {
    sections: Object.fromEntries(Object.entries(buckets).map(([key, value]) => [key, value.join("\n").trim()])) as Record<SectionKey, string>,
    header: header.join("\n"),
    explicitSections,
    summaryInferred,
    wordCount: words(cleaned).length,
  };
}

function metricEvidence(text: string) {
  const patterns = [
    /\b\d+(?:\.\d+)?\s*%/g,
    /(?:€|\$|£)\s?\d[\d,.]*(?:\s?[kmb])?/gi,
    /\b\d{1,3}(?:,\d{3})+\b/g,
    /\b\d+(?:\.\d+)?\s*(?:hours?|hrs?|days?|weeks?|months?|users?|customers?|employees?|people|projects?|workflows?|processes?|reports?|dashboards?|sites?|locations?|areas?|items?|orders?|articles?|countries?|minutes?|seconds?)\b/gi,
    /\b(?:saved|reduced|increased|improved|grew|cut|decreased|accelerated)\s+(?:by\s+)?\d+(?:\.\d+)?/gi,
  ];
  return patterns.reduce((sum, pattern) => sum + (text.match(pattern)?.length ?? 0), 0);
}

function dateRangeEvidence(text: string) {
  const yearRanges = text.match(/\b(?:19|20)\d{2}\s*(?:-|to|–|—)\s*(?:(?:19|20)\d{2}|present|current|now)\b/gi)?.length ?? 0;
  const monthYears = text.match(/\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(?:19|20)\d{2}\b/gi)?.length ?? 0;
  return yearRanges + Math.floor(monthYears / 2);
}

function actionEvidence(text: string) {
  return ACTION_VERBS.reduce((sum, verb) => sum + Math.min(3, countPhrase(text, verb)), 0);
}

function outcomeEvidence(text: string) {
  return OUTCOME_TERMS.reduce((sum, term) => sum + Math.min(2, countPhrase(text, term)), 0);
}

function contactSignals(text: string) {
  return {
    email: /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i.test(text),
    phone: /\+?\d[\d\s().-]{7,}/.test(text),
    linkedin: /linkedin\.com\/in\//i.test(text),
  };
}

function detectedSkills(text: string) {
  const normalizedText = ` ${normalize(text)} `;
  return unique(Object.values(SKILL_GROUPS).flat())
    .sort((left, right) => right.length - left.length)
    .filter((skill) => normalizedText.includes(` ${normalize(skill)} `));
}

function skillGroupCoverage(skills: string[]) {
  const skillSet = new Set(skills.map(normalize));
  return Object.values(SKILL_GROUPS).filter((group) => group.some((skill) => skillSet.has(normalize(skill)))).length;
}

function mergeSection(profileValue: string, parsedValue: string) {
  const values = unique([profileValue.trim(), parsedValue.trim()].filter(Boolean));
  return values.join("\n").trim();
}

function scoreSummary(summary: string, inferred: boolean) {
  if (!summary.trim()) return 12;
  const count = words(summary).length;
  const lengthFit = count >= 35 && count <= 140 ? 32 : count >= 22 && count <= 180 ? 23 : 12;
  const specificity = unique(detectedSkills(summary)).length;
  const evidence = metricEvidence(summary) + outcomeEvidence(summary);
  const roleLanguage = /\b(?:specialist|manager|engineer|consultant|analyst|developer|architect|leader|professional|planner|strategist|product builder)\b/i.test(summary);
  let score = 22 + lengthFit + Math.min(20, specificity * 3) + Math.min(14, evidence * 3) + (roleLanguage ? 8 : 0);
  if (inferred) score = Math.min(score, 82);
  return clamp(score, 96);
}

function scoreExperience(experience: string, fallbackText: string) {
  const text = experience.trim() || fallbackText;
  if (words(text).length < 35) return 18;
  const actions = actionEvidence(text);
  const metrics = metricEvidence(text);
  const outcomes = outcomeEvidence(text);
  const dates = dateRangeEvidence(text);
  const lineCount = text.split("\n").filter((line) => words(line).length >= 4).length;
  return clamp(25 + Math.min(24, actions * 2.2) + Math.min(22, metrics * 4) + Math.min(14, outcomes * 1.8) + Math.min(10, dates * 3) + Math.min(8, lineCount), 97);
}

function scoreEvidence(source: string, projectEvidence: ProjectEvidenceAssessment) {
  const metrics = metricEvidence(source);
  const outcomes = outcomeEvidence(source);
  const actions = actionEvidence(source);
  return clamp(12 + Math.min(38, metrics * 6) + Math.min(18, outcomes * 1.8) + Math.min(8, Math.floor(actions / 3)) + projectEvidence.score * 1.6, 97);
}

function scoreSkills(skillsSection: string, source: string, evidenceText: string) {
  const declared = unique(detectedSkills(skillsSection));
  const allDetected = unique(detectedSkills(source));
  const normalizedEvidence = ` ${normalize(evidenceText)} `;
  const evidenced = allDetected.filter((skill) => normalizedEvidence.includes(` ${normalize(skill)} `));
  const groups = skillGroupCoverage(allDetected);
  return clamp(15 + Math.min(34, allDetected.length * 2.8) + Math.min(16, declared.length * 2) + Math.min(22, evidenced.length * 2.5) + Math.min(10, groups * 2.5), 96);
}

function scoreStructure(parsed: ParsedCV, source: string, profile: SemanticCVProfile) {
  const contacts = contactSignals(source);
  const explicit = parsed.explicitSections;
  let score = 10;
  score += contacts.email ? 9 : 0;
  score += contacts.phone ? 5 : 0;
  score += contacts.linkedin || profile.linkedinUrl ? 4 : 0;
  score += explicit.has("experience") || profile.experience ? 22 : 0;
  score += explicit.has("skills") || profile.skills ? 15 : 0;
  score += explicit.has("education") || profile.education ? 12 : 0;
  score += explicit.has("summary") || profile.summary ? 13 : parsed.summaryInferred ? 7 : 0;
  score += explicit.has("projects") || profile.projects ? 5 : 0;
  score += explicit.has("certifications") || profile.certifications ? 3 : 0;
  score += dateRangeEvidence(source) >= 1 ? 6 : 0;
  return clamp(score, 97);
}

function scoreATS(parsed: ParsedCV, source: string, profile: SemanticCVProfile) {
  const contacts = contactSignals(source);
  const chars = source.length || 1;
  const oddChars = source.match(/[�\u0000]/g)?.length ?? 0;
  const readableRatio = 1 - oddChars / chars;
  const wc = parsed.wordCount;
  const lengthScore = wc >= 250 && wc <= 1400 ? 30 : wc >= 150 && wc <= 1800 ? 22 : wc >= 80 ? 14 : 5;
  const sectionScore = Math.min(30, (parsed.explicitSections.size + (profile.experience ? 1 : 0) + (profile.skills ? 1 : 0)) * 5);
  const contactScore = (contacts.email ? 8 : 0) + (contacts.phone ? 5 : 0) + (contacts.linkedin || profile.linkedinUrl ? 3 : 0);
  const chronologyScore = Math.min(10, dateRangeEvidence(source) * 3);
  return clamp(12 + lengthScore + sectionScore + contactScore + chronologyScore + (readableRatio > 0.995 ? 8 : 2), 96);
}

function assessCVFreshness(experience: string, source: string): CVFreshness {
  const currentYear = new Date().getUTCFullYear();
  const experienceText = experience.trim() || source;
  const hasCurrentRole = /(?:-|–|—|to)\s*(?:present|current|now)\b/i.test(experienceText);
  const years = [...experienceText.matchAll(/\b(?:19|20)\d{2}\b/g)].map((match) => Number(match[0])).filter((year) => year >= 1950 && year <= currentYear + 1);
  const latestExperienceYear = years.length ? Math.max(...years) : null;
  if (hasCurrentRole) return { status: "current", latestExperienceYear: currentYear, ageYears: 0, recommendationConfidence: "high", message: "A current/present role is explicitly dated in the CV, so career recommendations can use the timeline with normal confidence." };
  if (!latestExperienceYear) return { status: "unknown", latestExperienceYear: null, ageYears: null, recommendationConfidence: "low", message: "Career OS could not identify a reliable recent year in the experience timeline. Update role dates before relying on career recommendations." };
  const ageYears = Math.max(0, currentYear - latestExperienceYear);
  if (ageYears <= 1) return { status: "current", latestExperienceYear, ageYears, recommendationConfidence: "high", message: `The most recent dated experience is ${latestExperienceYear}, which appears current enough for normal recommendation confidence.` };
  if (ageYears === 2) return { status: "possibly-outdated", latestExperienceYear, ageYears, recommendationConfidence: "medium", message: `The most recent dated experience found is ${latestExperienceYear}. Career recommendations may miss changes from the last ${ageYears} years.` };
  return { status: "outdated", latestExperienceYear, ageYears, recommendationConfidence: "low", message: `The most recent dated experience found is ${latestExperienceYear}, about ${ageYears} years ago. Update your recent roles, responsibilities, tools and achievements before treating career recommendations as a current-profile assessment.` };
}

function customTargetScore(targetPosition: string, source: string, evidenceText: string) {
  const targetTerms = unique(words(targetPosition).filter((word) => word.length >= 3));
  const normalizedSource = ` ${normalize(source)} `;
  const directCoverage = targetTerms.length ? targetTerms.filter((term) => normalizedSource.includes(` ${term} `)).length / targetTerms.length : 0;
  return clamp(12 + directCoverage * 68 + Math.min(18, detectedSkills(evidenceText).length * 2));
}

function gapClosingEstimate(match: CareerEvidenceMatch, weeklyHours: number) {
  const coreGapCount = match.evidenceSummary.coreGaps.length;
  if (!coreGapCount) return "No core learning gap detected";
  let hours = 12 + Math.min(8, coreGapCount) * 8;
  if (match.score < 40) hours += 30;
  else if (match.score < 60) hours += 16;
  else if (match.score >= 80) hours = Math.max(12, hours - 8);
  const low = Math.max(2, Math.ceil(hours / weeklyHours));
  const high = Math.max(low + 1, Math.ceil((hours * 1.25) / weeklyHours));
  return `${low}–${high} weeks at ${weeklyHours}h/week`;
}

export function analyzeSemanticCV(profile: SemanticCVProfile, rawText: string, careers: readonly CareerReference[]): SemanticCVAnalysis {
  const profileText = [profile.headline, profile.summary, profile.experience, profile.education, profile.skills, profile.projects, profile.certifications, profile.languages].filter(Boolean).join("\n");
  const source = [rawText, profileText].filter(Boolean).join("\n").trim();
  const parsed = parseCV(rawText || profileText);
  const summary = mergeSection(profile.summary, parsed.sections.summary);
  const experience = mergeSection(profile.experience, parsed.sections.experience);
  const skills = mergeSection(profile.skills, parsed.sections.skills);
  const projects = mergeSection(profile.projects, parsed.sections.projects);
  const evidenceText = `${experience}\n${projects}\n${summary}`.trim() || source;
  const freshness = assessCVFreshness(experience, source);
  const projectEvidence = assessProjectEvidence({ projects, summary, experience, source });
  const matchingInput = {
    headline: profile.headline,
    summary,
    skills,
    experience,
    projects,
    education: mergeSection(profile.education, parsed.sections.education),
    certifications: mergeSection(profile.certifications, parsed.sections.certifications),
    source,
    projectEvidence,
  };
  const ranked = rankCareerEvidence(careers, matchingInput);
  const alignmentMode = profile.openToSuggestions || !profile.targetPosition.trim() ? "discovery" : "targeted";
  const selectedCareer = alignmentMode === "targeted" ? resolveTargetCareer(profile.targetPosition, careers) : null;
  const targetedMatch = selectedCareer ? scoreCareerEvidence(selectedCareer, matchingInput) : null;
  const targetScore = alignmentMode === "discovery" ? ranked[0]?.score ?? 0 : targetedMatch?.score ?? customTargetScore(profile.targetPosition, source, evidenceText);

  const summaryScore = scoreSummary(summary, parsed.summaryInferred && !profile.summary);
  const experienceScore = scoreExperience(experience, source);
  const evidenceScore = scoreEvidence(source, projectEvidence);
  const skillsScore = scoreSkills(skills, source, evidenceText);
  const structureScore = scoreStructure(parsed, source, profile);
  const atsScore = scoreATS(parsed, source, profile);
  const alignmentLabel = alignmentMode === "discovery" ? "Career direction alignment" : "Target job alignment";
  const rows: SemanticScoreRow[] = [
    { label: "ATS readability", score: atsScore, note: "Career OS baseline for text extraction, chronology and recognizable CV sections; not an employer ATS score." },
    { label: "Professional summary", score: summaryScore, note: "Evaluates detected or entered summary for positioning, specificity, evidence and useful length." },
    { label: "Experience quality", score: experienceScore, note: "Evaluates experience using action language, chronology, scope, outcomes and measurable results." },
    { label: "Achievement evidence", score: evidenceScore, note: "Recognizes quantified outcomes plus credible product, project, implementation and portfolio evidence across the profile." },
    { label: "Skills relevance", score: skillsScore, note: "Checks whether detected skills are supported inside summary, experience or project evidence." },
    { label: alignmentLabel, score: targetScore, note: alignmentMode === "discovery" ? "Measures evidence against the strongest available Career directions without treating one as a selected target." : `Measures evidence only against ${selectedCareer?.title ?? profile.targetPosition}.` },
    { label: "CV structure", score: structureScore, note: "Checks actual detected sections, contact details and chronology." },
  ];

  const weights = [0.15, 0.1, 0.22, 0.18, 0.15, 0.1, 0.1];
  const overall = clamp(rows.reduce((sum, row, index) => sum + row.score * weights[index], 0), 97);
  const strengths: string[] = [];
  const gaps: string[] = [];
  const detected = unique(detectedSkills(source));
  const normalizedEvidence = ` ${normalize(evidenceText)} `;
  const evidenced = detected.filter((skill) => normalizedEvidence.includes(` ${normalize(skill)} `));
  const metrics = metricEvidence(source);

  if (atsScore >= 75) strengths.push("The uploaded CV is text-extractable and exposes core recruiter-readable signals.");
  if (summaryScore >= 72) strengths.push("The professional summary presents a specific role identity and value proposition.");
  if (experienceScore >= 72) strengths.push("Experience contains credible action, chronology and outcome evidence.");
  if (metrics >= 4) strengths.push(`The CV contains ${metrics} measurable evidence signals rather than relying only on responsibilities.`);
  if (evidenced.length >= 6) strengths.push(`${evidenced.length} detected skills are supported inside experience or project evidence.`);
  if (projectEvidence.confidence === "high" || projectEvidence.confidence === "medium") strengths.push(`${projectEvidence.namedProducts.length || "Named"} product/project evidence is supported by implementation detail.`);

  if (freshness.status !== "current") gaps.push(freshness.message);
  if (structureScore < 70) gaps.push("Make Summary, Experience, Skills and Education explicit and consistently headed so recruiters can locate them quickly.");
  if (summaryScore < 65) gaps.push("Strengthen the summary with a clear role identity, domain focus and 1–2 differentiating proof points.");
  if (experienceScore < 65) gaps.push("Rewrite weak experience bullets around action + scope + outcome, and preserve clear role dates.");
  if (metrics < 3) gaps.push("Add measurable outcomes such as time saved, cost, volume, quality, adoption, revenue or performance change.");
  if (skillsScore < 65) gaps.push("Add a focused skills section and support important skills inside experience or project evidence.");
  if (targetScore < 55) gaps.push(alignmentMode === "discovery" ? "Current evidence only partially aligns with the strongest Career directions; strengthen role-specific tools and proof." : `Evidence for ${profile.targetPosition} is incomplete; add role-specific skills, tools and outcomes.`);
  if (projectEvidence.confidence === "none" || projectEvidence.confidence === "low") gaps.push("Add a substantial project, named product, case study or portfolio reference that proves a target-role skill in practice.");

  const weekly = Math.max(1, Math.min(40, Number(profile.weeklyHours) || 5));
  const emptyDimensions: CareerMatchDimensions = { roleRelevance: targetScore, professionalEvidence: 0, coreRequirements: 0, trajectory: 0, transferability: 0 };
  const baseMatches = alignmentMode === "discovery"
    ? ranked.slice(0, 3)
    : targetedMatch
      ? [targetedMatch]
      : [{
          careerSlug: "custom-target",
          title: profile.targetPosition,
          score: targetScore,
          match: targetScore,
          dimensions: emptyDimensions,
          evidenceSignals: [],
          missingSignals: ["No exact Career Catalog entry was resolved for this target."],
          evidenceSummary: {
            strongestEvidence: [],
            transferableEvidence: [],
            coreGaps: ["No exact Career Catalog entry was resolved for this target."],
            supportingOpportunities: [],
            limitingFactors: [],
          },
          professionalEvidence: {
            directDurationMonths: 0,
            directDurationBucket: "unknown" as const,
            transferableDurationMonths: 0,
            transferableDurationBucket: "unknown" as const,
            contexts: [],
            implementationCount: 0,
          },
          confidence: "low" as const,
        }];
  const matches = baseMatches.map((match) => ({ ...match, weeks: gapClosingEstimate(match, weekly) }));
  const firstGap = gaps[0] ?? "Tailor the strongest evidence to the role you want to pursue.";
  const nextActions = [
    firstGap,
    evidenced.length < 6 ? "Turn important declared skills into proof by attaching them to projects, results or concrete work examples." : "Keep the strongest evidenced skills prominent and remove low-value or unsupported claims.",
    alignmentMode === "discovery" ? "Compare the top evidence-aligned Career directions, then run a targeted analysis for the strongest realistic direction." : `Create a targeted CV version for ${profile.targetPosition} using the missing evidence signals as a checklist.`,
  ];

  return {
    overall,
    verdict: overall >= 85 ? "Strong Career OS CV baseline" : overall >= 70 ? "Competitive baseline with specific improvement opportunities" : overall >= 55 ? "Usable baseline, but evidence and positioning need work" : "Needs restructuring and stronger evidence before targeted applications",
    alignmentMode,
    rows,
    strengths: strengths.length ? unique(strengths).slice(0, 6) : ["The CV contains enough readable content to establish a Career OS baseline."],
    gaps: unique(gaps).slice(0, 6),
    nextActions,
    matches,
    freshness,
    projectEvidence,
  };
}
