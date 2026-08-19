import "server-only";

export type JobProviderResult = {
  externalId: string;
  source: "Adzuna";
  company: string;
  title: string;
  location: string;
  url: string;
  description: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  workplaceModel: "remote" | "hybrid" | "on_site" | "unknown";
  createdAt: string | null;
};

type AdzunaCountry = "gb" | "us" | "ca" | "au" | "nz" | "de" | "fr" | "nl" | "ch";
const currencies: Record<AdzunaCountry, string> = { gb: "GBP", us: "USD", ca: "CAD", au: "AUD", nz: "NZD", de: "EUR", fr: "EUR", nl: "EUR", ch: "CHF" };
const countryAliases: Record<string, AdzunaCountry> = {
  gb: "gb", uk: "gb", "united kingdom": "gb", britain: "gb",
  us: "us", usa: "us", "united states": "us", "united states of america": "us",
  ca: "ca", canada: "ca", au: "au", australia: "au", nz: "nz", "new zealand": "nz",
  de: "de", germany: "de", deutschland: "de", fr: "fr", france: "fr",
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
  company?: { display_name?: string };
  location?: { display_name?: string };
};

function workModel(job: RawJob): JobProviderResult["workplaceModel"] {
  const text = `${job.title ?? ""} ${job.description ?? ""}`.toLowerCase();
  if (/\b(remote|work from home|home-based|home based)\b/.test(text)) return "remote";
  if (/\bhybrid\b/.test(text)) return "hybrid";
  if (/\b(on[- ]?site|office[- ]based|office based)\b/.test(text)) return "on_site";
  return "unknown";
}

export function resolveAdzunaCountry(value: string): AdzunaCountry | null {
  return countryAliases[value.trim().toLowerCase()] ?? null;
}

export function adzunaConfigured() {
  return Boolean(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY);
}

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
      location: job.location?.display_name?.trim() || input.location || input.country,
      url: job.redirect_url,
      description: job.description?.trim() || "",
      salaryMin: typeof job.salary_min === "number" ? job.salary_min : null,
      salaryMax: typeof job.salary_max === "number" ? job.salary_max : null,
      currency: currencies[code],
      workplaceModel: workModel(job),
      createdAt: job.created ?? null,
    }];
  });
}
