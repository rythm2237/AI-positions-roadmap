begin;

alter table public.job_search_runs
  add column if not exists criteria_hash text,
  add column if not exists fallback_triggered boolean not null default false,
  add column if not exists shadow_comparison jsonb not null default '{}'::jsonb;

alter table public.job_opportunities
  add column if not exists company_normalized text,
  add column if not exists city text,
  add column if not exists region text,
  add column if not exists salary_period text;

update public.job_opportunities
set company_normalized = lower(regexp_replace(trim(company), '[^a-zA-Z0-9+#.]+', ' ', 'g'))
where company_normalized is null and company is not null;

alter table public.job_opportunities
  drop constraint if exists job_opportunities_salary_period_check,
  add constraint job_opportunities_salary_period_check check (salary_period is null or salary_period in ('hour','day','week','month','year'));

alter table public.job_provider_attempts
  add column if not exists provider_type text,
  add column if not exists provider_stage text,
  add column if not exists raw_count integer not null default 0,
  add column if not exists normalized_count integer not null default 0,
  add column if not exists cost_usd numeric(12,6) not null default 0,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.job_provider_attempts
  drop constraint if exists job_provider_attempts_provider_type_check,
  add constraint job_provider_attempts_provider_type_check check (provider_type is null or provider_type in ('DIRECT','APIFY','SEARCH_API')),
  drop constraint if exists job_provider_attempts_provider_stage_check,
  add constraint job_provider_attempts_provider_stage_check check (provider_stage is null or provider_stage in ('PRIMARY','SECONDARY','FALLBACK'));

alter table public.job_opportunity_sources
  add column if not exists provider_type text,
  add column if not exists confidence numeric(4,3),
  add column if not exists first_seen_at timestamptz not null default now(),
  add column if not exists last_seen_at timestamptz not null default now();

alter table public.job_opportunity_sources
  drop constraint if exists job_opportunity_sources_provider_type_check,
  add constraint job_opportunity_sources_provider_type_check check (provider_type is null or provider_type in ('DIRECT','APIFY','SEARCH_API')),
  drop constraint if exists job_opportunity_sources_confidence_check,
  add constraint job_opportunity_sources_confidence_check check (confidence is null or (confidence >= 0 and confidence <= 1));

create index if not exists job_search_runs_criteria_started_idx
  on public.job_search_runs(user_id, criteria_hash, started_at desc);

create index if not exists job_provider_attempts_provider_health_idx
  on public.job_provider_attempts(provider, created_at desc);

create index if not exists job_opportunity_sources_provenance_idx
  on public.job_opportunity_sources(job_id, provider_type, last_seen_at desc);

create index if not exists job_opportunities_company_title_location_idx
  on public.job_opportunities(user_id, company_normalized, normalized_title, country, city);

commit;
