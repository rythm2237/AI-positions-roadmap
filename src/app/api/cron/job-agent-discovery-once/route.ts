import { NextResponse } from "next/server";
import { authorized } from "@/lib/intelligence/refreshAuth";
import { runScheduledJobDiscovery } from "@/lib/job-agent/scheduledDiscovery";

export const maxDuration = 300;

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const discovery = await runScheduledJobDiscovery();
    return NextResponse.json({ discovery });
  } catch (error) {
    console.error("One-time Job Agent discovery failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "One-time Job Agent discovery failed" },
      { status: 503 },
    );
  }
}
