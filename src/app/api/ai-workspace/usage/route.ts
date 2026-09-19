import { WorkspaceError } from "@/lib/ai-workspace/contracts";
import { apiError, noStoreJson, requireRegisteredWorkspacePrincipal } from "@/lib/ai-workspace/http";

export const runtime = "nodejs";

export async function GET() {
  const requestId = crypto.randomUUID();
  try {
    const { ownerId, service } = await requireRegisteredWorkspacePrincipal();
    const [{ data: balance, error: balanceError }, { data: account, error: accountError }] = await Promise.all([
      service.rpc("aiw_balance", { p_owner: ownerId }),
      service.from("aiw_accounts").select("status,plan_key,daily_limit,monthly_limit,billing_period_start,billing_period_end,entitlements")
        .eq("id", ownerId).single(),
    ]);
    if (balanceError || accountError || !balance || !account) throw new WorkspaceError("USAGE_READ_FAILED", 503);

    const monthStart = account.billing_period_start || new Date(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1).toISOString();
    const { data: dailyRows, error: dailyError } = await service.from("aiw_ledger")
      .select("amount,kind,created_at").eq("owner_id", ownerId).eq("kind", "usage")
      .gte("created_at", monthStart).order("created_at", { ascending: true }).limit(5000);
    if (dailyError) throw new WorkspaceError("USAGE_READ_FAILED", 503);

    const byDay = new Map<string, bigint>();
    for (const row of dailyRows ?? []) {
      const day = String(row.created_at).slice(0, 10);
      const amount = BigInt(String(row.amount));
      byDay.set(day, (byDay.get(day) ?? 0n) + (amount < 0n ? -amount : 0n));
    }

    return noStoreJson({
      usage: {
        ...balance,
        status: account.status,
        planKey: account.plan_key,
        billingPeriodStart: account.billing_period_start,
        billingPeriodEnd: account.billing_period_end,
        days: Array.from(byDay, ([date, usedMicros]) => ({ date, usedMicros: usedMicros.toString() })),
      },
      requestId,
    });
  } catch (error) {
    return apiError(error, requestId);
  }
}
