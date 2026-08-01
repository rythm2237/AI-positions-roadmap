import "server-only";

import {
  buildCandidate,
  safeRefreshError,
  type RefreshCareerDefinition,
} from "@/lib/intelligence/refreshEngine";
import { intelligenceServiceFetch } from "@/lib/intelligence/snapshotRepository";
import type { SnapshotType } from "@/lib/intelligence/snapshotRegistry";

export async function queueAdminRefresh(input: {
  definition: RefreshCareerDefinition;
  countries: string[];
  types: SnapshotType[];
  sampleSize: number;
  actorUserId: string;
}) {
  const pageCalls = Math.ceil(input.sampleSize / 50);
  const plannedCalls = input.countries.length * input.types.reduce(
    (sum, type) => sum + pageCalls + (type === "salary" ? 2 : 0), 0,
  );
  const maximum = Math.max(1, Number(process.env.ADZUNA_MAX_CALLS_PER_RUN) || 60);
  if (plannedCalls > maximum) throw new Error("REQUEST_BUDGET_EXCEEDED");

  const run = await intelligenceServiceFetch<{ id: string }>("rpc/queue_admin_intelligence_refresh", {
    method: "POST",
    body: JSON.stringify({
      p_career_slug: input.definition.careerSlug,
      p_countries: input.countries,
      p_types: input.types,
      p_sample_size: input.sampleSize,
      p_actor_user_id: input.actorUserId,
      p_definition: input.definition,
      p_planned_calls: plannedCalls,
      p_config_version: `admin-${input.definition.careerSlug}-${input.definition.version}`,
      p_idempotency_key: `admin:${input.definition.careerSlug}:${crypto.randomUUID()}`,
    }),
  });
  return { runId: run.id, plannedCalls };
}

export async function processNextRefreshItem(runId: string) {
  const runs = await intelligenceServiceFetch<
    Array<{ id: string; requested_sample_size: number; idempotency_key: string }>
  >(`intelligence_refresh_runs?id=eq.${encodeURIComponent(runId)}&select=*&limit=1`);
  const run = runs[0];
  if (!run) throw new Error("RUN_NOT_FOUND");

  const claimed = await intelligenceServiceFetch<{
    id?: string;
    country_code: string;
    capability: SnapshotType;
    query_metadata: RefreshCareerDefinition;
    attempt_count: number;
  }>("rpc/claim_next_intelligence_refresh_item", {
    method: "POST", body: JSON.stringify({ p_run_id: run.id }),
  });
  if (!claimed?.id) {
    const reconciled = await intelligenceServiceFetch<{ status: string }>(
      "rpc/recompute_intelligence_refresh_run",
      { method: "POST", body: JSON.stringify({ p_run_id: run.id }) },
    );
    return { status: reconciled.status, reconciled: true };
  }

  const itemId = claimed.id;
  const requestCount = Math.ceil(run.requested_sample_size / 50) + (claimed.capability === "salary" ? 2 : 0);
  try {
    const result = await buildCandidate(
      claimed.query_metadata, claimed.country_code, claimed.capability, run.requested_sample_size,
      run.id, `${run.idempotency_key}:${claimed.country_code}:${claimed.capability}`,
    );
    const parent = await completeItem({
      itemId, status: "candidate", candidateId: result.candidateId, requestCount,
      pages: result.pagesRequested, retrieved: result.recordsRetrieved, analyzed: result.uniqueRecordsAnalyzed,
    });
    return { status: "candidate", runStatus: parent.status, itemId, candidateId: result.candidateId };
  } catch (error) {
    const safe = safeRefreshError(error);
    const retryable = ["PROVIDER_RATE_LIMIT", "PROVIDER_TIMEOUT"].includes(safe.code) && claimed.attempt_count < 3;
    const parent = await completeItem({
      itemId, status: retryable ? "retryable" : "failed", requestCount,
      errorCode: safe.code, errorMessage: safe.message,
      retryAfter: retryable ? new Date(Date.now() + 5 * 60_000).toISOString() : null,
    });
    return { status: retryable ? "retryable" : "failed", runStatus: parent.status, itemId, errorCode: safe.code };
  }
}

async function completeItem(input: {
  itemId: string; status: "candidate" | "failed" | "retryable";
  candidateId?: string; requestCount: number; pages?: number; retrieved?: number; analyzed?: number;
  errorCode?: string; errorMessage?: string; retryAfter?: string | null;
}) {
  return intelligenceServiceFetch<{ status: string }>("rpc/complete_intelligence_refresh_item", {
    method: "POST",
    body: JSON.stringify({
      p_item_id: input.itemId, p_status: input.status,
      p_candidate_snapshot_id: input.candidateId ?? null, p_request_count: input.requestCount,
      p_pages_requested: input.pages ?? 0, p_records_retrieved: input.retrieved ?? 0,
      p_unique_records_analyzed: input.analyzed ?? 0, p_error_code: input.errorCode ?? null,
      p_error_message: input.errorMessage ?? null, p_retry_after: input.retryAfter ?? null,
    }),
  });
}
