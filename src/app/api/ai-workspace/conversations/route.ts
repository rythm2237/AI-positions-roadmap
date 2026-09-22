import { WorkspaceError } from "@/lib/ai-workspace/contracts";
import { apiError, assertSameOrigin, enforceWorkspaceRateLimit, noStoreJson, readJson, requireRegisteredWorkspacePrincipal } from "@/lib/ai-workspace/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    const { ownerId, service } = await requireRegisteredWorkspacePrincipal();
    const projectId = new URL(request.url).searchParams.get("projectId");
    if (!projectId) throw new WorkspaceError("PROJECT_REQUIRED", 400);
    const { data: project, error: projectError } = await service.from("aiw_projects")
      .select("id").eq("id", projectId).eq("owner_id", ownerId).maybeSingle();
    if (projectError) throw new WorkspaceError("PROJECT_READ_FAILED", 503);
    if (!project) throw new WorkspaceError("NOT_FOUND", 404);
    const { data, error } = await service.from("aiw_conversations")
      .select("id,project_id,title,archived,pinned,created_at,updated_at")
      .eq("owner_id", ownerId).eq("project_id", projectId)
      .order("updated_at", { ascending: false }).limit(100);
    if (error) throw new WorkspaceError("CONVERSATION_LIST_FAILED", 503);
    return noStoreJson({ conversations: data ?? [], requestId });
  } catch (error) {
    return apiError(error, requestId);
  }
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    assertSameOrigin(request);
    const { ownerId, service } = await requireRegisteredWorkspacePrincipal();
    await enforceWorkspaceRateLimit(service, `conversation:create:${ownerId}`, 20);
    const body = await readJson<{ projectId?: unknown; title?: unknown }>(request, 4096);
    const projectId = typeof body.projectId === "string" ? body.projectId : "";
    const title = typeof body.title === "string" && body.title.trim() ? body.title.trim() : "New conversation";
    if (!projectId || title.length > 160) throw new WorkspaceError("INVALID_CONVERSATION", 400);
    const { data: project, error: projectError } = await service.from("aiw_projects")
      .select("id,archived").eq("id", projectId).eq("owner_id", ownerId).maybeSingle();
    if (projectError) throw new WorkspaceError("PROJECT_READ_FAILED", 503);
    if (!project || project.archived) throw new WorkspaceError("NOT_FOUND", 404);

    const { data: conversation, error } = await service.from("aiw_conversations")
      .insert({ owner_id: ownerId, project_id: projectId, title })
      .select("id,project_id,title,archived,pinned,created_at,updated_at").single();
    if (error || !conversation) throw new WorkspaceError("CONVERSATION_CREATE_FAILED", 503);
    return noStoreJson({ conversation, requestId }, { status: 201 });
  } catch (error) {
    return apiError(error, requestId);
  }
}
