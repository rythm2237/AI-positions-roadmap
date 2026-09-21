import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { authorized } from "@/lib/intelligence/refreshAuth";
import { runScheduledJobDiscovery } from "@/lib/job-agent/scheduledDiscovery";

export const maxDuration = 300;

const oneTimeTokenHash = "d95374a4760f28067d0cc02bebbecb0d9d19363237ed4a53751e16eb263ad06f";
const oneTimeExpiresAt = Date.parse("2026-09-21T12:15:00Z");

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
