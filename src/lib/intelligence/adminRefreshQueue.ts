import "server-only";

import { REFRESH_COOLDOWN_MINUTES } from "@/lib/intelligence/adminRefreshValidation";
import {
  buildCandidate,
  safeRefreshError,
  type RefreshCareerDefinition,
} from "@/lib/intelligence/refreshEngine";
import {
  createItem,
  createRun,
  intelligenceServiceFetch,
  updateItem,
  updateRun,
} from "@/lib/intelligence/snapshotRepository";
import type { SnapshotType } from "@/lib/intelligence/snapshotRegistry";

export async function queueAdminRefresh(input: {
  definition: RefreshCareerDefinition;
  countries: string[];
  types: SnapshotType[];
  sampleSize: number;
  actorUserId: string;
}) {
  const since = new Date(Date.now() - REFRESH_COOLDOWN_MINUTES * 60_000).toISOString();
  const active = await intelligenceServiceFetch<Array<{ id: string }>>(
    `intelligence_refresh_runs?status=in.(planned,running,completed,partial)&provider=eq.adzuna&started_at=gte.${encodeURIComponent(since)}&config_version=like.*${encodeURIComponent(input.definition.careerSlug)}*&select=id&limit=1`,
  );
  if (active.length) throw new Error("DUPLICATE_ACTIVE_REFRESH");

  const pageCalls = Math.ceil(input.sampleSize / 50);
  const planned = input.countries.length * input.types.reduce(
    (sum, type) => sum + pageCalls + (type === "salary" ? 2 : 0),
    0,
  );
  const maximum = Math.max(1, Number(process.env.ADZUNA_MAX_CALLS_PER_RUN) || 60);
  if (planned > maximum) throw new Error("REQUEST_BUDGET_EXCEEDED");

  const run = await createRun({
    refresh_type: input.types.length === 2 ? "all" : input.types[0],
    trigger_type: "manual",
    status: "planned",
    planned_calls: planned,
    config_version: `admin-${input.definition.careerSlug}-${input.definition.version}`,
    idempotency_key: `admin:${input.definition.careerSlug}:${crypto.randomUUID()}`,
    provider: "adzuna",
    requested_sample_size: input.sampleSize,
    triggered_by: input.actorUserId,
  });

  for (const country of input.countries) {
    for (const type of input.types) {
      await createItem({
        refresh_run_id: run.id,
        career_slug: input.definition.careerSlug,
        country_code: country,
        capability: type,
        status: "queued",
        provider: "adzuna",
        query_metadata: input.definition,
      });
    }
  }

  return { runId: run.id, plannedCalls: planned };
}

export async function processNextRefreshItem(runId: string) {
  const runs = await intelligenceServiceFetch<
    Array<{ id: string; requested_sample_size: number; idempotency_key: string }>
  >(`intelligence_refresh_runs?id=eq.${encodeURIComponent(runId)}&select=*&limit=1`);
  const run = runs[0];
  if (!run) throw new Error("RUN_NOT_FOUND");

  const claimed = await intelligenceServiceFetch<{
    id?: string;
    career_slug: string;
    country_code: string;
    capability: SnapshotType;
    query_metadata: RefreshCareerDefinition;
    attempt_count: number;
  }>("rpc/claim_next_intelligence_refresh_item", {
    method: "POST",
    body: JSON.stringify({ p_run_id: run.id }),
  });
  const item = claimed?.id ? claimed : null;
  if (!item) return finalizeRun(run.id);
  const itemId = item.id as string;

  const requestCount =
    Math.ceil(run.requested_sample_size / 50) + (item.capability === "salary" ? 2 : 0);
  try {
    const result = await buildCandidate(
      item.query_metadata,
      item.country_code,
      item.capability,
      run.requested_sample_size,
      run.id,
      `${run.idempotency_key}:${item.country_code}:${item.capability}`,
    );
    await updateItem(itemId, {
      status: "candidate",
      candidate_snapshot_id: result.candidateId,
      request_count: requestCount,
      pages_requested: result.pagesRequested,
      records_retrieved: result.recordsRetrieved,
      unique_records_analyzed: result.uniqueRecordsAnalyzed,
      completed_at: new Date().toISOString(),
    });
    return { status: "candidate", itemId, candidateId: result.candidateId };
  } catch (error) {
    const safe = safeRefreshError(error);
    const retryable =
      ["PROVIDER_RATE_LIMIT", "PROVIDER_TIMEOUT"].includes(safe.code) && item.attempt_count < 3;
    await updateItem(itemId, {
      status: retryable ? "retryable" : "failed",
      request_count: requestCount,
      error_code: safe.code,
      error_message: safe.message,
      retry_after: retryable ? new Date(Date.now() + 5 * 60_000).toISOString() : null,
      completed_at: new Date().toISOString(),
    });
    return { status: retryable ? "retryable" : "failed", itemId, errorCode: safe.code };
  }
}

async function finalizeRun(runId: string) {
  const items = await intelligenceServiceFetch<Array<{ status: string; request_count: number }>>(
    `intelligence_refresh_items?refresh_run_id=eq.${runId}&select=status,request_count`,
  );
  const pending = items.some((item) => ["queued", "running", "retryable"].includes(item.status));
  const failed = items.filter((item) => item.status === "failed").length;
  const candidates = items.filter((item) => item.status === "candidate").length;
  const completedCalls = items.reduce((sum, item) => sum + (item.request_count || 0), 0);
  const status = pending ? "pending" : failed ? (candidates ? "partial" : "failed") : "completed";

  if (!pending) {
    await updateRun(runId, {
      status,
      completed_calls: completedCalls,
      failed_calls: failed,
      completed_at: new Date().toISOString(),
    });
  }
  return { status, candidates, failed, completedCalls };
}
