import { createOpenAIProvider } from "@/lib/ai-workspace/openaiProvider";
import { executeWorkspaceRequest } from "@/lib/ai-workspace/execution";
import { createSupabaseExecutionStore } from "@/lib/ai-workspace/supabaseStore";
import { WorkspaceError, type WorkspaceMode } from "@/lib/ai-workspace/contracts";
import { apiError, assertSameOrigin, enforceWorkspaceRateLimit, readJson, requireRegisteredWorkspacePrincipal } from "@/lib/ai-workspace/http";

export const runtime = "nodejs";
export const maxDuration = 120;

function sse(event: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);
}

export async function POST(request: Request) {
  const correlationId = crypto.randomUUID();
  try {
    assertSameOrigin(request);
    const { ownerId, service } = await requireRegisteredWorkspacePrincipal();
    await enforceWorkspaceRateLimit(service, `chat:http:${ownerId}`, 30);
    const body = await readJson<{
      projectId?: unknown;
      conversationId?: unknown;
      requestId?: unknown;
      content?: unknown;
      mode?: unknown;
      skillId?: unknown;
    }>(request, 30000);

    const projectId = typeof body.projectId === "string" ? body.projectId : "";
    const conversationId = typeof body.conversationId === "string" ? body.conversationId : "";
    const requestId = typeof body.requestId === "string" ? body.requestId : crypto.randomUUID();
    const content = typeof body.content === "string" ? body.content : "";
    const mode = (body.mode ?? "auto") as WorkspaceMode;
    const skillId = typeof body.skillId === "string" ? body.skillId : undefined;
    if (!projectId || !conversationId || !content.trim() || !["auto", "fast", "best"].includes(mode)) {
      throw new WorkspaceError("INVALID_CHAT_REQUEST", 400);
    }

    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new WorkspaceError("PROVIDER_NOT_CONFIGURED", 503);
    const provider = createOpenAIProvider(key);
    const store = createSupabaseExecutionStore({ client: service });
    const controller = new AbortController();
    const abort = () => controller.abort();
    request.signal.addEventListener("abort", abort, { once: true });

    const stream = new ReadableStream<Uint8Array>({
      start(streamController) {
        void executeWorkspaceRequest({
          ownerId,
          projectId,
          conversationId,
          requestId,
          content,
          mode,
          skillId,
          signal: controller.signal,
        }, {
          store,
          provider,
          emit(event) {
            if (!controller.signal.aborted) streamController.enqueue(sse(event));
          },
        }).then(() => {
          request.signal.removeEventListener("abort", abort);
          streamController.close();
        }).catch((error: unknown) => {
          request.signal.removeEventListener("abort", abort);
          const known = error instanceof WorkspaceError;
          const code = known ? error.code : "EXECUTION_FAILED";
          console.error("AI Workspace execution error", { correlationId, requestId, code, error: known ? undefined : error });
          if (!controller.signal.aborted) {
            streamController.enqueue(sse({ type: "error", error: code, requestId, correlationId }));
            streamController.close();
          }
        });
      },
      cancel() {
        controller.abort();
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
        "X-Request-Id": correlationId,
      },
    });
  } catch (error) {
    return apiError(error, correlationId);
  }
}
