import { WorkspaceError } from "@/lib/ai-workspace/contracts";
import { apiError, assertSameOrigin, enforceWorkspaceRateLimit, noStoreJson, readJson, requireWorkspacePrincipal } from "@/lib/ai-workspace/http";

export const runtime = "nodejs";
type Context = { params: Promise<{ memoryId: string }> };

export async function PATCH(request: Request, context: Context) {
  const requestId = crypto.randomUUID();
  try {
    assertSameOrigin(request);
    const { memoryId } = await context.params;
    const { ownerId, service } = await requireWorkspacePrincipal();
    await enforceWorkspaceRateLimit(service, `memory:update:${ownerId}`, 60);
    const body = await readJson<{ content?: unknown; kind?: unknown; status?: unknown }>(request, 14000);
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.content !== undefined) {
      const content = typeof body.content === "string" ? body.content.trim() : "";
      if (!content || content.length > 12000) throw new WorkspaceError("INVALID_MEMORY", 400);
      patch.content = content;
    }
    if (body.kind !== undefined) {
      const kind = typeof body.kind === "string" ? body.kind.trim() : "";
      if (!kind || kind.length > 80) throw new WorkspaceError("INVALID_MEMORY", 400);
      patch.kind = kind;
    }
    if (body.status !== undefined) {
      if (body.status !== "active" && body.status !== "archived") throw new WorkspaceError("INVALID_MEMORY", 400);
      patch.status = body.status;
    }
    if (Object.keys(patch).length === 1) throw new WorkspaceError("EMPTY_UPDATE", 400);
    const { data, error } = await service.from("aiw_memories").update(patch)
      .eq("id", memoryId).eq("owner_id", ownerId)
      .select("id,project_id,scope,kind,content,provenance,status,created_at,updated_at").maybeSingle();
    if (error) throw new WorkspaceError("MEMORY_UPDATE_FAILED", 503);
    if (!data) throw new WorkspaceError("NOT_FOUND", 404);
    return noStoreJson({ memory: data, requestId });
  } catch (error) {
    return apiError(error, requestId);
  }
}

export async function DELETE(request: Request, context: Context) {
  const requestId = crypto.randomUUID();
  try {
    assertSameOrigin(request);
    const { memoryId } = await context.params;
    const { ownerId, service } = await requireWorkspacePrincipal();
    await enforceWorkspaceRateLimit(service, `memory:delete:${ownerId}`, 60);
    const { data, error } = await service.from("aiw_memories").update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", memoryId).eq("owner_id", ownerId).select("id").maybeSingle();
    if (error) throw new WorkspaceError("MEMORY_DELETE_FAILED", 503);
    if (!data) throw new WorkspaceError("NOT_FOUND", 404);
    return noStoreJson({ archived: true, memoryId, requestId });
  } catch (error) {
    return apiError(error, requestId);
  }
}
