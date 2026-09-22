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

export async function syncAiWorkspaceBillingEvent(input: {
  userId: string;
  eventId: string;
  eventCreated: number;
  eventType: string;
  status: BillingStatus;
  subscriptionId: string;
  customerId: string;
  currentPeriodStart?: number | null;
  currentPeriodEnd?: number | null;
  cancelAtPeriodEnd?: boolean;
}) {
  const supabase = adminClient();
  const planKey = planForSubscriptionStatus(input.status);
  const toIso = (seconds: number | null | undefined) => typeof seconds === "number" ? new Date(seconds * 1000).toISOString() : null;
  const { data, error } = await supabase.rpc("aiw_sync_subscription_event", {
    p_user: input.userId,
    p_event_id: input.eventId,
    p_event_created: new Date(input.eventCreated * 1000).toISOString(),
    p_event_type: input.eventType,
    p_status: input.status,
    p_subscription: input.subscriptionId,
    p_customer: input.customerId,
    p_period_start: toIso(input.currentPeriodStart),
    p_period_end: toIso(input.currentPeriodEnd),
    p_cancel_at_end: Boolean(input.cancelAtPeriodEnd),
    p_plan_key: planKey,
  });
  if (error) throw new Error(`AI Workspace billing sync failed: ${error.message}`);
  return data;
}

export function planForSubscriptionStatus(status: BillingStatus): "pro" | "free" {
  // Keep access during Stripe's retry window; revoke only after terminal/non-pro states.
  return status === "active" || status === "trialing" || status === "past_due" ? "pro" : "free";
}
