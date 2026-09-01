import type { JobAgent } from "@/types/jobAgent";
import type { Profile } from "@/types/identity";

export type FitJobInput = {
  title: string;
  company: string;
  location?: string | null;
  description?: string | null;
  requiredLanguages?: string[];
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
  workplaceModel?: "remote" | "hybrid" | "on_site" | "unknown";
};

export type FitResult = {
  fitScore: number;
  recommendation: "strong" | "prepare" | "review" | "skip";
  strengths: string[];
  gaps: string[];
  reasons: Array<{ factor: string; score: number; maxScore: number; explanation: string }>;
};

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9+#.]+/g, " ").trim();
const tokens = (value: string) => new Set(normalize(value).split(/\s+/).filter((item) => item.length > 2));
const overlap = (items: string[], text: string) => {
  const haystack = normalize(text);
  return items.filter((item) => {
    const needle = normalize(item);
    return needle.length > 1 && haystack.includes(needle);
  });
};

function titleScore(job: FitJobInput, agent: JobAgent) {
  const title = normalize(job.title);
  const primary = normalize(agent.primary_career ?? "");
  const desired = [...agent.desired_titles, ...agent.secondary_careers, ...agent.adjacent_roles].map(normalize).filter(Boolean);
  if (agent.excluded_roles.some((role) => title.includes(normalize(role)))) return { score: 0, explanation: "Role matches an explicit exclusion." };
  if (primary && (title.includes(primary) || primary.includes(title))) return { score: 25, explanation: "Direct match with the primary target career." };
  if (desired.some((role) => title.includes(role) || role.includes(title))) return { score: 21, explanation: "Matches a desired or approved adjacent role." };
  const titleWords = tokens(job.title);
  const targetWords = tokens([agent.primary_career, ...agent.desired_titles, ...agent.secondary_careers].filter(Boolean).join(" "));
  const shared = [...titleWords].filter((word) => targetWords.has(word)).length;
  return { score: Math.min(18, shared * 5), explanation: shared ? "Partial semantic title overlap with target roles." : "Limited title alignment." };
}

function skillScore(job: FitJobInput, profile: Profile) {
  const body = `${job.title} ${job.description ?? ""}`;
  const matched = overlap(profile.skills, body);
  const ratio = profile.skills.length ? matched.length / Math.min(profile.skills.length, 12) : 0;
  return { score: Math.min(25, Math.round(ratio * 25)), matched };
}

function languageScore(job: FitJobInput, profile: Profile, agent: JobAgent) {
  const required = (job.requiredLanguages ?? []).filter(Boolean);
  if (!required.length) return { score: 15, missing: [] as string[], explanation: "No explicit language requirement detected." };
  const known = profile.languages.map(normalize);
  const missing = required.filter((language) => !known.some((value) => value.includes(normalize(language)) || normalize(language).includes(value)));
  if (!missing.length) return { score: 15, missing, explanation: "Known languages satisfy detected requirements." };
  return { score: agent.exclude_unknown_languages ? 0 : 6, missing, explanation: `Missing or unverified language requirement: ${missing.join(", ")}.` };
}

function geographyScore(job: FitJobInput, agent: JobAgent) {
  const location = normalize(job.location ?? "");
  if (agent.excluded_countries.some((country) => location.includes(normalize(country)))) return { score: 0, explanation: "Location is explicitly excluded." };
  if (job.workplaceModel === "remote" && agent.workplace_preferences.includes("remote")) return { score: 15, explanation: "Remote preference aligned." };
  if (agent.search_countries.some((country) => location.includes(normalize(country))) || agent.cities_regions.some((place) => location.includes(normalize(place)))) return { score: 15, explanation: "Location matches the configured search geography." };
  if (!agent.search_countries.length && !agent.cities_regions.length) return { score: 10, explanation: "No strict geography filter configured." };
  return { score: 4, explanation: "Location is outside the preferred geography or could not be verified." };
}

