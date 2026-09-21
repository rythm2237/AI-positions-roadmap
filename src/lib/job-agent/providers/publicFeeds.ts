import "server-only";

import { canonicalJobKey, normalizeJobText, safeExternalUrl } from "../normalization";
import type { CanonicalJobCandidate, JobProvider, ProviderSearchInput, ProviderSearchOutcome } from "../contracts";
import { RemotiveProvider } from "./remotive";

const timeoutMs = 12_000;
const stripHtml = (value: string) => value.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim();
const tokens = (value: string) => normalizeJobText(value).split(" ").filter((token) => token.length > 2);

const canonicalCountry = (value: string | null | undefined) => {
  const normalized = normalizeJobText(value ?? "");
  const aliases: Record<string, string> = {
    de: "Germany", deutschland: "Germany", germany: "Germany",
    fr: "France", france: "France",
    hu: "Hungary", hungary: "Hungary", magyarorszag: "Hungary",
    nl: "Netherlands", netherlands: "Netherlands", holland: "Netherlands",
    at: "Austria", austria: "Austria", osterreich: "Austria",
    ch: "Switzerland", switzerland: "Switzerland", schweiz: "Switzerland",
    be: "Belgium", belgium: "Belgium",
    lu: "Luxembourg", luxembourg: "Luxembourg",
  };
  return aliases[normalized] ?? (value?.trim() || null);
};

const inferredCountryFromLocation = (value: string | undefined) => {
  const location = normalizeJobText(value ?? "");
  if (!location) return null;
  if (/\b(france|fr|paris|lyon|toulouse|lille|bordeaux|nantes|marseille|nice|grenoble|strasbourg)\b/.test(location)) return "France";
  if (/\b(germany|deutschland|de|berlin|hamburg|frankfurt|munich|munchen|muenchen|cologne|koln|koeln|stuttgart|dusseldorf|duesseldorf|leipzig|dresden|hannover|nuremberg|nurnberg)\b/.test(location)) return "Germany";
  if (/\b(hungary|magyarorszag|hu|budapest|debrecen|szeged|gyor|pecs)\b/.test(location)) return "Hungary";
  if (/\b(austria|osterreich|at|vienna|wien|graz|linz|salzburg|innsbruck)\b/.test(location)) return "Austria";
  if (/\b(switzerland|schweiz|ch|zurich|zuerich|geneva|genf|basel|bern|lausanne)\b/.test(location)) return "Switzerland";
  if (/\b(netherlands|holland|nl|amsterdam|rotterdam|utrecht|eindhoven|the hague|den haag)\b/.test(location)) return "Netherlands";
  if (/\b(belgium|be|brussels|bruxelles|antwerp|antwerpen|ghent|gent)\b/.test(location)) return "Belgium";
  if (/\b(luxembourg|lu)\b/.test(location)) return "Luxembourg";
  return null;
};

const inferredArbeitnowCountry = (job: ArbeitnowJob, input: ProviderSearchInput) => {
  const url = safeExternalUrl(job.url ?? "");
  const locationCountry = inferredCountryFromLocation(job.location);
  if (locationCountry) return locationCountry;
  if (url) {
    try {
      const host = new URL(url).hostname.toLowerCase();
      if (host.endsWith("arbeitnow.fr")) return "France";
    } catch {
      // safeExternalUrl already validated the URL; keep inference conservative on parse errors.
    }
  }
  const requested = canonicalCountry(input.country);
  const location = normalizeJobText(job.location ?? "");
  if (requested && location.includes(normalizeJobText(requested))) return requested;
  if (job.remote && /\b(remote|worldwide|global|europe|european union|eu)\b/.test(location)) return requested;
  return null;
};

const relevant = (job: ArbeitnowJob, input: ProviderSearchInput) => {
  const haystack = new Set(tokens(`${job.title ?? ""} ${job.tags?.join(" ") ?? ""} ${job.description ?? ""}`));
  const queryTokens = tokens(input.query);
  if (!queryTokens.length) return false;
  const roleMatch = queryTokens.some((token) => haystack.has(token));
  const requested = canonicalCountry(input.country);
  const inferred = inferredArbeitnowCountry(job, input);
  const countryMatch = !requested || !inferred || requested === inferred;
  return roleMatch && countryMatch;
};

const normalizeEmploymentTypes = (values: string[] | undefined) => [...new Set((values ?? []).flatMap((value) => {
  const normalized = normalizeJobText(value);
  if (/\b(full time|fulltime|vollzeit)\b/.test(normalized)) return ["full_time"];
  if (/\b(part time|parttime|teilzeit|working student|werkstudent)\b/.test(normalized)) return ["part_time"];
  if (/\b(freelance|freiberuflich|freelancer)\b/.test(normalized)) return ["freelance"];
  if (/\b(contract|contractor|temporary|befristet|fixed term)\b/.test(normalized)) return ["contract"];
  if (/\b(internship|intern|praktikum)\b/.test(normalized)) return ["internship"];
  if (/\b(permanent|unbefristet)\b/.test(normalized)) return ["permanent"];
  return [];
}))];

