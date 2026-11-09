import { canonicalCountry } from "../countryIdentity.ts";
import type { CanonicalJobCandidate, JobProvider, ProviderSearchInput, ProviderSearchOutcome } from "../contracts.ts";
import { canonicalJobKey, normalizeJobText, safeExternalUrl } from "../normalization.ts";
import { selectCandidatesForVerification } from "../verificationSelection.ts";
import { europeanJobCountryCode, SmartRecruitersProvider, smartRecruitersEmployers } from "./smartRecruiters.ts";

import { decodeListingHtml, listingText, parseCareerPageLinks, parseInterrollListings, parsePhenomListings, parseTgwListings, supplyChainLinkBoards, type ListingJob as Job } from "./supplyChainCareerPages.ts";

export const publicSupplyChainBoards = [
  { company: "DSV", kind: "successfactors", careerUrl: "https://jobs.dsv.com" },
  { company: "DACHSER", kind: "successfactors", careerUrl: "https://careers.dachser.com" },
  { company: "cargo-partner", kind: "lever", careerUrl: "https://www.cargo-partner.com/career", tenant: "cargo-partner" },
  { company: "OMP", kind: "greenhouse", careerUrl: "https://job-boards.greenhouse.io/ompexternaljobboards", tenant: "ompexternaljobboards" },
  { company: "KNAPP", kind: "knapp", careerUrl: "https://www.knapp.com/en/career/jobs/" },
  { company: "Maersk", kind: "workday", careerUrl: "https://maersk.wd3.myworkdayjobs.com/en-US/Maersk_Careers", tenant: "maersk", site: "Maersk_Careers" },
  { company: "KION Group", kind: "workday", careerUrl: "https://kiongroup.wd3.myworkdayjobs.com/en-US/KIONGroup", tenant: "kiongroup", site: "KIONGroup" },
  { company: "Vanderlande", kind: "workday", careerUrl: "https://vanderlande.wd3.myworkdayjobs.com/careers", tenant: "vanderlande", site: "careers" },
  { company: "Carrefour", kind: "sitemap", careerUrl: "https://recrute.carrefour.fr/wp-content/themes/crf-2.01-menuV1/offers-sitemap.xml", countries: ["France"] },
  { company: "Ahold Delhaize", kind: "vacancy_api", careerUrl: "https://careers.aholddelhaize.com/vacancies", detailPrefix: "vacancy" },
  { company: "ID Logistics", kind: "vacancy_api", careerUrl: "https://werkenbij.id-logistics.nl/vacatures", detailPrefix: "vacature", countries: ["Netherlands"] },
  { company: "Schwarz Group / Lidl", kind: "lidl", careerUrl: "https://jobs.lidl.de", countries: ["Germany"] },
  { company: "Kuehne+Nagel", kind: "phenom", careerUrl: "https://jobs.kuehne-nagel.com/global/en/search-results" },
  { company: "GXO Europe", kind: "successfactors", careerUrl: "https://jobs.gxo.com" },
  { company: "STEF", kind: "successfactors", careerUrl: "https://apply.stef.jobs" },
  { company: "SSI SCHAEFER", kind: "successfactors", careerUrl: "https://jobs.ssi-schaefer.com" },
  { company: "ALDI SÜD", kind: "successfactors", careerUrl: "https://jobs.aldi-sued.de", countries: ["Germany"] },
  { company: "Decathlon", kind: "successfactors", careerUrl: "https://jobs.decathlon.co.uk", countries: ["United Kingdom", "Ireland"] },
  { company: "AutoStore", kind: "workday", careerUrl: "https://autostore.wd3.myworkdayjobs.com/en-US/autostore", tenant: "autostore", site: "autostore" },
  { company: "Rhenus Logistics", kind: "workday", careerUrl: "https://rhe.wd3.myworkdayjobs.com/en-US/R1111", tenant: "rhe", site: "R1111" },
  { company: "Hellmann", kind: "workday", careerUrl: "https://hellmann.wd103.myworkdayjobs.com/en-US/hellmannexternaljobs", tenant: "hellmann", site: "hellmannexternaljobs" },
  { company: "Ocado Group", kind: "greenhouse", careerUrl: "https://careers.ocadogroup.com/jobs", tenant: "ocadogroup" },
  { company: "Swisslog", kind: "swisslog", careerUrl: "https://www.swisslog.com/en-gb/careers/openings" },
  { company: "Interroll", kind: "interroll", careerUrl: "https://www.interroll.com/careers/jobs" },
  { company: "TGW Logistics", kind: "tgw", careerUrl: "https://www.tgw-group.com/en/career/jobs/" },
  ...supplyChainLinkBoards.map((board) => ({ ...board, kind: "career_links" as const, countries: board.fixedCountry ? [board.fixedCountry] : undefined })),
] as const;

type Board = typeof publicSupplyChainBoards[number];
const plain = listingText;

