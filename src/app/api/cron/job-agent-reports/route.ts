import { NextResponse } from "next/server";
import { authorized } from "@/lib/intelligence/refreshAuth";
import { enqueueDueJobFollowUps } from "@/lib/job-agent/reporting";
import { batchPendingJobEmailDeliveries, sendDueDailyJobDigests } from "@/lib/job-agent/dailyDigestReporting";
import { runScheduledJobDiscovery } from "@/lib/job-agent/scheduledDiscovery";

export const maxDuration = 300;

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  process.env.SUPABASE_URL ??= process.env.NEXT_PUBLIC_SUPABASE_URL;

  let discovery: Awaited<ReturnType<typeof runScheduledJobDiscovery>>;
  try {
    // Discovery runs before the digest so jobs found in this cycle can be included in the same email.
    // Failures are isolated so an upstream provider outage does not suppress the daily report.
    discovery = await runScheduledJobDiscovery();
  } catch (error) {
    console.error("Job Agent scheduled discovery failed", error);
    discovery = {
      status: "failed",
      attempted: 0,
      completed: 0,
      failed: 1,
      outcomes: [{ ok: false, code: error instanceof Error ? error.message.slice(0, 80) : "SCHEDULED_DISCOVERY_FAILED" }],
    };
  }

  try {
    const followUps = await enqueueDueJobFollowUps();
    // Job-linked email notifications are consumed into one daily digest.
    // Non-job notifications remain independent and are not suppressed here.
    const batchedEmailDeliveries = await batchPendingJobEmailDeliveries();
    const dailyDigest = await sendDueDailyJobDigests();
    return NextResponse.json({ discovery, followUps, batchedEmailDeliveries, dailyDigest });
  } catch (error) {
    console.error("Job Agent daily digest cron failed", error);
    return NextResponse.json(
      {
        discovery,
        error: error instanceof Error ? error.message : "Job Agent daily digest failed",
      },
      { status: 503 },
    );
  }
}
