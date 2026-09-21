import "server-only";

import { canonicalJobKey, normalizeJobText, safeExternalUrl } from "../normalization";
import type { CanonicalJobCandidate, JobProvider, ProviderSearchInput, ProviderSearchOutcome } from "../contracts";

const timeoutMs = 12_000;
const stripHtml = (value: string) => value.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim();
const tokens = (value: string) => normalizeJobText(value).split(" ").filter((token) => token.length > 2);
const relevant = (job: ArbeitnowJob, input: ProviderSearchInput) => {
  const haystack = new Set(tokens(`${job.title ?? ""} ${job.tags?.join(" ") ?? ""} ${job.description ?? ""}`));
  const queryTokens = tokens(input.query);
  if (!queryTokens.length) return false;
  const roleMatch = queryTokens.some((token) => haystack.has(token));
  const location = normalizeJobText(job.location ?? "");
  const country = normalizeJobText(input.country);
  const countryMatch = job.remote === true || !country || location.includes(country) || (country === "germany" && /\b(de|deutschland|germany)\b/.test(location));
  return roleMatch && countryMatch;
};

type ArbeitnowJob = {
  slug?: string;
  company_name?: string;
  title?: string;
  description?: string;
  remote?: boolean;
  url?: string;
  tags?: string[];
  job_types?: string[];
  location?: string;
  created_at?: number;
};

type ArbeitnowResponse = { data?: ArbeitnowJob[] };

class ArbeitnowProvider implements JobProvider {
  readonly name = "Arbeitnow";
  countrySupport(country: string) {
    return ["germany", "france", "hungary", "netherlands", "austria", "switzerland", "belgium", "luxembourg"].includes(normalizeJobText(country));
  }
  async health() { return { configured: true, status: "healthy" as const }; }
  async rateLimitState() { return { keyRequired: false, source: "public-api" }; }

  async search(input: ProviderSearchInput): Promise<ProviderSearchOutcome> {
    const started = Date.now();
    if (!this.countrySupport(input.country)) return { provider: this.name, status: "unsupported_country", jobs: [], latencyMs: 0, requestCount: 0, rateLimitState: { keyRequired: false }, errorCode: "UNSUPPORTED_COUNTRY" };
    try {
      const response = await fetch("https://www.arbeitnow.com/api/job-board-api", {
        headers: { Accept: "application/json", "User-Agent": "AI-Role-Path-Job-Agent/1.0" },
        cache: "no-store",
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!response.ok) return { provider: this.name, status: response.status === 429 ? "rate_limit" : "provider_error", jobs: [], latencyMs: Date.now() - started, requestCount: 1, rateLimitState: {}, errorCode: `ARBEITNOW_HTTP_${response.status}` };
      const payload = await response.json() as ArbeitnowResponse;
      const jobs = (payload.data ?? []).filter((job) => relevant(job, input)).slice(0, input.limit).flatMap((job) => {
        const url = safeExternalUrl(job.url ?? "");
        if (!job.slug || !job.title || !job.company_name || !url) return [];
        const row: CanonicalJobCandidate = {
          externalId: job.slug,
          source: this.name,
          sourceQuery: input.query,
          company: job.company_name,
          title: job.title,
          normalizedTitle: normalizeJobText(job.title),
          location: job.location?.trim() || null,
          country: input.country,
          sourceUrl: url,
          applicationUrl: url,
          description: stripHtml(job.description ?? ""),
          descriptionComplete: Boolean(job.description),
          workplaceModel: job.remote ? "remote" : "unknown",
          employmentTypes: (job.job_types ?? []).map((value) => normalizeJobText(value).replaceAll(" ", "_")),
          seniority: null,
          salaryMin: null,
          salaryMax: null,
          currency: null,
          requiredLanguages: [],
          requiredSkills: [],
          preferredSkills: job.tags ?? [],
          educationRequirements: [],
          certificationRequirements: [],
          visaSponsorship: null,
          postedAt: typeof job.created_at === "number" ? new Date(job.created_at * 1000).toISOString() : null,
          expiresAt: null,
          canonicalKey: "",
          sourceQueries: [input.query],
          sources: [{ provider: this.name, sourceJobId: job.slug, sourceQuery: input.query, sourceUrl: url, providerPayload: { remote: Boolean(job.remote) } }],
        };
        row.canonicalKey = canonicalJobKey(row);
        return [row];
      });
      return { provider: this.name, status: jobs.length ? "success" : "no_results", jobs, latencyMs: Date.now() - started, requestCount: 1, rateLimitState: { keyRequired: false, source: "public-api" } };
    } catch (error) {
      return { provider: this.name, status: "provider_error", jobs: [], latencyMs: Date.now() - started, requestCount: 1, rateLimitState: {}, errorCode: error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError") ? "PROVIDER_TIMEOUT" : "ARBEITNOW_ERROR", errorMessage: error instanceof Error ? error.message.slice(0, 200) : "Unknown error" };
    }
  }
}

export function publicFeedProviders(): JobProvider[] {
  return [new ArbeitnowProvider()];
}
