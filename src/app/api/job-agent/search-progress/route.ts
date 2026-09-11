import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { visibleOpportunityKey } from "@/lib/job-agent/resultGroups";

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

  const [{ data: attempts }, { data: sourceRows }, { data: agent }, { data: applications }] = await Promise.all([
    supabase
      .from("job_provider_attempts")
      .select("records_received")
      .eq("user_id", authData.user.id)
      .eq("search_run_id", run.id),
    supabase
      .from("job_opportunity_sources")
      .select("job_id")
      .eq("user_id", authData.user.id)
      .eq("search_run_id", run.id),
    supabase
      .from("job_agents")
      .select("intent_version")
      .eq("user_id", authData.user.id)
      .maybeSingle<{ intent_version: number | null }>(),
    supabase
      .from("applications")
      .select("job_id")
      .eq("user_id", authData.user.id),
  ]);

  const liveSourceListings = (attempts ?? []).reduce((sum, item) => sum + Number(item.records_received ?? 0), 0);
  const finalSourceListings = Number(run.provider_records ?? 0);
  const sourceListings = finalSourceListings > 0 ? finalSourceListings : liveSourceListings;

  const sourceJobIds = Array.from(new Set((sourceRows ?? []).map((row) => String(row.job_id)).filter(Boolean)));
  let canonical = 0;

  if (sourceJobIds.length) {
    const { data: jobs } = await supabase
      .from("job_opportunities")
      .select("id,company,role,country,location,freshness_status,decision_status,snoozed_until,current_intent_version")
      .eq("user_id", authData.user.id)
      .in("id", sourceJobIds);

    const applicationJobIds = new Set((applications ?? []).map((application) => String(application.job_id)));
    const currentVersion = Number(agent?.intent_version ?? 0);
    const now = Date.now();
    const visibleJobs = (jobs ?? [])
      .filter((job) => !currentVersion || Number(job.current_intent_version ?? 0) === currentVersion)
      .filter((job) => job.freshness_status !== "expired")
      .filter((job) => !applicationJobIds.has(String(job.id)))
      .filter((job) => job.decision_status !== "rejected" && job.decision_status !== "approved")
      .filter((job) => job.decision_status !== "snoozed" || !job.snoozed_until || Date.parse(job.snoozed_until) <= now);

    canonical = new Set(visibleJobs.map((job) => visibleOpportunityKey(job))).size;
  }

  return NextResponse.json(
    {
      run: {
        id: run.id,
        status: run.status,
        discovered: canonical,
        sourceListings,
        canonical,
        pipelineCanonical: Number(run.deduplicated_count ?? 0),
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
