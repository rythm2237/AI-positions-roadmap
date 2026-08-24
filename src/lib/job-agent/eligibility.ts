import type { JobAgent } from "@/types/jobAgent";
import type { Profile } from "@/types/identity";

export type JobEligibilityStatus = "eligible" | "blocked" | "unverified";

export type EligibilityJobInput = {
  title: string;
  company: string;
  country?: string | null;
  location?: string | null;
  description?: string | null;
  descriptionComplete?: boolean;
  workplaceModel?: "remote" | "hybrid" | "on_site" | "unknown";
  employmentTypes?: string[];
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
};

export type JobEligibilityResult = {
  status: JobEligibilityStatus;
  reasons: string[];
  requiredLanguages: string[];
  postingLanguage: string | null;
};

const languagePatterns: Array<[string, RegExp]> = [
  ["English", /\benglish\b/i],
  ["German", /\b(german|deutsch(?:e|en|er|es)?|deutschkenntnisse)\b/i],
  ["French", /\b(french|fran[cç]ais)\b/i],
  ["Dutch", /\b(dutch|nederlands)\b/i],
  ["Spanish", /\b(spanish|espa[nñ]ol)\b/i],
  ["Italian", /\b(italian|italiano)\b/i],
  ["Hungarian", /\b(hungarian|magyar)\b/i],
  ["Polish", /\b(polish|polski)\b/i],
  ["Portuguese", /\b(portuguese|portugu[eê]s)\b/i],
];

const requirementWords = /\b(required|requirement|must|mandatory|fluent|fluency|professional|proficien(?:t|cy)|b1|b2|c1|c2|native|excellent|very good|written and spoken|written communication|spoken communication|kenntnisse|erforderlich|vorausgesetzt|fließend|fliessend|verhandlungssicher)\b/i;
const noSponsorship = /\b(no|not)\s+(?:visa\s+)?sponsorship\b|\b(?:must|need to)\s+(?:already\s+)?(?:have|hold)\s+(?:the\s+)?(?:right|authorization)\s+to\s+work\b/i;
const normalize = (value: string) => value.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");

export function extractRequiredLanguages(text: string): string[] {
  const found = new Set<string>();
  const clauses = text.split(/(?<=[.!?;:\n])\s+|\n+/).filter(Boolean);
  for (const clause of clauses) {
    if (!requirementWords.test(clause)) continue;
    for (const [language, pattern] of languagePatterns) if (pattern.test(clause)) found.add(language);
  }
  return [...found];
}

export function inferPostingLanguage(text: string): string | null {
  const lower = text.toLowerCase();
  const de = lower.match(/\b(und|oder|mit|für|fuer|wir|sie|der|die|das|eine|einen|deine|ihre|aufgaben|anforderungen|kenntnisse|berufserfahrung|arbeitszeit|arbeitsplatz|bewerbung)\b/g)?.length ?? 0;
  const en = lower.match(/\b(and|or|with|for|we|you|the|your|responsibilities|requirements|experience|skills|working|workplace|application)\b/g)?.length ?? 0;
  const fr = lower.match(/\b(et|avec|pour|nous|vous|les|des|une|compétences|competences|expérience|experience|candidature|poste)\b/g)?.length ?? 0;
  if (de >= 5 && de >= en * 1.3) return "German";
  if (fr >= 5 && fr >= en * 1.3) return "French";
  if (en >= 5) return "English";
  return null;
}

function hasLanguage(profile: Profile, language: string) {
  const target = normalize(language);
  return profile.languages.some((item) => {
    const known = normalize(item);
    return known.includes(target) || target.includes(known);
  });
}

function detectedSeniority(title: string): number | null {
  const value = normalize(title);
  if (/\b(intern|internship|trainee|graduate)\b/.test(value)) return 0;
  if (/\b(junior|jr)\b/.test(value)) return 1;
  if (/\b(senior|sr)\b/.test(value)) return 3;
  if (/\b(lead|principal|staff|head|director|vp|vice president)\b/.test(value)) return 4;
  if (/\b(mid|middle|intermediate)\b/.test(value)) return 2;
  return null;
}

function configuredSeniority(value: string | null): number | null {
  if (!value) return null;
  const normalized = normalize(value);
  if (/intern|trainee|graduate|entry/.test(normalized)) return 0;
  if (/junior|jr/.test(normalized)) return 1;
  if (/mid|middle|intermediate/.test(normalized)) return 2;
  if (/senior|sr/.test(normalized)) return 3;
  if (/lead|principal|staff|head|director|vp/.test(normalized)) return 4;
  return null;
}

function needsSponsorship(agent: JobAgent) {
  const value = normalize(agent.sponsorship_requirement ?? "");
  return /need|required|yes|sponsor/.test(value) && !/no|not needed|do not need/.test(value);
}

