import "server-only";

import { canonicalJobKey, normalizeJobText, safeExternalUrl } from "../normalization";
import type { CanonicalJobCandidate, JobProvider, ProviderSearchInput, ProviderSearchOutcome } from "../contracts";

const timeoutMs = 10_000;
const portfolioConcurrency = 8;

export type DirectPortfolioSource = {
  company: string;
  kind: "greenhouse" | "lever" | "career_page";
  tenant?: string;
  countries: string[];
  careerUrl: string;
  searchUrlTemplate?: string;
  priority: "top" | "high" | "normal";
};

const targetCountries = ["Germany", "France", "Hungary"];

// Exactly 50 technology-first employers. Public ATS endpoints are preferred.
// Large strategic employers with proprietary career systems are monitored directly
// through their public career-search pages instead of third-party aggregators.
export const directCompanyPortfolioRegistry: DirectPortfolioSource[] = [
  { company: "Celonis", kind: "greenhouse", tenant: "celonis", countries: ["Germany", "France"], careerUrl: "https://www.celonis.com/careers/jobs/", priority: "high" },
  { company: "Yext", kind: "greenhouse", tenant: "yext", countries: ["Hungary"], careerUrl: "https://www.yext.com/careers", priority: "high" },
  { company: "Pigment", kind: "lever", tenant: "pigment", countries: ["France"], careerUrl: "https://www.gopigment.com/careers", priority: "high" },
  { company: "Qonto", kind: "lever", tenant: "qonto", countries: ["France", "Germany"], careerUrl: "https://qonto.com/en/careers", priority: "high" },
  { company: "Dataiku", kind: "greenhouse", tenant: "dataiku", countries: ["France", "Germany"], careerUrl: "https://job-boards.greenhouse.io/dataiku", priority: "high" },
  { company: "Raisin", kind: "greenhouse", tenant: "raisin", countries: ["Germany"], careerUrl: "https://job-boards.greenhouse.io/raisin", priority: "high" },
  { company: "GetYourGuide", kind: "greenhouse", tenant: "getyourguide", countries: ["Germany"], careerUrl: "https://job-boards.greenhouse.io/getyourguide", priority: "high" },
  { company: "Contentful", kind: "greenhouse", tenant: "contentful", countries: ["Germany"], careerUrl: "https://job-boards.greenhouse.io/contentful", priority: "high" },
  { company: "Contentsquare", kind: "lever", tenant: "contentsquare", countries: ["France", "Germany"], careerUrl: "https://jobs.lever.co/contentsquare", priority: "high" },
  { company: "BlaBlaCar", kind: "lever", tenant: "blablacar", countries: ["France"], careerUrl: "https://jobs.lever.co/blablacar", priority: "high" },
  { company: "Back Market", kind: "lever", tenant: "backmarket", countries: ["France"], careerUrl: "https://jobs.lever.co/backmarket", priority: "high" },

  { company: "Microsoft", kind: "career_page", countries: targetCountries, careerUrl: "https://careers.microsoft.com/", searchUrlTemplate: "https://jobs.careers.microsoft.com/global/en/search?keywords={query}&location={country}", priority: "top" },
  { company: "Google", kind: "career_page", countries: targetCountries, careerUrl: "https://www.google.com/about/careers/applications/jobs/results/", searchUrlTemplate: "https://www.google.com/about/careers/applications/jobs/results/?q={query}&location={country}", priority: "top" },
  { company: "Apple", kind: "career_page", countries: targetCountries, careerUrl: "https://jobs.apple.com/", searchUrlTemplate: "https://jobs.apple.com/en-us/search?search={query}&location={country}", priority: "top" },
  { company: "Amazon", kind: "career_page", countries: targetCountries, careerUrl: "https://www.amazon.jobs/", searchUrlTemplate: "https://www.amazon.jobs/en/search?base_query={query}&loc_query={country}", priority: "top" },
  { company: "Meta", kind: "career_page", countries: targetCountries, careerUrl: "https://www.metacareers.com/jobs/", searchUrlTemplate: "https://www.metacareers.com/jobs/?q={query}&location={country}", priority: "top" },
  { company: "NVIDIA", kind: "career_page", countries: targetCountries, careerUrl: "https://www.nvidia.com/en-us/about-nvidia/careers/", searchUrlTemplate: "https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite?q={query}&locationCountry={country}", priority: "top" },
  { company: "IBM", kind: "career_page", countries: targetCountries, careerUrl: "https://www.ibm.com/careers", searchUrlTemplate: "https://www.ibm.com/careers/search?field_keyword_05[0]={query}&field_keyword_18[0]={country}", priority: "top" },
  { company: "Oracle", kind: "career_page", countries: targetCountries, careerUrl: "https://careers.oracle.com/jobs/", searchUrlTemplate: "https://careers.oracle.com/jobs/#en/sites/jobsearch/requisitions?keyword={query}&location={country}", priority: "top" },
  { company: "SAP", kind: "career_page", countries: targetCountries, careerUrl: "https://jobs.sap.com/", searchUrlTemplate: "https://jobs.sap.com/search/?q={query}&locationsearch={country}", priority: "top" },
  { company: "Salesforce", kind: "career_page", countries: targetCountries, careerUrl: "https://careers.salesforce.com/", searchUrlTemplate: "https://careers.salesforce.com/en/jobs/?search={query}&country={country}", priority: "top" },

  { company: "Datadog", kind: "greenhouse", tenant: "datadog", countries: ["Germany", "France"], careerUrl: "https://job-boards.greenhouse.io/datadog", priority: "high" },
  { company: "Cloudflare", kind: "greenhouse", tenant: "cloudflare", countries: ["Germany", "France"], careerUrl: "https://job-boards.greenhouse.io/cloudflare", priority: "high" },
  { company: "Grafana Labs", kind: "greenhouse", tenant: "grafanalabs", countries: ["Germany", "France"], careerUrl: "https://job-boards.greenhouse.io/grafanalabs", priority: "high" },
  { company: "Figma", kind: "greenhouse", tenant: "figma", countries: ["Germany", "France"], careerUrl: "https://job-boards.greenhouse.io/figma", priority: "high" },
  { company: "Anthropic", kind: "greenhouse", tenant: "anthropic", countries: ["Germany", "France"], careerUrl: "https://job-boards.greenhouse.io/anthropic", priority: "high" },
  { company: "OpenAI", kind: "greenhouse", tenant: "openai", countries: ["Germany", "France"], careerUrl: "https://job-boards.greenhouse.io/openai", priority: "high" },
  { company: "Databricks", kind: "greenhouse", tenant: "databricks", countries: ["Germany", "France"], careerUrl: "https://job-boards.greenhouse.io/databricks", priority: "high" },
  { company: "MongoDB", kind: "greenhouse", tenant: "mongodb", countries: ["Germany", "France"], careerUrl: "https://job-boards.greenhouse.io/mongodb", priority: "high" },
  { company: "Snyk", kind: "greenhouse", tenant: "snyk", countries: ["Germany", "France"], careerUrl: "https://job-boards.greenhouse.io/snyk", priority: "high" },
  { company: "Palantir", kind: "greenhouse", tenant: "palantir", countries: ["Germany", "France"], careerUrl: "https://job-boards.greenhouse.io/palantir", priority: "high" },
  { company: "Stripe", kind: "greenhouse", tenant: "stripe", countries: ["Germany", "France"], careerUrl: "https://job-boards.greenhouse.io/stripe", priority: "high" },
  { company: "GitLab", kind: "greenhouse", tenant: "gitlab", countries: targetCountries, careerUrl: "https://job-boards.greenhouse.io/gitlab", priority: "high" },
  { company: "Elastic", kind: "greenhouse", tenant: "elastic", countries: ["Germany", "France"], careerUrl: "https://job-boards.greenhouse.io/elastic", priority: "high" },
  { company: "Mistral AI", kind: "lever", tenant: "mistral", countries: ["France"], careerUrl: "https://jobs.lever.co/mistral", priority: "high" },
  { company: "Pennylane", kind: "lever", tenant: "pennylane", countries: ["France"], careerUrl: "https://jobs.lever.co/pennylane", priority: "high" },
  { company: "Algolia", kind: "lever", tenant: "algolia", countries: ["France", "Germany"], careerUrl: "https://jobs.lever.co/algolia", priority: "high" },
  { company: "Hugging Face", kind: "lever", tenant: "huggingface", countries: ["France", "Germany"], careerUrl: "https://jobs.lever.co/huggingface", priority: "high" },
  { company: "Alan", kind: "lever", tenant: "alan", countries: ["France"], careerUrl: "https://jobs.lever.co/alan", priority: "high" },
  { company: "Mirakl", kind: "lever", tenant: "mirakl", countries: ["France", "Germany"], careerUrl: "https://jobs.lever.co/mirakl", priority: "high" },
  { company: "Miro", kind: "greenhouse", tenant: "miro", countries: ["Germany"], careerUrl: "https://job-boards.greenhouse.io/miro", priority: "high" },
  { company: "Docker", kind: "greenhouse", tenant: "docker", countries: ["Germany", "France"], careerUrl: "https://job-boards.greenhouse.io/docker", priority: "high" },
  { company: "Reddit", kind: "greenhouse", tenant: "reddit", countries: ["Germany", "France"], careerUrl: "https://job-boards.greenhouse.io/reddit", priority: "high" },
  { company: "Airbnb", kind: "greenhouse", tenant: "airbnb", countries: ["Germany", "France"], careerUrl: "https://job-boards.greenhouse.io/airbnb", priority: "high" },

  { company: "Wiz", kind: "career_page", countries: ["Germany", "France"], careerUrl: "https://www.wiz.io/careers", searchUrlTemplate: "https://www.wiz.io/careers?search={query}&location={country}", priority: "high" },
  { company: "Wise", kind: "career_page", countries: ["Germany", "France", "Hungary"], careerUrl: "https://wise.jobs/", searchUrlTemplate: "https://wise.jobs/search/?q={query}&location={country}", priority: "high" },
  { company: "Revolut", kind: "career_page", countries: ["Germany", "France", "Hungary"], careerUrl: "https://www.revolut.com/careers/", searchUrlTemplate: "https://www.revolut.com/careers/?q={query}&location={country}", priority: "high" },
  { company: "OVHcloud", kind: "career_page", countries: ["France", "Germany"], careerUrl: "https://careers.ovhcloud.com/", searchUrlTemplate: "https://careers.ovhcloud.com/search/?q={query}&locationsearch={country}", priority: "high" },
  { company: "Scaleway", kind: "career_page", countries: ["France"], careerUrl: "https://www.scaleway.com/en/jobs/", searchUrlTemplate: "https://www.scaleway.com/en/jobs/?query={query}&location={country}", priority: "high" },
  { company: "JetBrains", kind: "career_page", countries: ["Germany", "France", "Hungary"], careerUrl: "https://www.jetbrains.com/careers/jobs/", searchUrlTemplate: "https://www.jetbrains.com/careers/jobs/?search={query}&location={country}", priority: "high" },
];

