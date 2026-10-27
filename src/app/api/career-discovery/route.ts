import { after, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeCareerTitle, relatedCareerCandidates } from "@/lib/ai/careerDiscovery";
import { careerGenerationLimit, createCareerGenerationAdminClient, dynamicCareerEngineEnabled, enqueueCareerGeneration, resolveExistingCareer } from "@/lib/ai/careerGenerationServer";
import { processOneCareerGenerationJob } from "@/lib/ai/careerGenerationWorker";
import { resolveRolePathPlan } from "@/lib/productAccess";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  if (!dynamicCareerEngineEnabled()) return NextResponse.json({ error: "Career discovery is not available." }, { status: 404 });

  const body = await request.json().catch(() => null) as { title?: unknown; confirmDistinct?: unknown } | null;
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const normalized = normalizeCareerTitle(title);
  if (title.length < 2 || title.length > 120 || !normalized) return NextResponse.json({ error: "Enter a career title between 2 and 120 characters." }, { status: 400 });

  try {
    const match = await resolveExistingCareer(title);
    if (match.candidate) {
      return NextResponse.json({
        kind: "existing",
        title: match.candidate.title,
        href: match.candidate.href,
        source: match.candidate.source,
        charged: false,
      });
    }
    if (match.ambiguous) {
      return NextResponse.json({ kind: "ambiguous", candidates: match.candidates.map(({ title: candidateTitle, href }) => ({ title: candidateTitle, href })) }, { status: 409 });
    }

    const related = relatedCareerCandidates(title, match.candidates);
    if (related.length && body?.confirmDistinct !== true) {
      return NextResponse.json({
        kind: "related_roles",
        message: "A few published careers cover nearby responsibilities. Confirm that you want a separate career blueprint for this title.",
        candidates: related.map(({ candidate, score }) => ({ title: candidate.title, href: candidate.href, similarity: Number(score.toFixed(2)) })),
      }, { status: 409 });
    }

    // Published career discovery is public, like the career pages themselves.
    // Require an account only when the request would create/reuse a generation job.
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.is_anonymous) return NextResponse.json({ error: "Sign in to request a new career." }, { status: 401 });

    const plan = resolveRolePathPlan(user);
    const monthlyLimit = careerGenerationLimit(plan);
    if (monthlyLimit < 1) {
      return NextResponse.json({ error: "New career generation is available on Career Pro.", code: "CAREER_GENERATION_REQUIRES_PRO" }, { status: 403 });
    }

    const queued = await enqueueCareerGeneration(user.id, title, monthlyLimit);
    if (!queued.allowed) return NextResponse.json({ error: "Your monthly career-generation allowance has been used.", code: "CAREER_GENERATION_LIMIT_REACHED", quota: { used: queued.used, limit: queued.limit } }, { status: 429 });

    // Start work immediately after the 202 response. The bounded daily cron is
    // retained as a recovery path for transient worker failures on Hobby plans.
    after(async () => {
      try {
        await processOneCareerGenerationJob();
      } catch (error) {
        console.error("Immediate career generation dispatch failed", error);
        try {
          const admin = createCareerGenerationAdminClient();
          await admin.from("career_generation_jobs")
            .update({ status: "queued", error_code: "DISPATCH_FAILED", updated_at: new Date().toISOString() })
            .eq("id", queued.jobId)
            .eq("status", "running");
        } catch (retryError) {
          console.error("Career generation retry scheduling failed", retryError);
        }
      }
    });

    const requestUrl = `/career-discovery/${queued.requestId}`;
    console.info(JSON.stringify({ level: "info", feature: "career-discovery", result: queued.status, jobId: queued.jobId, requestId: queued.requestId, charged: queued.charged }));
    return NextResponse.json({
      kind: queued.status === "review" ? "ready_for_review" : "queued",
      requestId: queued.requestId,
      statusHref: requestUrl,
      careerId: queued.careerId ?? null,
      quota: { used: queued.used, limit: queued.limit },
    }, { status: 202, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Career discovery request failed", error);
    return NextResponse.json({ error: "Career discovery is temporarily unavailable. Please try again later." }, { status: 503 });
  }
}
