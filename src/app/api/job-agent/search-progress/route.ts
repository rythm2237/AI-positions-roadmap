import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  const { data, error } = await supabase
    .from("job_search_runs")
    .select("id,status,provider_records,deduplicated_count,eligible_count,unverified_count,blocked_count,recommended_count,started_at,completed_at")
    .eq("user_id", authData.user.id)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "progress_unavailable" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }

  return NextResponse.json(
    {
      run: data
        ? {
            id: data.id,
            status: data.status,
            discovered: Number(data.provider_records ?? 0),
            canonical: Number(data.deduplicated_count ?? 0),
            eligible: Number(data.eligible_count ?? 0),
            unverified: Number(data.unverified_count ?? 0),
            blocked: Number(data.blocked_count ?? 0),
            recommended: Number(data.recommended_count ?? 0),
            startedAt: data.started_at,
            completedAt: data.completed_at,
          }
        : null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