const stripHtml = (value: string) => value
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<br\s*\/?>/gi, "\n")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&quot;/gi, '"')
  .replace(/&#39;/gi, "'")
  .replace(/\s+/g, " ")
  .trim();

const queryTokens = (value: string) => normalizeJobText(value).split(" ").filter((token) => token.length > 2);
const queryMatches = (title: string, query: string) => {
  const titleSet = new Set(queryTokens(title));
  const wanted = queryTokens(query);
  return wanted.length > 0 && wanted.some((token) => titleSet.has(token));
};

const countryMatchers: Record<string, RegExp> = {
  Germany: /\b(germany|deutschland|berlin|munich|muenchen|munchen|münchen|hamburg|frankfurt|cologne|koeln|koln|köln|dusseldorf|duesseldorf|düsseldorf|stuttgart|leipzig|dresden|hannover|nuremberg|nurnberg|nürnberg|remote.?germany)\b/i,
  France: /\b(france|paris|lyon|lille|bordeaux|nantes|marseille|toulouse|nice|grenoble|strasbourg|remote.?france)\b/i,
  Hungary: /\b(hungary|magyarorszag|budapest|debrecen|szeged|gyor|győr|pecs|pécs|remote.?hungary)\b/i,
};

const locationMatchesCountry = (value: string | null | undefined, country: string) => Boolean(value && countryMatchers[country]?.test(value));

function directJob(source: DirectPortfolioSource, input: ProviderSearchInput, fields: {
  externalId: string;
  title: string;
  url: string;
  location?: string | null;
  description?: string;
  descriptionComplete?: boolean;
  workplaceModel?: CanonicalJobCandidate["workplaceModel"];
  employmentTypes?: string[];
  postedAt?: string | null;
}, evidence: Record<string, unknown>): CanonicalJobCandidate | null {
  const url = safeExternalUrl(fields.url);
  if (!url || !fields.title.trim()) return null;
  const row: CanonicalJobCandidate = {
    externalId: fields.externalId,
    source: "DirectCompanyPortfolio",
    sourceQuery: input.query,
    company: source.company,
    title: fields.title.trim(),
    normalizedTitle: normalizeJobText(fields.title),
    location: fields.location?.trim() || null,
    country: input.country,
    sourceUrl: url,
    applicationUrl: url,
    description: fields.description ?? "",
    descriptionComplete: fields.descriptionComplete ?? false,
    workplaceModel: fields.workplaceModel ?? "unknown",
    employmentTypes: fields.employmentTypes ?? [],
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
    postedAt: fields.postedAt ?? null,
    expiresAt: null,
    canonicalKey: "",
    sourceQueries: [input.query],
    sources: [{ provider: `Direct:${source.company}`, sourceJobId: fields.externalId, sourceQuery: input.query, sourceUrl: url, providerPayload: { directCompany: true, company: source.company, careerUrl: source.careerUrl, sourceConfidence: "high", ...evidence } }],
    providerPayload: { directCompany: true, company: source.company, careerUrl: source.careerUrl, sourceConfidence: "high", ...evidence },
  };
  row.canonicalKey = canonicalJobKey(row);
  return row;
}

type GreenhouseJob = { id?: number; title?: string; location?: { name?: string }; content?: string; absolute_url?: string; updated_at?: string };
type LeverJob = { id?: string; text?: string; categories?: { location?: string; commitment?: string }; descriptionPlain?: string; additionalPlain?: string; hostedUrl?: string; applyUrl?: string; createdAt?: number; workplaceType?: string };

const normalizeCommitment = (value: string | undefined) => {
  const normalized = normalizeJobText(value ?? "");
  if (/\b(full time|fulltime|full-time|vollzeit)\b/.test(normalized)) return ["full_time"];
  if (/\b(part time|parttime|part-time|teilzeit)\b/.test(normalized)) return ["part_time"];
  if (/\b(contract|contractor|fixed term|temporary|befristet)\b/.test(normalized)) return ["contract"];
  if (/\b(internship|intern|praktikum)\b/.test(normalized)) return ["internship"];
  if (/\b(permanent|unbefristet|cdi)\b/.test(normalized)) return ["permanent"];
  return [];
};

class DirectCompanyPortfolioProvider implements JobProvider {
  readonly name = "DirectCompanyPortfolio";
  private atsCache = new Map<string, Promise<unknown>>();
  private pageCache = new Map<string, Promise<string>>();

  countrySupport(country: string) {
    return targetCountries.includes(country);
  }

  async health() {
    return { configured: true, status: "healthy" as const };
  }

  async rateLimitState() {
    return { keyRequired: false, source: "direct-company-public-sources", monitoredCompanies: directCompanyPortfolioRegistry.length };
  }

  private async fetchJson(url: string, cacheKey: string) {
    let cached = this.atsCache.get(cacheKey);
    if (!cached) {
      cached = fetch(url, { headers: { Accept: "application/json", "User-Agent": "AI-Role-Path-Job-Agent/1.0" }, cache: "no-store", signal: AbortSignal.timeout(timeoutMs) }).then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      });
      this.atsCache.set(cacheKey, cached);
    }
    return cached;
  }

  private async fetchHtml(url: string, cacheKey: string) {
    let cached = this.pageCache.get(cacheKey);
    if (!cached) {
      cached = fetch(url, { headers: { Accept: "text/html,application/xhtml+xml", "User-Agent": "Mozilla/5.0 AI-Role-Path-Job-Agent/1.0" }, cache: "no-store", redirect: "follow", signal: AbortSignal.timeout(timeoutMs) }).then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      });
      this.pageCache.set(cacheKey, cached);
    }
    return cached;
  }

  private async searchGreenhouse(source: DirectPortfolioSource, input: ProviderSearchInput) {
    const payload = await this.fetchJson(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(source.tenant ?? "")}/jobs?content=true`, `gh:${source.tenant}`) as { jobs?: GreenhouseJob[] };
    return (payload.jobs ?? [])
      .filter((job) => job.title && queryMatches(job.title, input.query))
      .filter((job) => locationMatchesCountry(job.location?.name, input.country))
      .slice(0, input.limit)
      .flatMap((job) => {
        if (!job.id || !job.title || !job.absolute_url) return [];
        const row = directJob(source, input, {
          externalId: String(job.id), title: job.title, url: job.absolute_url, location: job.location?.name ?? null,
          description: stripHtml(job.content ?? ""), descriptionComplete: Boolean(job.content),
          workplaceModel: /\bremote\b/i.test(job.location?.name ?? "") ? "remote" : /\bhybrid\b/i.test(job.location?.name ?? "") ? "hybrid" : "unknown",
          postedAt: job.updated_at ?? null,
        }, { ats: "greenhouse" });
        return row ? [row] : [];
      });
  }

  private async searchLever(source: DirectPortfolioSource, input: ProviderSearchInput) {
    const payload = await this.fetchJson(`https://api.lever.co/v0/postings/${encodeURIComponent(source.tenant ?? "")}?mode=json`, `lever:${source.tenant}`) as LeverJob[];
    return (payload ?? [])
      .filter((job) => job.text && queryMatches(job.text, input.query))
      .filter((job) => locationMatchesCountry(job.categories?.location, input.country))
      .slice(0, input.limit)
      .flatMap((job) => {
        const url = job.applyUrl ?? job.hostedUrl;
        if (!job.id || !job.text || !url) return [];
        const workplaceText = `${job.workplaceType ?? ""} ${job.categories?.location ?? ""}`;
        const row = directJob(source, input, {
          externalId: job.id, title: job.text, url, location: job.categories?.location ?? null,
          description: [job.descriptionPlain, job.additionalPlain].filter(Boolean).join("\n"), descriptionComplete: Boolean(job.descriptionPlain),
          workplaceModel: /\bremote\b/i.test(workplaceText) ? "remote" : /\bhybrid\b/i.test(workplaceText) ? "hybrid" : /\bon.?site\b/i.test(workplaceText) ? "on_site" : "unknown",
          employmentTypes: normalizeCommitment(job.categories?.commitment),
          postedAt: job.createdAt ? new Date(job.createdAt).toISOString() : null,
        }, { ats: "lever" });
        return row ? [row] : [];
      });
  }

  private async searchCareerPage(source: DirectPortfolioSource, input: ProviderSearchInput) {
    const template = source.searchUrlTemplate ?? source.careerUrl;
    const searchUrl = template
      .replaceAll("{query}", encodeURIComponent(input.query))
      .replaceAll("{country}", encodeURIComponent(input.country));
    const html = await this.fetchHtml(searchUrl, `page:${source.company}:${input.country}:${normalizeJobText(input.query)}`);
    const anchors = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
    const seen = new Set<string>();
    const jobs: CanonicalJobCandidate[] = [];
    for (const match of anchors) {
      if (jobs.length >= input.limit) break;
      const title = stripHtml(match[2] ?? "");
      if (title.length < 5 || title.length > 180 || !queryMatches(title, input.query)) continue;
      let absolute: string;
      try { absolute = new URL(match[1] ?? "", searchUrl).toString(); } catch { continue; }
      if (!/job|career|position|opening|requisition|vacanc|role/i.test(absolute)) continue;
      const normalizedUrl = safeExternalUrl(absolute);
      if (!normalizedUrl || seen.has(normalizedUrl)) continue;
      const aroundStart = Math.max(0, (match.index ?? 0) - 500);
      const around = stripHtml(html.slice(aroundStart, Math.min(html.length, (match.index ?? 0) + match[0].length + 500)));
      if (!template.includes("{country}") && !locationMatchesCountry(around, input.country)) continue;
      seen.add(normalizedUrl);
      const row = directJob(source, input, {
        externalId: `${source.company}:${normalizedUrl}`,
        title,
        url: normalizedUrl,
        location: locationMatchesCountry(around, input.country) ? input.country : null,
        description: around.slice(0, 1200),
        descriptionComplete: false,
        workplaceModel: /\bremote\b/i.test(around) ? "remote" : /\bhybrid\b/i.test(around) ? "hybrid" : "unknown",
      }, { ats: "career_page", extraction: "official-search-page" });
      if (row) jobs.push(row);
    }
    return jobs;
  }

  private async searchSource(source: DirectPortfolioSource, input: ProviderSearchInput) {
    if (source.kind === "greenhouse") return this.searchGreenhouse(source, input);
    if (source.kind === "lever") return this.searchLever(source, input);
    return this.searchCareerPage(source, input);
  }

  async search(input: ProviderSearchInput): Promise<ProviderSearchOutcome> {
    const started = Date.now();
    if (!this.countrySupport(input.country)) {
      return { provider: this.name, status: "unsupported_country", jobs: [], latencyMs: 0, requestCount: 0, rateLimitState: { monitoredCompanies: directCompanyPortfolioRegistry.length }, errorCode: "UNSUPPORTED_COUNTRY" };
    }

    const sources = directCompanyPortfolioRegistry
      .filter((source) => source.countries.includes(input.country))
      .sort((a, b) => ({ top: 0, high: 1, normal: 2 }[a.priority] - { top: 0, high: 1, normal: 2 }[b.priority]);
    const jobs: CanonicalJobCandidate[] = [];
    let requestCount = 0;
    let failedSources = 0;

    for (let index = 0; index < sources.length; index += portfolioConcurrency) {
      const batch = sources.slice(index, index + portfolioConcurrency);
      const results = await Promise.all(batch.map(async (source) => {
        try {
          const rows = await this.searchSource(source, input);
          return { rows, failed: false };
        } catch {
          return { rows: [] as CanonicalJobCandidate[], failed: true };
        }
      }));
      requestCount += batch.length;
      failedSources += results.filter((result) => result.failed).length;
      jobs.push(...results.flatMap((result) => result.rows));
    }

    const deduped = [...new Map(jobs.map((job) => [job.canonicalKey, job])).values()].slice(0, Math.max(input.limit, 25));
    return {
      provider: this.name,
      status: deduped.length ? "success" : failedSources === sources.length && sources.length > 0 ? "provider_error" : "no_results",
      jobs: deduped,
      latencyMs: Date.now() - started,
      requestCount,
      rateLimitState: { keyRequired: false, source: "direct-company-public-sources", monitoredCompanies: directCompanyPortfolioRegistry.length, attemptedSources: sources.length, failedSources },
      ...(failedSources === sources.length && sources.length > 0 ? { errorCode: "DIRECT_COMPANY_PORTFOLIO_UNAVAILABLE", errorMessage: "All direct-company sources failed for this country/query." } : {}),
    };
  }
}

export function directCompanyPortfolioProviders(): JobProvider[] {
  if (process.env.JOB_AGENT_DIRECT_COMPANY_ENABLED === "false") return [];
  return [new DirectCompanyPortfolioProvider()];
}
