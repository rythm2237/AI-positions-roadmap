import "server-only";

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
  apply_options?: Array<{ title?: string; link?: string }>;
  detected_extensions?: {
    posted_at?: string;
    schedule_type?: string;
    work_from_home?: boolean;
    salary?: string;
  };
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
  const text = `${job.title ?? ""} ${job.description ?? ""} ${job.detected_extensions?.schedule_type ?? ""}`.toLowerCase();
  if (/\b(remote|work from home|home-based|home based)\b/.test(text)) return "remote";
  if (/\bhybrid\b/.test(text)) return "hybrid";
  if (/\b(on[- ]?site|office[- ]based|office based)\b/.test(text)) return "on_site";
  return "unknown";
}

function serpEmploymentTypes(job: RawSerpApiJob): string[] {
  const found = new Set<string>();
  const schedule = (job.detected_extensions?.schedule_type ?? "").toLowerCase();
  const text = `${job.title ?? ""} ${job.description ?? ""}`.toLowerCase();
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
  if (!code || !appId || !appKey) return [];
  const limit = Math.min(50, Math.max(1, input.limit ?? 20));
  const params = new URLSearchParams({ app_id: appId, app_key: appKey, what: input.query, results_per_page: String(limit), sort_by: "date", "content-type": "application/json" });
  if (input.location) params.set("where", input.location);
  const response = await fetch(`https://api.adzuna.com/v1/api/jobs/${code}/search/1?${params}`, { headers: { Accept: "application/json" }, cache: "no-store" });
  if (!response.ok) {
    console.warn("Job Agent Adzuna search failed", { status: response.status, country: code, query: input.query });
    return [];
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

export async function searchSerpApiJobs(input: { country: string; query: string; location?: string; limit?: number }): Promise<JobProviderResult[]> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) return [];
  const gl = resolveSerpApiCountry(input.country);
  const location = input.location?.trim() ? `${input.location.trim()}, ${input.country.trim()}` : input.country.trim();
  const params = new URLSearchParams({
    engine: "google_jobs",
    q: input.query,
    api_key: apiKey,
    output: "json",
    hl: "en",
    location,
  });
  if (gl) params.set("gl", gl);
  const response = await fetch(`https://serpapi.com/search?${params}`, { headers: { Accept: "application/json" }, cache: "no-store" });
  if (!response.ok) {
    console.warn("Job Agent SerpApi search failed", { status: response.status, country: input.country, query: input.query });
    return [];
  }
  const payload = await response.json() as { jobs_results?: RawSerpApiJob[]; error?: string };
  if (payload.error) {
    console.warn("Job Agent SerpApi returned an error", { country: input.country, query: input.query, error: payload.error });
    return [];
  }
  const limit = Math.min(10, Math.max(1, input.limit ?? 10));
  return (payload.jobs_results ?? []).slice(0, limit).flatMap((job) => {
    const title = job.title?.trim();
    const company = job.company_name?.trim() || "Not specified";
    const jobUrl = job.apply_options?.find((option) => option.link)?.link?.trim() || job.share_link?.trim();
    const externalId = job.job_id?.trim() || jobUrl;
    if (!title || !jobUrl || !externalId) return [];
    const description = job.description?.trim() || "";
    return [{
      externalId,
      source: "SerpApi" as const,
      company,
      title,
      location: job.location?.trim() || location,
      country: input.country.trim(),
      url: jobUrl,
      description,
      descriptionComplete: description.length >= 120,
      salaryMin: null,
      salaryMax: null,
      currency: null,
      workplaceModel: serpWorkModel(job),
      employmentTypes: serpEmploymentTypes(job),
      createdAt: null,
    }];
  });
}
