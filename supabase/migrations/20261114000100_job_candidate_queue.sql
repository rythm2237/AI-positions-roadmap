create table public.job_candidate_queue (
  agent_id uuid not null references public.job_agents(id) on delete cascade,
  intent_version integer not null,
  candidate_key text not null,
  candidate jsonb not null,
  priority integer not null,
  first_seen_at timestamptz not null default now(),
  available_at timestamptz not null default now(),
  lease_id uuid,
  attempts integer not null default 0,
  completed_at timestamptz,
  last_reason text,
  primary key (agent_id, intent_version, candidate_key)
);

alter table public.job_candidate_queue enable row level security;
revoke all on public.job_candidate_queue from anon, authenticated;

create index job_candidate_queue_ready_idx
  on public.job_candidate_queue (agent_id, intent_version, available_at, priority desc)
  where completed_at is null;

create function public.claim_job_candidates(
  p_agent_id uuid, p_run_id uuid, p_intent_version integer, p_candidates jsonb, p_limit integer
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  claimed jsonb;
  remaining integer;
begin
  if not exists (
    select 1 from public.job_search_runs r
    join public.job_agents a on a.id = r.agent_id and a.user_id = r.user_id
    join public.job_search_intents i on i.id = r.intent_id and i.agent_id = a.id and i.user_id = a.user_id
    where r.id = p_run_id and r.agent_id = p_agent_id and r.status = 'running'
      and i.version = p_intent_version
      and (a.user_id = auth.uid() or auth.role() = 'service_role')
  ) then
    raise exception 'Job search run is unavailable' using errcode = '42501';
  end if;

  delete from public.job_candidate_queue
  where agent_id = p_agent_id and first_seen_at < now() - interval '14 days'
    and (lease_id is null or available_at <= now());

  insert into public.job_candidate_queue (agent_id, intent_version, candidate_key, candidate, priority)
  select p_agent_id, p_intent_version, c.candidate->>'canonicalKey', c.candidate, c.priority
  from jsonb_to_recordset(p_candidates) as c(candidate jsonb, priority integer)
  where c.candidate->>'canonicalKey' is not null
  order by c.candidate->>'canonicalKey'
  on conflict do nothing;

  with ready as (
    select candidate_key, row_number() over (
      partition by candidate->>'source'
      order by priority + least(30, floor(extract(epoch from (now() - first_seen_at)) / 86400)::integer * 5) desc,
        first_seen_at, candidate_key
    ) as source_slot
    from public.job_candidate_queue
    where agent_id = p_agent_id and intent_version = p_intent_version and completed_at is null
      and available_at <= now()
  ), selected as (
    select q.candidate_key
    from public.job_candidate_queue q join ready using (candidate_key)
    where q.agent_id = p_agent_id and q.intent_version = p_intent_version and q.completed_at is null
      and q.available_at <= now()
    order by ready.source_slot, q.priority desc, q.first_seen_at, q.candidate_key
    limit greatest(0, least(p_limit, 120))
    for update of q skip locked
  ), leased as (
    update public.job_candidate_queue q
    set lease_id = p_run_id, available_at = now() + interval '10 minutes'
    from selected s
    where q.agent_id = p_agent_id and q.intent_version = p_intent_version and q.candidate_key = s.candidate_key
    returning q.candidate
  )
  select coalesce(jsonb_agg(candidate), '[]'::jsonb) into claimed from leased;

  select count(*) into remaining from public.job_candidate_queue
  where agent_id = p_agent_id and intent_version = p_intent_version
    and completed_at is null and available_at <= now();

  return jsonb_build_object('jobs', claimed, 'remaining', remaining);
end
$$;

create function public.finish_job_candidates(
  p_agent_id uuid, p_run_id uuid, p_intent_version integer, p_results jsonb
) returns void language plpgsql security definer set search_path = '' as $$
begin
  if not exists (
    select 1 from public.job_search_runs r
    join public.job_agents a on a.id = r.agent_id and a.user_id = r.user_id
    where r.id = p_run_id and r.agent_id = p_agent_id and r.status = 'running'
      and (a.user_id = auth.uid() or auth.role() = 'service_role')
  ) then
    raise exception 'Job search run is unavailable' using errcode = '42501';
  end if;

  update public.job_candidate_queue q
  set lease_id = null,
    attempts = q.attempts + 1,
    last_reason = r.reason,
    completed_at = case when not r.retry or q.attempts >= 2 then now() end,
    available_at = now() + interval '1 day' * power(2, least(q.attempts, 2))
  from jsonb_to_recordset(p_results) as r(candidate_key text, retry boolean, reason text)
  where q.agent_id = p_agent_id and q.intent_version = p_intent_version
    and q.lease_id = p_run_id and q.candidate_key = r.candidate_key;
end
$$;

revoke execute on function public.claim_job_candidates(uuid, uuid, integer, jsonb, integer) from public, anon, authenticated;
revoke execute on function public.finish_job_candidates(uuid, uuid, integer, jsonb) from public, anon, authenticated;
grant execute on function public.claim_job_candidates(uuid, uuid, integer, jsonb, integer) to service_role;
grant execute on function public.finish_job_candidates(uuid, uuid, integer, jsonb) to service_role;
