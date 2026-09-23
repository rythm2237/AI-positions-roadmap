import "server-only";

import { canonicalJobKey, normalizeJobText, safeExternalUrl } from "../normalization";
import type { CanonicalJobCandidate, JobProvider, ProviderSearchInput, ProviderSearchOutcome } from "../contracts";

const timeoutMs = 4_000;
const concurrency = 20;
const targetCountries = ["Germany", "France", "Hungary"];

type Source = {
  company: string;
  kind: "greenhouse" | "lever" | "career_page";
  tenant?: string;
  countries: string[];
  careerUrl: string;
  searchUrlTemplate?: string;
};

// Companies 51-100 in the technology-first direct monitoring portfolio.
// Public ATS feeds are preferred; proprietary systems are queried only through
// the employer's own official careers/search pages.
export const directCompanyExpansionRegistry: Source[] = [
  { company: "Adobe", kind: "career_page", countries: targetCountries, careerUrl: "https://careers.adobe.com/", searchUrlTemplate: "https://careers.adobe.com/us/en/search-results?keywords={query}&location={country}" },
  { company: "Atlassian", kind: "career_page", countries: ["Germany", "France"], careerUrl: "https://www.atlassian.com/company/careers", searchUrlTemplate: "https://www.atlassian.com/company/careers/all-jobs?search={query}&location={country}" },
  { company: "GitHub", kind: "career_page", countries: targetCountries, careerUrl: "https://www.github.careers/careers-home", searchUrlTemplate: "https://www.github.careers/careers-home/jobs?keywords={query}&location={country}" },
  { company: "Cisco", kind: "career_page", countries: targetCountries, careerUrl: "https://jobs.cisco.com/", searchUrlTemplate: "https://jobs.cisco.com/jobs/SearchJobs/?21178=%5B169482%5D&21178_format=6020&listFilterMode=1&projectOffset=0&projectRecordsPerPage=10&keyword={query}&location={country}" },
  { company: "Broadcom", kind: "career_page", countries: ["Germany", "France"], careerUrl: "https://www.broadcom.com/company/careers", searchUrlTemplate: "https://broadcom.wd1.myworkdayjobs.com/External_Career?q={query}&locationCountry={country}" },
  { company: "ServiceNow", kind: "career_page", countries: targetCountries, careerUrl: "https://careers.servicenow.com/", searchUrlTemplate: "https://careers.servicenow.com/jobs/?search={query}&location={country}" },
  { company: "Snowflake", kind: "greenhouse", tenant: "snowflake", countries: ["Germany", "France"], careerUrl: "https://careers.snowflake.com/" },
  { company: "Confluent", kind: "greenhouse", tenant: "confluent", countries: ["Germany", "France"], careerUrl: "https://www.confluent.io/careers/" },
  { company: "HashiCorp", kind: "greenhouse", tenant: "hashicorp", countries: ["Germany", "France"], careerUrl: "https://www.hashicorp.com/careers/open-positions" },
  { company: "Twilio", kind: "greenhouse", tenant: "twilio", countries: ["Germany", "France"], careerUrl: "https://www.twilio.com/company/jobs" },
  { company: "Okta", kind: "greenhouse", tenant: "okta", countries: ["Germany", "France"], careerUrl: "https://www.okta.com/company/careers/" },
  { company: "CrowdStrike", kind: "career_page", countries: ["Germany", "France"], careerUrl: "https://www.crowdstrike.com/en-us/careers/", searchUrlTemplate: "https://crowdstrike.wd5.myworkdayjobs.com/crowdstrikecareers?q={query}&locationCountry={country}" },
  { company: "Palo Alto Networks", kind: "career_page", countries: ["Germany", "France"], careerUrl: "https://jobs.paloaltonetworks.com/", searchUrlTemplate: "https://jobs.paloaltonetworks.com/en/jobs/?search={query}&location={country}" },
  { company: "Fortinet", kind: "career_page", countries: ["Germany", "France"], careerUrl: "https://www.fortinet.com/corporate/careers", searchUrlTemplate: "https://edel.fa.us2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1/requisitions?keyword={query}&location={country}" },
  { company: "Zscaler", kind: "career_page", countries: ["Germany", "France"], careerUrl: "https://www.zscaler.com/careers", searchUrlTemplate: "https://www.zscaler.com/careers/search?search={query}&location={country}" },
  { company: "SentinelOne", kind: "greenhouse", tenant: "sentinelone", countries: ["Germany", "France"], careerUrl: "https://www.sentinelone.com/jobs/" },
  { company: "Veeam", kind: "career_page", countries: ["Germany", "France"], careerUrl: "https://careers.veeam.com/", searchUrlTemplate: "https://careers.veeam.com/vacancies?search={query}&location={country}" },
  { company: "Dynatrace", kind: "career_page", countries: ["Germany", "France"], careerUrl: "https://careers.dynatrace.com/", searchUrlTemplate: "https://careers.dynatrace.com/jobs/?search={query}&location={country}" },
  { company: "New Relic", kind: "greenhouse", tenant: "newrelic", countries: ["Germany", "France"], careerUrl: "https://newrelic.com/about/careers" },
  { company: "Splunk", kind: "career_page", countries: ["Germany", "France"], careerUrl: "https://www.splunk.com/en_us/careers/search-jobs.html", searchUrlTemplate: "https://www.splunk.com/en_us/careers/search-jobs.html?search={query}&location={country}" },
  { company: "HubSpot", kind: "career_page", countries: ["Germany", "France"], careerUrl: "https://www.hubspot.com/careers/jobs", searchUrlTemplate: "https://www.hubspot.com/careers/jobs?search={query}&location={country}" },
  { company: "Zendesk", kind: "greenhouse", tenant: "zendesk", countries: ["Germany", "France"], careerUrl: "https://jobs.zendesk.com/" },
  { company: "Personio", kind: "career_page", countries: ["Germany"], careerUrl: "https://www.personio.com/about-personio/careers/", searchUrlTemplate: "https://www.personio.com/about-personio/careers/jobs/?search={query}&location={country}" },
  { company: "N26", kind: "greenhouse", tenant: "n26", countries: ["Germany", "France"], careerUrl: "https://n26.com/en/careers" },
  { company: "SumUp", kind: "greenhouse", tenant: "sumup", countries: ["Germany", "France"], careerUrl: "https://www.sumup.com/careers/" },
  { company: "Klarna", kind: "lever", tenant: "klarna", countries: ["Germany", "France"], careerUrl: "https://www.klarna.com/careers/" },
  { company: "Mollie", kind: "greenhouse", tenant: "mollie", countries: ["Germany", "France"], careerUrl: "https://www.mollie.com/careers" },
  { company: "Adyen", kind: "greenhouse", tenant: "adyen", countries: ["Germany", "France"], careerUrl: "https://careers.adyen.com/" },
  { company: "Deezer", kind: "lever", tenant: "deezer", countries: ["France"], careerUrl: "https://www.deezerjobs.com/" },
  { company: "Doctolib", kind: "lever", tenant: "doctolib", countries: ["France", "Germany"], careerUrl: "https://careers.doctolib.com/" },
  { company: "Criteo", kind: "career_page", countries: ["France", "Germany"], careerUrl: "https://careers.criteo.com/", searchUrlTemplate: "https://careers.criteo.com/jobs/?search={query}&location={country}" },
  { company: "Ledger", kind: "lever", tenant: "ledger", countries: ["France"], careerUrl: "https://www.ledger.com/career" },
  { company: "Sorare", kind: "lever", tenant: "sorare", countries: ["France"], careerUrl: "https://sorare.com/careers" },
  { company: "ManoMano", kind: "greenhouse", tenant: "manomano", countries: ["France", "Germany"], careerUrl: "https://www.manomano.jobs/" },
  { company: "Brevo", kind: "career_page", countries: ["France", "Germany"], careerUrl: "https://www.brevo.com/careers/", searchUrlTemplate: "https://www.brevo.com/careers/?search={query}&location={country}" },
  { company: "PayFit", kind: "lever", tenant: "payfit", countries: ["France", "Germany"], careerUrl: "https://payfit.com/careers/" },
  { company: "Exotec", kind: "lever", tenant: "exotec", countries: ["France", "Germany"], careerUrl: "https://www.exotec.com/careers/" },
  { company: "Backbase", kind: "career_page", countries: ["Germany", "France"], careerUrl: "https://www.backbase.com/careers", searchUrlTemplate: "https://www.backbase.com/careers/jobs?search={query}&location={country}" },
  { company: "Booking.com", kind: "career_page", countries: ["Germany", "France"], careerUrl: "https://careers.booking.com/", searchUrlTemplate: "https://careers.booking.com/jobs/?search={query}&location={country}" },
  { company: "TomTom", kind: "career_page", countries: ["Germany", "France"], careerUrl: "https://www.tomtom.com/careers/", searchUrlTemplate: "https://www.tomtom.com/careers/jobs/?search={query}&location={country}" },
  { company: "ASML", kind: "career_page", countries: ["Germany", "France"], careerUrl: "https://www.asml.com/en/careers/find-your-job", searchUrlTemplate: "https://www.asml.com/en/careers/find-your-job?query={query}&location={country}" },
  { company: "NXP", kind: "career_page", countries: ["Germany", "France"], careerUrl: "https://www.nxp.com/company/about-nxp/careers:CAREERS", searchUrlTemplate: "https://nxp.wd3.myworkdayjobs.com/careers?q={query}&locationCountry={country}" },
  { company: "Bosch Digital", kind: "career_page", countries: ["Germany", "France", "Hungary"], careerUrl: "https://www.bosch-digital.com/careers/", searchUrlTemplate: "https://www.bosch-digital.com/careers/?search={query}&location={country}" },
  { company: "Siemens", kind: "career_page", countries: targetCountries, careerUrl: "https://jobs.siemens.com/careers", searchUrlTemplate: "https://jobs.siemens.com/careers?query={query}&location={country}" },
  { company: "T-Systems", kind: "career_page", countries: ["Germany", "Hungary"], careerUrl: "https://www.t-systems.com/de/en/careers", searchUrlTemplate: "https://www.t-systems.com/de/en/careers/search?query={query}&location={country}" },
  { company: "Nokia", kind: "career_page", countries: targetCountries, careerUrl: "https://www.nokia.com/about-us/careers/", searchUrlTemplate: "https://nokia.wd3.myworkdayjobs.com/en-US/jobs?q={query}&locationCountry={country}" },
  { company: "Ericsson", kind: "career_page", countries: targetCountries, careerUrl: "https://www.ericsson.com/en/careers", searchUrlTemplate: "https://jobs.ericsson.com/careers?query={query}&location={country}" },
  { company: "UiPath", kind: "greenhouse", tenant: "uipath", countries: ["Germany", "France"], careerUrl: "https://www.uipath.com/careers" },
  { company: "Automation Anywhere", kind: "greenhouse", tenant: "automationanywhere", countries: ["Germany", "France"], careerUrl: "https://www.automationanywhere.com/company/careers" },
  { company: "Procore", kind: "greenhouse", tenant: "procore", countries: ["Germany", "France"], careerUrl: "https://www.procore.com/jobs" },
];

