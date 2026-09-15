import { NextResponse } from "next/server";
import { authorized } from "@/lib/intelligence/refreshAuth";
import { enqueueDueJobFollowUps } from "@/lib/job-agent/reporting";
import { batchPendingJobEmailDeliveries, sendDueDailyJobDigests } from "@/lib/job-agent/dailyDigestReporting";

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  process.env.SUPABASE_URL ??= process.env.NEXT_PUBLIC_SUPABASE_URL;

  try {
    const followUps = await enqueueDueJobFollowUps();
    // Job-linked email notifications are consumed into one daily digest.
    // Non-job notifications remain independent and are not suppressed here.
    const batchedEmailDeliveries = await batchPendingJobEmailDeliveries();
    const dailyDigest = await sendDueDailyJobDigests();
    return NextResponse.json({ followUps, batchedEmailDeliveries, dailyDigest });
  } catch (error) {
    console.error("Job Agent daily digest cron failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Job Agent daily digest failed" }, { status: 503 });
  }
}
