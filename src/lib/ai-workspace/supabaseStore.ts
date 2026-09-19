import type { SupabaseClient } from "@supabase/supabase-js";
import { WorkspaceError, type Entitlements, type ModelConfiguration, type SkillVersion, type WorkspaceMessage } from "./contracts.ts";
import type { ExecutionSnapshot, ExecutionStore } from "./execution.ts";
import { createServiceClient } from "@/lib/supabase/admin";

function fail(error: unknown, code = "WORKSPACE_STORAGE_UNAVAILABLE", status = 503): never {
  console.error("AI Workspace storage failure", error);
  throw new WorkspaceError(code, status);
}

function asEntitlements(value: unknown): Entitlements {
  if (!value || typeof value !== "object") throw new WorkspaceError("INVALID_ENTITLEMENTS", 503);
  const v = value as Partial<Entitlements>;
  if (typeof v.enabled !== "boolean" || !Array.isArray(v.modes) || !Array.isArray(v.models)
    || !Array.isArray(v.tools) || !Number.isSafeInteger(v.maxOutputTokens)
    || !Number.isSafeInteger(v.maxContextTokens) || typeof v.maxRequestMicros !== "string") {
    throw new WorkspaceError("INVALID_ENTITLEMENTS", 503);
  }
  return v as Entitlements;
}

function asModel(value: unknown): ModelConfiguration | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Partial<ModelConfiguration>;
  if (typeof v.id !== "string" || v.provider !== "openai" || typeof v.enabled !== "boolean"
    || typeof v.inputRate !== "string" || typeof v.cachedInputRate !== "string" || typeof v.outputRate !== "string"
    || !Number.isSafeInteger(v.contextTokens) || !Number.isSafeInteger(v.maxOutputTokens)
    || typeof v.quality !== "number" || typeof v.latency !== "number" || !Array.isArray(v.reasoning)
    || typeof v.vision !== "boolean" || typeof v.tools !== "boolean" || typeof v.pricingVerifiedAt !== "string") return null;
  return v as ModelConfiguration;
}

export async function ensureRegisteredWorkspaceOwner(userId: string, client: SupabaseClient = createServiceClient()): Promise<string> {
  const { data, error } = await client.rpc("aiw_ensure_registered_account", { p_user: userId });
  if (error) fail(error, "WORKSPACE_ACCOUNT_PROVISION_FAILED");
  if (typeof data !== "string") throw new WorkspaceError("WORKSPACE_ACCOUNT_PROVISION_FAILED", 503);
  return data;
}