export function evaluateJobEligibility(job: EligibilityJobInput, profile: Profile, agent: JobAgent): JobEligibilityResult {
  const text = `${job.title}\n${job.description ?? ""}`;
  const blockers: string[] = [];
  const unverified: string[] = [];

  if (agent.excluded_companies.some((company) => normalize(job.company).includes(normalize(company)))) blockers.push("Company matches an explicit exclusion.");
  if (agent.excluded_roles.some((role) => normalize(job.title).includes(normalize(role)))) blockers.push("Role matches an explicit exclusion.");

  const country = job.country?.trim() || null;
  if (country && agent.excluded_countries.some((value) => normalize(value) === normalize(country))) blockers.push(`Country is excluded: ${country}.`);
  if (agent.search_countries.length) {
    if (!country) unverified.push("Job country could not be verified.");
    else if (!agent.search_countries.some((value) => normalize(value) === normalize(country))) blockers.push(`Country is outside the configured search scope: ${country}.`);
  }

  if (agent.cities_regions.length && job.workplaceModel !== "remote") {
    const location = normalize(job.location ?? "");
    if (!location) unverified.push("Job location could not be verified against configured cities/regions.");
    else if (!agent.cities_regions.some((place) => location.includes(normalize(place)))) blockers.push("Location is outside the configured cities/regions.");
  }

  const allowedWorkplaces = agent.workplace_preferences.map(normalize);
  if (allowedWorkplaces.length && allowedWorkplaces.length < 3) {
    if (!job.workplaceModel || job.workplaceModel === "unknown") unverified.push("Workplace model could not be verified.");
    else if (!allowedWorkplaces.includes(normalize(job.workplaceModel))) blockers.push(`Workplace model is not selected: ${job.workplaceModel}.`);
  }

  if (agent.employment_types.length) {
    const detectedEmployment = (job.employmentTypes ?? []).map(normalize);
    if (!detectedEmployment.length) unverified.push("Employment type could not be verified.");
    else if (!agent.employment_types.some((value) => detectedEmployment.includes(normalize(value)))) blockers.push(`Employment type is outside the configured filter: ${job.employmentTypes?.join(", ")}.`);
  }

  const jobSeniority = detectedSeniority(job.title);
  const minSeniority = configuredSeniority(agent.min_seniority);
  const maxSeniority = configuredSeniority(agent.max_seniority);
  if ((minSeniority !== null || maxSeniority !== null) && jobSeniority === null) unverified.push("Seniority could not be verified from the vacancy title.");
  else if (jobSeniority !== null) {
    if (minSeniority !== null && jobSeniority < minSeniority) blockers.push("Role is below the configured minimum seniority.");
    if (maxSeniority !== null && jobSeniority > maxSeniority) blockers.push("Role is above the configured maximum seniority.");
  }

  const requiredLanguages = extractRequiredLanguages(text);
  const postingLanguage = inferPostingLanguage(text);
  const missingLanguages = requiredLanguages.filter((language) => !hasLanguage(profile, language));
  if (missingLanguages.length) blockers.push(`Missing required language: ${missingLanguages.join(", ")}.`);

  if (agent.english_only_priority) {
    const nonEnglishRequirements = requiredLanguages.filter((language) => language !== "English");
    if (nonEnglishRequirements.length) blockers.push(`English-only priority excludes required ${nonEnglishRequirements.join("/")}.`);
    else if (postingLanguage && postingLanguage !== "English") blockers.push(`English-only priority excludes a ${postingLanguage} vacancy.`);
  }

  // Adzuna documents that its public Search API returns only a description snippet. The language
  // used to write that snippet is not proof that no additional language is required later in the ad.
  if (!requiredLanguages.length && agent.exclude_unknown_languages && !job.descriptionComplete) unverified.push("Full language requirements are not available from the job source.");

  if (agent.minimum_salary !== null) {
    if (job.salaryMax !== null && job.salaryMax !== undefined && job.salaryMax < agent.minimum_salary) blockers.push("Published salary range is below the configured minimum.");
    else if ((job.salaryMax === null || job.salaryMax === undefined) && agent.salary_negotiable === false) unverified.push("Salary is undisclosed and the configured minimum cannot be verified.");
  }

  if (needsSponsorship(agent) && noSponsorship.test(text)) blockers.push("Vacancy states that sponsorship/right-to-work support is unavailable.");

  if (blockers.length) return { status: "blocked", reasons: blockers, requiredLanguages, postingLanguage };
  if (unverified.length) return { status: "unverified", reasons: unverified, requiredLanguages, postingLanguage };
  return { status: "eligible", reasons: [], requiredLanguages, postingLanguage };
}
