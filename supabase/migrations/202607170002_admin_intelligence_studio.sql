begin;

alter table public.intelligence_refresh_runs add column if not exists triggered_by uuid references auth.users(id);
alter table public.intelligence_refresh_runs add column if not exists provider text not null default 'adzuna';
alter table public.intelligence_refresh_runs add column if not exists requested_sample_size integer not null default 50 check(requested_sample_size between 1 and 200);
alter table public.intelligence_refresh_items add column if not exists pages_requested integer not null default 0;
alter table public.intelligence_refresh_items add column if not exists records_retrieved integer not null default 0;
alter table public.intelligence_refresh_items add column if not exists unique_records_analyzed integer not null default 0;
alter table public.intelligence_refresh_items add column if not exists candidate_snapshot_id uuid references public.intelligence_snapshots(id);
alter table public.intelligence_refresh_items add column if not exists attempt_count integer not null default 0;
alter table public.intelligence_refresh_items add column if not exists retry_after timestamptz;
alter table public.intelligence_refresh_items add column if not exists query_metadata jsonb not null default '{}'::jsonb;
alter table public.intelligence_snapshots add column if not exists reviewed_by uuid references auth.users(id);
alter table public.intelligence_snapshots add column if not exists reviewed_at timestamptz;
alter table public.intelligence_snapshots add column if not exists rejection_reason text check(rejection_reason is null or char_length(rejection_reason)<=500);

create index if not exists intelligence_snapshot_admin_filter on public.intelligence_snapshots(status,provider,snapshot_type,country_code,created_at desc);
create index if not exists intelligence_refresh_admin_filter on public.intelligence_refresh_runs(status,provider,started_at desc);
create index if not exists intelligence_items_run_status on public.intelligence_refresh_items(refresh_run_id,status);

create table if not exists public.intelligence_review_audit (
 id uuid primary key default gen_random_uuid(), snapshot_id uuid not null references public.intelligence_snapshots(id),
 actor_user_id uuid not null references auth.users(id), action text not null check(action in ('candidate.published','candidate.rejected')),
 reason text check(reason is null or char_length(reason)<=500), created_at timestamptz not null default now()
);
create index if not exists intelligence_review_audit_snapshot on public.intelligence_review_audit(snapshot_id,created_at desc);
alter table public.intelligence_review_audit enable row level security;

drop policy if exists intelligence_runs_admin_read on public.intelligence_refresh_runs;
create policy intelligence_runs_admin_read on public.intelligence_refresh_runs for select to authenticated using(public.is_app_admin());
drop policy if exists intelligence_items_admin_read on public.intelligence_refresh_items;
create policy intelligence_items_admin_read on public.intelligence_refresh_items for select to authenticated using(public.is_app_admin());
drop policy if exists intelligence_snapshots_admin_read on public.intelligence_snapshots;
create policy intelligence_snapshots_admin_read on public.intelligence_snapshots for select to authenticated using(public.is_app_admin());
drop policy if exists intelligence_review_audit_admin_read on public.intelligence_review_audit;
create policy intelligence_review_audit_admin_read on public.intelligence_review_audit for select to authenticated using(public.is_app_admin());
grant select on public.intelligence_refresh_runs,public.intelligence_refresh_items,public.intelligence_snapshots,public.intelligence_review_audit to authenticated;
revoke insert,update,delete on public.intelligence_refresh_runs,public.intelligence_refresh_items,public.intelligence_snapshots,public.intelligence_review_audit from authenticated;

create or replace function public.claim_next_intelligence_refresh_item(p_run_id uuid) returns public.intelligence_refresh_items
language plpgsql security definer set search_path=public as $$
declare claimed public.intelligence_refresh_items;
begin
 select * into claimed from intelligence_refresh_items where refresh_run_id=p_run_id and status in ('queued','retryable') and (retry_after is null or retry_after<=now()) order by started_at for update skip locked limit 1;
 if claimed.id is null then return null; end if;
 update intelligence_refresh_items set status='running',attempt_count=attempt_count+1,started_at=now() where id=claimed.id returning * into claimed;
 update intelligence_refresh_runs set status='running' where id=p_run_id and status in ('planned','running','partial');
 return claimed;
end $$;
revoke all on function public.claim_next_intelligence_refresh_item(uuid) from public,anon,authenticated;

create or replace function public.admin_publish_intelligence_candidate(p_snapshot_id uuid) returns public.intelligence_snapshots
language plpgsql security definer set search_path=public as $$
declare candidate public.intelligence_snapshots;
begin
 if not public.is_app_admin() then raise exception 'admin_required' using errcode='42501'; end if;
 select * into candidate from intelligence_snapshots where id=p_snapshot_id for update;
 if candidate.id is null then raise exception 'candidate_not_found' using errcode='P0002'; end if;
 if candidate.status <> 'validating' or coalesce((candidate.validation_result->>'valid')::boolean,false) is not true then raise exception 'candidate_not_publishable' using errcode='P0001'; end if;
 update intelligence_snapshots set status='superseded',superseded_at=now() where career_slug=candidate.career_slug and country_code=candidate.country_code and snapshot_type=candidate.snapshot_type and status='published';
 update intelligence_snapshots set status='published',published_at=now(),reviewed_by=auth.uid(),reviewed_at=now() where id=p_snapshot_id returning * into candidate;
 insert into intelligence_review_audit(snapshot_id,actor_user_id,action) values(candidate.id,auth.uid(),'candidate.published');
 return candidate;
end $$;

create or replace function public.admin_reject_intelligence_candidate(p_snapshot_id uuid,p_reason text default null) returns public.intelligence_snapshots
language plpgsql security definer set search_path=public as $$
declare candidate public.intelligence_snapshots;
begin
 if not public.is_app_admin() then raise exception 'admin_required' using errcode='42501'; end if;
 update intelligence_snapshots set status='rejected',reviewed_by=auth.uid(),reviewed_at=now(),rejection_reason=nullif(trim(p_reason),'') where id=p_snapshot_id and status='validating' returning * into candidate;
 if candidate.id is null then raise exception 'candidate_not_rejectable' using errcode='P0001'; end if;
 insert into intelligence_review_audit(snapshot_id,actor_user_id,action,reason) values(candidate.id,auth.uid(),'candidate.rejected',candidate.rejection_reason);
 return candidate;
end $$;
revoke all on function public.admin_publish_intelligence_candidate(uuid),public.admin_reject_intelligence_candidate(uuid,text) from public,anon;
grant execute on function public.admin_publish_intelligence_candidate(uuid),public.admin_reject_intelligence_candidate(uuid,text) to authenticated;

commit;
