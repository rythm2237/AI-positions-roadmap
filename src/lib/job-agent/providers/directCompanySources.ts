import "server-only";

import { canonicalJobKey, normalizeJobText, safeExternalUrl } from "../normalization";
import type { CanonicalJobCandidate, JobProvider, ProviderSearchInput, ProviderSearchOutcome } from "../contracts";

const timeoutMs = 12_000;

export type DirectCompanySource = {
  company: string;
  ats: "greenhouse" | "lever";
  tenant: string;
  countries: string[];
  careerUrl: string;
  priority: "high" | "normal";
};

// Seed only sources that have been verified to expose public ATS vacancies.
// Technology and digital-first employers are prioritized for direct monitoring.
export const directCompanySourceRegistry: DirectCompanySource[] = [
  {
    company: "Celonis",
    ats: "greenhouse",
    tenant: "celonis",
    countries: ["Germany", "France"],
    careerUrl: "https://www.celonis.com/careers/jobs/",
    priority: "high",
  },
  {
    company: "Yext",
    ats: "greenhouse",
    tenant: "yext",
    countries: ["Hungary"],
    careerUrl: "https://www.yext.com/careers",
    priority: "high",
  },
  {
    company: "Pigment",
    ats: "lever",
    tenant: "pigment",
    countries: ["France"],
    careerUrl: "https://www.gopigment.com/careers",
    priority: "high",
  },
  {
    company: "Qonto",
    ats: "lever",
    tenant: "qonto",
    countries: ["France", "Germany"],
    careerUrl: "https://qonto.com/en/careers",
    priority: "high",
  },
  {
    company: "Dataiku",
    ats: "greenhouse",
    tenant: "dataiku",
    countries: ["France", "Germany"],
    careerUrl: "https://job-boards.greenhouse.io/dataiku",
    priority: "high",
  },
  {
    company: "Raisin",
    ats: "greenhouse",
    tenant: "raisin",
    countries: ["Germany"],
    careerUrl: "https://job-boards.greenhouse.io/raisin",
    priority: "high",
  },
  {
    company: "GetYourGuide",
    ats: "greenhouse",
    tenant: "getyourguide",
    countries: ["Germany"],
    careerUrl: "https://job-boards.greenhouse.io/getyourguide",
    priority: "high",
  },
  {
    company: "Contentful",
    ats: "greenhouse",
    tenant: "contentful",
    countries: ["Germany"],
    careerUrl: "https://job-boards.greenhouse.io/contentful",
    priority: "high",
  },
  {
    company: "Contentsquare",
    ats: "lever",
    tenant: "contentsquare",
    countries: ["France", "Germany"],
    careerUrl: "https://jobs.lever.co/contentsquare",
    priority: "high",
  },
  {
    company: "BlaBlaCar",
    ats: "lever",
    tenant: "blablacar",
    countries: ["France"],
    careerUrl: "https://jobs.lever.co/blablacar",
    priority: "high",
  },
  {
    company: "Back Market",
    ats: "lever",
    tenant: "backmarket",
    countries: ["France"],
    careerUrl: "https://jobs.lever.co/backmarket",
    priority: "high",
  },
];

const stripHtml = (value: string) => value
  .replace(/<br\s*\/?>/gi, "\n")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&#39;/gi, "'")
  .replace(/&quot;/gi, '"')
  .replace(/\s+/g, " ")
  .trim();

const queryMatches = (title: string, query: string) => {
  const titleTokens = new Set(normalizeJobText(title).split(" ").filter((token) => token.length > 2));
  const queryTokens = normalizeJobText(query).split(" ").filter((token) => token.length > 2);
  if (!queryTokens.length) return false;
  return queryTokens.some((token) => titleTokens.has(token));
};

const countryLocationTokens: Record<string, RegExp> = {
  Germany: /\b(germany|deutschland|berlin|munich|muenchen|munchen|münchen|hamburg|frankfurt|cologne|koeln|koln|köln|dusseldorf|duesseldorf|düsseldorf|stuttgart|leipzig|dresden|nuremberg|nurnberg|nürnberg|hannover)\b/i,
  France: /\b(france|paris|lyon|lille|bordeaux|nantes|marseille|toulouse|nice|grenoble|strasbourg)\b/i,
  Hungary: /\b(hungary|magyarorszag|budapest|debrecen|szeged|gyor|győr|pecs|pécs)\b/i,
};

const locationMatchesCountry = (location: string | null | undefined, country: string) => {
  const matcher = countryLocationTokens[country];
  if (!matcher || !location) return false;
  return matcher.test(location);
};

const normalizeEmploymentType = (value: string | undefined) => {
  const normalized = normalizeJobText(value ?? "");
  if (/\b(full time|fulltime|full-time)\b/.test(normalized)) return ["full_time"];
  if (/\b(part time|parttime|part-time)\b/.test(normalized)) return ["part_time"];
  if (/\b(internship|intern)\b/.test(normalized)) return ["internship"];
  if (/\b(contract|contractor|fixed term|fixed-term|temporary)\b/.test(normalized)) return ["contract"];
  if (/\b(permanent)\b/.test(normalized)) return ["permanent"];
  return [];
};

