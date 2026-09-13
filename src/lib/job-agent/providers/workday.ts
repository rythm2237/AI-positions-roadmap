import { canonicalJobKey, normalizeJobText, safeExternalUrl } from "../normalization.ts";
import type { JobProvider, ProviderSearchInput, ProviderSearchOutcome, CanonicalJobCandidate } from "../contracts.ts";
import type { WorkdaySiteConfig } from "../providerConfig.ts";

type WorkdayPosting = { title?: string; externalPath?: string; locationsText?: string; postedOn?: string; bulletFields?: string[]; jobReqId?: string; remoteType?: string };
type WorkdayResponse = { jobPostings?: WorkdayPosting[]; total?: number };

export class WorkdayProvider implements JobProvider {
  readonly id: string;
  readonly name: string;
  readonly enabled = true;
  readonly metadata;
  private readonly config: WorkdaySiteConfig;

  constructor(config: WorkdaySiteConfig) {
    this.config = config;
    this.id = `workday:${config.tenant}:${config.site}`;
    this.name = `Workday:${config.tenant}:${config.site}`;
    this.metadata = { providerType: "DIRECT" as const, stage: "PRIMARY" as const, priority: config.priority, supportedSources: ["workday"] };
  }

  countrySupport() { return true; }
  async health() { return { configured: true, status: "healthy" as const }; }
  async healthCheck() { return this.health(); }
  async rateLimitState() { return { publishedLimit: "provider-managed" }; }

  async search(input: ProviderSearchInput): Promise<ProviderSearchOutcome> {
    const started = Date.now();
    try {
      const endpoint = `https://${this.config.host}/wday/cxs/${encodeURIComponent(this.config.tenant)}/${encodeURIComponent(this.config.site)}/jobs`;
      const response = await fetch(endpoint, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ appliedFacets: {}, limit: Math.min(input.limit, 20), offset: 0, searchText: input.query }), cache: "no-store", signal: AbortSignal.timeout(12_000) });
      if (!response.ok) throw new Error(response.status === 429 ? "WORKDAY_RATE_LIMIT" : `WORKDAY_HTTP_${response.status}`);
      const payload = await response.json() as WorkdayResponse;
      const raw = Array.isArray(payload.jobPostings) ? payload.jobPostings : [];
      const jobs = raw.flatMap((posting) => {
        const title = posting.title?.trim(); const path = posting.externalPath?.trim();
        const sourceUrl = path ? safeExternalUrl(new URL(path, `https://${this.config.host}`).toString()) : null;
        if (!title || !sourceUrl) return [];
        const externalId = posting.jobReqId?.trim() || path || sourceUrl;
        const location = posting.locationsText?.trim() || null;
        const workplaceText = `${posting.remoteType ?? ""} ${location ?? ""}`;
        const providerPayload = { publicStructuredSource: true, bulletFields: posting.bulletFields ?? [] };
        const row: CanonicalJobCandidate = { externalId, source: this.name, sourceQuery: input.query, company: this.config.company, title, normalizedTitle: normalizeJobText(title), location, country: normalizeJobText(location).includes(normalizeJobText(input.country)) ? input.country : null, sourceUrl, applicationUrl: sourceUrl, description: (posting.bulletFields ?? []).join("\n"), descriptionComplete: false, workplaceModel: /remote/i.test(workplaceText) ? "remote" : /hybrid/i.test(workplaceText) ? "hybrid" : "unknown", employmentTypes: [], seniority: null, salaryMin: null, salaryMax: null, currency: null, requiredLanguages: [], requiredSkills: [], preferredSkills: [], educationRequirements: [], certificationRequirements: [], visaSponsorship: null, postedAt: posting.postedOn ?? null, expiresAt: null, canonicalKey: "", sourceQueries: [input.query], sources: [{ provider: this.name, sourceJobId: externalId, sourceQuery: input.query, sourceUrl, providerPayload }], providerPayload };
        row.canonicalKey = canonicalJobKey(row);
        return [row];
      });
      return { provider: this.name, status: jobs.length ? "success" : "no_results", jobs, latencyMs: Date.now() - started, requestCount: 1, rawCount: raw.length, normalizedCount: jobs.length, rateLimitState: { known: false }, metadata: { total: payload.total ?? raw.length, source: "workday-public-cxs" } };
    } catch (error) {
      const code = error instanceof Error ? error.message : "WORKDAY_PROVIDER_ERROR";
      return { provider: this.name, status: code === "WORKDAY_RATE_LIMIT" ? "rate_limit" : "provider_error", jobs: [], latencyMs: Date.now() - started, requestCount: 1, rawCount: 0, normalizedCount: 0, rateLimitState: {}, errorCode: code.slice(0, 80), errorMessage: code.slice(0, 240) };
    }
  }
}
