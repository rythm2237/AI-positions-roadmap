export interface SalaryReviewSnapshot {
  currency_code?: string | null;
  normalized_payload?: Record<string, unknown>;
  sample_size?: number;
  total_count?: number | null;
  captured_at?: string;
}

export interface SalaryReviewMetrics {
  providerTotal: number | null;
  retrieved: number;
  analyzed: number;
  exactMatches: number;
  adjacentMatches: number;
  salaryEvidence: number;
  employerDisclosed: number;
  providerEstimated: number;
  currency: string | null;
  payPeriod: string | null;
  median: number | null;
  minimum: number | null;
  maximum: number | null;
  periods: string[];
  currencies: string[];
  histogram: Array<{ salary: number; count: number }>;
  partial: boolean;
}

const finite = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;
const count = (value: unknown) => finite(value) ?? 0;

export function salaryReviewMetrics(snapshot: SalaryReviewSnapshot): SalaryReviewMetrics {
  const root = snapshot.normalized_payload ?? {};
  const evidence = (root.snapshot && typeof root.snapshot === "object" ? root.snapshot : {}) as Record<string, unknown>;
  const postings = Array.isArray(evidence.postings) ? evidence.postings : [];
  const salaries = postings.flatMap((posting) => {
    if (!posting || typeof posting !== "object") return [];
    const record = posting as Record<string, unknown>;
    if (record.matchQuality !== "direct" && record.matchQuality !== "approved-equivalent") return [];
    const salary = record.salary;
    return salary && typeof salary === "object" ? [salary as Record<string, unknown>] : [];
  });
  const periods = [...new Set(salaries.map((salary) => String(salary.period ?? "unknown")))];
  const currencies = [...new Set(salaries.map((salary) => String(salary.currencyCode ?? "")).filter(Boolean))];
  const range = evidence.observedRange && typeof evidence.observedRange === "object"
    ? evidence.observedRange as Record<string, unknown>
    : {};
  const histogramRoot = root.histogram && typeof root.histogram === "object"
    ? root.histogram as Record<string, unknown>
    : {};
  const histogram = Array.isArray(histogramRoot.buckets)
    ? histogramRoot.buckets.flatMap((bucket) => {
        if (!bucket || typeof bucket !== "object") return [];
        const item = bucket as Record<string, unknown>;
        const salary = finite(item.salary), bucketCount = finite(item.count);
        return salary === null || bucketCount === null ? [] : [{ salary, count: bucketCount }];
      })
    : [];
  const warnings = Array.isArray(evidence.warnings) ? evidence.warnings.map(String) : [];
  return {
    providerTotal: finite(evidence.providerResultCount) ?? finite(snapshot.total_count),
    retrieved: count(evidence.recordsRetrieved) || count(snapshot.sample_size),
    analyzed: count(evidence.uniqueRecordsAnalyzed) || count(snapshot.sample_size),
    exactMatches: count(evidence.primaryMatchCount),
    adjacentMatches: count(evidence.adjacentMatchCount),
    salaryEvidence: count(evidence.salarySampleSize),
    employerDisclosed: count(evidence.disclosedSalaryCount),
    providerEstimated: count(evidence.predictedSalaryCount),
    currency: typeof evidence.currencyCode === "string" ? evidence.currencyCode : snapshot.currency_code ?? null,
    payPeriod: periods.length === 1 ? periods[0] : periods.length ? "mixed" : null,
    median: finite(evidence.observedMedian),
    minimum: finite(range.min),
    maximum: finite(range.max),
    periods,
    currencies,
    histogram,
    partial: warnings.some((warning) => /partial|retry/i.test(warning)),
  };
}

export function salaryEvidenceLabel(matches: number) {
  if (matches < 5) return "Insufficient evidence — withhold";
  if (matches < 20) return "Limited observed evidence";
  if (matches < 50) return "Moderate observed evidence";
  return "Stronger observed evidence";
}

export function salaryQuality(metrics: SalaryReviewMetrics, published?: SalaryReviewMetrics | null) {
  const blocking: string[] = [], warnings: string[] = [];
  if (!metrics.currency) blocking.push("Missing local currency.");
  if (!metrics.payPeriod || metrics.payPeriod === "unknown") blocking.push("Missing pay-period or annualization metadata.");
  if (metrics.payPeriod === "mixed" || metrics.periods.some((period) => period !== "annual"))
    blocking.push("Mixed or unsupported pay periods are present in salary evidence.");
  if (metrics.currencies.length > 1 || metrics.currencies.some((currency) => currency !== metrics.currency))
    blocking.push("Mixed currencies are present without verified conversion.");
  if (metrics.median === null || metrics.minimum === null || metrics.maximum === null)
    blocking.push("Observed median and range are required.");
  for (const [label, value] of [["minimum", metrics.minimum], ["median", metrics.median], ["maximum", metrics.maximum]] as const)
    if (value !== null && (!Number.isFinite(value) || value < 0)) blocking.push(`Observed ${label} salary is invalid.`);
  if (metrics.minimum !== null && metrics.median !== null && metrics.minimum > metrics.median)
    blocking.push("Observed minimum exceeds the median.");
  if (metrics.median !== null && metrics.maximum !== null && metrics.median > metrics.maximum)
    blocking.push("Observed median exceeds the maximum.");
  if (metrics.salaryEvidence > metrics.exactMatches)
    blocking.push("Salary evidence exceeds exact/equivalent matches.");
  if (metrics.employerDisclosed + metrics.providerEstimated !== metrics.salaryEvidence)
    blocking.push("Employer-disclosed and provider-estimated counts do not reconcile with salary evidence.");
  if (!metrics.exactMatches) warnings.push("No exact or approved-equivalent title matches.");
  if (metrics.salaryEvidence < 5) warnings.push("Insufficient salary evidence; publication should be withheld.");
  else if (metrics.salaryEvidence < 20) warnings.push("Salary evidence is limited.");
  if (metrics.retrieved < 50) warnings.push("Retrieved sample is small.");
  if (metrics.partial) warnings.push("Provider retrieval reports a partial or retry condition.");

  let requiresAcknowledgement = false;
  if (published) {
    for (const [label, current, previous] of [
      ["median", metrics.median, published.median],
      ["minimum", metrics.minimum, published.minimum],
      ["maximum", metrics.maximum, published.maximum],
    ] as const) {
      if (current !== null && previous !== null && previous > 0 && Math.abs((current - previous) / previous) >= 0.25) {
        warnings.push(`Observed ${label} changed by at least 25% versus the published snapshot.`);
        requiresAcknowledgement = true;
      }
    }
  }
  return { valid: blocking.length === 0, blocking, warnings, requiresAcknowledgement };
}

export function numericDelta(current: number | null, previous: number | null) {
  if (current === null || previous === null) return { absolute: null, percent: null };
  return { absolute: current - previous, percent: previous === 0 ? null : ((current - previous) / previous) * 100 };
}
