"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/adminAuth";
import { createServiceClient } from "@/lib/supabase/admin";

function dollars(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!/^\d{1,7}(?:\.\d{1,6})?$/.test(raw)) throw new Error("INVALID_USD_AMOUNT");
  const [whole, fraction = ""] = raw.split(".");
  return (BigInt(whole) * BigInt(1000000) + BigInt((fraction + "000000").slice(0, 6))).toString();
}

function positiveInt(value: unknown, min: number, max: number, code: string) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < min || number > max) throw new Error(code);
  return number;
}

export async function upsertAIPlanAction(form: FormData) {
  const authorization = await requireAdmin();
  if (authorization.status !== "admin") throw new Error("ADMIN_REQUIRED");
  const planKey = String(form.get("planKey") ?? "").trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9_-]{0,79}$/.test(planKey)) throw new Error("INVALID_PLAN_KEY");
  const active = String(form.get("active")) === "true";
  const periodCreditMicros = dollars(form.get("periodCreditUsd"));
  const dailyLimitMicros = dollars(form.get("dailyLimitUsd"));
  const monthlyLimitMicros = dollars(form.get("monthlyLimitUsd"));
  const maxRequestMicros = dollars(form.get("maxRequestUsd"));
  const maxOutputTokens = positiveInt(form.get("maxOutputTokens"), 256, 128000, "INVALID_OUTPUT_LIMIT");
  const maxContextTokens = positiveInt(form.get("maxContextTokens"), 1000, 272000, "INVALID_CONTEXT_LIMIT");
  const modes = form.getAll("modes").map(String).filter(value => ["auto", "fast", "best"].includes(value));
  const requestedModels = [...new Set(form.getAll("models").map(String).filter(Boolean))];
  if (!modes.length || !requestedModels.length) throw new Error("PLAN_ROUTE_REQUIRED");

  const service = createServiceClient();
  const { data: modelRows, error: modelError } = await service.from("aiw_models").select("id,config").in("id", requestedModels);
  if (modelError) throw new Error("MODEL_LOOKUP_FAILED");
  const models = (modelRows ?? []).filter(row => !row.id.startsWith("test-") && (row.config as { enabled?: boolean })?.enabled === true).map(row => row.id);
  if (models.length !== requestedModels.length) throw new Error("PLAN_MODEL_NOT_AVAILABLE");
  if (BigInt(dailyLimitMicros) > BigInt(monthlyLimitMicros)) throw new Error("DAILY_EXCEEDS_MONTHLY");
  if (BigInt(periodCreditMicros) < BigInt(monthlyLimitMicros)) throw new Error("CREDIT_BELOW_MONTHLY_LIMIT");

  const config = {
    periodCreditMicros,
    dailyLimitMicros,
    monthlyLimitMicros,
    entitlements: {
      enabled: active && BigInt(periodCreditMicros) > BigInt(0),
      modes,
      models,
      tools: [],
      maxOutputTokens,
      maxContextTokens,
      maxRequestMicros,
    },
  };
  const { error } = await service.from("aiw_plan_entitlements").upsert({
    plan_key: planKey,
    config,
    active,
    updated_by: authorization.user.id,
    updated_at: new Date().toISOString(),
  }, { onConflict: "plan_key" });
  if (error) throw new Error("PLAN_SAVE_FAILED");
  await service.from("aiw_audit").insert({
    actor_id: authorization.user.id,
    action: "plan_entitlement_updated",
    details: { planKey, active, periodCreditMicros, dailyLimitMicros, monthlyLimitMicros, modes, models, maxOutputTokens, maxContextTokens, maxRequestMicros },
  });
  revalidatePath("/admin/ai-workspace");
}
