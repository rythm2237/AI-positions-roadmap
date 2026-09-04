import "server-only";

import { canonicalJobKey, normalizeJobText, safeExternalUrl } from "../normalization";
import { orchestrateProviderSearch } from "../providerOrchestration";
import type { CanonicalJobCandidate, JobProvider, ProviderSearchInput, ProviderSearchOutcome, SearchGatewayResult } from "../contracts";
import { adzunaConfigured, JobProviderRequestError, resolveAdzunaCountry, searchAdzunaJobs, searchSerpApiJobsDetailed, serpApiConfigured, type JobProviderResult } from "./adzuna";

function classify(error: unknown): Pick<ProviderSearchOutcome, "status" | "errorCode" | "errorMessage"> {
  if (error instanceof JobProviderRequestError) {
    const status = error.code === "RATE_LIMIT" ? "rate_limit" : error.code === "AUTH_FAILURE" ? "auth_failure" : error.code === "INVALID_QUERY" ? "invalid_query" : error.code === "UNSUPPORTED_COUNTRY" ? "unsupported_country" : "provider_error";
    return { status, errorCode: error.code, errorMessage: error.message };
  }
  return { status: "provider_error", errorCode: "UNEXPECTED_PROVIDER_ERROR", errorMessage: error instanceof Error ? error.message.slice(0, 240) : "Unknown provider failure" };
}

function candidate(job: JobProviderResult, query: string): CanonicalJobCandidate | null {
  const sourceUrl = safeExternalUrl(job.url);
  const applicationUrl = safeExternalUrl(job.url);
  if (!sourceUrl || !applicationUrl) return null;
  const normalized: CanonicalJobCandidate = {
    externalId: job.externalId, source: job.source, sourceQuery: query, company: job.company, title: job.title,
    normalizedTitle: normalizeJobText(job.title), location: job.location || null, country: job.country || null,
    sourceUrl, applicationUrl, description: job.description, descriptionComplete: job.descriptionComplete,
    workplaceModel: job.workplaceModel, employmentTypes: job.employmentTypes, seniority: null,
    salaryMin: job.salaryMin, salaryMax: job.salaryMax, currency: job.currency,
    requiredLanguages: [], requiredSkills: [], preferredSkills: [], educationRequirements: [], certificationRequirements: [], visaSponsorship: null,
    postedAt: job.createdAt, expiresAt: null, canonicalKey: "", sourceQueries: [query], sources: [{ provider: job.source, sourceJobId: job.externalId, sourceQuery: query, sourceUrl, providerPayload: {} }],
  };
  normalized.canonicalKey = canonicalJobKey(normalized);
  return normalized;
}

class ExistingProvider implements JobProvider {
  constructor(public readonly name: "SerpApi" | "Adzuna") {}
  countrySupport(country: string) { return this.name === "SerpApi" || Boolean(resolveAdzunaCountry(country)); }
  async health() { const configured = this.name === "SerpApi" ? serpApiConfigured() : adzunaConfigured(); return { configured, status: configured ? "healthy" as const : "unavailable" as const, reason: configured ? undefined : "Credentials are not configured." }; }
  async rateLimitState() { return { known: false }; }
  async search(input: ProviderSearchInput): Promise<ProviderSearchOutcome> {
    const started = Date.now();
    if (!this.countrySupport(input.country)) return { provider: this.name, status: "unsupported_country", jobs: [], latencyMs: 0, requestCount: 0, rateLimitState: {}, errorCode: "UNSUPPORTED_COUNTRY", errorMessage: `${this.name} does not support ${input.country}.` };
    try {
      const result = this.name === "SerpApi" ? await searchSerpApiJobsDetailed(input) : { jobs: await searchAdzunaJobs(input), requestCount: 1 };
      const rows = result.jobs;
      const jobs = rows.map((row) => candidate(row, input.query)).filter((row): row is CanonicalJobCandidate => Boolean(row));
      return { provider: this.name, status: jobs.length ? "success" : "no_results", jobs, latencyMs: Date.now() - started, requestCount: result.requestCount, rateLimitState: { known: false } };
    } catch (error) {
      return { provider: this.name, jobs: [], latencyMs: Date.now() - started, requestCount: 1, rateLimitState: { known: false }, ...classify(error) };
    }
  }
}

