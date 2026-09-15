import { NextResponse } from "next/server";
import { batchPendingJobEmailDeliveries, sendDueDailyJobDigests } from "@/lib/job-agent/dailyDigestReporting";

export async function GET() {
  if (process.env.VERCEL_ENV !== "production") return NextResponse.json({ error: "Production only" }, { status: 404 });
  process.env.SUPABASE_URL ??= process.env.NEXT_PUBLIC_SUPABASE_URL;
  const batched = await batchPendingJobEmailDeliveries();
  const digest = await sendDueDailyJobDigests();
  return NextResponse.json({ batched, digest });
}
