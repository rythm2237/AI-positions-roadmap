import { canonicalCountry } from "../countryIdentity.ts";
import { canonicalJobKey, normalizeJobText } from "../normalization.ts";
import type { CanonicalJobCandidate, JobProvider, ProviderSearchInput, ProviderSearchOutcome } from "../contracts.ts";

export const smartRecruitersEmployers = [
  { company: "BEUMER Group", tenant: "BEUMERGroup1", careerUrl: "https://www.beumergroup.com/careers/jobs/" },
  { company: "Continental", tenant: "Continental", careerUrl: "https://jobs.smartrecruiters.com/Continental" },
  { company: "JYSK", tenant: "JYSK", careerUrl: "https://jobs.smartrecruiters.com/JYSK" },
  { company: "H&M Group", tenant: "HmGroup", careerUrl: "https://jobs.smartrecruiters.com/HmGroup" },
  { company: "METRO/MAKRO", tenant: "METROMAKRO", careerUrl: "https://jobs.smartrecruiters.com/METROMAKRO" },
  { company: "Primark", tenant: "Primark", careerUrl: "https://jobs.smartrecruiters.com/Primark" },
  { company: "Sika", tenant: "SikaAG", careerUrl: "https://jobs.smartrecruiters.com/SikaAG" },
  { company: "Bertelsmann", tenant: "Bertelsmann-Jobs", careerUrl: "https://jobs.smartrecruiters.com/Bertelsmann-Jobs" },
  { company: "REPA Group", tenant: "REPAGROUP", careerUrl: "https://jobs.smartrecruiters.com/REPAGROUP" },
];
type Employer = typeof smartRecruitersEmployers[number];
type Posting = {
  id?: string; name?: string; releasedDate?: string; visibility?: string;
  location?: { country?: string; fullLocation?: string; remote?: boolean; hybrid?: boolean };
  department?: { label?: string }; typeOfEmployment?: { label?: string };
};

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
const countries = ["AT", "BE", "CH", "CZ", "DE", "DK", "ES", "FI", "FR", "GB", "HU", "IE", "IT", "NL", "NO", "PL", "PT", "RO", "SE"];
export const europeanJobCountryCode = (country: string) => countries.find((code) => code.toLowerCase() === country.toLowerCase() || canonicalCountry(countryNames.of(code)) === canonicalCountry(country));

export function smartRecruitersPostingApi(tenant: string) {
  return `https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(tenant)}/postings`;
}

export class SmartRecruitersProvider implements JobProvider {
  readonly name: string;
  private readonly employer: Employer;
  constructor(employer: Employer) {
    this.employer = employer;
    this.name = `Direct:${employer.company}`;
  }
  countrySupport(country: string) { return Boolean(europeanJobCountryCode(country)); }
  async health() { return { configured: true, status: "healthy" as const }; }
  async rateLimitState() { return { maximumListingPagesPerSearch: 2, source: "public-ats" }; }

  async search(input: ProviderSearchInput): Promise<ProviderSearchOutcome> {
    const started = Date.now();
    const jobs: CanonicalJobCandidate[] = [];
    const code = europeanJobCountryCode(input.country);
    let requestCount = 0;
    let errorCode: string | undefined;
    const limit = Math.max(1, Math.min(10, input.limit));
    for (let offset = 0; code && offset < 2 * limit && jobs.length < limit; offset += limit) {
      try {
        const params = new URLSearchParams({ q: input.query, country: code.toLowerCase(), limit: String(limit), offset: String(offset), destination: "PUBLIC" });
        requestCount++;
        const response = await fetch(`${smartRecruitersPostingApi(this.employer.tenant)}?${params}`, { redirect: "error", signal: AbortSignal.timeout(offset === 0 ? 10_000 : 4_000) });
        if (!response.ok) {
          errorCode = response.status === 429 ? "RATE_LIMIT" : `SMARTRECRUITERS_HTTP_${response.status}`;
          break;
        }
        const payload = await response.json() as { content?: Posting[]; totalFound?: number };
        if (!Array.isArray(payload.content)) { errorCode = "SMARTRECRUITERS_INVALID_RESPONSE"; break; }
        for (const row of payload.content) {
          if (!row.id || !/^\d+$/.test(row.id) || !row.name?.trim() || row.visibility !== "PUBLIC" || row.location?.country?.toLowerCase() !== code.toLowerCase()) continue;
          if (jobs.some((job) => job.externalId === row.id)) continue;
          const url = `https://jobs.smartrecruiters.com/${this.employer.tenant}/${row.id}`;
          const employment = row.typeOfEmployment?.label?.toLowerCase();
          const job: CanonicalJobCandidate = {
            externalId: row.id, source: this.name, sourceQuery: input.query, company: this.employer.company,
            title: row.name.trim(), normalizedTitle: normalizeJobText(row.name), location: row.location.fullLocation ?? null,
            country: countryNames.of(code) ?? null, sourceUrl: url, applicationUrl: url, description: "", descriptionComplete: false,
            workplaceModel: row.location.remote ? "remote" : row.location.hybrid ? "hybrid" : "unknown",
            employmentTypes: employment === "full-time" ? ["full_time"] : employment === "part-time" ? ["part_time"] : [],
            seniority: null, salaryMin: null, salaryMax: null, currency: null, requiredLanguages: [], requiredSkills: [],
            preferredSkills: [], educationRequirements: [], certificationRequirements: [], visaSponsorship: null,
            postedAt: row.releasedDate ?? null, expiresAt: null, canonicalKey: "", sourceQueries: [input.query],
            sources: [{ provider: this.name, sourceJobId: row.id, sourceQuery: input.query, sourceUrl: url,
              providerPayload: { directCompany: true, company: this.employer.company, careerUrl: this.employer.careerUrl,
                department: row.department?.label, ats: "smartrecruiters" } }],
          };
          job.canonicalKey = canonicalJobKey(job);
          jobs.push(job);
        }
        if (payload.content.length < limit || offset + limit >= (payload.totalFound ?? 0)) break;
      } catch (error) {
        errorCode = error instanceof Error && error.name === "TimeoutError" ? "SMARTRECRUITERS_TIMEOUT" : "SMARTRECRUITERS_FETCH_FAILED";
        break;
      }
    }
    return { provider: this.name, jobs: jobs.slice(0, limit), requestCount, latencyMs: Date.now() - started,
      status: errorCode === "RATE_LIMIT" ? "rate_limit" : errorCode ? "provider_error" : jobs.length ? "success" : "no_results",
      errorCode, rateLimitState: await this.rateLimitState() };
  }
}