export function parseSuccessFactorsListings(html: string, origin: string): Job[] {
  const jobs: Job[] = [];
  const rows = [
    ...html.matchAll(/<tr\b[^>]*class="data-row"[^>]*>([\s\S]*?)<\/tr>/gi),
    ...html.matchAll(/<li\b[^>]*class="job-tile [^"]+"[^>]*>([\s\S]*?)<\/li>/gi),
  ];
  for (const [, row] of rows) {
    const anchor = [...row.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].find((entry) => /class="jobTitle-link(?: |")/.test(entry[1]));
    const path = anchor?.[1].match(/href="(\/(?:Karriere\/)?job\/[^"<>]+\/(\d+)\/)"/i);
    const location = row.match(/<td\b[^>]*headers="hdrLocation"[^>]*>([\s\S]*?)<\/td>/i)
      ?? row.match(/<div\b[^>]*id="[^"]+-desktop-section-location-value"[^>]*>([\s\S]*?)<\/div>/i);
    if (!anchor || !path || !location) continue;
    jobs.push({ id: path[2], title: plain(anchor[2]), location: plain(location[1]), url: origin + decodeListingHtml(path[1]) });
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

function workdayLocation(location: string | undefined, path: string, company: string) {
  const city = path.split("/").length > 3 ? path.split("/")[2] : "";
  const countrySuffix = city.match(/-(Germany|France|Austria|Norway|United-Kingdom|Netherlands|Hungary|Belgium|Poland|Spain|Italy|Switzerland|Denmark|Sweden|Portugal|Ireland|Romania)$/i)?.[1]?.replaceAll("-", " ");
  const verifiedCityCountries: Record<string, string> = { Budapest: "Hungary", Lehrte: "Germany", Leipzig: "Germany", Bielefeld: "Germany", Osnabrck: "Germany", Gdynia: "Poland", Szczecin: "Poland" };
  const country = location?.includes(",") ? undefined : countrySuffix ?? (company === "Hellmann" ? verifiedCityCountries[city] : undefined);
  return [location, country].filter(Boolean).join(", ");
}

export class PublicSupplyChainBoard implements JobProvider {
  readonly name: string;
  private readonly source: Board;
  private readonly cache = new Map<string, Promise<Job[]>>();

  constructor(source: Board) {
    this.source = source;
    this.name = `Direct:${source.company}`;
  }

  countrySupport(country: string) { return Boolean(europeanJobCountryCode(country)) && (!("countries" in this.source) || !this.source.countries || this.source.countries.some((item) => canonicalCountry(item) === canonicalCountry(country))); }
  async health() { return { configured: true, status: "healthy" as const }; }
  async rateLimitState() { return { source: this.source.kind }; }

