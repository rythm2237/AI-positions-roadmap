import "server-only";
import { assembleCareerWorkspace } from "@/lib/ai/careerBlueprintAssembler";
import { generateCareerBlueprintWithUsage } from "@/lib/ai/careerGenerator";
import { careerSlugForTitle } from "@/lib/ai/careerDiscovery";
import { createCareerGenerationAdminClient } from "@/lib/ai/careerGenerationServer";
import { resolveExistingResources, type RegistryResource } from "@/lib/ai/careerResourceResolution";
import { adaptCareerWorkspaceLearningContract } from "@/lib/learning/adaptiveLearningContract";
import { validateCareerWorkspaceData } from "@/lib/careerContentValidation";

function safeUsageMetadata(usages: Array<{ model: string | null; inputTokens: number | null; outputTokens: number | null; totalTokens: number | null }>) {
  const inputTokens = usages.reduce((sum, item) => sum + (item.inputTokens ?? 0), 0);
  const outputTokens = usages.reduce((sum, item) => sum + (item.outputTokens ?? 0), 0);
  const totalTokens = usages.reduce((sum, item) => sum + (item.totalTokens ?? 0), 0);
  const rate = Number(process.env.CAREER_GENERATION_COST_PER_1K_TOKENS_USD);
  return {
    models: [...new Set(usages.map((item) => item.model).filter((item): item is string => Boolean(item)))],
    inputTokens,
    outputTokens,
    totalTokens,
    estimatedCostUsd: Number.isFinite(rate) && rate >= 0 ? Number((totalTokens / 1000 * rate).toFixed(6)) : null,
    costBasis: Number.isFinite(rate) && rate >= 0 ? "configured-blended-token-rate" : "not-configured",
  };
}

async function loadReusableCatalog(): Promise<RegistryResource[]> {
  const admin = createCareerGenerationAdminClient();
  const { data, error } = await admin.from("learning_resources")
    .select("id,canonical_url,mode,title,provider,content_type,cost,is_official,direct_destination_verified,status,verified_at,next_review_at,source_metadata")
    .eq("status", "active")
    .eq("direct_destination_verified", true)
    .not("verified_at", "is", null)
    .or(`next_review_at.is.null,next_review_at.gte.${new Date().toISOString()}`)
    .limit(1500);
  if (error) throw error;
  return (data ?? []) as RegistryResource[];
}

export async function processOneCareerGenerationJob() {
  const admin = createCareerGenerationAdminClient();
  const { data: claimed, error: claimError } = await admin.rpc("claim_career_generation_job");
  if (claimError) throw claimError;
  const job = Array.isArray(claimed) ? claimed[0] as { id: string; title: string; attempts: number } | undefined : undefined;
  if (!job) return { processed: false as const };

  try {
    const { blueprint, usage } = await generateCareerBlueprintWithUsage(job.title);
    const slug = careerSlugForTitle(job.title);
    if (!slug || slug.length > 120) throw new Error("CAREER_SLUG_INVALID");
    let workspace = adaptCareerWorkspaceLearningContract(assembleCareerWorkspace({ ...blueprint, title: job.title }, slug));

    const catalog = await loadReusableCatalog();
    const resolved = resolveExistingResources(workspace, catalog);
    workspace = resolved.workspace;
    const validation = validateCareerWorkspaceData(workspace, slug);
    if (!validation.valid) throw new Error("CAREER_BLUEPRINT_VALIDATION_FAILED");

    const adminClient = createCareerGenerationAdminClient();
    const { data: completed, error: completeError } = await adminClient.rpc("complete_career_generation", {
      p_job_id: job.id,
      p_slug: slug,
      p_title: job.title,
      p_short_title: blueprint.shortTitle,
      p_summary: blueprint.summary,
      p_taxonomy: { primaryTitle: blueprint.title, aliases: blueprint.aliases },
      p_workspace_data: validation.data,
      p_validation_errors: [],
      p_usage_metadata: {
        ...safeUsageMetadata(usage),
        resourceReuseCount: resolved.resourceReuseCount,
        resourceAssignmentCount: resolved.assignments.length,
        resourceReuseRate: resolved.assignments.length ? Number((resolved.assignments.length / Math.max(1, workspace.resourceRequirements?.length ?? 1)).toFixed(3)) : 0,
        queueAttempts: job.attempts,
      },
      p_resource_mappings: resolved.assignments,
    });
    if (completeError) throw completeError;
    return {
      processed: true as const,
      jobId: job.id,
      status: "review" as const,
      careerId: (completed as { careerId?: string } | null)?.careerId ?? null,
      reusedResourceCount: resolved.resourceReuseCount,
      usage: safeUsageMetadata(usage),
    };
  } catch (error) {
    const errorCode = error instanceof Error ? error.message.slice(0, 120) : "CAREER_GENERATION_FAILED";
    const nextStatus = job.attempts >= 3 ? "failed" : "queued";
    const { error: updateError } = await admin.from("career_generation_jobs")
      .update({ status: nextStatus, error_code: errorCode, updated_at: new Date().toISOString(), ...(nextStatus === "failed" ? { completed_at: new Date().toISOString() } : {}) })
      .eq("id", job.id)
      .eq("status", "running");
    if (updateError) console.error("Career generation job status update failed", updateError);
    console.error(JSON.stringify({ level: "error", feature: "career-generation", jobId: job.id, attempt: job.attempts, errorCode }));
    return { processed: true as const, jobId: job.id, status: nextStatus, errorCode };
  }
}