const text = (value: string) => value.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/gi, "&").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
const tokens = (value: string) => normalizeJobText(value).split(" ").filter((token) => token.length > 2);
const relevant = (title: string, query: string) => { const haystack = new Set(tokens(title)); return tokens(query).some((token) => haystack.has(token)); };
const countryPatterns: Record<string, RegExp> = {
  Germany: /\b(germany|deutschland|berlin|munich|muenchen|hamburg|frankfurt|cologne|koeln|stuttgart|dusseldorf|duesseldorf|leipzig|dresden|hannover|nuremberg)\b/i,
  France: /\b(france|paris|lyon|lille|bordeaux|nantes|marseille|toulouse|nice|grenoble|strasbourg)\b/i,
  Hungary: /\b(hungary|magyarorszag|budapest|debrecen|szeged|gyor|pecs)\b/i,
};
const countryMatch = (location: string | null | undefined, country: string) => Boolean(location && countryPatterns[country]?.test(location));

type GreenhouseJob = { id?: number; title?: string; absolute_url?: string; updated_at?: string; location?: { name?: string }; content?: string };
type LeverJob = { id?: string; text?: string; hostedUrl?: string; applyUrl?: string; createdAt?: number; categories?: { location?: string; commitment?: string }; descriptionPlain?: string; description?: string; lists?: Array<{ text?: string; content?: string }> };

