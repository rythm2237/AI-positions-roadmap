import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/adminAuth";
import { getCareer } from "@/lib/admin/careerRepository";
import { AdminAIError } from "@/lib/admin/ai/openaiAdminClient";
import { generateCareerDraft } from "@/lib/admin/ai/careerDraftGeneration";

export async function POST(request: Request) {
  const authorization = await requireAdmin();
  if (authorization.status !== "admin") return NextResponse.json({ error: "ADMIN_REQUIRED" }, { status: 403 });

  const body = (await request.json().catch(() => null)) as { careerId?: string } | null;
  const careerId = body?.careerId ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(careerId)) return NextResponse.json({ error: "INVALID_CAREER" }, { status: 400 });

  const career = await getCareer(authorization.accessToken, careerId);
  if (!career) return NextResponse.json({ error: "CAREER_NOT_FOUND" }, { status: 404 });

  try {
    const draft = await generateCareerDraft({
      slug: career.slug,
      title: career.title,
      shortTitle: career.short_title,
      summary: career.summary,
      primaryTitle: career.taxonomy.primaryTitle,
      aliases: career.taxonomy.aliases,
    });
    return NextResponse.json({ draft });
  } catch (error) {
    if (error instanceof AdminAIError) {
      const status = error.code === "not_configured" ? 503 : 502;
      return NextResponse.json({ error: error.code, message: error.message }, { status });
    }
    return NextResponse.json({ error: "AI_GENERATION_FAILED" }, { status: 500 });
  }
}
