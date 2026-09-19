import { WorkspaceError } from "@/lib/ai-workspace/contracts";
import { apiError, assertSameOrigin, enforceWorkspaceRateLimit, noStoreJson, readJson, requireRegisteredWorkspacePrincipal } from "@/lib/ai-workspace/http";

export const runtime = "nodejs";

function safeText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  const text = value.trim();
  if (text.length > max) throw new WorkspaceError("INVALID_SKILL", 400);
  return text;
}

function accessible(row: { owner_id: string | null; project_id: string | null }, ownerId: string, projectId: string | null) {
  return (row.owner_id === null || row.owner_id === ownerId)
    && (row.project_id === null || row.project_id === projectId);
}

export async function GET(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    const { ownerId, service } = await requireRegisteredWorkspacePrincipal();
    const projectId = new URL(request.url).searchParams.get("projectId");
    if (projectId) {
      const { data: project, error } = await service.from("aiw_projects")
        .select("id").eq("id", projectId).eq("owner_id", ownerId).maybeSingle();
      if (error) throw new WorkspaceError("PROJECT_READ_FAILED", 503);
      if (!project) throw new WorkspaceError("NOT_FOUND", 404);
    }

    const { data, error } = await service.from("aiw_skills")
      .select("id,version,owner_id,project_id,name,description,category,instructions,enabled,allowed_tools,created_at")
      .or(`owner_id.is.null,owner_id.eq.${ownerId}`)
      .order("version", { ascending: false }).limit(1000);
    if (error) throw new WorkspaceError("SKILL_LIST_FAILED", 503);

    const latest = new Map<string, Record<string, unknown>>();
    for (const raw of data ?? []) {
      const row = raw as typeof raw & { owner_id: string | null; project_id: string | null; id: string };
      if (!accessible(row, ownerId, projectId) || latest.has(row.id)) continue;
      latest.set(row.id, row);
    }
    return noStoreJson({ skills: Array.from(latest.values()), requestId });
  } catch (error) {
    return apiError(error, requestId);
  }
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    assertSameOrigin(request);
    const { ownerId, service } = await requireRegisteredWorkspacePrincipal();
    await enforceWorkspaceRateLimit(service, `skill:create:${ownerId}`, 20);
    const body = await readJson<{
      name?: unknown; description?: unknown; category?: unknown; instructions?: unknown;
      projectId?: unknown; sourceSkillId?: unknown; sourceVersion?: unknown;
    }>(request, 22000);

    const projectId = typeof body.projectId === "string" && body.projectId ? body.projectId : null;
    if (projectId) {
      const { data: project, error } = await service.from("aiw_projects")
        .select("id").eq("id", projectId).eq("owner_id", ownerId).maybeSingle();
      if (error) throw new WorkspaceError("PROJECT_READ_FAILED", 503);
      if (!project) throw new WorkspaceError("NOT_FOUND", 404);
    }

    let source: Record<string, unknown> | null = null;
    if (typeof body.sourceSkillId === "string" && body.sourceSkillId) {
      let query = service.from("aiw_skills")
        .select("id,version,owner_id,project_id,name,description,category,instructions,enabled,allowed_tools")
        .eq("id", body.sourceSkillId).or(`owner_id.is.null,owner_id.eq.${ownerId}`)
        .order("version", { ascending: false }).limit(1);
      if (Number.isSafeInteger(body.sourceVersion) && Number(body.sourceVersion) > 0) {
        query = query.eq("version", Number(body.sourceVersion));
      }
      const { data: rows, error } = await query;
      if (error) throw new WorkspaceError("SKILL_READ_FAILED", 503);
      const candidate = (rows?.[0] ?? null) as (Record<string, unknown> & { owner_id: string | null; project_id: string | null }) | null;
      if (!candidate || !accessible(candidate, ownerId, projectId)) throw new WorkspaceError("NOT_FOUND", 404);
      source = candidate;
    }

    const name = safeText(body.name ?? source?.name, 120);
    const description = safeText(body.description ?? source?.description ?? "", 2000);
    const category = safeText(body.category ?? source?.category ?? "general", 80) || "general";
    const instructions = safeText(body.instructions ?? source?.instructions, 16000);
    if (!name || !instructions) throw new WorkspaceError("INVALID_SKILL", 400);

    const { data: skill, error } = await service.from("aiw_skills").insert({
      owner_id: ownerId,
      project_id: projectId,
      name,
      description,
      category,
      instructions,
      enabled: true,
      // Users cannot self-grant tool access through prompt editing.
      allowed_tools: [],
    }).select("id,version,owner_id,project_id,name,description,category,instructions,enabled,allowed_tools,created_at").single();
    if (error || !skill) throw new WorkspaceError("SKILL_CREATE_FAILED", 503);
    return noStoreJson({ skill, requestId }, { status: 201 });
  } catch (error) {
    return apiError(error, requestId);
  }
}
