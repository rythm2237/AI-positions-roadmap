import type { CanonicalJobCandidate, JobProvider, SearchGatewayResult } from "./contracts.ts";
import { canonicalJobKey, deduplicateJobs, normalizeJobText } from "./normalization.ts";

const recoveryLimit = () => Math.max(0, Math.min(Number(process.env.JOB_AGENT_TRUSTED_RECOVERY_MAX ?? 4) || 0, 6));
const providerRequestTimeoutMs = 15_000;
const providerGatewayDeadlineMs = 120_000;

type ProviderOutcome = Awaited<ReturnType<JobProvider["search"]>>;

function providerDetails(provider: JobProvider) {
  return provider.metadata ?? { providerType: "SEARCH_API" as const, stage: "PRIMARY" as const, priority: 50, supportedSources: [] };
}

function boundedDuration(value: number | undefined, fallback: number, maximum: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1, Math.min(value ?? fallback, maximum));
}

function timeoutOutcome(provider: JobProvider, errorCode: "PROVIDER_TIMEOUT" | "GATEWAY_DEADLINE_EXCEEDED", latencyMs: number): ProviderOutcome {
  return {
    provider: provider.name,
    status: "provider_error",
    jobs: [],
    latencyMs,
    requestCount: errorCode === "PROVIDER_TIMEOUT" ? 1 : 0,
    rateLimitState: {},
    errorCode,
    errorMessage: errorCode === "PROVIDER_TIMEOUT"
      ? `Provider request exceeded ${latencyMs} ms.`
      : "Provider request was skipped because the search gateway deadline was reached.",
  };
}