function salaryScore(job: FitJobInput, agent: JobAgent) {
  if (agent.minimum_salary === null) return { score: 10, explanation: "No minimum salary constraint configured." };
  if (job.salaryMax === null || job.salaryMax === undefined) return { score: 5, explanation: "Salary is not disclosed, so alignment cannot be verified." };
  const expectedCurrency = agent.salary_currency?.trim().toUpperCase() || null;
  const jobCurrency = job.currency?.trim().toUpperCase() || null;
  if (!expectedCurrency || !jobCurrency || expectedCurrency !== jobCurrency) {
    return { score: 5, explanation: "Salary is present, but its currency cannot be safely compared with the configured salary threshold." };
  }
  if (job.salaryMax < agent.minimum_salary) return { score: 0, explanation: `Published salary range is below the configured minimum in ${expectedCurrency}.` };
  return { score: 10, explanation: `Published salary range meets the configured minimum in ${expectedCurrency}.` };
}

function experienceScore(job: FitJobInput, profile: Profile) {
  const description = normalize(job.description ?? "");
  const matches = [...description.matchAll(/(\d{1,2})\+?\s*(?:years|yrs)/g)].map((match) => Number(match[1])).filter(Number.isFinite);
  if (!matches.length || profile.years_experience === null) return { score: 5, explanation: "Experience requirement is not explicit or profile tenure is unavailable." };
  const required = Math.min(...matches);
  if (profile.years_experience >= required) return { score: 10, explanation: `Profile tenure meets the detected ${required}-year requirement.` };
  const ratio = Math.max(0, profile.years_experience / required);
  return { score: Math.round(ratio * 7), explanation: `Detected experience requirement is about ${required} years; profile currently records ${profile.years_experience}.` };
}

export function calculateJobFit(job: FitJobInput, profile: Profile, agent: JobAgent): FitResult {
  const title = titleScore(job, agent);
  const skills = skillScore(job, profile);
  const languages = languageScore(job, profile, agent);
  const geography = geographyScore(job, agent);
  const salary = salaryScore(job, agent);
  const experience = experienceScore(job, profile);
  const raw = title.score + skills.score + languages.score + geography.score + salary.score + experience.score;
  const fitScore = Math.max(0, Math.min(100, raw));
  const strengths: string[] = [];
  const gaps: string[] = [];
  if (title.score >= 20) strengths.push("Target-role alignment"); else gaps.push("Role/title alignment is partial");
  if (skills.matched.length) strengths.push(`Matched skills: ${skills.matched.slice(0, 6).join(", ")}`); else gaps.push("Few verified profile skills were found in the vacancy text");
  if (languages.missing.length) gaps.push(`Language gap: ${languages.missing.join(", ")}`); else strengths.push("Language requirements compatible or unspecified");
  if (geography.score >= 10) strengths.push("Geography/work-style fit"); else gaps.push("Geography/work-style mismatch or ambiguity");
  if (salary.score === 0) gaps.push("Salary below configured minimum");

  const recommendation = fitScore >= agent.strong_match_threshold ? "strong"
    : fitScore >= agent.auto_prepare_threshold ? "prepare"
      : fitScore < agent.auto_skip_threshold ? "skip" : "review";

  return {
    fitScore,
    recommendation,
    strengths,
    gaps,
    reasons: [
      { factor: "Role alignment", score: title.score, maxScore: 25, explanation: title.explanation },
      { factor: "Skills", score: skills.score, maxScore: 25, explanation: skills.matched.length ? `${skills.matched.length} verified skills matched.` : "No verified skill match found." },
      { factor: "Languages", score: languages.score, maxScore: 15, explanation: languages.explanation },
      { factor: "Geography", score: geography.score, maxScore: 15, explanation: geography.explanation },
      { factor: "Salary", score: salary.score, maxScore: 10, explanation: salary.explanation },
      { factor: "Experience", score: experience.score, maxScore: 10, explanation: experience.explanation },
    ],
  };
}
