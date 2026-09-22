import { WorkspaceError } from "@/lib/ai-workspace/contracts";
import { apiError, assertSameOrigin, enforceWorkspaceRateLimit, noStoreJson, readJson, requireWorkspacePrincipal } from "@/lib/ai-workspace/http";

export const runtime = "nodejs";

async function assertProject(service: Awaited<ReturnType<typeof requireWorkspacePrincipal>>["service"], ownerId: string, projectId: string) {
  const { data, error } = await service.from("aiw_projects").select("id").eq("id", projectId).eq("owner_id", ownerId).eq("archived", false).maybeSingle();
  if (error) throw new WorkspaceError("PROJECT_READ_FAILED", 503);
  if (!data) throw new WorkspaceError("NOT_FOUND", 404);
}

export async function GET(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    const { ownerId, service } = await requireWorkspacePrincipal();
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");
    const includeUser = url.searchParams.get("includeUser") !== "false";
    if (projectId) await assertProject(service, ownerId, projectId);
    let query = service.from("aiw_memories")
      .select("id,project_id,scope,kind,content,provenance,status,created_at,updated_at")
      .eq("owner_id", ownerId).eq("status", "active").order("updated_at", { ascending: false }).limit(200);
    if (projectId && includeUser) query = query.or(`project_id.eq.${projectId},project_id.is.null`);
    else if (projectId) query = query.eq("project_id", projectId);
    else query = query.is("project_id", null);
    const { data, error } = await query;
    if (error) throw new WorkspaceError("MEMORY_LIST_FAILED", 503);
    return noStoreJson({ memories: data ?? [], requestId });
  } catch (error) {
    return apiError(error, requestId);
  }
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    assertSameOrigin(request);
    const { ownerId, service } = await requireWorkspacePrincipal();
    await enforceWorkspaceRateLimit(service, `memory:create:${ownerId}`, 30);
    const body = await readJson<{ scope?: unknown; projectId?: unknown; kind?: unknown; content?: unknown }>(request, 14000);
    const scope = body.scope === "user" ? "user" : body.scope === "project" ? "project" : "";
    const projectId = typeof body.projectId === "string" && body.projectId ? body.projectId : null;
    const kind = typeof body.kind === "string" && body.kind.trim() ? body.kind.trim().slice(0, 80) : "fact";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!scope || !content || content.length > 12000) throw new WorkspaceError("INVALID_MEMORY", 400);
    if ((scope === "project") !== Boolean(projectId)) throw new WorkspaceError("INVALID_MEMORY_SCOPE", 400);
    if (projectId) await assertProject(service, ownerId, projectId);
    const { count, error: countError } = await service.from("aiw_memories").select("id", { count: "exact", head: true })
      .eq("owner_id", ownerId).eq("status", "active");
    if (countError) throw new WorkspaceError("MEMORY_LIMIT_CHECK_FAILED", 503);
    if ((count ?? 0) >= 500) throw new WorkspaceError("MEMORY_LIMIT_REACHED", 403);
    const { data, error } = await service.from("aiw_memories").insert({
      owner_id: ownerId,
      project_id: projectId,
      scope,
      kind,
      content,
      provenance: { source: "user", createdVia: "workspace" },
      status: "active",
    }).select("id,project_id,scope,kind,content,provenance,status,created_at,updated_at").single();
    if (error || !data) throw new WorkspaceError("MEMORY_CREATE_FAILED", 503);
    return noStoreJson({ memory: data, requestId }, { status: 201 });
  } catch (error) {
    return apiError(error, requestId);
  }
}
