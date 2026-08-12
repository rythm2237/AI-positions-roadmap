import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/adminAuth";
import { getCareer, saveCareerContent } from "@/lib/admin/careerRepository";
import { applyResourcePacks } from "@/lib/ai/careerBlueprintAssembler";
import { generateCareerResourcePacks } from "@/lib/ai/careerGenerator";
import { classifyCareerAiError, logCareerAiError } from "@/lib/ai/aiError";
import { validateCareerWorkspaceData } from "@/lib/careerContentValidation";

export const runtime = "nodejs";
export const maxDuration = 300;

function errorResponse(code: string, status: number) {
  return NextResponse.json({ ok: false, code }, { status });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const startedAt = Date.now();
  const requestId = request.headers.get("x-vercel-id");
  const authorization = await requireAdmin();
  if (authorization.status === "unauthenticated") return errorResponse("AUTH_REQUIRED", 401);
  if (authorization.status !== "admin") return errorResponse("ADMIN_REQUIRED", 403);

  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return errorResponse("INVALID_CAREER", 400);
  const career = await getCareer(authorization.accessToken, id);
  if (!career?.workspace_data) return errorResponse("CAREER_BLUEPRINT_MISSING", 404);
  const blueprintValidation = validateCareerWorkspaceData(career.workspace_data, career.slug);
  if (!blueprintValidation.valid) return errorResponse("CAREER_BLUEPRINT_INVALID", 422);

  try {
    console.log(JSON.stringify({ level: "info", message: "Career resource generation started", route: "/api/admin/careers/[id]/resources/generate", requestId, careerId: id }));
    const packs = await generateCareerResourcePacks(blueprintValidation.data);
    const workspace = applyResourcePacks(blueprintValidation.data, packs);
    const validation = validateCareerWorkspaceData(workspace, career.slug);
    await saveCareerContent(authorization.accessToken, id, workspace, validation.errors);
    console.log(JSON.stringify({ level: "info", message: "Career resource generation completed", route: "/api/admin/careers/[id]/resources/generate", requestId, careerId: id, durationMs: Date.now() - startedAt, resourceCount: workspace.globalResources.length, validationFindings: validation.errors.length }));
    return NextResponse.json({
      ok: true,
      careerId: id,
      resourceCount: workspace.globalResources.length,
      mappingCount: workspace.resourceMappings?.length ?? 0,
      validationErrors: validation.errors,
    });
  } catch (error) {
    logCareerAiError(error, { route: "/api/admin/careers/[id]/resources/generate", requestId, startedAt });
    const classified = classifyCareerAiError(error, "RESOURCE_GENERATION_FAILED");
    return errorResponse(classified.code, classified.status);
  }
}
