-- Diagnostic view: security_invoker retains RLS from underlying user-scoped tables.
create or replace view public.job_search_run_diagnostics
with (security_invoker = true)
as
select
  r.id as search_run_id,
  r.user_id,
  r.agent_id,
  r.started_at,
  r.completed_at,
  r.status as run_status,
  r.queries_planned,
  r.provider_records,
  r.deduplicated_count,
  r.eligible_count,
  r.unverified_count,
  r.blocked_count,
  r.recommended_count,
  r.error_code,
  coalesce(p.attempts, 0) as provider_attempts,
  coalesce(p.successes, 0) as provider_successes,
  coalesce(p.no_results, 0) as provider_no_results,
  coalesce(p.errors, 0) as provider_errors,
  coalesce(p.total_received, 0) as provider_attempt_records,
  coalesce(p.providers, '[]'::jsonb) as providers,
  case
    when r.status not in ('completed', 'success') and coalesce(p.errors, 0) > 0 then 'partial_provider_failure'
    when coalesce(r.provider_records, 0) = 0 then 'no_provider_records'
    when coalesce(r.deduplicated_count, 0) = 0 then 'deduplication_exhausted'
    when coalesce(r.eligible_count, 0) = 0 and
      (coalesce(r.unverified_count, 0) + coalesce(r.blocked_count, 0)) > 0
      then 'eligibility_or_verification_bottleneck'
    when coalesce(r.recommended_count, 0) = 0 then 'recommendation_bottleneck'
    else 'has_recommendations'
  end as diagnostic_category,
  r.provider_summary
from public.job_search_runs r
left join lateral (
  select
    count(*)::integer as attempts,
    count(*) filter (where a.status = 'success')::integer as successes,
    count(*) filter (where a.status = 'no_results')::integer as no_results,
    count(*) filter (where a.status not in ('success','no_results'))::integer as errors,
    sum(coalesce(a.records_received,0))::integer as total_received,
    jsonb_agg(jsonb_build_object(
       'provider', a.provider,
       'query', a.query,
       'country', a.country,
       'location', a.location,
       'status', a.status,
       'records_received', a.records_received,
       'error_code', a.error_code,
       'created_at', a.created_at
    ) order by a.created_at) as providers
  from public.job_provider_attempts a
  where a.search_run_id = r.id and a.user_id = r.user_id
) p on true;
revoke all on public.job_search_run_diagnostics from public, anon;
grant select on public.job_search_run_diagnostics to authenticated, service_role;
comment on view public.job_search_run_diagnostics is
'User-scoped per-run source diagnostics; provider errors and zero recommendations are separate states. Uses security_invoker RLS.';