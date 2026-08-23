import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export type BillingStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "unpaid"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "paused"
  | "unknown";

function adminClient() {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)?.trim();
  const secret = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !secret) throw new Error("Supabase admin configuration is incomplete.");
  return createSupabaseClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function updateBillingMetadata(
  userId: string,
  patch: Record<string, string | number | boolean | null>,
): Promise<void> {
  const supabase = adminClient();
  const current = await supabase.auth.admin.getUserById(userId);
  if (current.error || !current.data.user) {
    throw new Error(current.error?.message ?? "Billing user could not be loaded.");
  }

  const appMetadata = { ...(current.data.user.app_metadata ?? {}), ...patch };
  const updated = await supabase.auth.admin.updateUserById(userId, { app_metadata: appMetadata });
  if (updated.error) throw new Error(updated.error.message);
}

export function planForSubscriptionStatus(status: BillingStatus): "pro" | "free" {
  // Keep access during Stripe's retry window; revoke only after terminal/non-pro states.
  return status === "active" || status === "trialing" || status === "past_due" ? "pro" : "free";
}
