import { WorkspaceError } from "@/lib/ai-workspace/contracts";
import { apiError, noStoreJson, requireWorkspacePrincipal } from "@/lib/ai-workspace/http";

export const runtime = "nodejs";

export async function GET() {
  const requestId = crypto.randomUUID();
  try {
    const principal = await requireWorkspacePrincipal();
    const [{ data: balance, error: balanceError }, { data: account, error: accountError }] = await Promise.all([
      principal.service.rpc("aiw_balance", { p_owner: principal.ownerId }),
      principal.service.from("aiw_accounts").select("status,kind,plan_key,expires_at,billing_period_start,billing_period_end,entitlements")
        .eq("id", principal.ownerId).single(),
    ]);
    if (balanceError || accountError || !balance || !account) throw new WorkspaceError("SESSION_READ_FAILED", 503);
    return noStoreJson({
      session: {
        kind: principal.kind,
        ownerId: principal.ownerId,
        status: account.status,
        expiresAt: account.expires_at,
        planKey: account.plan_key,
        billingPeriodStart: account.billing_period_start,
        billingPeriodEnd: account.billing_period_end,
        entitlements: account.entitlements,
        balance,
      },
      requestId,
    });
  } catch (error) {
    return apiError(error, requestId);
  }
}
