import { WorkspaceError } from "@/lib/ai-workspace/contracts";
import { apiError, assertSameOrigin, noStoreJson, readJson, requireRegisteredWorkspacePrincipal } from "@/lib/ai-workspace/http";

export const runtime = "nodejs";

type Context = { params: Promise<{ projectId: string }> };

export async function PATCH(request: Request, context: Context) {
  const requestId = crypto.randomUUID();
  try {
    assertSameOrigin(request);
    const { projectId } = await context.params;
    const { ownerId, service } = await requireRegisteredWorkspacePrincipal();
    const body = await readJson<{ name?: unknown; description?: unknown; instructions?: unknown; archived?: unknown }>(request, 20000);

    const { data: current, error: currentError } = await service.from("aiw_projects")
      .select("id,name,description,instructions,archived").eq("id", projectId).eq("owner_id", ownerId).maybeSingle();
    if (currentError) throw new WorkspaceError("PROJECT_READ_FAILED", 503);
    if (!current) throw new WorkspaceError("NOT_FOUND", 404);

    const patch: Record<string, unknown> = {};
    if (body.name !== undefined) {
      if (typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 120) throw new WorkspaceError("INVALID_PROJECT", 400);
      patch.name = body.name.trim();
    }
    if (body.description !== undefined) {
      if (typeof body.description !== "string" || body.description.length > 2000) throw new WorkspaceError("INVALID_PROJECT", 400);
      patch.description = body.description.trim();
    }
    let newInstructions: string | null = null;
    if (body.instructions !== undefined) {
      if (typeof body.instructions !== "string" || body.instructions.length > 12000) throw new WorkspaceError("INVALID_PROJECT", 400);
      newInstructions = body.instructions.trim();
      patch.instructions = newInstructions;
    }
    if (body.archived !== undefined) {
      if (typeof body.archived !== "boolean") throw new WorkspaceError("INVALID_PROJECT", 400);
      patch.archived = body.archived;
    }
    if (!Object.keys(patch).length) throw new WorkspaceError("EMPTY_UPDATE", 400);

    if (newInstructions !== null && newInstructions !== current.instructions) {
      const { data: latest, error: versionReadError } = await service.from("aiw_project_instruction_versions")
        .select("version").eq("project_id", projectId).order("version", { ascending: false }).limit(1).maybeSingle();
      if (versionReadError) throw new WorkspaceError("PROJECT_UPDATE_FAILED", 503);
      const nextVersion = Number(latest?.version ?? 0) + 1;
      const { error: versionError } = await service.from("aiw_project_instruction_versions")
        .insert({ project_id: projectId, owner_id: ownerId, version: nextVersion, instructions: newInstructions });
      if (versionError) throw new WorkspaceError("PROJECT_UPDATE_FAILED", 409);
    }

    const { data: project, error } = await service.from("aiw_projects")
      .update(patch).eq("id", projectId).eq("owner_id", ownerId)
      .select("id,name,description,instructions,archived,preferences,created_at").maybeSingle();
    if (error) throw new WorkspaceError("PROJECT_UPDATE_FAILED", 503);
    if (!project) throw new WorkspaceError("NOT_FOUND", 404);
    return noStoreJson({ project, requestId });
  } catch (error) {
    return apiError(error, requestId);
  }
}

export async function DELETE(request: Request, context: Context) {
  const requestId = crypto.randomUUID();
  try {
    assertSameOrigin(request);
    const { projectId } = await context.params;
    const { ownerId, service } = await requireRegisteredWorkspacePrincipal();
    // Financial history is immutable; deletion is therefore a soft archive.
    const { data, error } = await service.from("aiw_projects").update({ archived: true })
      .eq("id", projectId).eq("owner_id", ownerId).select("id").maybeSingle();
    if (error) throw new WorkspaceError("PROJECT_ARCHIVE_FAILED", 503);
    if (!data) throw new WorkspaceError("NOT_FOUND", 404);
    await service.from("aiw_conversations").update({ archived: true }).eq("project_id", projectId).eq("owner_id", ownerId);
    return noStoreJson({ archived: true, projectId, requestId });
  } catch (error) {
    return apiError(error, requestId);
  }
}