const inferSeniority = (values: string[] | undefined) => {
  const normalized = normalizeJobText((values ?? []).join(" "));
  if (/\b(teamleitung|team lead|lead|head|manager)\b/.test(normalized)) return "lead";
  if (/\b(professional experienced|berufserfahren|senior)\b/.test(normalized)) return "senior";
  if (/\b(berufseinstieg|entry level|junior|graduate)\b/.test(normalized)) return "junior";
  return null;
};

type ArbeitnowJob = {
  slug?: string;
  company_name?: string;
  title?: string;
  description?: string;
  remote?: boolean;
  url?: string;
  tags?: string[];
  job_types?: string[];
  location?: string;
  created_at?: number;
};

type ArbeitnowResponse = { data?: ArbeitnowJob[] };

class ArbeitnowProvider implements JobProvider {
  readonly name = "Arbeitnow";
  countrySupport(country: string) {
    return ["Germany", "France", "Hungary", "Netherlands", "Austria", "Switzerland", "Belgium", "Luxembourg"].includes(canonicalCountry(country) ?? "");
  }
  async health() { return { configured: true, status: "healthy" as const }; }
  async rateLimitState() { return { keyRequired: false, source: "public-api" }; }

  async search(input: ProviderSearchInput): Promise<ProviderSearchOutcome> {
    const started = Date.now();
    if (!this.countrySupport(input.country)) return { provider: this.name, status: "unsupported_country", jobs: [], latencyMs: 0, requestCount: 0, rateLimitState: { keyRequired: false }, errorCode: "UNSUPPORTED_COUNTRY" };
    try {
      const response = await fetch("https://www.arbeitnow.com/api/job-board-api", {
        headers: { Accept: "application/json", "User-Agent": "AI-Role-Path-Job-Agent/1.0" },
        cache: "no-store",
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!response.ok) return { provider: this.name, status: response.status === 429 ? "rate_limit" : "provider_error", jobs: [], latencyMs: Date.now() - started, requestCount: 1, rateLimitState: {}, errorCode: `ARBEITNOW_HTTP_${response.status}` };
      const payload = await response.json() as ArbeitnowResponse;
      const jobs = (payload.data ?? []).filter((job) => relevant(job, input)).slice(0, input.limit).flatMap((job) => {
        const url = safeExternalUrl(job.url ?? "");
        if (!job.slug || !job.title || !job.company_name || !url) return [];
        const row: CanonicalJobCandidate = {
          externalId: job.slug,
          source: this.name,
          sourceQuery: input.query,
          company: job.company_name,
          title: job.title,
          normalizedTitle: normalizeJobText(job.title),
          location: job.location?.trim() || null,
          country: inferredArbeitnowCountry(job, input),
          sourceUrl: url,
          applicationUrl: url,
          description: stripHtml(job.description ?? ""),
          descriptionComplete: Boolean(job.description),
          workplaceModel: job.remote ? "remote" : "unknown",
          employmentTypes: normalizeEmploymentTypes(job.job_types),
          seniority: inferSeniority(job.job_types),
          salaryMin: null,
          salaryMax: null,
          currency: null,
          requiredLanguages: [],
          requiredSkills: [],
          preferredSkills: job.tags ?? [],
          educationRequirements: [],
          certificationRequirements: [],
          visaSponsorship: null,
          postedAt: typeof job.created_at === "number" ? new Date(job.created_at * 1000).toISOString() : null,
          expiresAt: null,
          canonicalKey: "",
          sourceQueries: [input.query],
          sources: [{ provider: this.name, sourceJobId: job.slug, sourceQuery: input.query, sourceUrl: url, providerPayload: { remote: Boolean(job.remote) } }],
        };
        row.canonicalKey = canonicalJobKey(row);
        return [row];
      });
      return { provider: this.name, status: jobs.length ? "success" : "no_results", jobs, latencyMs: Date.now() - started, requestCount: 1, rateLimitState: { keyRequired: false, source: "public-api" } };
    } catch (error) {
      return { provider: this.name, status: "provider_error", jobs: [], latencyMs: Date.now() - started, requestCount: 1, rateLimitState: {}, errorCode: error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError") ? "PROVIDER_TIMEOUT" : "ARBEITNOW_ERROR", errorMessage: error instanceof Error ? error.message.slice(0, 200) : "Unknown error" };
    }
  }
}

export function publicFeedProviders(): JobProvider[] {
  return [new ArbeitnowProvider(), new RemotiveProvider()];
}
