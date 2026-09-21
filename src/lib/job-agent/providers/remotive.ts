import "server-only";

import { canonicalJobKey, normalizeJobText, safeExternalUrl } from "../normalization";
import type { CanonicalJobCandidate, JobProvider, ProviderSearchInput, ProviderSearchOutcome } from "../contracts";

const timeoutMs = 12_000;
const stripHtml = (value: string) => value.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim();
const tokens = (value: string) => normalizeJobText(value).split(" ").filter((token) => token.length > 2);

const canonicalCountry = (value: string | null | undefined) => {
  const normalized = normalizeJobText(value ?? "");
  const aliases: Record<string, string> = {
    de: "Germany", deutschland: "Germany", germany: "Germany",
    fr: "France", france: "France",
    hu: "Hungary", hungary: "Hungary", magyarorszag: "Hungary",
    nl: "Netherlands", netherlands: "Netherlands", holland: "Netherlands",
    at: "Austria", austria: "Austria", osterreich: "Austria",
    ch: "Switzerland", switzerland: "Switzerland", schweiz: "Switzerland",
    be: "Belgium", belgium: "Belgium",
    lu: "Luxembourg", luxembourg: "Luxembourg",
  };
  return aliases[normalized] ?? (value?.trim() || null);
};

type RemotiveJob = {
  id?: number;
  url?: string;
  title?: string;
  company_name?: string;
  category?: string;
  job_type?: string;
  publication_date?: string;
  candidate_required_location?: string;
  description?: string;
};
type RemotiveResponse = { jobs?: RemotiveJob[] };

const locationAllows = (location: string | undefined, requestedCountry: string) => {
  const value = normalizeJobText(location ?? "");
  const requested = canonicalCountry(requestedCountry);
  if (!requested) return false;
  if (!value || /\b(worldwide|global|anywhere|europe|european union|eu|emea)\b/.test(value)) return true;
  if (value.includes(normalizeJobText(requested))) return true;
  const aliases: Record<string, string[]> = {
    Germany: ["germany", "deutschland"],
    France: ["france"],
    Hungary: ["hungary", "magyarorszag"],
    Netherlands: ["netherlands", "holland"],
    Austria: ["austria", "osterreich"],
    Switzerland: ["switzerland", "schweiz"],
    Belgium: ["belgium"],
    Luxembourg: ["luxembourg"],
  };
  return (aliases[requested] ?? []).some((alias) => value.includes(alias));
};

const relevant = (job: RemotiveJob, input: ProviderSearchInput) => {
  const queryTokens = tokens(input.query);
  if (!queryTokens.length) return false;
  const titleCategory = new Set(tokens(`${job.title ?? ""} ${job.category ?? ""}`));
  const description = new Set(tokens(stripHtml(job.description ?? "")));
  const titleHits = queryTokens.filter((token) => titleCategory.has(token)).length;
  const allHits = queryTokens.filter((token) => titleCategory.has(token) || description.has(token)).length;
  const roleMatch = titleHits >= 1 && (queryTokens.length <= 2 || allHits / queryTokens.length >= 0.4);
  return roleMatch && locationAllows(job.candidate_required_location, input.country);
};

export class RemotiveProvider implements JobProvider {
  readonly name = "Remotive";
  private payloadPromise: Promise<RemotiveJob[]> | null = null;

  countrySupport(country: string) { return Boolean(canonicalCountry(country)); }
  async health() { return { configured: true, status: "healthy" as const }; }
  async rateLimitState() { return { keyRequired: false, source: "public-api", advisedMaxRequestsPerDay: 4 }; }

  private loadFeed() {
    const networkRequest = !this.payloadPromise;
    this.payloadPromise ??= fetch("https://remotive.com/api/remote-jobs?limit=500", {
      headers: { Accept: "application/json", "User-Agent": "AI-Role-Path-Job-Agent/1.0" },
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    }).then(async (response) => {
      if (!response.ok) throw new Error(`REMOTIVE_HTTP_${response.status}`);
      const payload = await response.json() as RemotiveResponse;
      return payload.jobs ?? [];
    });
    return { payload: this.payloadPromise, networkRequest };
  }

  async search(input: ProviderSearchInput): Promise<ProviderSearchOutcome> {
    const started = Date.now();
    if (!this.countrySupport(input.country)) return { provider: this.name, status: "unsupported_country", jobs: [], latencyMs: 0, requestCount: 0, rateLimitState: { keyRequired: false }, errorCode: "UNSUPPORTED_COUNTRY" };
    try {
      const feed = this.loadFeed();
      const payload = await feed.payload;
      const jobs = payload.filter((job) => relevant(job, input)).slice(0, input.limit).flatMap((job) => {
        const url = safeExternalUrl(job.url ?? "");
        if (!job.id || !job.title || !job.company_name || !url) return [];
        const jobType = normalizeJobText(job.job_type ?? "").replaceAll(" ", "_");
        const allowedTypes = new Set(["full_time", "part_time", "contract", "freelance", "internship"]);
        const row: CanonicalJobCandidate = {
          externalId: String(job.id), source: this.name, sourceQuery: input.query, company: job.company_name, title: job.title,
          normalizedTitle: normalizeJobText(job.title), location: job.candidate_required_location?.trim() || "Remote", country: canonicalCountry(input.country),
          sourceUrl: url, applicationUrl: url, description: stripHtml(job.description ?? ""), descriptionComplete: Boolean(job.description),
          workplaceModel: "remote", employmentTypes: allowedTypes.has(jobType) ? [jobType] : [], seniority: null,
          salaryMin: null, salaryMax: null, currency: null, requiredLanguages: [], requiredSkills: [], preferredSkills: job.category ? [job.category] : [],
          educationRequirements: [], certificationRequirements: [], visaSponsorship: null, postedAt: job.publication_date ?? null, expiresAt: null, canonicalKey: "",
          sourceQueries: [input.query], sources: [{ provider: this.name, sourceJobId: String(job.id), sourceQuery: input.query, sourceUrl: url, providerPayload: { candidateRequiredLocation: job.candidate_required_location ?? null } }],
        };
        row.canonicalKey = canonicalJobKey(row);
        return [row];
      });
      return { provider: this.name, status: jobs.length ? "success" : "no_results", jobs, latencyMs: Date.now() - started, requestCount: feed.networkRequest ? 1 : 0, rateLimitState: { keyRequired: false, source: "public-api", advisedMaxRequestsPerDay: 4 } };
    } catch (error) {
      return { provider: this.name, status: "provider_error", jobs: [], latencyMs: Date.now() - started, requestCount: 1, rateLimitState: { keyRequired: false, source: "public-api" }, errorCode: error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError") ? "PROVIDER_TIMEOUT" : "REMOTIVE_ERROR", errorMessage: error instanceof Error ? error.message.slice(0, 200) : "Unknown error" };
    }
  }
}
