begin;

alter table public.intelligence_snapshots
  add column if not exists high_change_acknowledged boolean not null default false;

alter table public.intelligence_review_audit
  add column if not exists metadata jsonb not null default '{}'::jsonb;

drop function if exists public.admin_publish_intelligence_candidate(uuid);
create or replace function public.admin_publish_intelligence_candidate(
  p_snapshot_id uuid,
  p_acknowledge_high_change boolean default false
) returns public.intelligence_snapshots
language plpgsql security definer set search_path=public as $$
declare
  candidate public.intelligence_snapshots;
  evidence jsonb;
  salary_min numeric;
  salary_median numeric;
  salary_max numeric;
  salary_count integer;
  disclosed_count integer;
  predicted_count integer;
  exact_count integer;
  published_evidence jsonb;
  published_min numeric;
  published_median numeric;
  published_max numeric;
  high_change boolean := false;
begin
  if not public.is_app_admin() then raise exception 'admin_required' using errcode='42501'; end if;
  select * into candidate from intelligence_snapshots where id=p_snapshot_id for update;
  if candidate.id is null then raise exception 'candidate_not_found' using errcode='P0002'; end if;
  if candidate.status <> 'validating' or coalesce((candidate.validation_result->>'valid')::boolean,false) is not true then
    raise exception 'candidate_not_publishable' using errcode='P0001';
  end if;

  if candidate.snapshot_type='salary' then
    evidence := candidate.normalized_payload->'snapshot';
    salary_min := nullif(evidence->'observedRange'->>'min','')::numeric;
    salary_median := nullif(evidence->>'observedMedian','')::numeric;
    salary_max := nullif(evidence->'observedRange'->>'max','')::numeric;
    salary_count := coalesce((evidence->>'salarySampleSize')::integer,0);
    disclosed_count := coalesce((evidence->>'disclosedSalaryCount')::integer,0);
    predicted_count := coalesce((evidence->>'predictedSalaryCount')::integer,0);
    exact_count := coalesce((evidence->>'primaryMatchCount')::integer,0);
    if candidate.currency_code is null or salary_min is null or salary_median is null or salary_max is null
       or salary_min < 0 or salary_median < 0 or salary_max < 0
       or salary_min > salary_median or salary_median > salary_max
       or salary_count > exact_count or disclosed_count + predicted_count <> salary_count
       or exists (
         select 1 from jsonb_array_elements(coalesce(evidence->'postings','[]'::jsonb)) posting
          where posting->>'matchQuality' in ('direct','approved-equivalent') and posting ? 'salary'
            and (posting->'salary'->>'period' <> 'annual'
              or posting->'salary'->>'currencyCode' <> candidate.currency_code)
       ) then
      raise exception 'salary_candidate_structurally_invalid' using errcode='P0001';
    end if;

    select normalized_payload->'snapshot' into published_evidence
      from intelligence_snapshots
     where career_slug=candidate.career_slug and country_code=candidate.country_code
       and snapshot_type='salary' and status='published' limit 1;
    if published_evidence is not null then
      published_min := nullif(published_evidence->'observedRange'->>'min','')::numeric;
      published_median := nullif(published_evidence->>'observedMedian','')::numeric;
      published_max := nullif(published_evidence->'observedRange'->>'max','')::numeric;
      high_change := (published_min > 0 and abs(salary_min-published_min)/published_min >= .25)
        or (published_median > 0 and abs(salary_median-published_median)/published_median >= .25)
        or (published_max > 0 and abs(salary_max-published_max)/published_max >= .25);
    end if;
  end if;

  if high_change and not p_acknowledge_high_change then
    raise exception 'high_change_acknowledgement_required' using errcode='P0001';
  end if;

  update intelligence_snapshots set status='superseded',superseded_at=now()
   where career_slug=candidate.career_slug and country_code=candidate.country_code
     and snapshot_type=candidate.snapshot_type and status='published';
  update intelligence_snapshots set status='published',published_at=now(),reviewed_by=auth.uid(),reviewed_at=now(),
    high_change_acknowledged=p_acknowledge_high_change
   where id=p_snapshot_id returning * into candidate;
  insert into intelligence_review_audit(snapshot_id,actor_user_id,action,metadata)
   values(candidate.id,auth.uid(),'candidate.published',jsonb_build_object('highChangeAcknowledged',p_acknowledge_high_change,'highChangeDetected',high_change));
  return candidate;
end $$;

revoke all on function public.admin_publish_intelligence_candidate(uuid,boolean) from public,anon;
grant execute on function public.admin_publish_intelligence_candidate(uuid,boolean) to authenticated;

commit;
