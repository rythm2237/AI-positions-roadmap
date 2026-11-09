import { canonicalCountry } from "../countryIdentity.ts";
import { canonicalJobKey, normalizeJobText } from "../normalization.ts";
import type { CanonicalJobCandidate, JobProvider, ProviderSearchInput, ProviderSearchOutcome } from "../contracts.ts";

const origin = "https://jobs.ikea.com";
const logisticsPath = "/en/category/logistics-and-supply-chain-jobs/22908/59688/1/";
const locationPaths: Record<string, string> = { germany: "/en/location/jobs/22908/2921044/2/", hungary: "/en/location/jobs/22908/719819/2/" };
const countries = new Set(["austria", "belgium", "czechia", "denmark", "finland", "france", "germany", "hungary", "ireland", "italy", "netherlands", "norway", "poland", "portugal", "romania", "spain", "sweden", "switzerland", "united kingdom"]);
const entities: Record<string, string> = { amp: "&", quot: '"', apos: "'", nbsp: " ", lt: "<", gt: ">" };
const decode = (value: string) => value.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (match, entity: string) => {
  if (!entity.startsWith("#")) return entities[entity] ?? match;
  const codePoint = entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
  return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : match;
}).trim();

export function parseIkeaVacancies(html: string) {
  const vacancies = new Map<string, { id: string; url: string; title: string; location: string; department: string; employment: string }>();
  for (const [, path, id, body] of html.matchAll(/<a\s+href="(\/en\/job\/[^"<>]+\/(\d+))"[^>]*class="job-list__anchor"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const field = (name: string) => decode(body.match(new RegExp('<span class="job-list__' + name + '">([^<]*)</span>', "i"))?.[1] ?? "");
    const title = field("title");
    const location = field("location");
    if (title && location) vacancies.set(id, { id, url: new URL(path, origin).href, title, location, department: field("categories"), employment: field("job-type") });
  }
  return [...vacancies.values()];
}

export class IkeaProvider implements JobProvider {
  readonly name = "Direct:IKEA";
  private readonly listings = new Map<string, Promise<Awaited<ReturnType<IkeaProvider["loadListings"]>>>>();
  countrySupport(country: string) { return countries.has(canonicalCountry(country)); }
  async health() { return { configured: true, status: "healthy" as const }; }
  async rateLimitState() { return { maximumListingPagesPerRun: 3 }; }

  private async loadListings(path: string) {
    const rows: ReturnType<typeof parseIkeaVacancies> = [];
    let requests = 0;
    let errorCode: string | undefined;
    for (let page = 1; page <= 3; page++) {
      try {
        requests++;
        const response = await fetch(origin + path + page, { redirect: "error", signal: AbortSignal.timeout(page === 1 ? 8_000 : 3_000), next: { revalidate: 900 } } as RequestInit);
        if (!response.ok) {
          errorCode = response.status === 429 ? "RATE_LIMIT" : `IKEA_HTTP_${response.status}`;
          break;
        }
        const html = await response.text();
        const parsed = parseIkeaVacancies(html);
        if (!parsed.length && !/data-total-results="0"/.test(html)) {
          errorCode = "IKEA_LISTING_FORMAT_UNRECOGNIZED";
          break;
        }
        rows.push(...parsed);
        if (!/class="next"\s+href=/.test(html)) break;
      } catch {
        errorCode = "IKEA_LISTING_FETCH_FAILED";
        break;
      }
    }
    return { rows, requests, errorCode };
  }

  async search(input: ProviderSearchInput): Promise<ProviderSearchOutcome> {
    const started = Date.now();
    const path = locationPaths[canonicalCountry(input.country)] ?? logisticsPath;
    const cached = this.listings.get(path);
    const pending = cached ?? this.loadListings(path);
    this.listings.set(path, pending);
    const listing = await pending;
    const query = new Set(normalizeJobText(input.query).split(" ").filter((token) => token.length >= 3));
    const jobs = listing.rows.flatMap((item) => {
      const country = item.location.split(",").at(-1)?.trim() ?? "";
      if (canonicalCountry(country) !== canonicalCountry(input.country)) return [];
      const employmentTypes = /full time/i.test(item.employment) ? ["full_time"] : /part time/i.test(item.employment) ? ["part_time"] : [];
      const candidate: CanonicalJobCandidate = {
        externalId: item.id, source: this.name, sourceQuery: input.query, company: "IKEA", title: item.title,
        normalizedTitle: normalizeJobText(item.title), location: item.location, country,
        sourceUrl: item.url, applicationUrl: item.url, description: "", descriptionComplete: false,
        workplaceModel: "unknown", employmentTypes, seniority: null, salaryMin: null, salaryMax: null, currency: null,
        requiredLanguages: [], requiredSkills: [], preferredSkills: [], educationRequirements: [],
        certificationRequirements: [], visaSponsorship: null, postedAt: null, expiresAt: null, canonicalKey: "",
        sourceQueries: [input.query], sources: [{ provider: this.name, sourceJobId: item.id, sourceQuery: input.query,
          sourceUrl: item.url, providerPayload: { directCompany: true, company: "IKEA", careerUrl: origin, department: item.department } }],
      };
      candidate.canonicalKey = canonicalJobKey(candidate);
      return [candidate];
    });
    const operationsQuery = /fulfil|warehouse|replenish|logistic|supply chain|flow plan|automation/i.test(input.query);
    const operationsTitle = /fulfil|warehouse|replenish|logisti|supply chain|flow plan|automation|automati|lager|raktar|aruosszekeszit|anyagmozgat/i;
    const relevance = (job: CanonicalJobCandidate) => job.normalizedTitle.split(" ").filter((token) => query.has(token)).length
      + (operationsQuery && operationsTitle.test(job.normalizedTitle) ? 1 : 0);
    jobs.sort((a, b) => relevance(b) - relevance(a));
    return { provider: this.name, jobs: jobs.slice(0, input.limit), latencyMs: Date.now() - started,
      status: listing.errorCode === "RATE_LIMIT" ? "rate_limit" : listing.errorCode ? "provider_error" : jobs.length ? "success" : "no_results",
      errorCode: listing.errorCode, requestCount: cached ? 0 : listing.requests,
      rateLimitState: await this.rateLimitState() };
  }
}
