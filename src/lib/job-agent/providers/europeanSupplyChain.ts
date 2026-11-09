import { canonicalCountry } from "../countryIdentity.ts";
import type { CanonicalJobCandidate, JobProvider, ProviderSearchInput, ProviderSearchOutcome } from "../contracts.ts";
import { canonicalJobKey, normalizeJobText, safeExternalUrl } from "../normalization.ts";
import { selectCandidatesForVerification } from "../verificationSelection.ts";
import { europeanJobCountryCode, SmartRecruitersProvider, smartRecruitersEmployers } from "./smartRecruiters.ts";

const publicBoards = [
  { company: "DSV", kind: "successfactors", careerUrl: "https://jobs.dsv.com" },
  { company: "DACHSER", kind: "successfactors", careerUrl: "https://careers.dachser.com" },
  { company: "cargo-partner", kind: "lever", careerUrl: "https://www.cargo-partner.com/career", tenant: "cargo-partner" },
  { company: "OMP", kind: "greenhouse", careerUrl: "https://job-boards.greenhouse.io/ompexternaljobboards", tenant: "ompexternaljobboards" },
  { company: "KNAPP", kind: "knapp", careerUrl: "https://www.knapp.com/en/career/jobs/" },
  { company: "Maersk", kind: "workday", careerUrl: "https://maersk.wd3.myworkdayjobs.com/en-US/Maersk_Careers", tenant: "maersk", site: "Maersk_Careers" },
  { company: "KION Group", kind: "workday", careerUrl: "https://kiongroup.wd3.myworkdayjobs.com/en-US/KIONGroup", tenant: "kiongroup", site: "KIONGroup" },
  { company: "Vanderlande", kind: "workday", careerUrl: "https://vanderlande.wd3.myworkdayjobs.com/careers", tenant: "vanderlande", site: "careers" },
] as const;

type Board = typeof publicBoards[number];
type Job = { id: string; title: string; location: string; url: string; description?: string };
const entities: Record<string, string> = { amp: "&", nbsp: " ", quot: '"', apos: "'", lt: "<", gt: ">" };
function plain(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, key: string) => {
    if (!key.startsWith("#")) return entities[key] ?? entity;
    const code = key[1].toLowerCase() === "x" ? Number.parseInt(key.slice(2), 16) : Number(key.slice(1));
    return code <= 0x10ffff ? String.fromCodePoint(code) : entity;
  }).replace(/\s+/g, " ").trim();
}

export function parseSuccessFactorsListings(html: string, origin: string): Job[] {
  const jobs: Job[] = [];
  for (const [, row] of html.matchAll(/<tr\b[^>]*class="data-row"[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const anchor = row.match(/<a\b[^>]*href="(\/job\/[^"<>]+\/(\d+)\/)"[^>]*class="jobTitle-link"[^>]*>([\s\S]*?)<\/a>/i);
    const location = row.match(/<td\b[^>]*headers="hdrLocation"[^>]*>([\s\S]*?)<\/td>/i);
    if (!anchor || !location) continue;
    jobs.push({ id: anchor[2], title: plain(anchor[3]), location: plain(location[1]), url: origin + anchor[1] });
  }
  return jobs;
}

export function parseKnappListings(html: string): Job[] {
  const countries = [...html.matchAll(/<h3\b[^>]*class="country-name"[^>]*>([^<]+)<\/h3>/gi)];
  return countries.flatMap((country, index) => {
    const section = html.slice((country.index ?? 0) + country[0].length, countries[index + 1]?.index ?? html.length);
    return [...section.matchAll(/<a\b[^>]*data-id="(\d+)"[^>]*href="(https:\/\/www\.knapp\.com\/en\/jobs\/[^"<>]+)"[^>]*>([\s\S]*?)<\/a>/gi)].flatMap(([, id, url, content]) => {
      const title = content.match(/<div class="job-name">([\s\S]*?)<\/div>/i);
      const city = content.match(/<div class="job-location">([\s\S]*?)<\/div>/i);
      return title ? [{ id, url, title: plain(title[1]), location: [city && plain(city[1]), plain(country[1])].filter(Boolean).join(", ") }] : [];
    });
  });
}

