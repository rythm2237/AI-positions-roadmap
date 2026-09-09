import type { CanonicalJobCandidate, JobProvider, SearchGatewayResult } from "./contracts.ts";
import { canonicalJobKey, deduplicateJobs, normalizeJobText } from "./normalization.ts";

const recoveryLimit = () => Math.max(0, Math.min(Number(process.env.JOB_AGENT_TRUSTED_RECOVERY_MAX ?? 4) || 0, 6));

function providerCountry(provider: JobProvider, country: string) {
  if (provider.name !== "SerpApi") return country;
  const normalized = normalizeJobText(country);
  // Germany needs an explicit ISO override because Intl.DisplayNames can resolve the
  // historical DD region before DE in the lower-level SerpApi adapter. Other configured
  // country names must remain human-readable here because the adapter also uses this
  // value to build SerpApi's `location` parameter (e.g. "France", not "fr").
  if (normalized === "germany" || normalized === "deutschland") return "de";
  return country;
}

function restoreRequestedCountry(outcome: Awaited<ReturnType<JobProvider["search"]>>, country: string) {
  if (!outcome.jobs.length) return outcome;
  return {
    ...outcome,
    jobs: outcome.jobs.map((job) => {
      if (normalizeJobText(job.country) === normalizeJobText(country)) return job;
      const normalized = { ...job, country, canonicalKey: "" };
      normalized.canonicalKey = canonicalJobKey(normalized);
      return normalized;
    }),
  };
}

function sameVacancyIdentity(a: CanonicalJobCandidate, b: CanonicalJobCandidate) {
  const titleA = normalizeJobText(a.title);
  const titleB = normalizeJobText(b.title);
  const companyA = normalizeJobText(a.company);
  const companyB = normalizeJobText(b.company);
  if (!titleA || !titleB || titleA !== titleB || !companyA || !companyB || companyA !== companyB) return false;
  const countryA = normalizeJobText(a.country);
  const countryB = normalizeJobText(b.country);
  if (countryA && countryB && countryA !== countryB) return false;
  const locationA = normalizeJobText(a.location);
  const locationB = normalizeJobText(b.location);
  if (locationA && locationB) {
    const locationMatches = locationA.includes(locationB) || locationB.includes(locationA)
      || locationA.split(" ").some((token) => token.length >= 4 && locationB.includes(token));
    if (!locationMatches) return false;
  }
  return true;
}

function recoveryQuery(job: CanonicalJobCandidate) {
  return `"${job.title.replaceAll('"', "").trim()}" ${job.company.trim()}`.trim();
}

async function recoverIncompleteAdzunaVacancies(input: {
  providers: JobProvider[];
  jobs: CanonicalJobCandidate[];
  correlationId: string;
}): Promise<Array<{ country: string; query: string; outcome: Awaited<ReturnType<JobProvider["search"]>> }>> {
  const serpApi = input.providers.find((provider) => provider.name === "SerpApi");
  const limit = recoveryLimit();
  if (!serpApi || limit === 0) return [];

  const alreadyCovered = input.jobs.filter((job) => job.source !== "Adzuna" && job.descriptionComplete);
  const targets = input.jobs
    .filter((job) => job.source === "Adzuna" && !job.descriptionComplete && job.country)
    .filter((job) => !alreadyCovered.some((other) => sameVacancyIdentity(job, other)))
    .filter((job, index, rows) => rows.findIndex((other) => sameVacancyIdentity(job, other)) === index)
    .slice(0, limit);

  const recovered: Array<{ country: string; query: string; outcome: Awaited<ReturnType<JobProvider["search"]>> }> = [];
  for (const job of targets) {
    const query = recoveryQuery(job);
    const country = job.country ?? "";
    try {
      // Exact-title/company recovery does not need the aggregator's granular location label.
      // Sending values such as "17ème Arrondissement, Paris" can cause SerpApi to reject an
      // otherwise valid lookup. Search at country scope and let identity verification enforce
      // the vacancy match after retrieval.
      const rawOutcome = await serpApi.search({
        country: providerCountry(serpApi, country),
        query,
        limit: 5,
        correlationId: `${input.correlationId}:trusted-recovery`,
      });
      recovered.push({ country, query, outcome: restoreRequestedCountry(rawOutcome, country) });
    } catch (error) {
      recovered.push({
        country,
        query,
        outcome: {
          provider: serpApi.name,
          status: "provider_error",
          jobs: [],
          latencyMs: 0,
          requestCount: 0,
          rateLimitState: {},
          errorCode: "TRUSTED_RECOVERY_ERROR",
          errorMessage: error instanceof Error ? error.message.slice(0, 240) : "Trusted-source recovery failed",
        },
      });
    }
  }
  return recovered;
}

export async function orchestrateProviderSearch(input: { providers: JobProvider[]; queries: string[]; countries: string[]; location?: string; correlationId: string; limitPerRequest?: number; maxRequests?: number }): Promise<SearchGatewayResult> {
  const maxRequests = Math.max(1, Math.min(input.maxRequests ?? 36, 60));
  const requests = input.countries.flatMap((country) => input.queries.flatMap((query) => input.providers.map((provider) => ({ provider, country, query })))).slice(0, maxRequests);
  const outcomes: Array<{ country: string; query: string; outcome: Awaited<ReturnType<JobProvider["search"]>> }> = [];
  // Bound concurrency to protect provider limits and the serverless runtime. Providers
  // still return independent typed failures; one adapter cannot collapse the run.
  for (let index = 0; index < requests.length; index += 8) {
    const batch = requests.slice(index, index + 8);
    outcomes.push(...await Promise.all(batch.map(async ({ provider, country, query }) => {
      try {
        const rawOutcome = await provider.search({ country: providerCountry(provider, country), query, location: input.location, limit: input.limitPerRequest ?? 10, correlationId: input.correlationId });
        return { country, query, outcome: restoreRequestedCountry(rawOutcome, country) };
      } catch (error) {
        return { country, query, outcome: { provider: provider.name, status: "provider_error" as const, jobs: [], latencyMs: 0, requestCount: 0, rateLimitState: {}, errorCode: "UNHANDLED_ADAPTER_ERROR", errorMessage: error instanceof Error ? error.message.slice(0, 240) : "Unknown provider adapter error" } };
      }
    })));
  }

  const primaryJobs = deduplicateJobs(outcomes.flatMap((item) => item.outcome.jobs));
  // Adzuna's public Search API intentionally returns only description snippets. When the
  // corresponding public Adzuna detail page is rate-limited, do not retry or bypass it.
  // Instead, make a small, bounded exact-title/company lookup through the already-approved
  // SerpApi provider so the normal vacancy verifier can inspect an independent public source
  // (for example an employer ATS or public employment-service vacancy page). Recovery results
  // remain ordinary candidates and are not promoted to verified status here.
  const recoveryOutcomes = await recoverIncompleteAdzunaVacancies({ providers: input.providers, jobs: primaryJobs, correlationId: input.correlationId });
  outcomes.push(...recoveryOutcomes);

  return {
    jobs: deduplicateJobs(outcomes.flatMap((item) => item.outcome.jobs)),
    attempts: outcomes.map(({ country, query, outcome }) => ({ provider: outcome.provider, query, country, location: input.location ?? null, status: outcome.status, recordsReceived: outcome.jobs.length, requestCount: outcome.requestCount, rateLimitState: outcome.rateLimitState, latencyMs: outcome.latencyMs, errorCode: outcome.errorCode, errorMessage: outcome.errorMessage })),
  };
}