export function createSupabaseExecutionStore(options: {
  client?: SupabaseClient;
  deviceHash?: string | null;
} = {}): ExecutionStore {
  const client = options.client ?? createServiceClient();
  const deviceHash = options.deviceHash ?? null;

  async function reserveStage(input: Parameters<ExecutionStore["reserveStage"]>[0]) {
    const { data, error } = await client.rpc("aiw_reserve_stage", {
      p_owner: input.ownerId,
      p_project: input.projectId,
      p_conversation: input.conversationId,
      p_request: input.requestId,
      p_content: input.content,
      p_mode: input.mode,
      p_route: input.route,
      p_skill: input.skill,
      p_request_kind: input.requestKind,
      p_parent_request: input.parentRequestId ?? null,
      p_metadata: input.metadata ?? {},
      p_device_hash: deviceHash,
    });
    if (error) fail(error, "RESERVATION_FAILED");
    return data === true;
  }

  return {
    async load(ownerId, projectId, conversationId): Promise<ExecutionSnapshot> {
      const [accountResult, projectResult, conversationResult, messagesResult, skillsResult, modelsResult, preferencesResult, balanceResult] = await Promise.all([
        client.from("aiw_accounts").select("id,status,expires_at,entitlements").eq("id", ownerId).maybeSingle(),
        client.from("aiw_projects").select("id,owner_id,instructions,archived").eq("id", projectId).eq("owner_id", ownerId).maybeSingle(),
        client.from("aiw_conversations").select("id,owner_id,project_id,archived").eq("id", conversationId).eq("owner_id", ownerId).eq("project_id", projectId).maybeSingle(),
        client.from("aiw_messages").select("role,content,metadata,created_at").eq("owner_id", ownerId).eq("conversation_id", conversationId).order("created_at", { ascending: false }).limit(160),
        client.from("aiw_skills").select("id,version,owner_id,project_id,name,description,category,instructions,enabled,allowed_tools").eq("enabled", true),
        client.from("aiw_models").select("config"),
        client.from("aiw_account_preferences").select("custom_instructions").eq("owner_id", ownerId).maybeSingle(),
        client.rpc("aiw_balance", { p_owner: ownerId }),
      ]);

      for (const result of [accountResult, projectResult, conversationResult, messagesResult, skillsResult, modelsResult, preferencesResult, balanceResult]) {
        if (result.error) fail(result.error);
      }

      const account = accountResult.data as { id: string; status: string; expires_at: string | null; entitlements: unknown } | null;
      const project = projectResult.data as { id: string; owner_id: string; instructions: string; archived: boolean } | null;
      const conversation = conversationResult.data as { id: string; owner_id: string; project_id: string; archived: boolean } | null;
      if (!account || !project || !conversation || project.archived || conversation.archived) throw new WorkspaceError("NOT_FOUND", 404);
      if (account.status !== "active" || (account.expires_at && Date.parse(account.expires_at) <= Date.now())) {
        throw new WorkspaceError("ACCESS_DISABLED", 403);
      }

      const history = ((messagesResult.data ?? []) as Array<{ role: string; content: string; metadata?: Record<string, unknown> | null }>).reverse()
        .filter(row => row.metadata?.internal !== true)
        .filter((row): row is { role: "user" | "assistant"; content: string; metadata?: Record<string, unknown> | null } => row.role === "user" || row.role === "assistant")
        .slice(-120)
        .map(({ role, content }): WorkspaceMessage => ({ role, content }));

      const skills = ((skillsResult.data ?? []) as Array<Record<string, unknown>>)
        .filter(row => (row.owner_id == null || row.owner_id === ownerId) && (row.project_id == null || row.project_id === projectId))
        .map((row): SkillVersion => ({
          id: String(row.id), version: Number(row.version), name: String(row.name), description: String(row.description ?? ""),
          instructions: String(row.instructions ?? ""), ownerId: row.owner_id == null ? null : String(row.owner_id),
          projectId: row.project_id == null ? null : String(row.project_id), category: String(row.category ?? "general"),
          enabled: Boolean(row.enabled), allowedTools: Array.isArray(row.allowed_tools) ? row.allowed_tools.map(String) : [],
        }));

      const models = ((modelsResult.data ?? []) as Array<{ config: unknown }>).map(row => asModel(row.config)).filter((model): model is ModelConfiguration => Boolean(model));
      const balance = balanceResult.data as Record<string, unknown> | null;
      if (!balance || typeof balance.availableMicros !== "string") throw new WorkspaceError("INVALID_BALANCE", 503);

      return {
        ownerId,
        projectId,
        conversationId,
        projectInstructions: project.instructions ?? "",
        customInstructions: String((preferencesResult.data as { custom_instructions?: string } | null)?.custom_instructions ?? ""),
        history,
        skills,
        models,
        entitlements: asEntitlements(account.entitlements),
        availableMicros: balance.availableMicros,
      };
    },

    async reserve(input) {
      return reserveStage({ ...input, requestKind: "answer", parentRequestId: null, metadata: { promptProfile: "normal" } });
    },

    reserveStage,

    async markProviderStarted(ownerId, requestId, providerRequestId) {
      const { data, error } = await client.rpc("aiw_mark_provider_started", {
        p_owner: ownerId,
        p_request: requestId,
        p_provider_request: providerRequestId ?? null,
      });
      if (error) fail(error, "PROVIDER_START_PERSISTENCE_FAILED");
      return data === true;
    },

    async releaseUnstarted(ownerId, requestId, code) {
      const { data, error } = await client.rpc("aiw_release_unstarted", {
        p_owner: ownerId,
        p_request: requestId,
        p_code: code,
      });
      if (error) fail(error, "RESERVATION_RELEASE_FAILED");
      return data === true;
    },

    async settle(input) {
      const { data, error } = await client.rpc("aiw_settle", {
        p_owner: input.ownerId,
        p_request: input.requestId,
        p_content: input.content,
        p_usage: input.usage,
        p_provider_request: input.providerRequestId,
        p_incomplete: input.incomplete,
      });
      if (error) fail(error, "SETTLEMENT_FAILED");
      if (data !== true) throw new WorkspaceError("SETTLEMENT_FAILED", 503);

      const { data: ledger, error: ledgerError } = await client.from("aiw_ledger")
        .select("amount").eq("request_id", input.requestId).eq("owner_id", input.ownerId).single();
      if (ledgerError) fail(ledgerError, "SETTLEMENT_VERIFICATION_FAILED");
      if (BigInt(String((ledger as { amount: number | string }).amount)) !== -BigInt(input.actualMicros)) {
        throw new WorkspaceError("COST_ACCOUNTING_MISMATCH", 503);
      }
    },

    async markUncertain(ownerId, requestId, code, providerRequestId) {
      const { data, error } = await client.rpc("aiw_mark_uncertain", {
        p_owner: ownerId,
        p_request: requestId,
        p_code: code,
        p_provider_request: providerRequestId ?? null,
      });
      if (error) fail(error, "RECONCILIATION_FAILED");
      if (data !== true) throw new WorkspaceError("RECONCILIATION_FAILED", 503);
    },
  };
}
