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

function recoveryQueryKey(job: CanonicalJobCandidate) {
  return `${normalizeJobText(job.country)}|${normalizeJobText(job.title)}|${normalizeJobText(job.company)}`;
}

function sourceQueryKey(job: CanonicalJobCandidate) {
  return normalizeJobText(job.sourceQuery)
    || normalizeJobText(job.sourceQueries?.[0] ?? "")
    || "unknown";
}

function attemptKey(country: string, query: string) {
  return `${normalizeJobText(country)}|${normalizeJobText(query)}`;
}

function recoveryToken(token: string) {
  if (token.length > 5 && token.endsWith("ies")) return `${token.slice(0, -3)}y`;
  if (token.length > 4 && token.endsWith("s") && !token.endsWith("ss")) return token.slice(0, -1);
  return token;
}

function recoveryTokens(value: string) {
  return normalizeJobText(value)
    .split(" ")
    .map((token) => recoveryToken(token.trim()))
    .filter((token) => token.length >= 2);
}

function isContinuitySeed(job: CanonicalJobCandidate) {
  return job.sources.some((source) => {
    const payload = source.providerPayload;
    return Boolean(payload && typeof payload === "object" && "continuitySeed" in payload && payload.continuitySeed === true);
  });
}

function recoveryRelevanceScore(job: CanonicalJobCandidate) {
  const query = job.sourceQuery || job.sourceQueries?.[0] || "";
  const queryText = normalizeJobText(query);
  const titleText = normalizeJobText(job.normalizedTitle || job.title);
  const queryTokens = [...new Set(recoveryTokens(queryText))];
  const titleTokens = new Set(recoveryTokens(titleText));
  if (!queryTokens.length) return 0;

  const matched = queryTokens.filter((token) => titleTokens.has(token)).length;
  const coverage = matched / queryTokens.length;
  const precision = matched / Math.max(titleTokens.size, 1);
  const exactPhrase = titleText.includes(queryText) || queryText.includes(titleText) ? 1 : 0;
  // Continuity seeds were activated only by an exact current-run country/query rate limit,
  // so preserve their explicit priority while using lexical title relevance to rank ordinary
  // candidates inside the same source-query bucket. Lightweight singularization handles
  // common variants such as "Solution" vs "Solutions" without role/company hardcoding.
  return (isContinuitySeed(job) ? 10_000 : 0) + exactPhrase * 1_000 + coverage * 100 + precision * 20;
}

function fairRowsAcrossSourceQueries(rows: CanonicalJobCandidate[]) {
  if (rows.length <= 1) return rows;
  const byQuery = new Map<string, CanonicalJobCandidate[]>();
  const queryOrder: string[] = [];
  for (const row of rows) {
    const key = sourceQueryKey(row);
    if (!byQuery.has(key)) {
      byQuery.set(key, []);
      queryOrder.push(key);
    }
    byQuery.get(key)?.push(row);
  }

  // Provider result order is not a relevance guarantee. Rank only within each original
  // discovery-query bucket before round-robin allocation so unrelated rows cannot consume a
  // scarce recovery slot ahead of a close title match. Stable index tie-breaking preserves
  // deterministic provider order when scores are equal.
  for (const query of queryOrder) {
    const ranked = (byQuery.get(query) ?? [])
      .map((row, index) => ({ row, index, score: recoveryRelevanceScore(row) }))
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .map(({ row }) => row);
    byQuery.set(query, ranked);
  }

  const ordered: CanonicalJobCandidate[] = [];
  let round = 0;
  while (ordered.length < rows.length) {
    let added = false;
    for (const query of queryOrder) {
      const row = byQuery.get(query)?.[round];
      if (!row) continue;
      ordered.push(row);
      added = true;
    }
    if (!added) break;
    round += 1;
  }
  return ordered;
}

