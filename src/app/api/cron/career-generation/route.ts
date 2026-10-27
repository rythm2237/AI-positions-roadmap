import { NextResponse } from "next/server";
import { dynamicCareerEngineEnabled } from "@/lib/ai/careerGenerationServer";
import { processOneCareerGenerationJob } from "@/lib/ai/careerGenerationWorker";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const authorization = request.headers.get("authorization");
  if (!secret || authorization !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!dynamicCareerEngineEnabled()) return NextResponse.json({ ok: true, skipped: "feature-disabled" });
  const result = await processOneCareerGenerationJob();
  return NextResponse.json({ ok: true, ...result }, { headers: { "Cache-Control": "no-store" } });
}
