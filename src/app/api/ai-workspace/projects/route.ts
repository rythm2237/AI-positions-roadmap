import { WorkspaceError } from "@/lib/ai-workspace/contracts";
import { apiError, assertSameOrigin, enforceWorkspaceRateLimit, noStoreJson, readJson, requireRegisteredWorkspacePrincipal } from "@/lib/ai-workspace/http";

export const runtime = "nodejs";

export async function GET() {
  const requestId = crypto.randomUUID();
  try {
    const { ownerId, service } = await requireRegisteredWorkspacePrincipal();
    const { data, error } = await service.from("aiw_projects")
      .select("id,name,description,instructions,archived,preferences,created_at")
      .eq("owner_id", ownerId).order("created_at", { ascending: false }).limit(100);
    if (error) throw new WorkspaceError("PROJECT_LIST_FAILED", 503);
    return noStoreJson({ projects: data ?? [], requestId });
  } catch (error) {
    return apiError(error, requestId);
  }
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    assertSameOrigin(request);
    const { ownerId, service } = await requireRegisteredWorkspacePrincipal();
    await enforceWorkspaceRateLimit(service, `project:create:${ownerId}`, 10);
    const body = await readJson<{ name?: unknown; description?: unknown; instructions?: unknown }>(request, 20000);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const instructions = typeof body.instructions === "string" ? body.instructions.trim() : "";
    if (!name || name.length > 120 || description.length > 2000 || instructions.length > 12000) {
      throw new WorkspaceError("INVALID_PROJECT", 400);
    }

    const { count, error: countError } = await service.from("aiw_projects")
      .select("id", { count: "exact", head: true }).eq("owner_id", ownerId).eq("archived", false);
    if (countError) throw new WorkspaceError("PROJECT_LIMIT_CHECK_FAILED", 503);
    if ((count ?? 0) >= 50) throw new WorkspaceError("PROJECT_LIMIT_REACHED", 403);

    const { data: project, error } = await service.from("aiw_projects")
      .insert({ owner_id: ownerId, name, description, instructions }).select("id,name,description,instructions,archived,preferences,created_at").single();
    if (error || !project) throw new WorkspaceError("PROJECT_CREATE_FAILED", 503);

    const { error: versionError } = await service.from("aiw_project_instruction_versions")
      .insert({ project_id: project.id, owner_id: ownerId, version: 1, instructions });
    if (versionError) {
      await service.from("aiw_projects").delete().eq("id", project.id).eq("owner_id", ownerId);
      throw new WorkspaceError("PROJECT_CREATE_FAILED", 503);
    }

    return noStoreJson({ project, requestId }, { status: 201 });
  } catch (error) {
    return apiError(error, requestId);
  }
}
