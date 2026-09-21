import "server-only";

import { canonicalJobKey, normalizeJobText, safeExternalUrl } from "../normalization";
import type { CanonicalJobCandidate, JobProvider, ProviderSearchInput, ProviderSearchOutcome } from "../contracts";

const timeoutMs = 12_000;
const normalizeCountry = (value: string | null | undefined) => {
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

const countryFromLocation = (value: string) => {
  const location = normalizeJobText(value);
  if (/\b(france|paris|lyon|toulouse|lille|bordeaux|nantes|marseille|nice|grenoble|strasbourg)\b/.test(location)) return "France";
  if (/\b(germany|deutschland|berlin|hamburg|frankfurt|munich|munchen|muenchen|cologne|koln|koeln|stuttgart|dusseldorf|duesseldorf|leipzig|dresden|hannover|nuremberg|nurnberg)\b/.test(location)) return "Germany";
  if (/\b(hungary|magyarorszag|budapest|debrecen|szeged|gyor|pecs)\b/.test(location)) return "Hungary";
  if (/\b(austria|osterreich|vienna|wien|graz|linz|salzburg|innsbruck)\b/.test(location)) return "Austria";
  if (/\b(switzerland|schweiz|zurich|zuerich|geneva|genf|basel|bern|lausanne)\b/.test(location)) return "Switzerland";
  if (/\b(netherlands|holland|amsterdam|rotterdam|utrecht|eindhoven|the hague|den haag)\b/.test(location)) return "Netherlands";
  if (/\b(belgium|brussels|bruxelles|antwerp|antwerpen|ghent|gent)\b/.test(location)) return "Belgium";
  if (/\b(luxembourg)\b/.test(location)) return "Luxembourg";
  return null;
};

type NomadoJob = {
  slug: string;
  title: string;
  companyName: string;
  location: string;
  remote: boolean;
  workArrangement: string;
  language: "de" | "en" | "fr";
  tags: string[];
  source: string;
  publishedAt: string;
  url: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
};
type NomadoResponse = { data?: NomadoJob[]; meta?: { attribution?: string } };

const matchesCountry = (job: NomadoJob, country: string) => {
  const requested = normalizeCountry(country);
  if (!requested) return false;
  const inferred = countryFromLocation(job.location);
  if (inferred) return inferred === requested;
  const location = normalizeJobText(job.location);
  if (job.remote && /\b(remote|europe|european union|eu|emea|worldwide|global)\b/.test(location)) return true;
  return location.includes(normalizeJobText(requested));
};

export class Nomado24Provider implements JobProvider {
  readonly name = "Nomado24";
  private queryCache = new Map<string, Promise<NomadoJob[]>>();

  countrySupport(country: string) {
    return ["Germany", "France", "Hungary", "Netherlands", "Austria", "Switzerland", "Belgium", "Luxembourg"].includes(normalizeCountry(country) ?? "");
  }
  async health() { return { configured: true, status: "healthy" as const }; }
  async rateLimitState() { return { keyRequired: false, source: "public-api", publishedLimit: "~240 requests / 15 minutes / IP" }; }

  private loadQuery(query: string) {
    const key = normalizeJobText(query);
    const networkRequest = !this.queryCache.has(key);
    if (!this.queryCache.has(key)) {
      const params = new URLSearchParams({ q: query, per_page: "100" });
      this.queryCache.set(key, fetch(`https://api.nomado24.de/api/public/v1/jobs?${params}`, {
        headers: { Accept: "application/json", "User-Agent": "AI-Role-Path-Job-Agent/1.0" },
        cache: "no-store",
        signal: AbortSignal.timeout(timeoutMs),
      }).then(async (response) => {
        if (!response.ok) throw new Error(`NOMADO24_HTTP_${response.status}`);
        const payload = await response.json() as NomadoResponse;
        return payload.data ?? [];
      }));
    }
    return { payload: this.queryCache.get(key)!, networkRequest };
  }

  async search(input: ProviderSearchInput): Promise<ProviderSearchOutcome> {
    const started = Date.now();
    if (!this.countrySupport(input.country)) return { provider: this.name, status: "unsupported_country", jobs: [], latencyMs: 0, requestCount: 0, rateLimitState: { keyRequired: false }, errorCode: "UNSUPPORTED_COUNTRY" };
    try {
      const query = this.loadQuery(input.query);
      const payload = await query.payload;
      const jobs = payload.filter((job) => matchesCountry(job, input.country)).slice(0, input.limit).flatMap((job) => {
        const url = safeExternalUrl(job.url);
        if (!job.slug || !job.title || !job.companyName || !url) return [];
        const country = countryFromLocation(job.location) ?? normalizeCountry(input.country);
        const arrangement = normalizeJobText(job.workArrangement);
        const workplaceModel = /hybrid/.test(arrangement) ? "hybrid" as const : job.remote || /remote/.test(arrangement) ? "remote" as const : "unknown" as const;
        const row: CanonicalJobCandidate = {
          externalId: job.slug, source: this.name, sourceQuery: input.query, company: job.companyName, title: job.title,
          normalizedTitle: normalizeJobText(job.title), location: job.location || null, country, sourceUrl: url, applicationUrl: url,
          description: `${job.title}. ${job.tags.join(", ")}. Language: ${job.language}.`, descriptionComplete: false,
          workplaceModel, employmentTypes: [], seniority: null, salaryMin: job.salaryMin ?? null, salaryMax: job.salaryMax ?? null, currency: job.currency ?? null,
          requiredLanguages: [], requiredSkills: [], preferredSkills: job.tags ?? [], educationRequirements: [], certificationRequirements: [], visaSponsorship: null,
          postedAt: job.publishedAt ?? null, expiresAt: null, canonicalKey: "", sourceQueries: [input.query],
          sources: [{ provider: this.name, sourceJobId: job.slug, sourceQuery: input.query, sourceUrl: url, providerPayload: { originSource: job.source, language: job.language, attribution: "Data: Nomado24 (https://www.nomado24.de)" } }],
        };
        row.canonicalKey = canonicalJobKey(row);
        return [row];
      });
      return { provider: this.name, status: jobs.length ? "success" : "no_results", jobs, latencyMs: Date.now() - started, requestCount: query.networkRequest ? 1 : 0, rateLimitState: { keyRequired: false, source: "public-api", publishedLimit: "~240 requests / 15 minutes / IP" } };
    } catch (error) {
      return { provider: this.name, status: "provider_error", jobs: [], latencyMs: Date.now() - started, requestCount: 1, rateLimitState: { keyRequired: false, source: "public-api" }, errorCode: error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError") ? "PROVIDER_TIMEOUT" : "NOMADO24_ERROR", errorMessage: error instanceof Error ? error.message.slice(0, 200) : "Unknown error" };
    }
  }
}