const htmlText = (value: string) => value.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim();
const queryMatches = (title: string, query: string) => {
  const titleTokens = new Set(normalizeJobText(title).split(" ").filter((item) => item.length > 2));
  const queryTokens = normalizeJobText(query).split(" ").filter((item) => item.length > 2);
  return queryTokens.length > 0 && queryTokens.filter((item) => titleTokens.has(item)).length / queryTokens.length >= 0.5;
};

type GreenhouseJob = { id?: number; title?: string; location?: { name?: string }; content?: string; absolute_url?: string; updated_at?: string };
type LeverJob = { id?: string; text?: string; categories?: { location?: string; commitment?: string }; descriptionPlain?: string; additionalPlain?: string; hostedUrl?: string; applyUrl?: string; createdAt?: number; workplaceType?: string };

class GreenhouseProvider implements JobProvider {
  readonly name: string;
  private payloadPromise: Promise<GreenhouseJob[]> | null = null;
  constructor(private readonly board: string) { this.name = `Greenhouse:${board}`; }
  countrySupport() { return true; }
  async health() { return { configured: true, status: "healthy" as const }; }
  async rateLimitState() { return { publishedLimit: "provider-managed" }; }
  private loadBoard() {
    const networkRequest = !this.payloadPromise;
    this.payloadPromise ??= fetch(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(this.board)}/jobs?content=true`, { headers: { Accept: "application/json" }, cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new JobProviderRequestError(response.status === 429 ? "RATE_LIMIT" : response.status === 404 ? "INVALID_QUERY" : "PROVIDER_ERROR", `Greenhouse returned HTTP ${response.status}.`, response.status);
      const payload = await response.json() as { jobs?: GreenhouseJob[] };
      return payload.jobs ?? [];
    });
    return { payload: this.payloadPromise, networkRequest };
  }
  async search(input: ProviderSearchInput): Promise<ProviderSearchOutcome> {
    const started = Date.now();
    try {
      const board = this.loadBoard();
      const jobs = (await board.payload).filter((job) => job.title && queryMatches(job.title, input.query)).slice(0, input.limit).flatMap((job) => {
        const url = safeExternalUrl(job.absolute_url); if (!job.id || !job.title || !url) return [];
        const location = job.location?.name?.trim() || null;
        const row: CanonicalJobCandidate = { externalId: String(job.id), source: this.name, sourceQuery: input.query, company: this.board, title: job.title.trim(), normalizedTitle: normalizeJobText(job.title), location, country: location && normalizeJobText(location).includes(normalizeJobText(input.country)) ? input.country : null, sourceUrl: url, applicationUrl: url, description: htmlText(job.content ?? ""), descriptionComplete: Boolean(job.content), workplaceModel: /\bremote\b/i.test(location ?? "") ? "remote" : "unknown", employmentTypes: [], seniority: null, salaryMin: null, salaryMax: null, currency: null, requiredLanguages: [], requiredSkills: [], preferredSkills: [], educationRequirements: [], certificationRequirements: [], visaSponsorship: null, postedAt: job.updated_at ?? null, expiresAt: null, canonicalKey: "", sourceQueries: [input.query], sources: [{ provider: this.name, sourceJobId: String(job.id), sourceQuery: input.query, sourceUrl: url, providerPayload: {} }] };
        row.canonicalKey = canonicalJobKey(row); return [row];
      });
      return { provider: this.name, status: jobs.length ? "success" : "no_results", jobs, latencyMs: Date.now() - started, requestCount: board.networkRequest ? 1 : 0, rateLimitState: { publishedLimit: "provider-managed" } };
    } catch (error) { return { provider: this.name, jobs: [], latencyMs: Date.now() - started, requestCount: 1, rateLimitState: {}, ...classify(error) }; }
  }
}

class LeverProvider implements JobProvider {
  readonly name: string;
  private payloadPromise: Promise<LeverJob[]> | null = null;
  constructor(private readonly site: string) { this.name = `Lever:${site}`; }
  countrySupport() { return true; }
  async health() { return { configured: true, status: "healthy" as const }; }
  async rateLimitState() { return { publishedLimit: "provider-managed" }; }
  private loadSite() {
    const networkRequest = !this.payloadPromise;
    this.payloadPromise ??= fetch(`https://api.lever.co/v0/postings/${encodeURIComponent(this.site)}?mode=json`, { headers: { Accept: "application/json" }, cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new JobProviderRequestError(response.status === 429 ? "RATE_LIMIT" : response.status === 404 ? "INVALID_QUERY" : "PROVIDER_ERROR", `Lever returned HTTP ${response.status}.`, response.status);
      return response.json() as Promise<LeverJob[]>;
    });
    return { payload: this.payloadPromise, networkRequest };
  }
  async search(input: ProviderSearchInput): Promise<ProviderSearchOutcome> {
    const started = Date.now();
    try {
      const site = this.loadSite();
      const payload = await site.payload;
      const jobs = payload.filter((job) => job.text && queryMatches(job.text, input.query)).slice(0, input.limit).flatMap((job) => {
        const sourceUrl = safeExternalUrl(job.hostedUrl); const applicationUrl = safeExternalUrl(job.applyUrl ?? job.hostedUrl); if (!job.id || !job.text || !sourceUrl || !applicationUrl) return [];
        const location = job.categories?.location?.trim() || null; const workplace = /remote/i.test(job.workplaceType ?? location ?? "") ? "remote" as const : /hybrid/i.test(job.workplaceType ?? "") ? "hybrid" as const : "unknown" as const;
        const row: CanonicalJobCandidate = { externalId: job.id, source: this.name, sourceQuery: input.query, company: this.site, title: job.text.trim(), normalizedTitle: normalizeJobText(job.text), location, country: location && normalizeJobText(location).includes(normalizeJobText(input.country)) ? input.country : null, sourceUrl, applicationUrl, description: [job.descriptionPlain, job.additionalPlain].filter(Boolean).join("\n"), descriptionComplete: Boolean(job.descriptionPlain), workplaceModel: workplace, employmentTypes: job.categories?.commitment ? [normalizeJobText(job.categories.commitment).replaceAll(" ", "_")] : [], seniority: null, salaryMin: null, salaryMax: null, currency: null, requiredLanguages: [], requiredSkills: [], preferredSkills: [], educationRequirements: [], certificationRequirements: [], visaSponsorship: null, postedAt: job.createdAt ? new Date(job.createdAt).toISOString() : null, expiresAt: null, canonicalKey: "", sourceQueries: [input.query], sources: [{ provider: this.name, sourceJobId: job.id, sourceQuery: input.query, sourceUrl, providerPayload: {} }] };
        row.canonicalKey = canonicalJobKey(row); return [row];
      });
      return { provider: this.name, status: jobs.length ? "success" : "no_results", jobs, latencyMs: Date.now() - started, requestCount: site.networkRequest ? 1 : 0, rateLimitState: { publishedLimit: "provider-managed" } };
    } catch (error) { return { provider: this.name, jobs: [], latencyMs: Date.now() - started, requestCount: 1, rateLimitState: {}, ...classify(error) }; }
  }
}

const configuredTokens = (value: string | undefined) => [...new Set((value ?? "").split(",").map((item) => item.trim()).filter((item) => /^[a-zA-Z0-9_-]{1,80}$/.test(item)))].slice(0, 10);

export function configuredJobProviders(): JobProvider[] {
  return [
    ...(serpApiConfigured() ? [new ExistingProvider("SerpApi")] : []),
    ...(adzunaConfigured() ? [new ExistingProvider("Adzuna")] : []),
    ...configuredTokens(process.env.JOB_AGENT_GREENHOUSE_BOARDS).map((board) => new GreenhouseProvider(board)),
    ...configuredTokens(process.env.JOB_AGENT_LEVER_SITES).map((site) => new LeverProvider(site)),
  ];
}

export async function runProviderGateway(input: { providers: JobProvider[]; queries: string[]; countries: string[]; location?: string; correlationId: string; limitPerRequest?: number; maxRequests?: number }): Promise<SearchGatewayResult> {
  return orchestrateProviderSearch(input);
}
