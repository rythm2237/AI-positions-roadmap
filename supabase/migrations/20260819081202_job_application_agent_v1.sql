-- Job Application Agent V1
-- Extends the authenticated career identity with user-controlled job search execution.

create table if not exists public.job_agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active','paused')),
  automation_mode text not null default 'assisted_apply' check (automation_mode in ('discovery_only','prepare_applications','assisted_apply','maximum_automation')),
  primary_career text,
  secondary_careers text[] not null default '{}',
  desired_titles text[] not null default '{}',
  adjacent_roles text[] not null default '{}',
  excluded_roles text[] not null default '{}',
  min_seniority text,
  max_seniority text,
  search_countries text[] not null default '{}',
  excluded_countries text[] not null default '{}',
  cities_regions text[] not null default '{}',
  max_commute_minutes integer check (max_commute_minutes is null or max_commute_minutes between 0 and 360),
  workplace_preferences text[] not null default '{}',
  willing_to_relocate boolean,
  relocation_countries text[] not null default '{}',
  english_only_priority boolean not null default false,
  exclude_unknown_languages boolean not null default true,
  work_authorization text,
  sponsorship_requirement text,
  notice_period text,
  earliest_start_date date,
  employment_types text[] not null default '{}',
  industries text[] not null default '{}',
  preferred_companies text[] not null default '{}',
  excluded_companies text[] not null default '{}',
  minimum_salary numeric,
  preferred_salary numeric,
  salary_currency text,
  salary_negotiable boolean,
  auto_prepare_threshold integer not null default 75 check (auto_prepare_threshold between 0 and 100),
  strong_match_threshold integer not null default 85 check (strong_match_threshold between 0 and 100),
  auto_skip_threshold integer not null default 60 check (auto_skip_threshold between 0 and 100),
  automatically_send_email_applications boolean not null default false,
  never_submit_ats_automatically boolean not null default true,
  ask_before_startups boolean not null default true,
  report_frequency text not null default 'daily' check (report_frequency in ('daily','weekly','none')),
  report_time time,
  timezone text not null default 'UTC',
  notification_channels text[] not null default '{in_app,email}',
  immediate_high_fit_threshold integer not null default 90 check (immediate_high_fit_threshold between 0 and 100),
  linkedin_url text,
  linkedin_sync_mode text not null default 'review_first' check (linkedin_sync_mode in ('use_automatically','review_first','ignore')),
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create table if not exists public.job_opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_id uuid not null references public.job_agents(id) on delete cascade,
  external_job_id text,
  source text not null,
  company text not null,
  role text not null,
  location text,
  job_url text not null,
  job_description text,
  required_languages text[] not null default '{}',
  fit_score integer check (fit_score is null or fit_score between 0 and 100),
  recommendation text,
  strengths text[] not null default '{}',
  gaps text[] not null default '{}',
  founder_positioning text,
  status text not null default 'discovered' check (status in ('discovered','recommended','preparing','ready_for_review','ready_for_submit','applied','recruiter_response','interview','assessment','offer','rejected','withdrawn','expired','skipped')),
  skip_reason text,
  discovered_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, job_url)
);

create unique index if not exists job_opportunities_external_unique
  on public.job_opportunities(user_id, source, external_job_id)
  where external_job_id is not null;

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_id uuid not null references public.job_agents(id) on delete cascade,
  job_id uuid not null references public.job_opportunities(id) on delete cascade,
  status text not null default 'preparing' check (status in ('preparing','ready_for_review','ready_for_submit','ats_pack_manual_finalization','applied','recruiter_response','interview','assessment','offer','rejected','withdrawn','expired','skipped')),
  agent_mode text not null,
  applied_at timestamptz,
  recruiter_contact text,
  last_response_at timestamptz,
  next_action text,
  continuation_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, job_id)
);

create table if not exists public.application_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  asset_type text not null check (asset_type in ('cv','portfolio','cover_note','job_snapshot','fit_analysis','screening_answers','interview_pack')),
  version text not null,
  storage_path text,
  structured_content jsonb,
  source_resume_id uuid references public.resumes(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(application_id, asset_type, version)
);

create table if not exists public.application_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.job_agents enable row level security;
alter table public.job_opportunities enable row level security;
alter table public.applications enable row level security;
alter table public.application_assets enable row level security;
alter table public.application_events enable row level security;

drop policy if exists "job_agents_own_rows" on public.job_agents;
create policy "job_agents_own_rows" on public.job_agents
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "job_opportunities_own_rows" on public.job_opportunities;
create policy "job_opportunities_own_rows" on public.job_opportunities
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "applications_own_rows" on public.applications;
create policy "applications_own_rows" on public.applications
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "application_assets_own_rows" on public.application_assets;
create policy "application_assets_own_rows" on public.application_assets
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "application_events_own_rows" on public.application_events;
create policy "application_events_own_rows" on public.application_events
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists job_opportunities_user_status_idx on public.job_opportunities(user_id, status, discovered_at desc);
create index if not exists applications_user_status_idx on public.applications(user_id, status, created_at desc);
create index if not exists application_events_application_idx on public.application_events(application_id, created_at desc);
