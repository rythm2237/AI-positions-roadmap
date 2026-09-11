import type { JobOpportunity } from "@/types/jobAgent";

const normalizeIdentityPart = (value: string | null | undefined) => (value ?? "")
  .normalize("NFKC")
  .toLowerCase()
  .replace(/&/g, " and ")
  .replace(/[^a-z0-9+#.]+/g, " ")
  .replace(/\s+/g, " ")
  .trim();

type VisibleOpportunityIdentity = Pick<JobOpportunity, "id" | "company" | "role" | "country" | "location">;

export function visibleOpportunityKey(job: VisibleOpportunityIdentity) {
  const company = normalizeIdentityPart(job.company);
  const role = normalizeIdentityPart(job.role);
  if (!company || !role) return `id|${job.id}`;
  return [company, role, job.country, job.location].map(normalizeIdentityPart).join("|");
}

const verificationRank = (status: JobOpportunity["verification_status"]) => status === "verified" ? 3
  : status === "partially_verified" ? 2
    : status === "unverified" ? 1 : 0;

function preferredVisibleOpportunity(a: JobOpportunity, b: JobOpportunity) {
  const verificationDifference = verificationRank(b.verification_status) - verificationRank(a.verification_status);
  if (verificationDifference) return verificationDifference > 0 ? b : a;
  const descriptionDifference = (b.job_description?.length ?? 0) - (a.job_description?.length ?? 0);
  if (descriptionDifference) return descriptionDifference > 0 ? b : a;
  return Date.parse(b.updated_at) > Date.parse(a.updated_at) ? b : a;
}

export function collapseDuplicateOpportunities(jobs: JobOpportunity[]) {
  const unique = new Map<string, JobOpportunity>();
  for (const job of jobs) {
    const key = visibleOpportunityKey(job);
    const existing = unique.get(key);
    unique.set(key, existing ? preferredVisibleOpportunity(existing, job) : job);
  }
  return [...unique.values()];
}

export function groupCurrentJobResults(jobs: JobOpportunity[]) {
  const active = collapseDuplicateOpportunities(jobs)
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
