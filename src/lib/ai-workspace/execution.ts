import { WorkspaceError, type Entitlements, type ExecutionRoute, type ModelConfiguration, type ProviderUsage, type SkillVersion, type WorkspaceMessage, type WorkspaceMode, type WorkspaceRequestKind } from "./contracts.ts";
import { buildContext, selectSkill } from "./context.ts";
import { costForUsage, micros } from "./money.ts";
import { chooseRoute, classifyIntent } from "./routing.ts";

export interface ExecutionSnapshot {
  ownerId: string;
  projectId: string;
  conversationId: string;
  projectInstructions: string;
  customInstructions: string;
  history: WorkspaceMessage[];
  skills: SkillVersion[];
  models: ModelConfiguration[];
  entitlements: Entitlements;
  availableMicros: string;
}

export interface RetrievedKnowledge {
  id: string;
  text: string;
  sourceType: "file" | "memory";
  fileId: string | null;
}

export interface ExecutionStore {
  /** Authenticate externally; verify ownership and active device before returning data. */
  load(ownerId: string, projectId: string, conversationId: string): Promise<ExecutionSnapshot>;
  /** Retrieve only owner/project-scoped reference data. Returned text is untrusted context, never authorization. */
  retrieveKnowledge(ownerId: string, projectId: string, query: string): Promise<RetrievedKnowledge[]>;
  /** Normal visible answer reservation. */
  reserve(input: { ownerId: string; projectId: string; conversationId: string; requestId: string;
    content: string; route: ExecutionRoute; skill: SkillVersion | null; mode: WorkspaceMode }): Promise<boolean>;
  /** Stage-aware reservation used by multi-stage workflows such as Professional prompt enhancement. */
  reserveStage(input: { ownerId: string; projectId: string; conversationId: string; requestId: string;
    content: string; route: ExecutionRoute; skill: SkillVersion | null; mode: WorkspaceMode;
    requestKind: WorkspaceRequestKind; parentRequestId?: string | null; metadata?: Record<string, unknown> }): Promise<boolean>;
  /** Persist the fact that provider execution is about to begin before starting network execution. */
  markProviderStarted(ownerId: string, requestId: string, providerRequestId?: string): Promise<boolean>;
  /** Release only a reservation that is still provably pre-provider. */
  releaseUnstarted(ownerId: string, requestId: string, code: string): Promise<boolean>;
  /** MUST atomically append ledger, persist assistant output, and release unused reservation. */
  settle(input: { ownerId: string; requestId: string; content: string; usage: ProviderUsage;
    actualMicros: string; providerRequestId: string; incomplete: boolean }): Promise<void>;
  /** Unknown provider usage retains the reservation; never silently refunds a possibly billed request. */
  markUncertain(ownerId: string, requestId: string, code: string, providerRequestId?: string): Promise<void>;
}

export type ProviderEvent = { type: "text"; delta: string }
  | { type: "complete"; usage: ProviderUsage; providerRequestId: string; incomplete: boolean };

export interface WorkspaceProvider {
  stream(input: { route: ExecutionRoute; context: ReturnType<typeof buildContext>; requestId: string; signal: AbortSignal }): AsyncIterable<ProviderEvent>;
}

function publicKnowledgeSources(items: RetrievedKnowledge[]) {
  return items.map(({ id, sourceType, fileId }) => ({ id, sourceType, fileId }));
}