const locationParts = (location: string) => location.split(/[,;|]/).map((part) => canonicalCountry(part));
const matchesCountry = (location: string, country: string, code: string) =>
  locationParts(location).some((part) => part === canonicalCountry(country) || part === canonicalCountry(code));

class PublicSupplyChainBoard implements JobProvider {
  readonly name: string;
  private readonly source: Board;
  private readonly cache = new Map<string, Promise<Job[]>>();

  constructor(source: Board) {
    this.source = source;
    this.name = `Direct:${source.company}`;
  }

  countrySupport(country: string) { return Boolean(europeanJobCountryCode(country)); }
  async health() { return { configured: true, status: "healthy" as const }; }
  async rateLimitState() { return { source: this.source.kind }; }

  private async load(input: ProviderSearchInput): Promise<Job[]> {
    const source = this.source;
    const options = { signal: AbortSignal.timeout(9_000), redirect: "error" as const };
    if (source.kind === "successfactors") {
      const query = new URLSearchParams({ q: input.query, locationsearch: input.country });
      const response = await fetch(`${source.careerUrl}/search/?${query}`, options);
      if (!response.ok) throw new Error(`HTTP_${response.status}`);
      const html = await response.text();
      if (!/id="searchresults"|class="data-row"|class="no-results"|No jobs found|No results found/i.test(html)) throw new Error("UNRECOGNIZED_LISTING");
      return parseSuccessFactorsListings(html, source.careerUrl);
    }
    if (source.kind === "knapp") {
      const response = await fetch(source.careerUrl, options);
      if (!response.ok) throw new Error(`HTTP_${response.status}`);
      const html = await response.text();
      if (!html.includes('class="country-name"')) throw new Error("UNRECOGNIZED_LISTING");
      return parseKnappListings(html);
    }
    if (source.kind === "workday") {
      const origin = new URL(source.careerUrl).origin;
      const response = await fetch(`${origin}/wday/cxs/${source.tenant}/${source.site}/jobs`, {
        ...options, method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appliedFacets: {}, limit: 20, offset: 0, searchText: input.query }),
      });
      if (!response.ok) throw new Error(`HTTP_${response.status}`);
      const data = await response.json() as { jobPostings: { title: string; externalPath: string; locationsText?: string; bulletFields?: string[] }[] };
      return data.jobPostings.flatMap((row) => /^\/job\/[^/?#]+(?:\/[^/?#]+)*$/.test(row.externalPath) && row.title ? [{
        id: row.bulletFields?.[0] ?? row.externalPath, title: row.title, location: row.locationsText ?? "",
        url: source.careerUrl + row.externalPath,
      }] : []);
    }
    if (source.kind === "greenhouse") {
      const response = await fetch(`https://boards-api.greenhouse.io/v1/boards/${source.tenant}/jobs?content=true`, options);
      if (!response.ok) throw new Error(`HTTP_${response.status}`);
      const data = await response.json() as { jobs: { id: number; title: string; location?: { name?: string }; absolute_url: string; content?: string }[] };
      return data.jobs.map((row) => ({ id: String(row.id), title: row.title, location: row.location?.name ?? "", url: row.absolute_url, description: row.content }));
    }
    const response = await fetch(`https://api.lever.co/v0/postings/${source.tenant}?mode=json`, options);
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    const data = await response.json() as { id: string; text: string; categories?: { location?: string }; hostedUrl: string; descriptionPlain?: string }[];
    return data.map((row) => ({ id: row.id, title: row.text, location: row.categories?.location ?? "", url: row.hostedUrl, description: row.descriptionPlain }));
  }

  async search(input: ProviderSearchInput): Promise<ProviderSearchOutcome> {
    const started = Date.now();
    const code = europeanJobCountryCode(input.country);
    const key = this.source.kind === "successfactors" ? JSON.stringify([input.country, input.query])
      : this.source.kind === "workday" ? input.query : "board";
    const cached = this.cache.get(key);
    const payload = cached ?? this.load(input);
    this.cache.set(key, payload);
    try {
      const tokens = normalizeJobText(input.query).split(" ").filter((word) => word.length > 2);
      const jobs = (await payload).flatMap((row) => {
        const url = safeExternalUrl(row.url);
        const title = normalizeJobText(row.title);
        if (!code || !url || !row.id || !row.title || !matchesCountry(row.location, input.country, code)) return [];
        if (["greenhouse", "lever", "knapp"].includes(this.source.kind) && !tokens.some((token) => title.split(" ").includes(token))) return [];
        const job: CanonicalJobCandidate = {
          externalId: row.id, source: this.name, sourceQuery: input.query, company: this.source.company,
          title: row.title, normalizedTitle: title, location: row.location, country: input.country,
          sourceUrl: url, applicationUrl: url, description: row.description ? plain(row.description) : "", descriptionComplete: Boolean(row.description),
          workplaceModel: "unknown", employmentTypes: [], seniority: null, salaryMin: null, salaryMax: null, currency: null,
          requiredLanguages: [], requiredSkills: [], preferredSkills: [], educationRequirements: [], certificationRequirements: [],
          visaSponsorship: null, postedAt: null, expiresAt: null, canonicalKey: "", sourceQueries: [input.query],
          sources: [{ provider: this.name, sourceJobId: row.id, sourceQuery: input.query, sourceUrl: url,
            providerPayload: { directCompany: true, careerUrl: this.source.careerUrl, ats: this.source.kind } }],
        };
        job.canonicalKey = canonicalJobKey(job);
        return [job];
      });
      return { provider: this.name, status: jobs.length ? "success" : "no_results", jobs: jobs.slice(0, input.limit),
        latencyMs: Date.now() - started, requestCount: cached ? 0 : 1, rateLimitState: {} };
    } catch (error) {
      const code = error instanceof Error ? error.message : "SOURCE_FAILURE";
      return { provider: this.name, status: code === "HTTP_429" ? "rate_limit" : "provider_error", jobs: [],
        latencyMs: Date.now() - started, requestCount: cached ? 0 : 1, rateLimitState: {},
        errorCode: /^HTTP_\d+$/.test(code) || code === "UNRECOGNIZED_LISTING" ? code : "SOURCE_FAILURE" };
    }
  }
}

