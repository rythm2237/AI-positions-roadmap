export type CanonicalRunMetricCandidate = {
  jobId: string;
  freshnessStatus: string;
  eligibilityStatus: string;
  classification: string;
};

export function summarizeCanonicalSearchRun(candidates: CanonicalRunMetricCandidate[]) {
  const canonical = [...new Map(candidates.map((candidate) => [candidate.jobId, candidate])).values()];
  const active = canonical.filter((candidate) => candidate.freshnessStatus !== "expired");

  return {
    searched: active.length,
    eligible: active.filter((candidate) => candidate.eligibilityStatus === "eligible").length,
    unverified: active.filter((candidate) => candidate.eligibilityStatus === "unverified").length,
    blocked: active.filter((candidate) => candidate.eligibilityStatus === "blocked").length,
    expired: canonical.filter((candidate) => candidate.freshnessStatus === "expired").length,
    recommended: active.filter((candidate) => candidate.classification === "strong_match" || candidate.classification === "good_match").length,
  };
}
