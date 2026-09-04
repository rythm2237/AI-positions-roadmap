import "server-only";

import { parseProviderAnnualSalary, parseProviderPostedAt } from "../providerFields";

export type JobProviderResult = {
  externalId: string;
  source: "Adzuna" | "SerpApi";
  company: string;
  title: string;
  location: string;
  country: string;
  url: string;
  description: string;
  descriptionComplete: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  workplaceModel: "remote" | "hybrid" | "on_site" | "unknown";
  employmentTypes: string[];
  createdAt: string | null;
};

export class JobProviderRequestError extends Error {
  constructor(public readonly code: "RATE_LIMIT" | "AUTH_FAILURE" | "INVALID_QUERY" | "UNSUPPORTED_COUNTRY" | "PROVIDER_ERROR", message: string, public readonly status: number | null = null) {
    super(message);
    this.name = "JobProviderRequestError";
  }
}

function providerHttpError(provider: string, response: Response, detail?: string) {
  const code = response.status === 429 ? "RATE_LIMIT"
    : response.status === 401 || response.status === 403 ? "AUTH_FAILURE"
      : response.status === 400 || response.status === 422 ? "INVALID_QUERY" : "PROVIDER_ERROR";
  return new JobProviderRequestError(code, `${provider} returned HTTP ${response.status}${detail ? `: ${detail.slice(0, 180)}` : ""}`, response.status);
}

type AdzunaCountry = "gb" | "us" | "ca" | "au" | "nz" | "de" | "fr" | "nl" | "ch";
const currencies: Record<AdzunaCountry, string> = { gb: "GBP", us: "USD", ca: "CAD", au: "AUD", nz: "NZD", de: "EUR", fr: "EUR", nl: "EUR", ch: "CHF" };
const countryNames: Record<AdzunaCountry, string> = { gb: "United Kingdom", us: "United States", ca: "Canada", au: "Australia", nz: "New Zealand", de: "Germany", fr: "France", nl: "Netherlands", ch: "Switzerland" };
const countryAliases: Record<string, AdzunaCountry> = {
  gb: "gb", uk: "gb", "united kingdom": "gb", britain: "gb",
  us: "us", usa: "us", "united states": "us", "united states of america": "us",
  ca: "ca", canada: "ca", au: "au", australia: "au", nz: "nz", "new zealand": "nz",
  de: "de", germany: "de", deutschland: "de", fr: "fr", france: "fr", frence: "fr",
  nl: "nl", netherlands: "nl", holland: "nl", ch: "ch", switzerland: "ch", schweiz: "ch", suisse: "ch",
};

type RawJob = {
  id?: string;
  title?: string;
  description?: string;
  created?: string;
  redirect_url?: string;
  salary_min?: number;
  salary_max?: number;
  contract_time?: string;
  contract_type?: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
};

type RawSerpApiJob = {
  job_id?: string;
  title?: string;
  company_name?: string;
  location?: string;
  description?: string;
  share_link?: string;
  link?: string;
  apply_options?: Array<{ title?: string; link?: string }>;
  extensions?: string[];
  detected_extensions?: {
    posted_at?: string;
    schedule_type?: string;
    work_from_home?: boolean;
    salary?: string;
  };
};

type RawSerpApiOrganicResult = {
  title?: string;
  link?: string;
  source?: string;
  displayed_link?: string;
  snippet?: string;
  date?: string;
};

function workModel(job: RawJob): JobProviderResult["workplaceModel"] {
  const text = `${job.title ?? ""} ${job.description ?? ""}`.toLowerCase();
  if (/\b(remote|work from home|home-based|home based)\b/.test(text)) return "remote";
  if (/\bhybrid\b/.test(text)) return "hybrid";
  if (/\b(on[- ]?site|office[- ]based|office based)\b/.test(text)) return "on_site";
  return "unknown";
}

