import type { ProviderAttempt } from "../../types/jobAgent.ts";
export function summarizeProviderAttempts(attempts: ProviderAttempt[]) {
  return {
    requests: attempts.reduce((sum, item) => sum + item.requestCount, 0),
    records: attempts.reduce((sum, item) => sum + item.recordsReceived, 0),
    errors: attempts.filter((item) => ["provider_error", "rate_limit", "auth_failure", "invalid_query"].includes(item.status)).length,
    statuses: Object.fromEntries([...new Set(attempts.map((item) => item.status))].map((status) => [status, attempts.filter((item) => item.status === status).length])),
    latencyMs: attempts.reduce((sum, item) => sum + item.latencyMs, 0),
  };
}
