import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export type BetaAiQuotaKind = "project_review" | "interview_review";

export class BetaAiQuotaError extends Error {
  constructor(public readonly code: string) {
    super("The site's AI usage service is unavailable. Your draft is preserved.");
    this.name = "BetaAiQuotaError";
  }
}

function quotaError(code?: string): BetaAiQuotaError {
  return new BetaAiQuotaError(code === "42501" ? "AI_QUOTA_ACCESS_DENIED" : code === "PGRST202" ? "AI_QUOTA_FUNCTION_MISSING" : code === "PGRST301" || code === "PGRST303" ? "AI_QUOTA_AUTH_FAILED" : "AI_QUOTA_DATABASE_UNAVAILABLE");
}

export type BetaAiQuotaResult = {
  allowed: boolean;
  used: number;
  limit: number;
  usageDate?: string;
};

function adminClient() {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)?.trim();
  const secret = process.env.SUPABASE_SECRET_KEY?.trim() || process.env.SUPABASE_SERVICE_KEY?.trim();
  if (!url || !secret) throw new BetaAiQuotaError("AI_QUOTA_CONFIG_MISSING");
  return createSupabaseClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Reads zero rows: validates the server connection without consuming quota or returning user data.
export async function checkBetaAiQuotaConfiguration(): Promise<{ready:boolean;code?:string}> {
  try {
    const {error} = await adminClient().from("beta_ai_usage_daily").select("usage_date").limit(0);
    if (error) return {ready:false,code:quotaError(error.code).code};
    return {ready:true};
  } catch (error) {
    return {ready:false,code:error instanceof BetaAiQuotaError ? error.code : "AI_QUOTA_DATABASE_UNAVAILABLE"};
  }
}

function dailyLimit(kind: BetaAiQuotaKind): number {
  const raw = kind === "project_review"
    ? process.env.BETA_PROJECT_REVIEW_DAILY_LIMIT
    : process.env.BETA_INTERVIEW_REVIEW_DAILY_LIMIT;
  const fallback = 10;
  const parsed = Number(raw ?? fallback);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(100, Math.floor(parsed)));
}

export async function consumeBetaAiQuota(userId: string, kind: BetaAiQuotaKind): Promise<BetaAiQuotaResult> {
  if (process.env.NEXT_PUBLIC_ROLE_PATH_BILLING_ENABLED === "true") {
    return { allowed: true, used: 0, limit: dailyLimit(kind) };
  }

  const limit = dailyLimit(kind);
  const supabase = adminClient();
  const usageDate = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase.rpc("consume_beta_ai_quota", {
    p_user_id: userId,
    p_kind: kind,
    p_limit: limit,
  });
  if (error) throw quotaError(error.code);

  const row = Array.isArray(data) ? data[0] : data;
  return {
    // Omit the date across midnight rather than risk refunding another day.
    usageDate: usageDate === new Date().toISOString().slice(0, 10) ? usageDate : undefined,
    allowed: Boolean(row?.allowed),
    used: Number(row?.used ?? 0),
    limit: Number(row?.quota_limit ?? limit),
  };
}

export async function refundRejectedBetaAiQuota(userId: string, kind: BetaAiQuotaKind, usageDate: string, requestId: string): Promise<void> {
  if (process.env.NEXT_PUBLIC_ROLE_PATH_BILLING_ENABLED === "true") return;
  const { data, error } = await adminClient().rpc("refund_rejected_beta_ai_quota", {p_user_id:userId,p_kind:kind,p_usage_date:usageDate,p_request_id:requestId});
  if (error || data !== true) throw new Error("Rejected AI request quota could not be refunded.");
}