export class EuropeanSupplyChainProvider implements JobProvider {
  readonly name = "DirectEuropeanSupplyChain";
  private readonly boards: JobProvider[];

  constructor(boards: JobProvider[] = [
    ...publicBoards.map((source) => new PublicSupplyChainBoard(source)),
    ...smartRecruitersEmployers.slice(1).map((source) => new SmartRecruitersProvider(source)),
  ]) { this.boards = boards; }

  countrySupport(country: string) { return this.boards.some((board) => board.countrySupport(country)); }
  async health() { return { configured: true, status: "healthy" as const }; }
  async rateLimitState() { return { source: "employer-websites-and-ats", monitoredCompanies: this.boards.length }; }

  async search(input: ProviderSearchInput): Promise<ProviderSearchOutcome> {
    const started = Date.now();
    const outcomes = await Promise.all(this.boards.filter((board) => board.countrySupport(input.country)).map((board) => board.search(input)));
    const failures = outcomes.filter((outcome) => ["provider_error", "rate_limit"].includes(outcome.status));
    const jobs = selectCandidatesForVerification(outcomes.flatMap((outcome) => outcome.jobs), Math.max(input.limit, 24));
    return { provider: this.name, jobs, status: jobs.length ? "success" : failures.length && failures.length === outcomes.length ? "provider_error" : "no_results",
      latencyMs: Date.now() - started, requestCount: outcomes.reduce((total, outcome) => total + outcome.requestCount, 0),
      rateLimitState: { ...await this.rateLimitState(), failedSources: failures.length, attemptedSources: outcomes.length,
        employers: outcomes.map((outcome) => ({ provider: outcome.provider, status: outcome.status, records: outcome.jobs.length, errorCode: outcome.errorCode })) } };
  }
}
