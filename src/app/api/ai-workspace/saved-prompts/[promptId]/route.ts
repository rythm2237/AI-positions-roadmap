import { WorkspaceError } from "@/lib/ai-workspace/contracts";
import { apiError, assertSameOrigin, noStoreJson, readJson, requireRegisteredWorkspacePrincipal } from "@/lib/ai-workspace/http";

export const runtime = "nodejs";
type Context = { params: Promise<{ promptId: string }> };

export async function PATCH(request: Request, context: Context) {
  const requestId = crypto.randomUUID();
  try {
    assertSameOrigin(request);
    const { promptId } = await context.params;
    const { ownerId, service } = await requireRegisteredWorkspacePrincipal();
    const body = await readJson<{ name?: unknown; content?: unknown; archived?: unknown }>(request, 26000);
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.name !== undefined) {
      if (typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 160) throw new WorkspaceError("INVALID_SAVED_PROMPT", 400);
      patch.name = body.name.trim();
    }
    if (body.content !== undefined) {
      if (typeof body.content !== "string" || !body.content.trim() || body.content.trim().length > 24000) throw new WorkspaceError("INVALID_SAVED_PROMPT", 400);
      patch.content = body.content.trim();
    }
    if (body.archived !== undefined) {
      if (typeof body.archived !== "boolean") throw new WorkspaceError("INVALID_SAVED_PROMPT", 400);
      patch.archived = body.archived;
    }
    if (Object.keys(patch).length === 1) throw new WorkspaceError("EMPTY_UPDATE", 400);
    const { data: prompt, error } = await service.from("aiw_saved_prompts").update(patch)
      .eq("id", promptId).eq("owner_id", ownerId)
      .select("id,project_id,name,content,archived,created_at,updated_at").maybeSingle();
    if (error) throw new WorkspaceError("SAVED_PROMPT_UPDATE_FAILED", 503);
    if (!prompt) throw new WorkspaceError("NOT_FOUND", 404);
    return noStoreJson({ prompt, requestId });
  } catch (error) {
    return apiError(error, requestId);
  }
}

export async function DELETE(request: Request, context: Context) {
  const requestId = crypto.randomUUID();
  try {
    assertSameOrigin(request);
    const { promptId } = await context.params;
    const { ownerId, service } = await requireRegisteredWorkspacePrincipal();
    const { data, error } = await service.from("aiw_saved_prompts")
      .delete().eq("id", promptId).eq("owner_id", ownerId).select("id").maybeSingle();
    if (error) throw new WorkspaceError("SAVED_PROMPT_DELETE_FAILED", 503);
    if (!data) throw new WorkspaceError("NOT_FOUND", 404);
    return noStoreJson({ deleted: true, promptId, requestId });
  } catch (error) {
    return apiError(error, requestId);
  }
}
