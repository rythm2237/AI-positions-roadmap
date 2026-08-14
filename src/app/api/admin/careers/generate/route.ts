import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/adminAuth";
import { AdminRepositoryError, createCareer, getCareerBySlug, saveCareerContent } from "@/lib/admin/careerRepository";
import { normalizeCareerSlug, validateCareerInput } from "@/lib/admin/careerValidation";
import { generateCareerBlueprint } from "@/lib/ai/careerGenerator";
import { assembleCareerWorkspace } from "@/lib/ai/careerBlueprintAssembler";
import { classifyCareerAiError, logCareerAiError } from "@/lib/ai/aiError";
import { validateCareerWorkspaceData } from "@/lib/careerContentValidation";
import { adaptCareerWorkspaceLearningContract } from "@/lib/learning/adaptiveLearningContract";

export const runtime = "nodejs";
export const maxDuration = 300;

function errorResponse(code: string, status: number) {
  return NextResponse.json({ ok: false, code }, { status });
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const requestId = request.headers.get("x-vercel-id");
  const authorization = await requireAdmin();
  if (authorization.status === "unauthenticated") return errorResponse("AUTH_REQUIRED", 401);
  if (authorization.status !== "admin") return errorResponse("ADMIN_REQUIRED", 403);

  const body = await request.json().catch(() => null) as { title?: unknown; countryCodes?: unknown } | null;
  const requestedTitle = typeof body?.title === "string" ? body.title.trim() : "";
  const countryCodes = Array.isArray(body?.countryCodes)
    ? body.countryCodes.filter((value): value is string => typeof value === "string")
    : [];
  if (requestedTitle.length < 2 || requestedTitle.length > 120) {
    return errorResponse("INVALID_CAREER_TITLE", 400);
  }

  const requestedSlug = normalizeCareerSlug(requestedTitle);
  const existing = await getCareerBySlug(authorization.accessToken, requestedSlug).catch(() => null);
  if (existing) {
    return NextResponse.json({ ok: false, code: "CAREER_EXISTS", careerId: existing.id }, { status: 409 });
  }

  try {
    console.log(JSON.stringify({ level: "info", message: "Career Blueprint generation started", route: "/api/admin/careers/generate", requestId, slug: requestedSlug }));
    const generated = await generateCareerBlueprint(requestedTitle);
    const blueprint = { ...generated, title: requestedTitle };
    const workspace = adaptCareerWorkspaceLearningContract(
      assembleCareerWorkspace(blueprint, requestedSlug),
    );
    const validation = validateCareerWorkspaceData(workspace, requestedSlug);
    const input = validateCareerInput({
      slug: requestedSlug,
      title: requestedTitle,
      shortTitle: blueprint.shortTitle,
      summary: blueprint.summary,
      primaryTitle: requestedTitle,
      aliases: blueprint.aliases,
      defaultCountryCodes: countryCodes,
    });
    if (!input.success) return errorResponse("GENERATED_IDENTITY_INVALID", 422);

    const career = await createCareer(authorization.accessToken, input.value);
    await saveCareerContent(authorization.accessToken, career.id, workspace, validation.errors);
    console.log(JSON.stringify({ level: "info", message: "Career Blueprint generation completed", route: "/api/admin/careers/generate", requestId, careerId: career.id, durationMs: Date.now() - startedAt, validationFindings: validation.errors.length }));
    return NextResponse.json({
      ok: true,
      careerId: career.id,
      slug: career.slug,
      validationErrors: validation.errors,
      stageCount: workspace.journeyStages.length,
      projectCount: workspace.projects.length,
      requirementCount: workspace.resourceRequirements?.length ?? 0,
    });
  } catch (error) {
    if (error instanceof AdminRepositoryError && error.code === "duplicate_slug") {
      return errorResponse("CAREER_EXISTS", 409);
    }
    logCareerAiError(error, { route: "/api/admin/careers/generate", requestId, startedAt });
    const classified = classifyCareerAiError(error, "CAREER_GENERATION_FAILED");
    return errorResponse(classified.code, classified.status);
  }
}