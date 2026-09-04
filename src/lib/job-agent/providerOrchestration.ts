import type { JobProvider, SearchGatewayResult } from "./contracts.ts";
import { deduplicateJobs } from "./normalization.ts";

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
        return { country, query, outcome: await provider.search({ country, query, location: input.location, limit: input.limitPerRequest ?? 10, correlationId: input.correlationId }) };
      } catch (error) {
        return { country, query, outcome: { provider: provider.name, status: "provider_error" as const, jobs: [], latencyMs: 0, requestCount: 0, rateLimitState: {}, errorCode: "UNHANDLED_ADAPTER_ERROR", errorMessage: error instanceof Error ? error.message.slice(0, 240) : "Unknown provider adapter error" } };
      }
    })));
  }
  return {
    jobs: deduplicateJobs(outcomes.flatMap((item) => item.outcome.jobs)),
    attempts: outcomes.map(({ country, query, outcome }) => ({ provider: outcome.provider, query, country, location: input.location ?? null, status: outcome.status, recordsReceived: outcome.jobs.length, requestCount: outcome.requestCount, rateLimitState: outcome.rateLimitState, latencyMs: outcome.latencyMs, errorCode: outcome.errorCode, errorMessage: outcome.errorMessage })),
  };
}