function balancedRecoveryTargets(rows: CanonicalJobCandidate[], limit: number) {
  if (limit <= 0 || rows.length <= 1) return rows.slice(0, limit);
  const byCountry = new Map<string, CanonicalJobCandidate[]>();
  const countryOrder: string[] = [];
  for (const row of rows) {
    const country = normalizeJobText(row.country) || "unknown";
    if (!byCountry.has(country)) {
      byCountry.set(country, []);
      countryOrder.push(country);
    }
    byCountry.get(country)?.push(row);
  }

  // Build each country's queue with round-robin fairness across the original discovery
  // queries first. Within each query, candidates are ranked by title relevance so a noisy
  // provider ordering cannot spend the bounded recovery budget on unrelated vacancies.
  for (const country of countryOrder) {
    byCountry.set(country, fairRowsAcrossSourceQueries(byCountry.get(country) ?? []));
  }

  const selected: CanonicalJobCandidate[] = [];
  let round = 0;
  while (selected.length < limit) {
    let added = false;
    for (const country of countryOrder) {
      const row = byCountry.get(country)?.[round];
      if (!row) continue;
      selected.push(row);
      added = true;
      if (selected.length >= limit) break;
    }
    if (!added) break;
    round += 1;
  }
  return selected;
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
  const candidates = input.jobs
    .filter((job) => job.source === "Adzuna" && !job.descriptionComplete && job.country)
    .filter((job) => !alreadyCovered.some((other) => sameVacancyIdentity(job, other)))
    .filter((job, index, rows) => rows.findIndex((other) => sameVacancyIdentity(job, other)) === index)
    // Recovery is executed by exact title + company at country scope. Multiple canonical
    // rows that differ only by granular location would generate the same provider request,
    // so collapse them before applying the bounded recovery budget.
    .filter((job, index, rows) => rows.findIndex((other) => recoveryQueryKey(other) === recoveryQueryKey(job)) === index);
  // Keep the recovery budget bounded while distributing it across both configured countries
  // and the original discovery queries inside each country.
  const targets = balancedRecoveryTargets(candidates, limit);

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

export async function orchestrateProviderSearch(input: {
  providers: JobProvider[];
  queries: string[];
  countries: string[];
  location?: string;
  correlationId: string;
  limitPerRequest?: number;
  maxRequests?: number;
  continuityJobs?: CanonicalJobCandidate[];
}): Promise<SearchGatewayResult> {
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
  const rateLimitedAdzunaAttempts = new Set(
    outcomes
      .filter(({ outcome }) => outcome.provider === "Adzuna" && outcome.status === "rate_limit" && outcome.jobs.length === 0)
      .map(({ country, query }) => attemptKey(country, query)),
  );
  // A recent persisted Adzuna row is continuity evidence only, never a fresh discovery.
  // It may seed an exact independent lookup when the same country/query failed specifically
  // because of a transient Adzuna rate limit. Ordinary no-results responses do not activate
  // continuity, preventing removed vacancies from being resurrected from cache.
  const continuitySeeds = (input.continuityJobs ?? []).filter((job) => {
    if (job.source !== "Adzuna" || !job.country) return false;
    const sourceQueries = [...new Set([job.sourceQuery, ...(job.sourceQueries ?? [])].filter(Boolean))];
    return sourceQueries.some((query) => rateLimitedAdzunaAttempts.has(attemptKey(job.country ?? "", query)));
  });

  // Activated continuity seeds represent current-run provider failures, so they must be
  // considered before ordinary incomplete Adzuna rows when the bounded recovery budget is
  // allocated. They are still hints only: the cached row is never emitted, and any recovery
  // result must pass the same independent verification and hard-eligibility gates.
  const recoveryInputJobs = deduplicateJobs([...continuitySeeds, ...primaryJobs]);

  // Adzuna's public Search API intentionally returns only description snippets. When the
  // corresponding public Adzuna detail page is rate-limited, do not retry or bypass it.
  // Instead, make a small, bounded exact-title/company lookup through the already-approved
  // SerpApi provider so the normal vacancy verifier can inspect an independent public source
  // (for example an employer ATS or public employment-service vacancy page). Recovery results
  // remain ordinary candidates and are not promoted to verified status here.
  const recoveryOutcomes = await recoverIncompleteAdzunaVacancies({ providers: input.providers, jobs: recoveryInputJobs, correlationId: input.correlationId });
  const recoveredJobs = deduplicateJobs(recoveryOutcomes.flatMap((item) => item.outcome.jobs));
  outcomes.push(...recoveryOutcomes);

  return {
    // Continuity seeds are deliberately absent here. Trusted recovery candidates are emitted
    // before bulk discovery rows so downstream bounded processing (currently 80 jobs/run)
    // cannot silently discard the very candidates created to repair incomplete aggregator data.
    // They remain ordinary candidates and still pass vacancy verification and hard eligibility.
    jobs: deduplicateJobs([...recoveredJobs, ...primaryJobs]),
    attempts: outcomes.map(({ country, query, outcome }) => ({ provider: outcome.provider, query, country, location: input.location ?? null, status: outcome.status, recordsReceived: outcome.jobs.length, requestCount: outcome.requestCount, rateLimitState: outcome.rateLimitState, latencyMs: outcome.latencyMs, errorCode: outcome.errorCode, errorMessage: outcome.errorMessage })),
  };
}
