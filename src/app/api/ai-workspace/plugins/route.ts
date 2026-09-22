import { WorkspaceError } from "@/lib/ai-workspace/contracts";
import { apiError, noStoreJson, requireWorkspacePrincipal } from "@/lib/ai-workspace/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    const { ownerId, service } = await requireWorkspacePrincipal();
    const projectId = new URL(request.url).searchParams.get("projectId") ?? "";
    if (!projectId) throw new WorkspaceError("PROJECT_REQUIRED", 400);
    const { data: project, error: projectError } = await service.from("aiw_projects").select("id").eq("id", projectId).eq("owner_id", ownerId).eq("archived", false).maybeSingle();
    if (projectError) throw new WorkspaceError("PROJECT_READ_FAILED", 503);
    if (!project) throw new WorkspaceError("NOT_FOUND", 404);

    const [catalog, connections, permissions] = await Promise.all([
      service.from("aiw_plugin_catalog").select("id,display_name,status,auth_kind,capabilities,updated_at").order("display_name"),
      service.from("aiw_plugin_connections").select("id,plugin_id,status,scopes,metadata,created_at,updated_at,revoked_at").eq("owner_id", ownerId),
      service.from("aiw_project_plugin_permissions").select("connection_id,enabled,permissions,updated_at").eq("owner_id", ownerId).eq("project_id", projectId),
    ]);
    if (catalog.error || connections.error || permissions.error) throw new WorkspaceError("PLUGIN_CATALOG_FAILED", 503);
    return noStoreJson({
      plugins: catalog.data ?? [],
      connections: connections.data ?? [],
      projectPermissions: permissions.data ?? [],
      connectionCreationAvailable: false,
      note: "Only provider-configured connectors can become available. OAuth/API credentials are never accepted through this endpoint.",
      requestId,
    });
  } catch (error) {
    return apiError(error, requestId);
  }
}