async function searchProviderWithin(provider: JobProvider, input: Parameters<JobProvider["search"]>[0], timeoutMs: number): Promise<ProviderOutcome> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<ProviderOutcome>((resolve) => {
    timer = setTimeout(() => resolve(timeoutOutcome(provider, "PROVIDER_TIMEOUT", timeoutMs)), timeoutMs);
  });
  try {
    return await Promise.race([provider.search(input), timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

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
  deadlineAt: number;
  requestTimeoutMs: number;
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
    const remainingMs = input.deadlineAt - Date.now();
    if (remainingMs <= 0) {
      recovered.push({ country, query, outcome: timeoutOutcome(serpApi, "GATEWAY_DEADLINE_EXCEEDED", 0) });
      continue;
    }
    try {
      const rawOutcome = await searchProviderWithin(serpApi, {
        country: providerCountry(serpApi, country),
        query,
        limit: 5,
        correlationId: `${input.correlationId}:trusted-recovery`,
      }, Math.min(input.requestTimeoutMs, remainingMs));
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
  requestTimeoutMs?: number;
  gatewayDeadlineMs?: number;
  mode?: "legacy" | "shadow" | "primary";
  minimumBeforeFallback?: number;
  maxApifyRuns?: number;
}): Promise<SearchGatewayResult> {
  const maxRequests = Math.max(1, Math.min(input.maxRequests ?? 36, 60));
  const requestTimeoutMs = boundedDuration(input.requestTimeoutMs, providerRequestTimeoutMs, 60_000);
  const gatewayDeadlineMs = boundedDuration(input.gatewayDeadlineMs, providerGatewayDeadlineMs, 180_000);
  const deadlineAt = Date.now() + gatewayDeadlineMs;
  const outcomes: Array<{ country: string; query: string; outcome: Awaited<ReturnType<JobProvider["search"]>> }> = [];
  let requestsUsed = 0;
  let apifyRunsUsed = 0;
  const runProviders = async (providers: JobProvider[]) => {
    const candidates = input.countries.flatMap((country) => input.queries.flatMap((query) => providers.filter((provider) => provider.countrySupport(country)).map((provider) => ({ provider, country, query }))));
    const requests = candidates.filter(({ provider }) => {
      if (providerDetails(provider).providerType !== "APIFY") return true;
      if (apifyRunsUsed >= Math.max(0, input.maxApifyRuns ?? 2)) return false;
      apifyRunsUsed += 1;
      return true;
    }).slice(0, Math.max(0, maxRequests - requestsUsed));
    requestsUsed += requests.length;
    const stageOutcomes: typeof outcomes = [];
    for (let index = 0; index < requests.length; index += 8) {
      const batch = requests.slice(index, index + 8);
      const remainingMs = deadlineAt - Date.now();
      if (remainingMs <= 0) {
        stageOutcomes.push(...requests.slice(index).map(({ provider, country, query }) => ({ country, query, outcome: timeoutOutcome(provider, "GATEWAY_DEADLINE_EXCEEDED", 0) })));
        break;
      }
      stageOutcomes.push(...await Promise.all(batch.map(async ({ provider, country, query }) => {
        try {
          const rawOutcome = await searchProviderWithin(provider, { country: providerCountry(provider, country), query, location: input.location, limit: input.limitPerRequest ?? 10, correlationId: input.correlationId }, Math.min(requestTimeoutMs, remainingMs));
          return { country, query, outcome: restoreRequestedCountry(rawOutcome, country) };
        } catch (error) {
          return { country, query, outcome: { provider: provider.name, status: "provider_error" as const, jobs: [], latencyMs: 0, requestCount: 0, rateLimitState: {}, errorCode: "UNHANDLED_ADAPTER_ERROR", errorMessage: error instanceof Error ? error.message.slice(0, 240) : "Unknown provider adapter error" } };
        }
      })));
    }
    outcomes.push(...stageOutcomes);
    return stageOutcomes;
  };

  const orderedProviders = [...input.providers].sort((left, right) => providerDetails(left).priority - providerDetails(right).priority || left.name.localeCompare(right.name));
  const fallbackProviders = orderedProviders.filter((provider) => providerDetails(provider).fallbackOnly || providerDetails(provider).stage === "FALLBACK");
  const primaryProviders = orderedProviders.filter((provider) => !fallbackProviders.includes(provider));
  const directProviders = primaryProviders.filter((provider) => providerDetails(provider).providerType === "DIRECT");
  const secondaryProviders = primaryProviders.filter((provider) => !directProviders.includes(provider));
  const mode = input.mode ?? "legacy";
  const minimumBeforeFallback = Math.max(0, Math.min(input.minimumBeforeFallback ?? 20, 200));
  let fallbackTriggered = false;
  let authoritativeOutcomes: typeof outcomes;
  let multisourceOutcomes: typeof outcomes;

  if (mode === "legacy") {
    await runProviders(orderedProviders);
    authoritativeOutcomes = [...outcomes];
    multisourceOutcomes = [...outcomes];
  } else {
    const directOutcomes = await runProviders(directProviders);
    const directJobs = deduplicateJobs(directOutcomes.flatMap((item) => item.outcome.jobs));
    const secondaryOutcomes = mode === "shadow" || directJobs.length < minimumBeforeFallback ? await runProviders(secondaryProviders) : [];
    const primaryOutcomes = [...directOutcomes, ...secondaryOutcomes];
    const primaryJobs = deduplicateJobs(primaryOutcomes.flatMap((item) => item.outcome.jobs));
    fallbackTriggered = primaryJobs.length < minimumBeforeFallback;
    const fallbackOutcomes = mode === "shadow" || fallbackTriggered ? await runProviders(fallbackProviders) : [];
    multisourceOutcomes = fallbackTriggered ? [...primaryOutcomes, ...fallbackOutcomes] : primaryOutcomes;
    authoritativeOutcomes = mode === "shadow" ? [...primaryOutcomes, ...fallbackOutcomes] : multisourceOutcomes;
  }

  const primaryJobs = deduplicateJobs(authoritativeOutcomes.flatMap((item) => item.outcome.jobs));
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
  const recoveryProviders = mode === "primary" && !fallbackTriggered ? primaryProviders : input.providers;
  const recoveryOutcomes = await recoverIncompleteAdzunaVacancies({ providers: recoveryProviders, jobs: recoveryInputJobs, correlationId: input.correlationId, deadlineAt, requestTimeoutMs });
  const recoveredJobs = deduplicateJobs(recoveryOutcomes.flatMap((item) => item.outcome.jobs));
  outcomes.push(...recoveryOutcomes);

  const finalJobs = deduplicateJobs([...recoveredJobs, ...primaryJobs]);
  const providerByName = new Map(input.providers.map((provider) => [provider.name, provider]));
  const providerCounts = Object.fromEntries(["DIRECT", "APIFY", "SEARCH_API"].map((providerType) => [providerType, finalJobs.filter((job) => job.sources.some((source) => { const sourceProvider = providerByName.get(source.provider); return sourceProvider ? providerDetails(sourceProvider).providerType === providerType : false; })).length]));
  const multisourceJobs = deduplicateJobs(multisourceOutcomes.flatMap((item) => item.outcome.jobs));
  const legacyKeys = new Set(finalJobs.map((job) => job.canonicalKey));
  const multisourceKeys = new Set(multisourceJobs.map((job) => job.canonicalKey));
  const shadowComparison = mode === "shadow" ? {
    mode: "shadow" as const,
    legacyCount: finalJobs.length,
    multisourceCount: multisourceJobs.length,
    overlapCount: [...legacyKeys].filter((key) => multisourceKeys.has(key)).length,
    legacyOnlyCount: [...legacyKeys].filter((key) => !multisourceKeys.has(key)).length,
    multisourceOnlyCount: [...multisourceKeys].filter((key) => !legacyKeys.has(key)).length,
    directOnlyCount: multisourceJobs.filter((job) => job.sources.every((source) => { const sourceProvider = providerByName.get(source.provider); return sourceProvider ? providerDetails(sourceProvider).providerType === "DIRECT" : false; })).length,
    apifyOnlyCount: multisourceJobs.filter((job) => job.sources.every((source) => { const sourceProvider = providerByName.get(source.provider); return sourceProvider ? providerDetails(sourceProvider).providerType === "APIFY" : false; })).length,
    fallbackOnlyCount: multisourceJobs.filter((job) => job.sources.every((source) => { const sourceProvider = providerByName.get(source.provider); return sourceProvider ? providerDetails(sourceProvider).stage === "FALLBACK" : false; })).length,
  } : undefined;

  return {
    jobs: finalJobs,
    fallbackTriggered,
    providerCounts,
    shadowComparison,
    attempts: outcomes.map(({ country, query, outcome }) => {
      const provider = providerByName.get(outcome.provider);
      const details = provider ? providerDetails(provider) : undefined;
      return { provider: outcome.provider, providerType: details?.providerType, providerStage: details?.stage, query, country, location: input.location ?? null, status: outcome.status, recordsReceived: outcome.jobs.length, requestCount: outcome.requestCount, rawCount: outcome.rawCount, normalizedCount: outcome.normalizedCount, costUsd: outcome.costUsd, metadata: outcome.metadata, rateLimitState: outcome.rateLimitState, latencyMs: outcome.latencyMs, errorCode: outcome.errorCode, errorMessage: outcome.errorMessage };
    }),
  };
}
