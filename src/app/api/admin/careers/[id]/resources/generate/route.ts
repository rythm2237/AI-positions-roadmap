import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/adminAuth";
import { getCareer, saveCareerContent } from "@/lib/admin/careerRepository";
import { applyResourcePacks } from "@/lib/ai/careerBlueprintAssembler";
import { generateCareerResourcePack } from "@/lib/ai/careerGenerator";
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
  const payload = await request.json().catch(() => ({})) as { requirementId?: unknown };
  const requirements = blueprintValidation.data.resourceRequirements ?? [];
  if (!requirements.length) return errorResponse("CAREER_RESOURCE_REQUIREMENTS_MISSING", 422);
  const incompleteRequirement = requirements.find((requirement) => {
    const mapping = blueprintValidation.data.resourceMappings?.find((item) => item.requirementId === requirement.id);
    return !mapping?.reading || !mapping.video || !mapping.practice;
  });
  const requirement = typeof payload.requirementId === "string"
    ? requirements.find((item) => item.id === payload.requirementId)
    : incompleteRequirement ?? requirements[0];
  if (!requirement) return errorResponse("RESOURCE_REQUIREMENT_INVALID", 400);

  try {
    console.log(JSON.stringify({ level: "info", message: "Career resource generation started", route: "/api/admin/careers/[id]/resources/generate", requestId, careerId: id, requirementId: requirement.id }));
    const pack = await generateCareerResourcePack(blueprintValidation.data, requirement);
    const workspace = applyResourcePacks(blueprintValidation.data, [pack]);
    const validation = validateCareerWorkspaceData(workspace, career.slug);
    if (!validation.valid) throw new Error(`CAREER_RESOURCE_OUTPUT_INVALID: ${validation.errors.join(" | ")}`);
    await saveCareerContent(authorization.accessToken, id, validation.data, []);
    const completedCount = validation.data.resourceMappings?.filter((mapping) => mapping.reading && mapping.video && mapping.practice).length ?? 0;
    console.log(JSON.stringify({ level: "info", message: "Career resource generation completed", route: "/api/admin/careers/[id]/resources/generate", requestId, careerId: id, requirementId: requirement.id, durationMs: Date.now() - startedAt, resourceCount: validation.data.globalResources.length, completedCount, totalCount: requirements.length }));
    return NextResponse.json({
      ok: true,
      careerId: id,
      requirementId: requirement.id,
      requirementTitle: validation.data.journeyStages.find((stage) => stage.id === requirement.milestoneId)?.title ?? requirement.topic,
      resourceCount: validation.data.globalResources.length,
      mappingCount: validation.data.resourceMappings?.length ?? 0,
      completedCount,
      totalCount: requirements.length,
      validationErrors: [],
    });
  } catch (error) {
    logCareerAiError(error, { route: "/api/admin/careers/[id]/resources/generate", requestId, startedAt });
    const classified = classifyCareerAiError(error, "RESOURCE_GENERATION_FAILED");
    return errorResponse(classified.code, classified.status);
  }
}
