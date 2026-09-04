import { evaluateJobEligibility } from "./eligibility.ts";
import type { CanonicalJobCandidate } from "./contracts.ts";
import type { CareerEvidenceItem, EligibilityReason, JobAgent, JobEligibilityStatus, NormalizedJobSearchIntent } from "../../types/jobAgent.ts";
import type { Profile } from "../../types/identity.ts";

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
const reasonCode = (message: string) => {
  if (/company.*exclusion/i.test(message)) return "EXCLUDED_COMPANY";
  if (/role.*exclusion/i.test(message)) return "EXCLUDED_ROLE";
  if (/country.*excluded|outside.*search scope/i.test(message)) return "GEOGRAPHY_CONFLICT";
  if (/location.*outside/i.test(message)) return "LOCATION_CONFLICT";
  if (/location.*could not/i.test(message)) return "LOCATION_UNKNOWN";
  if (/workplace model.*not selected/i.test(message)) return "WORKPLACE_CONFLICT";
  if (/workplace model.*could not/i.test(message)) return "WORKPLACE_UNKNOWN";
  if (/employment type.*outside/i.test(message)) return "EMPLOYMENT_TYPE_CONFLICT";
  if (/employment type.*could not/i.test(message)) return "EMPLOYMENT_TYPE_UNKNOWN";
  if (/seniority.*below|seniority.*above/i.test(message)) return "SENIORITY_CONFLICT";
  if (/seniority.*could not/i.test(message)) return "SENIORITY_UNKNOWN";
  if (/missing required language|english-only priority/i.test(message)) return "LANGUAGE_CONFLICT";
  if (/language requirements.*not available/i.test(message)) return "LANGUAGE_UNKNOWN";
  if (/salary.*below/i.test(message)) return "SALARY_CONFLICT";
  if (/salary currency.*cannot/i.test(message)) return "SALARY_CURRENCY_UNKNOWN";
  if (/salary.*undisclosed/i.test(message)) return "SALARY_UNKNOWN";
  if (/commute time.*could not/i.test(message)) return "COMMUTE_UNKNOWN";
  if (/sponsorship.*could not/i.test(message)) return "SPONSORSHIP_UNKNOWN";
  if (/sponsorship|right-to-work/i.test(message)) return "SPONSORSHIP_CONFLICT";
  return "HARD_CONSTRAINT_CONFLICT";
};

export function evaluateHardEligibility(input: { job: CanonicalJobCandidate; profile: Profile; agent: JobAgent; intent: NormalizedJobSearchIntent; evidence: CareerEvidenceItem[]; expired: boolean }): { status: JobEligibilityStatus; reasons: string[]; detail: EligibilityReason[]; requiredLanguages: string[]; postingLanguage: string | null } {
  if (input.expired) return { status: "blocked", reasons: ["The vacancy is expired."], detail: [{ code: "VACANCY_EXPIRED", outcome: "block", field: "expiresAt", message: "The vacancy is expired.", evidence: input.job.expiresAt }], requiredLanguages: input.job.requiredLanguages, postingLanguage: null };
  const profile = { ...input.profile, languages: input.intent.hard.languages };
  const base = evaluateJobEligibility({ title: input.job.title, company: input.job.company, country: input.job.country, location: input.job.location, description: input.job.description, descriptionComplete: input.job.descriptionComplete, workplaceModel: input.job.workplaceModel, employmentTypes: input.job.employmentTypes, seniority: input.job.seniority, visaSponsorship: input.job.visaSponsorship, salaryMin: input.job.salaryMin, salaryMax: input.job.salaryMax, currency: input.job.currency }, profile, input.agent);
  const hard: EligibilityReason[] = base.reasons.map((message) => ({ code: reasonCode(message), outcome: base.status === "blocked" ? "block" : "unknown", field: reasonCode(message).split("_")[0].toLowerCase(), message, evidence: null }));

  const industryText = normalize(input.job.description);
  for (const industry of input.intent.hard.excludedIndustries) if (industryText.includes(normalize(industry))) hard.push({ code: "EXCLUDED_INDUSTRY", outcome: "block", field: "industry", message: `Vacancy matches excluded industry: ${industry}.`, evidence: industry });

  for (const certification of input.job.certificationRequirements) {
    const present = input.evidence.some((item) => item.evidenceType === "certification" && (normalize(item.label).includes(normalize(certification)) || normalize(certification).includes(normalize(item.label))));
    if (!present) hard.push({ code: "REQUIRED_LICENSE_MISSING", outcome: "block", field: "certification", message: `Required licence or certification is not present: ${certification}.`, evidence: certification });
  }

  const status: JobEligibilityStatus = hard.some((item) => item.outcome === "block") ? "blocked" : hard.some((item) => item.outcome === "unknown") ? "unverified" : "eligible";
  return { status, reasons: hard.map((item) => item.message), detail: hard, requiredLanguages: base.requiredLanguages, postingLanguage: base.postingLanguage };
}