type NormalizedFeedJob = { id: string; title: string; url: string; location: string | null; description: string; postedAt: string | null; employmentTypes: string[] };

class DirectCompanyExpansionProvider implements JobProvider {
  readonly name = "DirectCompanyExpansion";
  private readonly payloads = new Map<string, Promise<NormalizedFeedJob[]>>();

  countrySupport(country: string) { return targetCountries.includes(country); }
  async health() { return { configured: true, status: "healthy" as const }; }
  async rateLimitState() { return { keyRequired: false, source: "direct-company-careers", monitoredCompanies: directCompanyExpansionRegistry.length }; }

  private load(source: Source): Promise<NormalizedFeedJob[]> {
    const key = `${source.kind}:${source.tenant ?? source.company}`;
    const cached = this.payloads.get(key);
    if (cached) return cached;
    const promise = this.fetchSource(source).catch(() => []);
    this.payloads.set(key, promise);
    return promise;
  }

  private async fetchSource(source: Source): Promise<NormalizedFeedJob[]> {
    if (source.kind === "greenhouse" && source.tenant) {
      const response = await fetch(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(source.tenant)}/jobs?content=true`, { headers: { Accept: "application/json", "User-Agent": "AI-Role-Path-Job-Agent/1.0" }, cache: "no-store", signal: AbortSignal.timeout(timeoutMs) });
      if (!response.ok) return [];
      const payload = await response.json() as { jobs?: GreenhouseJob[] };
      return (payload.jobs ?? []).flatMap((job) => {
        if (!job.id || !job.title || !job.absolute_url) return [];
        return [{ id: String(job.id), title: job.title, url: job.absolute_url, location: job.location?.name?.trim() || null, description: text(job.content ?? ""), postedAt: job.updated_at ?? null, employmentTypes: [] }];
      });
    }
    if (source.kind === "lever" && source.tenant) {
      const response = await fetch(`https://api.lever.co/v0/postings/${encodeURIComponent(source.tenant)}?mode=json`, { headers: { Accept: "application/json", "User-Agent": "AI-Role-Path-Job-Agent/1.0" }, cache: "no-store", signal: AbortSignal.timeout(timeoutMs) });
      if (!response.ok) return [];
      const payload = await response.json() as LeverJob[];
      return payload.flatMap((job) => {
        const url = job.applyUrl ?? job.hostedUrl;
        if (!job.id || !job.text || !url) return [];
        const description = [job.descriptionPlain ?? text(job.description ?? ""), ...(job.lists ?? []).map((item) => `${item.text ?? ""} ${text(item.content ?? "")}`)].join(" ").trim();
        return [{ id: job.id, title: job.text, url, location: job.categories?.location?.trim() || null, description, postedAt: typeof job.createdAt === "number" ? new Date(job.createdAt).toISOString() : null, employmentTypes: job.categories?.commitment ? [job.categories.commitment] : [] }];
      });
    }

    const url = source.searchUrlTemplate?.replace("{query}", "").replace("{country}", "") ?? source.careerUrl;
    const response = await fetch(url, { headers: { Accept: "text/html,application/xhtml+xml", "User-Agent": "AI-Role-Path-Job-Agent/1.0" }, cache: "no-store", signal: AbortSignal.timeout(timeoutMs), redirect: "follow" });
    if (!response.ok) return [];
    const html = await response.text();
    const rows: NormalizedFeedJob[] = [];
    for (const match of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
      try {
        const parsed = JSON.parse(match[1]);
        const values = Array.isArray(parsed) ? parsed : parsed?.["@graph"] ? parsed["@graph"] : [parsed];
        for (const value of values) {
          if (value?.["@type"] !== "JobPosting" || !value.title) continue;
          const location = value.jobLocation?.address ? [value.jobLocation.address.addressLocality, value.jobLocation.address.addressCountry].filter(Boolean).join(", ") : null;
          const rawUrl = value.url ?? value.sameAs ?? source.careerUrl;
          rows.push({ id: String(value.identifier?.value ?? rawUrl ?? value.title), title: String(value.title), url: String(rawUrl), location, description: text(String(value.description ?? "")), postedAt: value.datePosted ? String(value.datePosted) : null, employmentTypes: value.employmentType ? (Array.isArray(value.employmentType) ? value.employmentType.map(String) : [String(value.employmentType)]) : [] });
        }
      } catch { /* malformed third-party JSON-LD should not break a source */ }
    }
    return rows;
  }

