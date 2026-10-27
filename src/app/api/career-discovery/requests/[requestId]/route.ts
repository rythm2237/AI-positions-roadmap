import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { dynamicCareerEngineEnabled, getOwnedGenerationRequest } from "@/lib/ai/careerGenerationServer";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ requestId: string }> }) {
  if (!dynamicCareerEngineEnabled()) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || user.is_anonymous) return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  const { requestId } = await context.params;
  const owned = await getOwnedGenerationRequest(requestId, user.id);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    requestId,
    title: owned.job.title,
    status: owned.job.status,
    attempts: owned.job.attempts,
    errorCode: owned.job.status === "failed" ? owned.job.error_code : null,
    career: owned.career ? {
      slug: owned.career.slug,
      title: owned.career.title,
      status: owned.career.status,
      summary: owned.career.summary,
    } : null,
    usage: owned.job.usage_metadata,
  }, { headers: { "Cache-Control": "private, no-store" } });
}
