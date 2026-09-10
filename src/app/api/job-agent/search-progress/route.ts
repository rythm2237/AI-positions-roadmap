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

  const { data: run, error } = await supabase
    .from("job_search_runs")
    .select("id,status,provider_records,deduplicated_count,eligible_count,unverified_count,blocked_count,recommended_count,started_at,completed_at")
    .eq("user_id", authData.user.id)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "progress_unavailable" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }

  if (!run) {
    return NextResponse.json({ run: null }, { headers: { "Cache-Control": "no-store" } });
  }

  const { data: attempts } = await supabase
    .from("job_provider_attempts")
    .select("records_received")
    .eq("user_id", authData.user.id)
    .eq("search_run_id", run.id);

  const liveDiscovered = (attempts ?? []).reduce((sum, item) => sum + Number(item.records_received ?? 0), 0);
  const finalDiscovered = Number(run.provider_records ?? 0);

  return NextResponse.json(
    {
      run: {
        id: run.id,
        status: run.status,
        discovered: finalDiscovered > 0 ? finalDiscovered : liveDiscovered,
        canonical: Number(run.deduplicated_count ?? 0),
        eligible: Number(run.eligible_count ?? 0),
        unverified: Number(run.unverified_count ?? 0),
        blocked: Number(run.blocked_count ?? 0),
        recommended: Number(run.recommended_count ?? 0),
        startedAt: run.started_at,
        completedAt: run.completed_at,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