  private async load(input: ProviderSearchInput, countDetail: () => void): Promise<Job[]> {
    const source = this.source;
    const options = { signal: AbortSignal.timeout(9_000), redirect: "error" as const };
    if (source.kind === "successfactors") {
      const query = new URLSearchParams({ q: input.query, locationsearch: input.country });
      const response = await fetch(`${source.careerUrl}/search/?${query}`, options);
      if (!response.ok) throw new Error(`HTTP_${response.status}`);
      const html = await response.text();
      if (!/id="searchresults"|class="data-row"|class="job-tile |class="no-results"|No jobs found|No results found/i.test(html)) throw new Error("UNRECOGNIZED_LISTING");
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
        id: row.bulletFields?.[0] ?? row.externalPath, title: row.title, location: workdayLocation(row.locationsText, row.externalPath, source.company),
        url: source.careerUrl + row.externalPath,
      }] : []);
    }
    if (source.kind === "sitemap") {
      const origin = new URL(source.careerUrl).origin;
      const signal = AbortSignal.timeout(11_000);
      const response = await fetch(source.careerUrl, { ...options, signal });
      if (!response.ok) throw new Error(`HTTP_${response.status}`);
      const xml = await response.text();
      const pathPattern = /^\/offres\/\d+-[^/]+\/$/;
      const terms = normalizeJobText(input.query).split(" ").filter((term) => term.length > 2);
      const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].flatMap(([, location]) => {
        try {
          const url = new URL(decodeListingHtml(location));
          const slug = normalizeJobText(decodeURIComponent(url.pathname));
          return url.origin === origin && pathPattern.test(url.pathname) && terms.every((term) => slug.includes(term)) ? [url] : [];
        } catch { return []; }
      }).slice(0, 4);
      const found = await Promise.allSettled(urls.map(async (url) => {
        countDetail();
        const detail = await fetch(url, { ...options, signal });
        if (!detail.ok) throw new Error(`HTTP_${detail.status}`);
        const html = await detail.text();
        for (const [, json] of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
          try {
            const item = JSON.parse(json);
            const address = item.jobLocation?.address;
            if (item["@type"] === "JobPosting" && typeof item.title === "string" && address?.addressCountry === "FR") {
              return { id: url.pathname, title: plain(item.title), location: [address.addressLocality, "France"].filter(Boolean).join(", "), url: url.href };
            }
          } catch { continue; }
        }
        return null;
      }));
      if (found.length && found.every((item) => item.status === "rejected")) throw new Error("SOURCE_FAILURE");
      return found.flatMap((item) => item.status === "fulfilled" && item.value ? [item.value] : []);
    }
    if (source.kind === "vacancy_api") {
      const origin = new URL(source.careerUrl).origin;
      const query = new URLSearchParams({ search: input.query, pageSize: "20" });
      const response = await fetch(`${origin}/api/vacancy/?${query}`, { ...options, headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" } });
      if (!response.ok) throw new Error(`HTTP_${response.status}`);
      const data = await response.json() as { vacancies: { id?: number; slug?: string; title?: string; city?: string; country?: string; internal_vacancy?: boolean }[] };
      return data.vacancies.flatMap((row) => {
        const country = row.country ?? (source.company === "ID Logistics" ? "Netherlands" : "");
        if (!row.id || !row.title || !country || row.internal_vacancy) return [];
        return [{ id: String(row.id), title: row.title, location: [row.city, country].filter(Boolean).join(", "),
          url: `${origin}/${source.detailPrefix}/${row.id}${row.slug ? `/${encodeURIComponent(row.slug)}` : ""}` }];
      });
    }
    if (source.kind === "lidl") {
      const query = new URLSearchParams({ term: input.query });
      const response = await fetch(`${source.careerUrl}/api/v1/search?${query}`, options);
      if (!response.ok) throw new Error(`HTTP_${response.status}`);
      const data = await response.json() as { jobs: { postingId?: string; title?: string; jobDetailUrl?: string; location?: { city?: string; country?: string } }[] };
      return data.jobs.flatMap((row) => row.postingId && row.title && row.location?.country === "DE" && row.jobDetailUrl?.startsWith(`${source.careerUrl}/jobs/`) ? [{
        id: row.postingId, title: row.title, url: row.jobDetailUrl, location: [row.location.city, "Germany"].filter(Boolean).join(", "),
      }] : []);
    }
    if (source.kind === "swisslog") {
      const response = await fetch("https://www.swisslog.com/en-gb/api/job/getjobs?searchrootpath=24F53394AB4E44F1A28C930664FDC228", options);
      if (!response.ok) throw new Error(`HTTP_${response.status}`);
      const data = await response.json() as { items: { item_id: string; headline: string; href: string; facetsTop?: string[] }[] };
      return data.items.flatMap((row) => typeof row.href === "string" && row.href.startsWith("https://www.swisslog.com/") ? [{
        id: row.item_id, title: row.headline, location: row.facetsTop?.join(", ") ?? "", url: row.href,
      }] : []);
    }
    if (source.kind === "career_links" || source.kind === "interroll" || source.kind === "tgw" || source.kind === "phenom") {
      const response = await fetch(source.careerUrl, options);
      if (!response.ok) throw new Error(`HTTP_${response.status}`);
      const html = await response.text();
      const origin = new URL(source.careerUrl).origin;
      const jobs = source.kind === "interroll" ? parseInterrollListings(html, origin)
        : source.kind === "tgw" ? parseTgwListings(html, origin)
        : source.kind === "phenom" ? parsePhenomListings(html, origin) : parseCareerPageLinks(html, source);
      if (!jobs.length) throw new Error("UNRECOGNIZED_LISTING");
      return jobs;
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
    const key = ["successfactors", "lidl", "vacancy_api", "sitemap"].includes(this.source.kind) ? JSON.stringify([input.country, input.query])
      : this.source.kind === "workday" ? input.query : "board";
    const cached = this.cache.get(key);
    let requestCount = cached ? 0 : 1;
    const payload = cached ?? this.load(input, () => { requestCount++; });
    this.cache.set(key, payload);
    try {
      const tokens = normalizeJobText(input.query).split(" ").filter((word) => word.length > 2);
      const jobs = (await payload).flatMap((row) => {
        const url = safeExternalUrl(row.url);
        const title = normalizeJobText(row.title);
        if (/^(?:initiativbewerbung|unsolicited application|spontaneous application)/i.test(row.title)) return [];
        if (!code || !url || !row.id || !row.title || !matchesCountry(row.location, input.country, code)) return [];
        if (!["successfactors", "workday", "lidl", "vacancy_api", "sitemap"].includes(this.source.kind) && tokens.length > 0 && !tokens.some((token) => title.split(" ").includes(token))) return [];
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
        latencyMs: Date.now() - started, requestCount, rateLimitState: {} };
    } catch (error) {
      const code = error instanceof Error ? error.message : "SOURCE_FAILURE";
      return { provider: this.name, status: code === "HTTP_429" ? "rate_limit" : "provider_error", jobs: [],
        latencyMs: Date.now() - started, requestCount, rateLimitState: {},
        errorCode: /^HTTP_\d+$/.test(code) || code === "UNRECOGNIZED_LISTING" ? code : "SOURCE_FAILURE" };
    }
  }
}

export class EuropeanSupplyChainProvider implements JobProvider {
  readonly name = "DirectEuropeanSupplyChain";
  private readonly boards: JobProvider[];

  constructor(boards: JobProvider[] = [
    ...publicSupplyChainBoards.map((source) => new PublicSupplyChainBoard(source)),
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