export async function executeWorkspaceRequest(input: {
  ownerId: string; projectId: string; conversationId: string; requestId: string;
  content: string; mode: WorkspaceMode; skillId?: string; signal: AbortSignal;
}, dependencies: {
  store: ExecutionStore; provider: WorkspaceProvider;
  emit: (event: { type: string; [key: string]: unknown }) => void;
}) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.requestId)) {
    throw new WorkspaceError("INVALID_REQUEST_ID");
  }
  if (input.signal.aborted) throw new WorkspaceError("CANCELLED", 499);
  if (typeof input.content !== "string" || !input.content.trim() || input.content.length > 24000) throw new WorkspaceError("INVALID_MESSAGE");
  const snapshot = await dependencies.store.load(input.ownerId, input.projectId, input.conversationId);
  if (snapshot.ownerId !== input.ownerId || snapshot.projectId !== input.projectId
    || snapshot.conversationId !== input.conversationId) throw new WorkspaceError("NOT_FOUND", 404);
  const intent = classifyIntent(input.content);
  const skill = selectSkill(snapshot.skills, intent.category, input.ownerId, input.projectId, input.skillId);
  const knowledge = await dependencies.store.retrieveKnowledge(input.ownerId, input.projectId, input.content);
  const context = buildContext({ projectInstructions: snapshot.projectInstructions, customInstructions: snapshot.customInstructions,
    skill, history: snapshot.history, currentMessage: input.content, maxInputTokens: snapshot.entitlements.maxContextTokens,
    knowledge: knowledge.map(item => ({ id: item.id, text: item.text })) });
  const route = chooseRoute({ intent, mode: input.mode, models: snapshot.models, entitlements: snapshot.entitlements,
    inputTokenBound: context.inputTokenBound, availableMicros: snapshot.availableMicros });
  const reserved = await dependencies.store.reserve({ ...input, route, skill });
  if (!reserved) throw new WorkspaceError("REQUEST_ALREADY_EXISTS_OR_LIMIT_REACHED", 409);

  if (input.signal.aborted) {
    await dependencies.store.releaseUnstarted(input.ownerId, input.requestId, "CLIENT_CANCELLED_PRE_PROVIDER");
    throw new WorkspaceError("CANCELLED", 499);
  }

  let started = false;
  try {
    started = await dependencies.store.markProviderStarted(input.ownerId, input.requestId);
  } catch (error) {
    await dependencies.store.releaseUnstarted(input.ownerId, input.requestId, "PROVIDER_START_PERSISTENCE_FAILED").catch(() => false);
    throw error;
  }
  if (!started) {
    await dependencies.store.releaseUnstarted(input.ownerId, input.requestId, "PROVIDER_START_REJECTED").catch(() => false);
    throw new WorkspaceError("REQUEST_STATE_CHANGED", 409);
  }

  let content = "";
  let complete: Extract<ProviderEvent, { type: "complete" }> | undefined;
  let providerRequestId: string | undefined;
  try {
    dependencies.emit({ type: "route", mode: input.mode, promptProfile: "normal", skill: skill ? { name: skill.name, version: skill.version } : null,
      historyTruncated: context.historyTruncated, currentInformationVerified: false, requestId: input.requestId });
    if (knowledge.length) dependencies.emit({ type: "knowledge", sources: publicKnowledgeSources(knowledge), requestId: input.requestId });
    for await (const event of dependencies.provider.stream({ route, context, requestId: input.requestId, signal: input.signal })) {
      if (event.type === "text") {
        if (complete) throw new WorkspaceError("INVALID_PROVIDER_STREAM", 502);
        content += event.delta;
        if (content.length > 500000) throw new WorkspaceError("PROVIDER_OUTPUT_LIMIT", 502);
        dependencies.emit(event);
      } else {
        if (complete) throw new WorkspaceError("INVALID_PROVIDER_STREAM", 502);
        complete = event;
        providerRequestId = event.providerRequestId;
      }
    }
    if (!complete) throw new WorkspaceError("PROVIDER_USAGE_UNKNOWN", 502);
    const actualMicros = costForUsage(route.model, complete.usage);
    if (micros(actualMicros) > micros(route.reservationMicros)) throw new WorkspaceError("COST_BOUND_EXCEEDED", 502);
    await dependencies.store.settle({ ownerId: input.ownerId, requestId: input.requestId, content,
      usage: complete.usage, actualMicros, providerRequestId: complete.providerRequestId, incomplete: complete.incomplete });
  } catch (error) {
    await dependencies.store.markUncertain(input.ownerId, input.requestId,
      error instanceof WorkspaceError ? error.code : "EXECUTION_INTERRUPTED", providerRequestId);
    throw error;
  }
  dependencies.emit({ type: "done", requestId: input.requestId, promptProfile: "normal", incomplete: complete.incomplete });
}