  async search(input: ProviderSearchInput): Promise<ProviderSearchOutcome> {
    const started = Date.now();
    if (!this.countrySupport(input.country)) return { provider: this.name, status: "unsupported_country", jobs: [], latencyMs: 0, requestCount: 0, rateLimitState: { monitoredCompanies: directCompanyExpansionRegistry.length }, errorCode: "UNSUPPORTED_COUNTRY" };
    const sources = directCompanyExpansionRegistry.filter((source) => source.countries.includes(input.country));
    const collected: CanonicalJobCandidate[] = [];
    let requestCount = 0;

    for (let i = 0; i < sources.length; i += concurrency) {
      const batch = sources.slice(i, i + concurrency);
      const results = await Promise.all(batch.map(async (source) => ({ source, jobs: await this.load(source) })));
      requestCount += results.length;
      for (const { source, jobs } of results) {
        for (const job of jobs) {
          if (!relevant(job.title, input.query) || !countryMatch(job.location, input.country)) continue;
          const url = safeExternalUrl(job.url);
          if (!url) continue;
          const row: CanonicalJobCandidate = {
            externalId: `${source.company}:${job.id}`,
            source: this.name,
            sourceQuery: input.query,
            company: source.company,
            title: job.title,
            normalizedTitle: normalizeJobText(job.title),
            location: job.location,
            country: input.country,
            sourceUrl: url,
            applicationUrl: url,
            description: job.description,
            descriptionComplete: Boolean(job.description),
            workplaceModel: /\bremote\b/i.test(job.location ?? "") ? "remote" : "unknown",
            employmentTypes: job.employmentTypes,
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
            postedAt: job.postedAt,
            expiresAt: null,
            canonicalKey: "",
            sourceQueries: [input.query],
            sources: [{ provider: this.name, sourceJobId: `${source.company}:${job.id}`, sourceQuery: input.query, sourceUrl: url, providerPayload: { directCompany: true, careerUrl: source.careerUrl, ats: source.kind, sourceConfidence: "high", portfolio: "51-100" } }],
            providerPayload: { directCompany: true, careerUrl: source.careerUrl, ats: source.kind, sourceConfidence: "high", portfolio: "51-100" },
          };
          row.canonicalKey = canonicalJobKey(row);
          collected.push(row);
          if (collected.length >= input.limit) break;
        }
        if (collected.length >= input.limit) break;
      }
      if (collected.length >= input.limit) break;
    }

    return { provider: this.name, status: collected.length ? "success" : "no_results", jobs: collected.slice(0, input.limit), latencyMs: Date.now() - started, requestCount, rateLimitState: { keyRequired: false, source: "direct-company-careers", monitoredCompanies: directCompanyExpansionRegistry.length } };
  }
}

export function directCompanyExpansionProviders(): JobProvider[] {
  if (process.env.JOB_AGENT_DIRECT_COMPANY_ENABLED === "false") return [];
  return [new DirectCompanyExpansionProvider()];
}