function employmentTypes(job: RawJob): string[] {
  const found = new Set<string>();
  const contractTime = (job.contract_time ?? "").toLowerCase();
  const contractType = (job.contract_type ?? "").toLowerCase();
  const text = `${job.title ?? ""} ${job.description ?? ""}`.toLowerCase();
  if (contractTime === "full_time" || /\bfull[- ]?time\b/.test(text)) found.add("full_time");
  if (contractTime === "part_time" || /\bpart[- ]?time\b/.test(text)) found.add("part_time");
  if (/\bintern(ship)?\b/.test(text)) found.add("internship");
  if (/\bfreelance\b/.test(text)) found.add("freelance");
  if (contractType === "permanent" || /\bpermanent\b/.test(text)) found.add("permanent");
  if (contractType === "contract" || /\b(contract|fixed[- ]term|temporary)\b/.test(text)) found.add("contract");
  return [...found];
}

function serpWorkModel(job: RawSerpApiJob): JobProviderResult["workplaceModel"] {
  if (job.detected_extensions?.work_from_home) return "remote";
  const text = `${job.title ?? ""} ${job.description ?? ""} ${(job.extensions ?? []).join(" ")} ${job.detected_extensions?.schedule_type ?? ""}`.toLowerCase();
  if (/\b(remote|work from home|home-based|home based)\b/.test(text)) return "remote";
  if (/\bhybrid\b/.test(text)) return "hybrid";
  if (/\b(on[- ]?site|office[- ]based|office based)\b/.test(text)) return "on_site";
  return "unknown";
}

function serpEmploymentTypes(job: RawSerpApiJob): string[] {
  const found = new Set<string>();
  const schedule = (job.detected_extensions?.schedule_type ?? "").toLowerCase();
  const text = `${job.title ?? ""} ${job.description ?? ""} ${(job.extensions ?? []).join(" ")}`.toLowerCase();
  if (/full[- ]?time/.test(schedule) || /\bfull[- ]?time\b/.test(text)) found.add("full_time");
  if (/part[- ]?time/.test(schedule) || /\bpart[- ]?time\b/.test(text)) found.add("part_time");
  if (/contract|contractor|fixed[- ]term|temporary/.test(schedule) || /\b(contract|contractor|fixed[- ]term|temporary)\b/.test(text)) found.add("contract");
  if (/permanent/.test(schedule) || /\bpermanent\b/.test(text)) found.add("permanent");
  if (/\bintern(ship)?\b/.test(text)) found.add("internship");
  if (/\bfreelance\b/.test(text)) found.add("freelance");
  return [...found];
}

function normalizeCountry(value: string) {
  return value.trim().toLowerCase().replace(/[._-]+/g, " ").replace(/\s+/g, " ");
}

const serpCountryAliases: Record<string, string> = {
  uk: "gb", britain: "gb", "great britain": "gb", "united kingdom": "gb",
  us: "us", usa: "us", "united states": "us", "united states of america": "us",
  hungary: "hu", magyarorszag: "hu", magyarország: "hu",
};

