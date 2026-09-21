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
    discovery = await runScheduledJobDiscovery();
  } catch (error) {
    console.error("Job Agent scheduled discovery failed", error);
    discovery = {
      status: "partial",
      attempted: 0,
      completed: 0,
      failed: 1,
      outcomes: [{ ok: false, code: error instanceof Error ? error.message.slice(0, 80) : "SCHEDULED_DISCOVERY_FAILED" }],
    };
  }

  let followUps: unknown = { due: 0, enqueued: 0, error: null };
  try {
    followUps = await enqueueDueJobFollowUps();
  } catch (error) {
    console.error("Job Agent follow-up enqueue failed", error);
    followUps = { due: 0, enqueued: 0, error: error instanceof Error ? error.message.slice(0, 120) : "FOLLOW_UP_FAILED" };
  }

  try {
    // A failure in legacy follow-up processing must never suppress the daily digest.
    const batchedEmailDeliveries = await batchPendingJobEmailDeliveries();
    const dailyDigest = await sendDueDailyJobDigests();
    return NextResponse.json({ discovery, followUps, batchedEmailDeliveries, dailyDigest });
  } catch (error) {
    console.error("Job Agent daily digest cron failed", error);
    return NextResponse.json(
      {
        discovery,
        followUps,
        error: error instanceof Error ? error.message : "Job Agent daily digest failed",
      },
      { status: 503 },
    );
  }
}
