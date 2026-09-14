import type { ProviderAttempt } from "../../types/jobAgent.ts";
import { createHash } from "node:crypto";
export function summarizeProviderAttempts(attempts: ProviderAttempt[]) {
  return {
    requests: attempts.reduce((sum, item) => sum + item.requestCount, 0),
    records: attempts.reduce((sum, item) => sum + item.recordsReceived, 0),
    errors: attempts.filter((item) => ["provider_error", "rate_limit", "auth_failure", "invalid_query"].includes(item.status)).length,
    statuses: Object.fromEntries([...new Set(attempts.map((item) => item.status))].map((status) => [status, attempts.filter((item) => item.status === status).length])),
    latencyMs: attempts.reduce((sum, item) => sum + item.latencyMs, 0),
  };
}

function safeMetadata(metadata: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(metadata).filter(([key]) => !/(token|secret|authorization|cookie|password)/i.test(key)).map(([key, value]) => [key, typeof value === "string" ? value.slice(0, 240) : value]));
}

export function logJobDiscoveryEvent(event: string, input: { runId: string; userId?: string; provider?: string; status?: string; latencyMs?: number; counts?: Record<string, number>; metadata?: Record<string, unknown> }) {
  const userRef = input.userId ? createHash("sha256").update(input.userId).digest("hex").slice(0, 12) : undefined;
  console.log(JSON.stringify({ level: "info", domain: "job_discovery", event, runId: input.runId, userRef, provider: input.provider, status: input.status, latencyMs: input.latencyMs, counts: input.counts, metadata: safeMetadata(input.metadata ?? {}), at: new Date().toISOString() }));
}