const failure = (provider: string, started: number, error: unknown, requestCount = 1): ProviderSearchOutcome => {
  const timeout = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
  return {
    provider,
    status: "provider_error",
    jobs: [],
    latencyMs: Date.now() - started,
    requestCount,
    rateLimitState: { source: "public-ats" },
    errorCode: timeout ? "PROVIDER_TIMEOUT" : "DIRECT_COMPANY_PROVIDER_ERROR",
    errorMessage: error instanceof Error ? error.message.slice(0, 240) : "Unknown direct-company provider failure",
  };
};

type GreenhouseJob = {
  id?: number;
  title?: string;
  location?: { name?: string };
  content?: string;
  absolute_url?: string;
  updated_at?: string;
};

class DirectGreenhouseProvider implements JobProvider {
  readonly name: string;
  private payloadPromise: Promise<GreenhouseJob[]> | null = null;

  constructor(private readonly source: DirectCompanySource) {
    this.name = `Direct:${source.company}`;
  }

  countrySupport(country: string) {
    return this.source.countries.includes(country);
  }

  async health() {
    return { configured: true, status: "healthy" as const };
  }

  async rateLimitState() {
    return { keyRequired: false, source: "public-greenhouse-api" };
  }

  private loadBoard() {
    const networkRequest = !this.payloadPromise;
    this.payloadPromise ??= fetch(
      `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(this.source.tenant)}/jobs?content=true`,
      {
        headers: { Accept: "application/json", "User-Agent": "AI-Role-Path-Job-Agent/1.0" },
        cache: "no-store",
        signal: AbortSignal.timeout(timeoutMs),
      },
    ).then(async (response) => {
      if (!response.ok) throw new Error(`Greenhouse ${this.source.company} returned HTTP ${response.status}`);
      const payload = await response.json() as { jobs?: GreenhouseJob[] };
      return payload.jobs ?? [];
    });
    return { payload: this.payloadPromise, networkRequest };
  }

  async search(input: ProviderSearchInput): Promise<ProviderSearchOutcome> {
    const started = Date.now();
    if (!this.countrySupport(input.country)) {
      return { provider: this.name, status: "unsupported_country", jobs: [], latencyMs: 0, requestCount: 0, rateLimitState: { source: "public-greenhouse-api" }, errorCode: "UNSUPPORTED_COUNTRY" };
    }

    try {
      const board = this.loadBoard();
      const jobs = (await board.payload)
        .filter((job) => job.title && queryMatches(job.title, input.query))
        .filter((job) => locationMatchesCountry(job.location?.name, input.country))
        .slice(0, input.limit)
        .flatMap((job) => {
          const url = safeExternalUrl(job.absolute_url ?? "");
          if (!job.id || !job.title || !url) return [];
          const location = job.location?.name?.trim() || null;
          const row: CanonicalJobCandidate = {
            externalId: String(job.id),
            source: this.name,
            sourceQuery: input.query,
            company: this.source.company,
            title: job.title.trim(),
            normalizedTitle: normalizeJobText(job.title),
            location,
            country: input.country,
            sourceUrl: url,
            applicationUrl: url,
            description: stripHtml(job.content ?? ""),
            descriptionComplete: Boolean(job.content),
            workplaceModel: /\bremote\b/i.test(location ?? "") ? "remote" : /\bhybrid\b/i.test(location ?? "") ? "hybrid" : "unknown",
            employmentTypes: [],
            seniority: null,
            salaryMin: null,
            salaryMax: null,
            currency: null,
            requiredLanguages: [],
            requiredSkills: [],
            preferredSkills: [],
            educationRequirements: [],
            certificationRequirements: [],
            visaSponsorship: null,
            postedAt: job.updated_at ?? null,
            expiresAt: null,
            canonicalKey: "",
            sourceQueries: [input.query],
            sources: [{
              provider: this.name,
              sourceJobId: String(job.id),
              sourceQuery: input.query,
              sourceUrl: url,
              providerPayload: { directCompany: true, ats: "greenhouse", company: this.source.company, careerUrl: this.source.careerUrl, sourceConfidence: "high" },
            }],
            providerPayload: { directCompany: true, ats: "greenhouse", company: this.source.company, sourceConfidence: "high" },
          };
          row.canonicalKey = canonicalJobKey(row);
          return [row];
        });

      return {
        provider: this.name,
        status: jobs.length ? "success" : "no_results",
        jobs,
        latencyMs: Date.now() - started,
        requestCount: board.networkRequest ? 1 : 0,
        rateLimitState: { keyRequired: false, source: "public-greenhouse-api" },
      };
    } catch (error) {
      return failure(this.name, started, error);
    }
  }
}

