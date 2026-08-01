begin;
create extension if not exists pgcrypto;
create table if not exists public.intelligence_refresh_runs (
 id uuid primary key default gen_random_uuid(), refresh_type text not null check(refresh_type in ('market','salary','all')), trigger_type text not null check(trigger_type in ('cron','manual','cli')), status text not null check(status in ('planned','running','partial','completed','failed')), started_at timestamptz not null default now(), completed_at timestamptz, planned_calls integer not null default 0 check(planned_calls>=0), completed_calls integer not null default 0 check(completed_calls>=0), failed_calls integer not null default 0 check(failed_calls>=0), config_version text not null, idempotency_key text not null unique, error_summary text, created_at timestamptz not null default now()
);
create table if not exists public.intelligence_refresh_items (
 id uuid primary key default gen_random_uuid(), refresh_run_id uuid not null references public.intelligence_refresh_runs(id) on delete cascade, career_slug text not null, country_code text not null check(country_code ~ '^[a-z]{2}$'), capability text not null, status text not null, provider text not null default 'adzuna', request_count integer not null default 0, error_code text, error_message text, started_at timestamptz not null default now(), completed_at timestamptz, unique(refresh_run_id,career_slug,country_code,capability)
);
create table if not exists public.intelligence_snapshots (
 id uuid primary key default gen_random_uuid(), career_slug text not null, country_code text not null check(country_code ~ '^[a-z]{2}$'), snapshot_type text not null check(snapshot_type in ('market','salary')), provider text not null, status text not null check(status in ('draft','validating','published','rejected','superseded')), version integer not null check(version>0), idempotency_key text not null unique, query_metadata jsonb not null, normalized_payload jsonb not null, sample_size integer not null default 0 check(sample_size>=0), total_count integer, currency_code text check(currency_code is null or currency_code ~ '^[A-Z]{3}$'), captured_at timestamptz not null, published_at timestamptz, superseded_at timestamptz, refresh_run_id uuid not null references public.intelligence_refresh_runs(id), validation_result jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), unique(career_slug,country_code,snapshot_type,version)
);
create unique index if not exists intelligence_one_published on public.intelligence_snapshots(career_slug,country_code,snapshot_type) where status='published';
create index if not exists intelligence_snapshot_lookup on public.intelligence_snapshots(career_slug,country_code,snapshot_type,published_at desc);
create index if not exists intelligence_run_started on public.intelligence_refresh_runs(started_at desc);
alter table public.intelligence_refresh_runs enable row level security;
alter table public.intelligence_refresh_items enable row level security;
alter table public.intelligence_snapshots enable row level security;
revoke all on public.intelligence_refresh_runs,public.intelligence_refresh_items,public.intelligence_snapshots from anon,authenticated;
create or replace function public.publish_intelligence_snapshot(snapshot_id uuid) returns public.intelligence_snapshots language plpgsql security definer set search_path=public as $$
declare candidate public.intelligence_snapshots;
begin
 select * into candidate from intelligence_snapshots where id=snapshot_id for update;
 if candidate.status <> 'validating' or coalesce((candidate.validation_result->>'valid')::boolean,false) is not true then raise exception 'snapshot_not_publishable'; end if;
 update intelligence_snapshots set status='superseded',superseded_at=now() where career_slug=candidate.career_slug and country_code=candidate.country_code and snapshot_type=candidate.snapshot_type and status='published';
 update intelligence_snapshots set status='published',published_at=now() where id=snapshot_id returning * into candidate;
 return candidate;
end $$;
revoke all on function public.publish_intelligence_snapshot(uuid) from public,anon,authenticated;
commit;
