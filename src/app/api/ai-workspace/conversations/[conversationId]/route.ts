import { WorkspaceError } from "@/lib/ai-workspace/contracts";
import { apiError, assertSameOrigin, noStoreJson, readJson, requireRegisteredWorkspacePrincipal } from "@/lib/ai-workspace/http";

export const runtime = "nodejs";
type Context = { params: Promise<{ conversationId: string }> };

export async function PATCH(request: Request, context: Context) {
  const requestId = crypto.randomUUID();
  try {
    assertSameOrigin(request);
    const { conversationId } = await context.params;
    const { ownerId, service } = await requireRegisteredWorkspacePrincipal();
    const body = await readJson<{ title?: unknown; archived?: unknown; pinned?: unknown }>(request, 4096);
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.title !== undefined) {
      if (typeof body.title !== "string" || !body.title.trim() || body.title.trim().length > 160) throw new WorkspaceError("INVALID_CONVERSATION", 400);
      patch.title = body.title.trim();
    }
    if (body.archived !== undefined) {
      if (typeof body.archived !== "boolean") throw new WorkspaceError("INVALID_CONVERSATION", 400);
      patch.archived = body.archived;
    }
    if (body.pinned !== undefined) {
      if (typeof body.pinned !== "boolean") throw new WorkspaceError("INVALID_CONVERSATION", 400);
      patch.pinned = body.pinned;
    }
    if (Object.keys(patch).length === 1) throw new WorkspaceError("EMPTY_UPDATE", 400);
    const { data, error } = await service.from("aiw_conversations").update(patch)
      .eq("id", conversationId).eq("owner_id", ownerId)
      .select("id,project_id,title,archived,pinned,created_at,updated_at").maybeSingle();
    if (error) throw new WorkspaceError("CONVERSATION_UPDATE_FAILED", 503);
    if (!data) throw new WorkspaceError("NOT_FOUND", 404);
    return noStoreJson({ conversation: data, requestId });
  } catch (error) {
    return apiError(error, requestId);
  }
}

export async function DELETE(request: Request, context: Context) {
  const requestId = crypto.randomUUID();
  try {
    assertSameOrigin(request);
    const { conversationId } = await context.params;
    const { ownerId, service } = await requireRegisteredWorkspacePrincipal();
    // Preserve messages/ledger references; deletion is a soft archive by policy.
    const { data, error } = await service.from("aiw_conversations")
      .update({ archived: true, updated_at: new Date().toISOString() })
      .eq("id", conversationId).eq("owner_id", ownerId).select("id").maybeSingle();
    if (error) throw new WorkspaceError("CONVERSATION_ARCHIVE_FAILED", 503);
    if (!data) throw new WorkspaceError("NOT_FOUND", 404);
    return noStoreJson({ archived: true, conversationId, requestId });
  } catch (error) {
    return apiError(error, requestId);
  }
}
