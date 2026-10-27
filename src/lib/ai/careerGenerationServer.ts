import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { builtInCareerCandidates, canonicalizeCareerCandidates, exactCareerMatches, type CareerCandidate } from "@/lib/ai/careerDiscovery";

export type CareerGenerationStatus = "queued" | "running" | "review" | "failed";

export function dynamicCareerEngineEnabled() {
  return process.env.DYNAMIC_CAREER_ENGINE_ENABLED === "true";
}

export function careerGenerationLimit(plan: string) {
  const key = plan === "pro" ? "CAREER_GENERATION_MONTHLY_LIMIT_PRO" : "CAREER_GENERATION_MONTHLY_LIMIT_FREE";
  const parsed = Number(process.env[key] ?? (plan === "pro" ? 1 : 0));
  return Number.isInteger(parsed) ? Math.max(0, Math.min(50, parsed)) : 0;
}

export function createCareerGenerationAdminClient() {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)?.trim();
  const serviceKey = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY)?.trim();
  if (!url || !serviceKey) throw new Error("CAREER_GENERATION_DATABASE_NOT_CONFIGURED");
  return createSupabaseClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function findCareerCandidates() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("careers")
    .select("slug,title,taxonomy")
    .eq("status", "published");
  if (error) throw error;

  const published: CareerCandidate[] = (data ?? []).map((row) => {
    const taxonomy = row.taxonomy && typeof row.taxonomy === "object" ? row.taxonomy as Record<string, unknown> : {};
    const taxonomyAliases = Array.isArray(taxonomy.aliases) ? taxonomy.aliases.filter((value): value is string => typeof value === "string") : [];
    return { slug: row.slug, title: row.title, aliases: taxonomyAliases, href: `/careers/${row.slug}`, source: "published" };
  });

  return canonicalizeCareerCandidates([...published, ...builtInCareerCandidates()]);
}

export async function resolveExistingCareer(title: string) {
  const candidates = await findCareerCandidates();
  const matches = exactCareerMatches(title, candidates);
  if (matches.length === 1) return { candidate: matches[0], ambiguous: false, candidates };
  if (matches.length > 1) return { candidate: null, ambiguous: true, candidates: matches };
  return { candidate: null, ambiguous: false, candidates };
}

export async function enqueueCareerGeneration(userId: string, title: string, monthlyLimit: number) {
  const admin = createCareerGenerationAdminClient();
  const { data, error } = await admin.rpc("enqueue_career_generation", {
    p_user_id: userId,
    p_title: title,
    p_monthly_limit: monthlyLimit,
  });
  if (error) throw error;
  return data as { allowed: boolean; jobId?: string; requestId?: string; status?: CareerGenerationStatus; careerId?: string | null; used: number; limit: number; charged: boolean };
}

export async function getOwnedGenerationRequest(requestId: string, userId: string) {
  const admin = createCareerGenerationAdminClient();
  const { data: requestRow, error: requestError } = await admin.from("career_generation_requests")
    .select("id,job_id,created_at")
    .eq("id", requestId)
    .eq("user_id", userId)
    .maybeSingle();
  if (requestError || !requestRow) return null;

  const { data: job, error: jobError } = await admin.from("career_generation_jobs")
    .select("id,title,status,attempts,error_code,result_career_id,created_at,completed_at,usage_metadata")
    .eq("id", requestRow.job_id)
    .maybeSingle();
  if (jobError || !job) return null;

  let career: Record<string, unknown> | null = null;
  if (job.result_career_id) {
    const { data, error } = await admin.from("careers")
      .select("id,slug,title,short_title,summary,status,workspace_data,validation_errors,content_version")
      .eq("id", job.result_career_id)
      .maybeSingle();
    if (!error && data) career = data;
  }
  return { request: requestRow, job, career };
}

export async function getCareerMatch(title: string) {
  const { candidates } = await resolveExistingCareer(title);
  return exactCareerMatches(title, candidates);
}

