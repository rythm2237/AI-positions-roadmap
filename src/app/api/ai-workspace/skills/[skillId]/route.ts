import { WorkspaceError } from "@/lib/ai-workspace/contracts";
import { apiError, assertSameOrigin, enforceWorkspaceRateLimit, noStoreJson, readJson, requireRegisteredWorkspacePrincipal } from "@/lib/ai-workspace/http";

export const runtime = "nodejs";
type Context = { params: Promise<{ skillId: string }> };

export async function GET(request: Request, context: Context) {
  const requestId = crypto.randomUUID();
  try {
    const { skillId } = await context.params;
    const { ownerId, service } = await requireRegisteredWorkspacePrincipal();
    const projectId = new URL(request.url).searchParams.get("projectId");
    const { data, error } = await service.from("aiw_skills")
      .select("id,version,owner_id,project_id,name,description,category,instructions,enabled,allowed_tools,created_at")
      .eq("id", skillId).or(`owner_id.is.null,owner_id.eq.${ownerId}`)
      .order("version", { ascending: false }).limit(100);
    if (error) throw new WorkspaceError("SKILL_READ_FAILED", 503);
    const versions = (data ?? []).filter(row => (row.project_id === null || row.project_id === projectId));
    if (!versions.length) throw new WorkspaceError("NOT_FOUND", 404);
    return noStoreJson({ skill: versions[0], versions, requestId });
  } catch (error) {
    return apiError(error, requestId);
  }
}

export async function PATCH(request: Request, context: Context) {
  const requestId = crypto.randomUUID();
  try {
    assertSameOrigin(request);
    const { skillId } = await context.params;
    const { ownerId, service } = await requireRegisteredWorkspacePrincipal();
    await enforceWorkspaceRateLimit(service, `skill:update:${ownerId}`, 30);
    const body = await readJson<{ name?: unknown; description?: unknown; category?: unknown; instructions?: unknown; enabled?: unknown }>(request, 22000);

    const { data: rows, error: readError } = await service.from("aiw_skills")
      .select("id,version,owner_id,project_id,name,description,category,instructions,enabled,allowed_tools")
      .eq("id", skillId).eq("owner_id", ownerId).order("version", { ascending: false }).limit(1);
    if (readError) throw new WorkspaceError("SKILL_READ_FAILED", 503);
    const current = rows?.[0];
    if (!current) throw new WorkspaceError("NOT_FOUND", 404);

    const name = body.name === undefined ? current.name : typeof body.name === "string" ? body.name.trim() : "";
    const description = body.description === undefined ? current.description : typeof body.description === "string" ? body.description.trim() : "";
    const category = body.category === undefined ? current.category : typeof body.category === "string" ? body.category.trim() : "";
    const instructions = body.instructions === undefined ? current.instructions : typeof body.instructions === "string" ? body.instructions.trim() : "";
    const enabled = body.enabled === undefined ? current.enabled : body.enabled;
    if (!name || name.length > 120 || String(description).length > 2000 || !category || String(category).length > 80
      || !instructions || String(instructions).length > 16000 || typeof enabled !== "boolean") {
      throw new WorkspaceError("INVALID_SKILL", 400);
    }

    const nextVersion = Number(current.version) + 1;
    const { data: skill, error } = await service.from("aiw_skills").insert({
      id: skillId,
      version: nextVersion,
      owner_id: ownerId,
      project_id: current.project_id,
      name,
      description,
      category,
      instructions,
      enabled,
      // Preserve only already-authorized tool bindings; prompt edits cannot add tools.
      allowed_tools: current.allowed_tools ?? [],
    }).select("id,version,owner_id,project_id,name,description,category,instructions,enabled,allowed_tools,created_at").single();
    if (error || !skill) throw new WorkspaceError("SKILL_VERSION_CREATE_FAILED", 409);
    return noStoreJson({ skill, requestId });
  } catch (error) {
    return apiError(error, requestId);
  }
}
