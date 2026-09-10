import type { CanonicalJobCandidate, JobProvider, SearchGatewayResult } from "./contracts.ts";
import { canonicalJobKey, deduplicateJobs, normalizeJobText } from "./normalization.ts";

const recoveryLimit = () => Math.max(0, Math.min(Number(process.env.JOB_AGENT_TRUSTED_RECOVERY_MAX ?? 4) || 0, 6));

function providerCountry(provider: JobProvider, country: string) {
  if (provider.name !== "SerpApi") return country;
  const normalized = normalizeJobText(country);
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
  if (!queryTokens.length) return isContinuitySeed(job) ? 10_000 : 0;

  const matched = queryTokens.filter((token) => titleTokens.has(token)).length;
  const coverage = matched / queryTokens.length;
  const precision = matched / Math.max(titleTokens.size, 1);
  const exactPhrase = titleText.includes(queryText) || queryText.includes(titleText) ? 1 : 0;
  const continuityPriority = isContinuitySeed(job) ? 10_000 : 0;

  // Keep this ranking deliberately conservative. Only titles covering every meaningful query
  // token are promoted above the provider's stable order. This fixes clear false-order cases
  // such as an unrelated management vacancy preceding an AI Solution Consultant, while avoiding
  // broad semantic guesses that could destabilize existing country/query fairness. Lightweight
  // singularization handles variants such as Solution/Solutions without company or role hardcoding.
  if (coverage < 1) return continuityPriority;
  return continuityPriority + exactPhrase * 1_000 + 100 + precision * 20;
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
    .filter((job, index, rows) => rows.findIndex((other) => recoveryQueryKey(other) === recoveryQueryKey(job)) === index);
  const targets = balancedRecoveryTargets(candidates, limit);

  const recovered: Array<{ country: string; query: string; outcome: Awaited<ReturnType<JobProvider["search"]>> }> = [];
  for (const job of targets) {
    const query = recoveryQuery(job);
    const country = job.country ?? "";
    try {
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
  const continuitySeeds = (input.continuityJobs ?? []).filter((job) => {
    if (job.source !== "Adzuna" || !job.country) return false;
    const sourceQueries = [...new Set([job.sourceQuery, ...(job.sourceQueries ?? [])].filter(Boolean))];
    return sourceQueries.some((query) => rateLimitedAdzunaAttempts.has(attemptKey(job.country ?? "", query)));
  });

  const recoveryInputJobs = deduplicateJobs([...continuitySeeds, ...primaryJobs]);
  const recoveryOutcomes = await recoverIncompleteAdzunaVacancies({ providers: input.providers, jobs: recoveryInputJobs, correlationId: input.correlationId });
  const recoveredJobs = deduplicateJobs(recoveryOutcomes.flatMap((item) => item.outcome.jobs));
  outcomes.push(...recoveryOutcomes);

  return {
    jobs: deduplicateJobs([...recoveredJobs, ...primaryJobs]),
    attempts: outcomes.map(({ country, query, outcome }) => ({ provider: outcome.provider, query, country, location: input.location ?? null, status: outcome.status, recordsReceived: outcome.jobs.length, requestCount: outcome.requestCount, rateLimitState: outcome.rateLimitState, latencyMs: outcome.latencyMs, errorCode: outcome.errorCode, errorMessage: outcome.errorMessage })),
  };
}