export function resolveSerpApiCountry(value: string): string | null {
  const normalized = normalizeCountry(value);
  if (serpCountryAliases[normalized]) return serpCountryAliases[normalized];
  if (/^[a-z]{2}$/.test(normalized)) return normalized;
  try {
    const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
    for (let first = 65; first <= 90; first += 1) {
      for (let second = 65; second <= 90; second += 1) {
        const code = String.fromCharCode(first, second);
        const label = displayNames.of(code);
        if (label && label !== code && normalizeCountry(label) === normalized) return code.toLowerCase();
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function resolveAdzunaCountry(value: string): AdzunaCountry | null { return countryAliases[value.trim().toLowerCase()] ?? null; }
export function adzunaConfigured() { return Boolean(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY); }
export function serpApiConfigured() { return Boolean(process.env.SERPAPI_API_KEY); }

export async function searchAdzunaJobs(input: { country: string; query: string; location?: string; limit?: number }): Promise<JobProviderResult[]> {
  const code = resolveAdzunaCountry(input.country);
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!code) throw new JobProviderRequestError("UNSUPPORTED_COUNTRY", `Adzuna does not support ${input.country}.`);
  if (!appId || !appKey) throw new JobProviderRequestError("AUTH_FAILURE", "Adzuna credentials are not configured.");
  const limit = Math.min(50, Math.max(1, input.limit ?? 20));
  const params = new URLSearchParams({ app_id: appId, app_key: appKey, what: input.query, results_per_page: String(limit), sort_by: "date", "content-type": "application/json" });
  if (input.location) params.set("where", input.location);
  const response = await fetch(`https://api.adzuna.com/v1/api/jobs/${code}/search/1?${params}`, { headers: { Accept: "application/json" }, cache: "no-store" });
  if (!response.ok) {
    console.warn("Job Agent Adzuna search failed", { status: response.status, country: code, query: input.query });
    throw providerHttpError("Adzuna", response);
  }
  const payload = await response.json() as { results?: RawJob[] };
  return (payload.results ?? []).flatMap((job) => {
    if (!job.id || !job.title || !job.redirect_url) return [];
    return [{
      externalId: job.id,
      source: "Adzuna" as const,
      company: job.company?.display_name?.trim() || "Not specified",
      title: job.title.trim(),
      location: job.location?.display_name?.trim() || input.location || countryNames[code],
      country: countryNames[code],
      url: job.redirect_url,
      description: job.description?.trim() || "",
      descriptionComplete: false,
      salaryMin: typeof job.salary_min === "number" ? job.salary_min : null,
      salaryMax: typeof job.salary_max === "number" ? job.salary_max : null,
      currency: currencies[code],
      workplaceModel: workModel(job),
      employmentTypes: employmentTypes(job),
      createdAt: job.created ?? null,
    }];
  });
}

function mapSerpJob(job: RawSerpApiJob, input: { country: string; location: string }): JobProviderResult | null {
  const title = job.title?.trim();
  const company = job.company_name?.trim() || "Not specified";
  const jobUrl = job.apply_options?.find((option) => option.link)?.link?.trim() || job.share_link?.trim() || job.link?.trim();
  const externalId = job.job_id?.trim() || jobUrl;
  if (!title || !jobUrl || !externalId) return null;
  const description = job.description?.trim() || (job.extensions ?? []).join(" · ");
  const salary = parseProviderAnnualSalary(job.detected_extensions?.salary);
  return {
    externalId,
    source: "SerpApi",
    company,
    title,
    location: job.location?.trim() || input.location,
    country: input.country.trim(),
    url: jobUrl,
    description,
    descriptionComplete: Boolean(job.description && job.description.trim().length >= 120),
    salaryMin: salary.min,
    salaryMax: salary.max,
    currency: salary.currency,
    workplaceModel: serpWorkModel(job),
    employmentTypes: serpEmploymentTypes(job),
    createdAt: parseProviderPostedAt(job.detected_extensions?.posted_at),
  };
}

function looksLikeJobResult(result: RawSerpApiOrganicResult) {
  const haystack = `${result.title ?? ""} ${result.source ?? ""} ${result.displayed_link ?? ""}`.toLowerCase();
  return /\b(job|jobs|career|careers|vacancy|vacancies|position|hiring)\b/.test(haystack)
    || /linkedin|indeed|glassdoor|profession|jobrapido|jooble|careerjet|workable|greenhouse|lever|smartrecruiters/.test(haystack);
}

async function searchSerpApiGoogleSearch(input: { country: string; query: string; location: string; gl: string | null; limit: number; apiKey: string }): Promise<JobProviderResult[]> {
  const q = `${input.query} jobs in ${input.location}`;
  const params = new URLSearchParams({ engine: "google", q, api_key: input.apiKey, output: "json", hl: "en", location: input.location });
  if (input.gl) params.set("gl", input.gl);
  const response = await fetch(`https://serpapi.com/search?${params}`, { headers: { Accept: "application/json" }, cache: "no-store" });
  const payload = await response.json().catch(() => ({})) as {
    error?: string;
    jobs_results?: { jobs?: RawSerpApiJob[] };
    organic_results?: RawSerpApiOrganicResult[];
  };
  if (!response.ok || payload.error) {
    console.warn("Job Agent SerpApi Google Search failed", { status: response.status, country: input.country, query: input.query, error: payload.error ?? null });
    throw providerHttpError("SerpApi", response, payload.error);
  }
  const jobs = (payload.jobs_results?.jobs ?? []).map((job) => mapSerpJob(job, { country: input.country, location: input.location })).filter((job): job is JobProviderResult => Boolean(job));
  if (jobs.length) return jobs.slice(0, input.limit);

  return (payload.organic_results ?? []).filter(looksLikeJobResult).slice(0, input.limit).flatMap((result) => {
    if (!result.title?.trim() || !result.link?.trim()) return [];
    return [{
      externalId: result.link.trim(),
      source: "SerpApi" as const,
      company: result.source?.trim() || "Not specified",
      title: result.title.trim(),
      location: input.location,
      country: input.country.trim(),
      url: result.link.trim(),
      description: result.snippet?.trim() || "",
      descriptionComplete: false,
      salaryMin: null,
      salaryMax: null,
      currency: null,
      workplaceModel: "unknown" as const,
      employmentTypes: [],
      createdAt: result.date ?? null,
    }];
  });
}

export async function searchSerpApiJobsDetailed(input: { country: string; query: string; location?: string; limit?: number }): Promise<{ jobs: JobProviderResult[]; requestCount: number }> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) throw new JobProviderRequestError("AUTH_FAILURE", "SerpApi credentials are not configured.");
  const gl = resolveSerpApiCountry(input.country);
  const location = input.location?.trim() ? `${input.location.trim()}, ${input.country.trim()}` : input.country.trim();
  const limit = Math.min(10, Math.max(1, input.limit ?? 10));

  // Regular Google Search has much broader country coverage than the dedicated
  // Google Jobs engine and exposes a structured jobs_results block when Google
  // serves one. Use it as the global entry point, including markets such as Hungary.
  const globalResults = await searchSerpApiGoogleSearch({ country: input.country, query: input.query, location, gl, limit, apiKey });
  if (globalResults.length) return { jobs: globalResults, requestCount: 1 };

  // If Google Search did not expose a jobs block, try the dedicated engine. Some
  // countries are unsupported by that engine; a 400 is therefore a recoverable
  // provider limitation, not an application error.
  const params = new URLSearchParams({ engine: "google_jobs", q: input.query, api_key: apiKey, output: "json", hl: "en", location });
  if (gl) params.set("gl", gl);
  const response = await fetch(`https://serpapi.com/search?${params}`, { headers: { Accept: "application/json" }, cache: "no-store" });
  const payload = await response.json().catch(() => ({})) as { jobs_results?: RawSerpApiJob[]; error?: string };
  if (!response.ok || payload.error) {
    console.warn("Job Agent SerpApi Google Jobs unavailable", { status: response.status, country: input.country, query: input.query, error: payload.error ?? null });
    // The broad Google Search request above succeeded for this country. If only the
    // dedicated Jobs surface rejects the market, the combined provider outcome is
    // NO_RESULTS rather than UNSUPPORTED_COUNTRY.
    if (response.status === 400 && /location|country|unsupported/i.test(payload.error ?? "")) return { jobs: [], requestCount: 2 };
    throw providerHttpError("SerpApi", response, payload.error);
  }
  return { jobs: (payload.jobs_results ?? []).map((job) => mapSerpJob(job, { country: input.country, location })).filter((job): job is JobProviderResult => Boolean(job)).slice(0, limit), requestCount: 2 };
}

export async function searchSerpApiJobs(input: { country: string; query: string; location?: string; limit?: number }): Promise<JobProviderResult[]> {
  return (await searchSerpApiJobsDetailed(input)).jobs;
}
