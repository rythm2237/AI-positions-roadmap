import { NextResponse } from "next/server";
import { sendPendingJobInboxEmails } from "@/lib/job-agent/reporting";

export async function GET() {
  if (process.env.VERCEL_ENV !== "preview") {
    return NextResponse.json({ error: "Preview only" }, { status: 404 });
  }
  process.env.SUPABASE_URL ??= process.env.NEXT_PUBLIC_SUPABASE_URL;
  const result = await sendPendingJobInboxEmails();
  return NextResponse.json(result);
}
