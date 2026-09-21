import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { authorized } from "@/lib/intelligence/refreshAuth";
import { runScheduledJobDiscovery } from "@/lib/job-agent/scheduledDiscovery";

export const maxDuration = 300;

const oneTimeTokenHash = "7676909c9ea71819b41a165dfbc00db9c465e93f7cfd6f0243e9d1ee5700742d";
const oneTimeExpiresAt = Date.parse("2026-09-21T11:10:00Z");

function oneTimeAuthorized(request: Request) {
  if (Date.now() > oneTimeExpiresAt) return false;
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return false;
  const actual = Buffer.from(createHash("sha256").update(token).digest("hex"), "hex");
  const expected = Buffer.from(oneTimeTokenHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function GET(request: Request) {
  if (!authorized(request) && !oneTimeAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
