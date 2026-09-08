import type { JobOpportunity } from "@/types/jobAgent";

export function groupCurrentJobResults(jobs: JobOpportunity[]) {
  const active = jobs
    .filter((job) => job.freshness_status !== "expired")
    .sort((a, b) => (b.fit_score ?? -1) - (a.fit_score ?? -1));

  return {
    active,
    ready: active.filter((job) => job.eligibility_status === "eligible"),
    review: active.filter((job) => job.eligibility_status !== "eligible" && job.eligibility_status !== "blocked"),
    blocked: active.filter((job) => job.eligibility_status === "blocked"),
  };
}

export function countProviderIssues(providerSummary: unknown) {
  if (!providerSummary || typeof providerSummary !== "object") return 0;
  const attempts = (providerSummary as { attemptsByStatus?: unknown }).attemptsByStatus;
  if (!attempts || typeof attempts !== "object") return 0;

  return ["provider_error", "rate_limit", "auth_failure", "invalid_query"].reduce((total, status) => {
    const count = Number((attempts as Record<string, unknown>)[status] ?? 0);
    return total + (Number.isFinite(count) && count > 0 ? count : 0);
  }, 0);
}
