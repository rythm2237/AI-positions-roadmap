import { createHash } from "node:crypto";
import type { JobAgent, JobWorkplaceModel, NormalizedJobSearchIntent } from "../../types/jobAgent.ts";

const cleaned = (items: string[] | null | undefined) => [...new Set((items ?? []).map((item) => item.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
const workplace = (items: string[]) => cleaned(items).filter((item): item is JobWorkplaceModel => ["remote", "hybrid", "on_site"].includes(item));

export function createJobSearchIntent(agent: JobAgent, profileLanguages: string[], version = (agent.intent_version ?? 0) + 1, confirmedAt = new Date().toISOString()): NormalizedJobSearchIntent {
  const primaryTargetRole = agent.primary_career?.trim() || agent.desired_titles[0]?.trim() || "";
  const withoutFingerprint = {
    primaryTargetRole,
    hard: {
      excludedRoles: cleaned(agent.excluded_roles),
      minimumSeniority: agent.min_seniority?.trim() || null,
      maximumSeniority: agent.max_seniority?.trim() || null,
      excludedIndustries: cleaned(agent.excluded_industries),
      excludedCompanies: cleaned(agent.excluded_companies),
      countries: cleaned(agent.search_countries),
      citiesRegions: cleaned(agent.cities_regions),
      maximumCommuteMinutes: agent.max_commute_minutes,
      workplaceModels: workplace(agent.workplace_preferences),
      workAuthorization: agent.work_authorization?.trim() || null,
      sponsorshipRequirement: agent.sponsorship_requirement?.trim() || null,
      languages: cleaned(profileLanguages),
      englishOnly: agent.english_only_priority,
      employmentTypes: cleaned(agent.employment_types),
      salary: {
        minimum: agent.minimum_salary,
        preferred: agent.preferred_salary,
        currency: agent.salary_currency?.trim().toUpperCase() || "PER_VACANCY",
        negotiable: agent.salary_negotiable ?? true,
      },
      earliestStartDate: agent.earliest_start_date,
    },
    soft: {
      secondaryRoles: cleaned(agent.secondary_careers),
      marketTitleVariants: cleaned(agent.desired_titles),
      adjacentRoles: cleaned(agent.adjacent_roles),
      targetIndustries: cleaned(agent.industries),
      preferredCompanies: cleaned(agent.preferred_companies),
      preferredCountries: [] as string[],
      preferredCitiesRegions: [] as string[],
      workplaceModels: [] as JobWorkplaceModel[],
      relocationPreference: agent.willing_to_relocate ? "open" as const : "not_willing" as const,
      relocationCountries: cleaned(agent.relocation_countries),
      noticePeriod: agent.notice_period?.trim() || null,
    },
    version,
    confirmedAt,
  };
  const stable = JSON.stringify({ primaryTargetRole: withoutFingerprint.primaryTargetRole, hard: withoutFingerprint.hard, soft: withoutFingerprint.soft });
  return { ...withoutFingerprint, fingerprint: createHash("sha256").update(stable).digest("hex") };
}

export function validateJobSearchIntent(intent: NormalizedJobSearchIntent) {
  const errors: string[] = [];
  if (!intent.primaryTargetRole) errors.push("PRIMARY_ROLE_REQUIRED");
  if (!intent.hard.countries.length) errors.push("COUNTRY_REQUIRED");
  if (intent.hard.salary.minimum !== null && intent.hard.salary.preferred !== null && intent.hard.salary.preferred < intent.hard.salary.minimum) errors.push("INVALID_SALARY_RANGE");
  return errors;
}