type LeverJob = {
  id?: string;
  text?: string;
  categories?: { location?: string; commitment?: string };
  descriptionPlain?: string;
  additionalPlain?: string;
  hostedUrl?: string;
  applyUrl?: string;
  createdAt?: number;
  workplaceType?: string;
};

class DirectLeverProvider implements JobProvider {
  readonly name: string;
  private payloadPromise: Promise<LeverJob[]> | null = null;

  constructor(private readonly source: DirectCompanySource) {
    this.name = `Direct:${source.company}`;
  }

  countrySupport(country: string) {
    return this.source.countries.includes(country);
  }

  async health() {
    return { configured: true, status: "healthy" as const };
  }

  async rateLimitState() {
    return { keyRequired: false, source: "public-lever-api" };
  }

  private loadSite() {
    const networkRequest = !this.payloadPromise;
    this.payloadPromise ??= fetch(
      `https://api.lever.co/v0/postings/${encodeURIComponent(this.source.tenant)}?mode=json`,
      {
        headers: { Accept: "application/json", "User-Agent": "AI-Role-Path-Job-Agent/1.0" },
        cache: "no-store",
        signal: AbortSignal.timeout(timeoutMs),
      },
    ).then(async (response) => {
      if (!response.ok) throw new Error(`Lever ${this.source.company} returned HTTP ${response.status}`);
      return response.json() as Promise<LeverJob[]>;
    });
    return { payload: this.payloadPromise, networkRequest };
  }

  async search(input: ProviderSearchInput): Promise<ProviderSearchOutcome> {
    const started = Date.now();
    if (!this.countrySupport(input.country)) {
      return { provider: this.name, status: "unsupported_country", jobs: [], latencyMs: 0, requestCount: 0, rateLimitState: { source: "public-lever-api" }, errorCode: "UNSUPPORTED_COUNTRY" };
    }

    try {
      const site = this.loadSite();
      const jobs = (await site.payload)
        .filter((job) => job.text && queryMatches(job.text, input.query))
        .filter((job) => locationMatchesCountry(job.categories?.location, input.country))
        .slice(0, input.limit)
        .flatMap((job) => {
          const sourceUrl = safeExternalUrl(job.hostedUrl ?? "");
          const applicationUrl = safeExternalUrl(job.applyUrl ?? job.hostedUrl ?? "");
          if (!job.id || !job.text || !sourceUrl || !applicationUrl) return [];
          const location = job.categories?.location?.trim() || null;
          const workplaceText = `${job.workplaceType ?? ""} ${location ?? ""}`;
          const row: CanonicalJobCandidate = {
            externalId: job.id,
            source: this.name,
            sourceQuery: input.query,
            company: this.source.company,
            title: job.text.trim(),
            normalizedTitle: normalizeJobText(job.text),
            location,
            country: input.country,
            sourceUrl,
            applicationUrl,
            description: [job.descriptionPlain, job.additionalPlain].filter(Boolean).join("\n"),
            descriptionComplete: Boolean(job.descriptionPlain),
            workplaceModel: /\bremote\b/i.test(workplaceText) ? "remote" : /\bhybrid\b/i.test(workplaceText) ? "hybrid" : /\bon.?site\b/i.test(workplaceText) ? "on_site" : "unknown",
            employmentTypes: normalizeEmploymentType(job.categories?.commitment),
            seniority: null,
            salaryMin: null,
            salaryMax: null,
            currency: null,
            requiredLanguages: [],
            requiredSkills: [],
            preferredSkills: [],
            educationRequirements: [],
            certificationRequirements: [],
            visaSponsorship: null,
            postedAt: job.createdAt ? new Date(job.createdAt).toISOString() : null,
            expiresAt: null,
            canonicalKey: "",
            sourceQueries: [input.query],
            sources: [{
              provider: this.name,
              sourceJobId: job.id,
              sourceQuery: input.query,
              sourceUrl,
              providerPayload: { directCompany: true, ats: "lever", company: this.source.company, careerUrl: this.source.careerUrl, sourceConfidence: "high" },
            }],
            providerPayload: { directCompany: true, ats: "lever", company: this.source.company, sourceConfidence: "high" },
          };
          row.canonicalKey = canonicalJobKey(row);
          return [row];
        });

      return {
        provider: this.name,
        status: jobs.length ? "success" : "no_results",
        jobs,
        latencyMs: Date.now() - started,
        requestCount: site.networkRequest ? 1 : 0,
        rateLimitState: { keyRequired: false, source: "public-lever-api" },
      };
    } catch (error) {
      return failure(this.name, started, error);
    }
  }
}

export function directCompanyProviders(): JobProvider[] {
  if (process.env.JOB_AGENT_DIRECT_COMPANY_ENABLED === "false") return [];
  return directCompanySourceRegistry.map((source) => source.ats === "greenhouse"
    ? new DirectGreenhouseProvider(source)
    : new DirectLeverProvider(source));
}
