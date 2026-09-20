"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/adminAuth";
import { createServiceClient } from "@/lib/supabase/admin";
import { generateGuestCode } from "@/lib/ai-workspace/guestCredentials";

function adminOrThrow(result: Awaited<ReturnType<typeof requireAdmin>>) {
  if (result.status !== "admin") throw new Error("ADMIN_REQUIRED");
  return result;
}

function text(form: FormData, key: string, max: number) {
  const value = String(form.get(key) ?? "").trim();
  if (!value || value.length > max) throw new Error(`INVALID_${key.toUpperCase()}`);
  return value;
}

function int(form: FormData, key: string, min: number, max: number) {
  const value = Number(form.get(key));
  if (!Number.isSafeInteger(value) || value < min || value > max) throw new Error(`INVALID_${key.toUpperCase()}`);
  return value;
}

function usdMicros(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!/^\d{1,7}(?:\.\d{1,6})?$/.test(raw)) throw new Error("INVALID_USD_AMOUNT");
  const [whole, fraction = ""] = raw.split(".");
  return (BigInt(whole) * BigInt(1000000) + BigInt((fraction + "000000").slice(0, 6))).toString();
}

export async function createGuestCodeAction(form: FormData) {
  const admin = adminOrThrow(await requireAdmin());
  const service = createServiceClient();
  const label = text(form, "label", 160);
  const initialCredit = usdMicros(form.get("initialCreditUsd"));
  const dailyLimit = usdMicros(form.get("dailyLimitUsd"));
  const monthlyLimit = usdMicros(form.get("monthlyLimitUsd"));
  const maxRequestMicros = usdMicros(form.get("maxRequestUsd"));
  const deviceLimit = int(form, "deviceLimit", 1, 10);
  const maxActivations = int(form, "maxActivations", 1, 1000);
  const expiryDays = int(form, "expiryDays", 1, 365);
  const allowedModels = form.getAll("models").map(String).filter(Boolean);
  const modes = form.getAll("modes").map(String).filter(value => ["auto", "fast", "best"].includes(value));
  if (!allowedModels.length || !modes.length) throw new Error("MODELS_AND_MODES_REQUIRED");
  const { data: modelRows, error: modelError } = await service.from("aiw_models").select("id,config").in("id", allowedModels);
  if (modelError) throw new Error("MODEL_LOOKUP_FAILED");
  const enabledIds = (modelRows ?? []).filter(row => (row.config as { enabled?: boolean })?.enabled === true).map(row => row.id);
  if (enabledIds.length !== new Set(allowedModels).size) throw new Error("MODEL_NOT_AVAILABLE");

  const { code, hash } = generateGuestCode();
  const expiresAt = new Date(Date.now() + expiryDays * 86400000).toISOString();
  const entitlements = {
    enabled: BigInt(initialCredit) > BigInt(0),
    modes,
    models: enabledIds,
    tools: [],
    maxOutputTokens: 8192,
    maxContextTokens: 80000,
    maxRequestMicros,
  };
  const { error } = await service.from("aiw_guest_codes").insert({
    code_hash: hash,
    label,
    status: "active",
    expires_at: expiresAt,
    max_activations: maxActivations,
    device_limit: deviceLimit,
    initial_credit: initialCredit,
    daily_limit: dailyLimit,
    monthly_limit: monthlyLimit,
    entitlements,
    created_by: admin.user.id,
  });
  if (error) throw new Error("GUEST_CODE_CREATE_FAILED");
  await service.from("aiw_audit").insert({ actor_id: admin.user.id, action: "guest_code_created", details: { label, expiresAt, maxActivations, deviceLimit, initialCredit, dailyLimit, monthlyLimit, models: enabledIds, modes } });
  revalidatePath("/admin/ai-workspace");
  return { code };
}

export async function revokeGuestCodeAction(form: FormData) {
  const admin = adminOrThrow(await requireAdmin());
  const codeId = text(form, "codeId", 100);
  const reason = text(form, "reason", 500);
  const service = createServiceClient();
  const { data, error } = await service.rpc("aiw_admin_revoke_guest_code", { p_actor: admin.user.id, p_code: codeId, p_reason: reason });
  if (error || data !== true) throw new Error("GUEST_CODE_REVOKE_FAILED");
  revalidatePath("/admin/ai-workspace");
}

export async function revokeGuestDeviceAction(form: FormData) {
  const admin = adminOrThrow(await requireAdmin());
  const deviceId = text(form, "deviceId", 100);
  const reason = text(form, "reason", 500);
  const service = createServiceClient();
  const { data, error } = await service.rpc("aiw_admin_revoke_guest_device", { p_actor: admin.user.id, p_device: deviceId, p_reason: reason });
  if (error || data !== true) throw new Error("GUEST_DEVICE_REVOKE_FAILED");
  revalidatePath("/admin/ai-workspace");
}

export async function adjustCreditAction(form: FormData) {
  const admin = adminOrThrow(await requireAdmin());
  const ownerId = text(form, "ownerId", 100);
  const reason = text(form, "reason", 500);
  const sign = String(form.get("direction")) === "debit" ? BigInt(-1) : BigInt(1);
  const amount = BigInt(usdMicros(form.get("amountUsd"))) * sign;
  if (amount === BigInt(0)) throw new Error("ZERO_ADJUSTMENT");
  const service = createServiceClient();
  const { error } = await service.rpc("aiw_admin_credit", { p_actor: admin.user.id, p_owner: ownerId, p_amount: amount.toString(), p_reason: reason });
  if (error) throw new Error("CREDIT_ADJUST_FAILED");
  revalidatePath("/admin/ai-workspace");
}

export async function reconcileUncertainAction(form: FormData) {
  const admin = adminOrThrow(await requireAdmin());
  const ownerId = text(form, "ownerId", 100);
  const requestId = text(form, "requestId", 100);
  const reason = text(form, "reason", 500);
  if (reason.length < 8) throw new Error("RECONCILIATION_REASON_TOO_SHORT");
  const service = createServiceClient();
  const { data, error } = await service.rpc("aiw_admin_release_uncertain", { p_actor: admin.user.id, p_owner: ownerId, p_request: requestId, p_reason: reason });
  if (error || data !== true) throw new Error("RECONCILIATION_FAILED");
  revalidatePath("/admin/ai-workspace");
}

export async function setModelEnabledAction(form: FormData) {
  const admin = adminOrThrow(await requireAdmin());
  const modelId = text(form, "modelId", 150);
  const enabled = String(form.get("enabled")) === "true";
  if (modelId.startsWith("test-")) throw new Error("TEST_MODEL_CANNOT_BE_ENABLED");
  const service = createServiceClient();
  const { data: row, error } = await service.from("aiw_models").select("config").eq("id", modelId).maybeSingle();
  if (error || !row) throw new Error("MODEL_NOT_FOUND");
  const config = { ...(row.config as Record<string, unknown>), enabled };
  const { error: updateError } = await service.from("aiw_models").update({ config, updated_at: new Date().toISOString() }).eq("id", modelId);
  if (updateError) throw new Error("MODEL_UPDATE_FAILED");
  await service.from("aiw_audit").insert({ actor_id: admin.user.id, action: "model_status_changed", details: { modelId, enabled } });
  revalidatePath("/admin/ai-workspace");
}
