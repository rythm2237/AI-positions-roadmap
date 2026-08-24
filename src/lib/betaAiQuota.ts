import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export type BetaAiQuotaKind = "project_review" | "interview_review";

export type BetaAiQuotaResult = {
  allowed: boolean;
  used: number;
  limit: number;
};

function adminClient() {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)?.trim();
  const secret = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !secret) throw new Error("Supabase admin configuration is incomplete.");
  return createSupabaseClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
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
  const { data, error } = await supabase.rpc("consume_beta_ai_quota", {
    p_user_id: userId,
    p_kind: kind,
    p_limit: limit,
  });
  if (error) throw new Error(`AI usage quota could not be checked: ${error.message}`);

  const row = Array.isArray(data) ? data[0] : data;
  return {
    allowed: Boolean(row?.allowed),
    used: Number(row?.used ?? 0),
    limit: Number(row?.quota_limit ?? limit),
  };
}
