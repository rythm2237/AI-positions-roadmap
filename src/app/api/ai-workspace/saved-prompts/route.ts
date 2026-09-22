import { WorkspaceError } from "@/lib/ai-workspace/contracts";
import { apiError, assertSameOrigin, enforceWorkspaceRateLimit, noStoreJson, readJson, requireRegisteredWorkspacePrincipal } from "@/lib/ai-workspace/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    const { ownerId, service } = await requireRegisteredWorkspacePrincipal();
    const projectId = new URL(request.url).searchParams.get("projectId");
    let query = service.from("aiw_saved_prompts")
      .select("id,project_id,name,content,archived,created_at,updated_at")
      .eq("owner_id", ownerId).order("updated_at", { ascending: false }).limit(200);
    if (projectId) query = query.eq("project_id", projectId);
    const { data, error } = await query;
    if (error) throw new WorkspaceError("SAVED_PROMPT_LIST_FAILED", 503);
    return noStoreJson({ prompts: data ?? [], requestId });
  } catch (error) {
    return apiError(error, requestId);
  }
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    assertSameOrigin(request);
    const { ownerId, service } = await requireRegisteredWorkspacePrincipal();
    await enforceWorkspaceRateLimit(service, `prompt:create:${ownerId}`, 30);
    const body = await readJson<{ projectId?: unknown; name?: unknown; content?: unknown }>(request, 26000);
    const projectId = typeof body.projectId === "string" && body.projectId ? body.projectId : null;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!name || name.length > 160 || !content || content.length > 24000) throw new WorkspaceError("INVALID_SAVED_PROMPT", 400);
    if (projectId) {
      const { data: project, error } = await service.from("aiw_projects")
        .select("id").eq("id", projectId).eq("owner_id", ownerId).maybeSingle();
      if (error) throw new WorkspaceError("PROJECT_READ_FAILED", 503);
      if (!project) throw new WorkspaceError("NOT_FOUND", 404);
    }
    const { data: prompt, error } = await service.from("aiw_saved_prompts")
      .insert({ owner_id: ownerId, project_id: projectId, name, content })
      .select("id,project_id,name,content,archived,created_at,updated_at").single();
    if (error || !prompt) throw new WorkspaceError("SAVED_PROMPT_CREATE_FAILED", 503);
    return noStoreJson({ prompt, requestId }, { status: 201 });
  } catch (error) {
    return apiError(error, requestId);
  }
}
