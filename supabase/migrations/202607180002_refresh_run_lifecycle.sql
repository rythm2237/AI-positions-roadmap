begin;

create or replace function public.recompute_intelligence_refresh_run(p_run_id uuid)
returns public.intelligence_refresh_runs
language plpgsql security definer set search_path=public as $$
declare
  result public.intelligence_refresh_runs;
  active_count integer;
  running_count integer;
  queued_count integer;
  terminal_count integer;
  failed_count integer;
  total_count integer;
  call_count integer;
begin
  select count(*),
         count(*) filter(where status in ('queued','running','retryable')),
         count(*) filter(where status='running'),
         count(*) filter(where status in ('queued','retryable')),
         count(*) filter(where status not in ('queued','running','retryable')),
         count(*) filter(where status in ('failed','skipped_budget')),
         coalesce(sum(request_count),0)
    into total_count,active_count,running_count,queued_count,terminal_count,failed_count,call_count
    from intelligence_refresh_items where refresh_run_id=p_run_id;

  update intelligence_refresh_runs set
    status=case
      when active_count>0 and (running_count>0 or terminal_count>0) then 'running'
      when active_count>0 and queued_count>0 then 'planned'
      when total_count=0 then status
      when failed_count=total_count then 'failed'
      when failed_count>0 then 'partial'
      else 'completed'
    end,
    completed_calls=call_count,
    failed_calls=failed_count,
    completed_at=case when active_count=0 and total_count>0 then coalesce(completed_at,now()) else null end
   where id=p_run_id returning * into result;
  return result;
end $$;

create or replace function public.claim_next_intelligence_refresh_item(p_run_id uuid)
returns public.intelligence_refresh_items
language plpgsql security definer set search_path=public as $$
declare claimed public.intelligence_refresh_items;
begin
  select * into claimed from intelligence_refresh_items
   where refresh_run_id=p_run_id and status in ('queued','retryable')
     and (retry_after is null or retry_after<=now())
   order by started_at for update skip locked limit 1;
  if claimed.id is null then return null; end if;
  update intelligence_refresh_items set status='running',attempt_count=attempt_count+1,started_at=now(),completed_at=null
   where id=claimed.id and status in ('queued','retryable') returning * into claimed;
  perform public.recompute_intelligence_refresh_run(p_run_id);
  return claimed;
end $$;

create or replace function public.complete_intelligence_refresh_item(
  p_item_id uuid,
  p_status text,
  p_candidate_snapshot_id uuid default null,
  p_request_count integer default 0,
  p_pages_requested integer default 0,
  p_records_retrieved integer default 0,
  p_unique_records_analyzed integer default 0,
  p_error_code text default null,
  p_error_message text default null,
  p_retry_after timestamptz default null
) returns public.intelligence_refresh_runs
language plpgsql security definer set search_path=public as $$
declare
  run_id uuid;
begin
  if p_status not in ('candidate','failed','retryable','skipped_budget') then
    raise exception 'invalid_item_terminal_status' using errcode='22023';
  end if;
  update intelligence_refresh_items set
    status=p_status,candidate_snapshot_id=p_candidate_snapshot_id,request_count=greatest(p_request_count,0),
    pages_requested=greatest(p_pages_requested,0),records_retrieved=greatest(p_records_retrieved,0),
    unique_records_analyzed=greatest(p_unique_records_analyzed,0),error_code=p_error_code,
    error_message=p_error_message,retry_after=case when p_status='retryable' then p_retry_after else null end,
    completed_at=case when p_status='retryable' then null else now() end
   where id=p_item_id and status='running' returning refresh_run_id into run_id;
  if run_id is null then raise exception 'refresh_item_not_running' using errcode='P0001'; end if;
  return public.recompute_intelligence_refresh_run(run_id);
end $$;

create or replace function public.queue_admin_intelligence_refresh(
  p_career_slug text,p_countries text[],p_types text[],p_sample_size integer,
  p_actor_user_id uuid,p_definition jsonb,p_planned_calls integer,p_config_version text,p_idempotency_key text
) returns public.intelligence_refresh_runs
language plpgsql security definer set search_path=public as $$
declare
  result public.intelligence_refresh_runs;
begin
  perform pg_advisory_xact_lock(hashtext('adzuna:'||p_career_slug));
  if exists(
    select 1 from intelligence_refresh_items item
    join intelligence_refresh_runs run on run.id=item.refresh_run_id
    where run.provider='adzuna' and item.career_slug=p_career_slug
      and item.country_code=any(p_countries) and item.capability=any(p_types)
      and item.status in ('queued','running','retryable')
  ) then raise exception 'DUPLICATE_ACTIVE_REFRESH' using errcode='P0001'; end if;
  if exists(
    select 1 from intelligence_snapshots snapshot
    where snapshot.provider='adzuna' and snapshot.career_slug=p_career_slug
      and snapshot.country_code=any(p_countries) and snapshot.snapshot_type=any(p_types)
      and snapshot.status='validating'
  ) then raise exception 'CANDIDATE_AWAITING_REVIEW' using errcode='P0001'; end if;

  insert into intelligence_refresh_runs(refresh_type,trigger_type,status,planned_calls,config_version,
    idempotency_key,provider,requested_sample_size,triggered_by)
  values(case when cardinality(p_types)=2 then 'all' else p_types[1] end,'manual','planned',p_planned_calls,
    p_config_version,p_idempotency_key,'adzuna',p_sample_size,p_actor_user_id) returning * into result;
  insert into intelligence_refresh_items(refresh_run_id,career_slug,country_code,capability,status,provider,query_metadata)
    select result.id,p_career_slug,country,type,'queued','adzuna',p_definition
      from unnest(p_countries) country cross join unnest(p_types) type;
  return result;
end $$;

revoke all on function public.recompute_intelligence_refresh_run(uuid) from public,anon,authenticated;
revoke all on function public.complete_intelligence_refresh_item(uuid,text,uuid,integer,integer,integer,integer,text,text,timestamptz) from public,anon,authenticated;
revoke all on function public.queue_admin_intelligence_refresh(text,text[],text[],integer,uuid,jsonb,integer,text,text) from public,anon,authenticated;
grant execute on function public.recompute_intelligence_refresh_run(uuid) to service_role;
grant execute on function public.complete_intelligence_refresh_item(uuid,text,uuid,integer,integer,integer,integer,text,text,timestamptz) to service_role;
grant execute on function public.queue_admin_intelligence_refresh(text,text[],text[],integer,uuid,jsonb,integer,text,text) to service_role;
grant execute on function public.claim_next_intelligence_refresh_item(uuid) to service_role;

select public.recompute_intelligence_refresh_run(run.id)
  from intelligence_refresh_runs run
 where run.status in ('planned','running','partial')
   and exists(select 1 from intelligence_refresh_items item where item.refresh_run_id=run.id)
   and not exists(select 1 from intelligence_refresh_items item where item.refresh_run_id=run.id and item.status in ('queued','running','retryable'));

commit;
