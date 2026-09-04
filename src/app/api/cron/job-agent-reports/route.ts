import { NextResponse } from "next/server";
import { authorized } from "@/lib/intelligence/refreshAuth";
import { enqueueDueJobFollowUps, sendDueJobAgentReports, sendPendingJobInboxEmails } from "@/lib/job-agent/reporting";

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const followUps = await enqueueDueJobFollowUps();
    const inbox = await sendPendingJobInboxEmails();
    const reports = await sendDueJobAgentReports();
    return NextResponse.json({ followUps, inbox, reports });
  } catch (error) {
    console.error("Job Agent report cron failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Job Agent report failed" }, { status: 503 });
  }
}
