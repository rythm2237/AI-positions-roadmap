-- Job Acquisition System
-- Additive, backwards-compatible foundation for intent versioning, evidence provenance,
-- provider observability, vacancy verification, explainable fit, approvals, inbox,
-- lifecycle tracking, feedback and safe execution.

begin;

alter table public.job_agents
  add column if not exists intent_version integer not null default 0,
  add column if not exists learned_preferences_enabled boolean not null default true,
  add column if not exists excluded_industries text[] not null default '{}',
  add column if not exists search_languages text[] not null default '{}',
  add column if not exists follow_up_days integer not null default 7
    check (follow_up_days between 1 and 90);

alter table public.job_opportunities
  add column if not exists canonical_key text,
  add column if not exists normalized_title text,
  add column if not exists source_query text,
  add column if not exists workplace_model text not null default 'unknown',
  add column if not exists employment_types text[] not null default '{}',
  add column if not exists seniority text,
  add column if not exists required_skills text[] not null default '{}',
  add column if not exists preferred_skills text[] not null default '{}',
  add column if not exists education_requirements text[] not null default '{}',
  add column if not exists certification_requirements text[] not null default '{}',
  add column if not exists visa_sponsorship text,
  add column if not exists posted_at timestamptz,
  add column if not exists expires_at timestamptz,
  add column if not exists application_url text,
  add column if not exists source_url text,
  add column if not exists verification_status text not null default 'unverified',
  add column if not exists verification_provenance jsonb not null default '{}'::jsonb,
  add column if not exists verified_at timestamptz,
  add column if not exists freshness_status text not null default 'unknown',
  add column if not exists stale_reason text,
  add column if not exists eligibility_detail jsonb not null default '{}'::jsonb,
  add column if not exists fit_confidence text,
  add column if not exists fit_explanation jsonb not null default '{}'::jsonb,
  add column if not exists decision_classification text,
  add column if not exists execution_capability text not null default 'manual_only',
  add column if not exists current_intent_version integer;

update public.job_opportunities
set application_url = coalesce(application_url, job_url),
    source_url = coalesce(source_url, job_url),
    normalized_title = coalesce(normalized_title, lower(trim(role)))
where application_url is null or source_url is null or normalized_title is null;

alter table public.job_opportunities
  drop constraint if exists job_opportunities_workplace_model_check,
  add constraint job_opportunities_workplace_model_check
    check (workplace_model in ('remote','hybrid','on_site','unknown')),
  drop constraint if exists job_opportunities_verification_status_check,
  add constraint job_opportunities_verification_status_check
    check (verification_status in ('verified','partially_verified','unverified','failed')),
  drop constraint if exists job_opportunities_freshness_status_check,
  add constraint job_opportunities_freshness_status_check
    check (freshness_status in ('fresh','stale','expired','unknown')),
  drop constraint if exists job_opportunities_execution_capability_check,
  add constraint job_opportunities_execution_capability_check
    check (execution_capability in ('auto_submit_supported','assisted_supported','manual_only','blocked'));

alter table public.job_opportunities drop constraint if exists job_opportunities_status_check;
alter table public.job_opportunities add constraint job_opportunities_status_check check (status in (
  'discovered','recommended','reviewing','preparing','ready_for_review','ready_for_submit',
  'manual_action_required','submitted','applied','recruiter_response','interview','assessment','offer',
  'rejected','withdrawn','expired','skipped'
));

-- canonical_key is indexed for lookup, while the pre-existing (user_id, job_url)
-- constraint remains the persistence conflict target. A second unique target here
-- would make otherwise valid upserts fail when a provider changes its redirect URL.
create index if not exists job_opportunities_user_canonical_key_idx
  on public.job_opportunities(user_id, canonical_key);

create table if not exists public.job_search_intents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_id uuid not null references public.job_agents(id) on delete cascade,
  version integer not null check (version > 0),
  primary_target_role text not null,
  hard_constraints jsonb not null default '{}'::jsonb,
  soft_preferences jsonb not null default '{}'::jsonb,
  normalized_intent jsonb not null,
  fingerprint text not null,
  is_current boolean not null default true,
  confirmed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(agent_id, version),
  unique(user_id, fingerprint)
);
create unique index if not exists job_search_intents_current_agent_unique
  on public.job_search_intents(agent_id) where is_current;

create table if not exists public.job_evidence_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_type text not null check (source_type in ('profile','master_cv','cv_analyzer','experience','education','certification','language','project','portfolio','roadmap','assessment')),
  source_id text,
  evidence_type text not null check (evidence_type in ('user_claim','skill_mention','work_implementation','project_implementation','quantified_achievement','education','certification','language','assessment_result','portfolio_artifact','role_history')),
  label text not null,
  value text not null,
  confidence numeric(4,3) not null check (confidence between 0 and 1),
  duration_months integer check (duration_months is null or duration_months >= 0),
  occurred_at daterange,
  provenance jsonb not null default '{}'::jsonb,
  fingerprint text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, fingerprint)
);
create index if not exists job_evidence_user_active_idx
  on public.job_evidence_items(user_id, active, evidence_type);

create table if not exists public.job_search_runs (
  id uuid primary key default gen_random_uuid(),
  correlation_id uuid not null default gen_random_uuid() unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_id uuid not null references public.job_agents(id) on delete cascade,
  intent_id uuid not null references public.job_search_intents(id) on delete restrict,
  status text not null default 'running' check (status in ('running','completed','partial','failed')),
  queries_planned integer not null default 0,
  provider_records integer not null default 0,
  deduplicated_count integer not null default 0,
  eligible_count integer not null default 0,
  unverified_count integer not null default 0,
  blocked_count integer not null default 0,
  recommended_count integer not null default 0,
  expired_count integer not null default 0,
  provider_summary jsonb not null default '{}'::jsonb,
  api_usage jsonb not null default '{}'::jsonb,
  estimated_cost numeric(12,6) not null default 0,
  latency_ms integer,
  error_code text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists job_search_runs_user_started_idx
  on public.job_search_runs(user_id, started_at desc);

create table if not exists public.job_provider_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  search_run_id uuid not null references public.job_search_runs(id) on delete cascade,
  provider text not null,
  query text not null,
  country text not null,
  location text,
  status text not null check (status in ('success','no_results','provider_error','rate_limit','unsupported_country','auth_failure','invalid_query')),
  records_received integer not null default 0,
  request_count integer not null default 1,
  rate_limit_state jsonb not null default '{}'::jsonb,
  latency_ms integer,
  error_code text,
  error_message text,
  created_at timestamptz not null default now()
);
create index if not exists job_provider_attempts_run_idx
  on public.job_provider_attempts(search_run_id, created_at);

create table if not exists public.job_opportunity_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.job_opportunities(id) on delete cascade,
  search_run_id uuid references public.job_search_runs(id) on delete set null,
  provider text not null,
  source_job_id text,
  source_query text,
  source_url text not null,
  provider_payload jsonb not null default '{}'::jsonb,
  collected_at timestamptz not null default now(),
  unique(user_id, provider, source_url)
);
create index if not exists job_opportunity_sources_job_idx
  on public.job_opportunity_sources(job_id, collected_at desc);

create table if not exists public.job_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.job_opportunities(id) on delete cascade,
  status text not null check (status in ('verified','partially_verified','unverified','failed')),
  method text not null,
  source_url text not null,
  fields jsonb not null default '{}'::jsonb,
  error_code text,
  verified_at timestamptz not null default now(),
  unique(job_id, method, source_url)
);

create table if not exists public.job_fit_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.job_opportunities(id) on delete cascade,
  intent_id uuid not null references public.job_search_intents(id) on delete restrict,
  score integer not null check (score between 0 and 100),
  confidence text not null check (confidence in ('high','medium','low')),
  classification text not null check (classification in ('strong_match','good_match','worth_reviewing','stretch','blocked','expired')),
  dimensions jsonb not null,
  strongest_evidence_ids uuid[] not null default '{}',
  missing_evidence text[] not null default '{}',
  transferable_evidence_ids uuid[] not null default '{}',
  explanation jsonb not null default '{}'::jsonb,
  scoring_version text not null,
  created_at timestamptz not null default now(),
  unique(job_id, intent_id, scoring_version)
);

create table if not exists public.job_application_readiness (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.job_opportunities(id) on delete cascade,
  status text not null check (status in ('ready','needs_user_input','blocked')),
  checklist jsonb not null,
  missing_inputs text[] not null default '{}',
  assessed_at timestamptz not null default now(),
  unique(user_id, job_id)
);

create table if not exists public.job_approval_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid references public.job_opportunities(id) on delete cascade,
  application_id uuid references public.applications(id) on delete cascade,
  action text not null check (action in ('prepare_pack','external_submit','send_email','external_follow_up')),
  status text not null default 'pending' check (status in ('pending','approved','rejected','expired','consumed')),
  scope jsonb not null default '{}'::jsonb,
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  check (job_id is not null or application_id is not null)
);
create index if not exists job_approval_requests_user_pending_idx
  on public.job_approval_requests(user_id, status, expires_at);

create table if not exists public.job_agent_inbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid references public.job_opportunities(id) on delete cascade,
  application_id uuid references public.applications(id) on delete cascade,
  category text not null check (category in ('new_strong_match','new_review_job','application_ready','manual_action_required','application_submitted','recruiter_reply','interview_request','follow_up_due','application_closed','agent_error')),
  title text not null check (char_length(trim(title)) between 1 and 160),
  body text not null,
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  recommended_action text,
  deep_link text,
  status text not null default 'open' check (status in ('open','done','dismissed')),
  read_at timestamptz,
  dedupe_key text not null,
  created_at timestamptz not null default now(),
  unique(user_id, dedupe_key)
);
create index if not exists job_agent_inbox_user_unread_idx
  on public.job_agent_inbox(user_id, read_at, created_at desc);

alter table public.applications
  add column if not exists execution_capability text not null default 'manual_only',
  add column if not exists submission_receipt text,
  add column if not exists submission_evidence jsonb not null default '{}'::jsonb,
  add column if not exists submitted_at timestamptz,
  add column if not exists follow_up_due_at timestamptz;

alter table public.applications
  drop constraint if exists applications_execution_capability_check,
  add constraint applications_execution_capability_check
    check (execution_capability in ('auto_submit_supported','assisted_supported','manual_only','blocked'));

alter table public.applications drop constraint if exists applications_status_check;
alter table public.applications add constraint applications_status_check check (status in (
  'discovered','reviewing','preparing','ready_for_review','ready_for_submit','manual_action_required',
  'submitted','applied','recruiter_response','interview','assessment','offer','rejected',
  'withdrawn','expired','skipped','ats_pack_manual_finalization'
));

create table if not exists public.application_status_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  from_status text,
  to_status text not null,
  reason_code text not null,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists application_status_events_app_idx
  on public.application_status_events(application_id, created_at desc);

create table if not exists public.application_execution_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  approval_id uuid references public.job_approval_requests(id) on delete set null,
  mode text not null check (mode in ('discovery_only','assisted_apply','auto_apply')),
  capability text not null check (capability in ('auto_submit_supported','assisted_supported','manual_only','blocked')),
  status text not null check (status in ('planned','approval_required','executing','succeeded','failed','manual_action_required','blocked')),
  idempotency_key text not null,
  target_url text,
  external_confirmation jsonb not null default '{}'::jsonb,
  failure_code text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(user_id, idempotency_key)
);

create table if not exists public.job_notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  inbox_item_id uuid references public.job_agent_inbox(id) on delete cascade,
  channel text not null check (channel in ('in_app','email','push')),
  status text not null check (status in ('pending','sent','failed','skipped')),
  provider text,
  provider_message_id text,
  error_code text,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  unique(user_id, idempotency_key, channel)
);

create or replace function public.job_inbox_enqueue_notifications()
returns trigger language plpgsql set search_path = public as $$
declare channels text[];
begin
  select notification_channels into channels from public.job_agents where user_id = new.user_id limit 1;
  if coalesce(channels, '{in_app}'::text[]) @> array['in_app']::text[] then
    insert into public.job_notification_deliveries(user_id, inbox_item_id, channel, status, provider, idempotency_key, sent_at)
    values(new.user_id, new.id, 'in_app', 'sent', 'internal', 'inbox:' || new.id::text, now())
    on conflict(user_id, idempotency_key, channel) do nothing;
  end if;
  if coalesce(channels, '{}'::text[]) @> array['email']::text[] then
    insert into public.job_notification_deliveries(user_id, inbox_item_id, channel, status, provider, idempotency_key)
    values(new.user_id, new.id, 'email', 'pending', 'resend', 'inbox:' || new.id::text)
    on conflict(user_id, idempotency_key, channel) do nothing;
  end if;
  return new;
end $$;
drop trigger if exists job_inbox_enqueue_notifications on public.job_agent_inbox;
create trigger job_inbox_enqueue_notifications after insert on public.job_agent_inbox
for each row execute function public.job_inbox_enqueue_notifications();

create table if not exists public.job_follow_ups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  due_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending','completed','dismissed')),
  suggested_action text not null,
  external_send_approved boolean not null default false,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists job_follow_ups_user_due_idx
  on public.job_follow_ups(user_id, status, due_at);

create table if not exists public.job_agent_learned_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  signal_type text not null check (signal_type in ('rejected_role','accepted_role','recruiter_response','industry_outcome','evidence_gap')),
  signal_key text not null,
  value jsonb not null,
  confidence numeric(4,3) not null check (confidence between 0 and 1),
  sample_size integer not null default 1 check (sample_size > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, signal_type, signal_key)
);

create or replace function public.record_job_agent_learning_signal(
  p_signal_type text,
  p_signal_key text,
  p_value jsonb,
  p_confidence numeric
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  actor uuid := auth.uid();
begin
  if actor is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;
  if p_signal_type not in ('rejected_role','accepted_role','recruiter_response','industry_outcome','evidence_gap') then
    raise exception 'INVALID_LEARNING_SIGNAL_TYPE';
  end if;
  if nullif(trim(p_signal_key), '') is null then raise exception 'LEARNING_SIGNAL_KEY_REQUIRED'; end if;
  if p_confidence < 0 or p_confidence > 1 then raise exception 'INVALID_LEARNING_SIGNAL_CONFIDENCE'; end if;

  insert into public.job_agent_learned_preferences(
    user_id, signal_type, signal_key, value, confidence, sample_size, active, updated_at
  ) values (
    actor, p_signal_type, lower(trim(p_signal_key)), p_value, p_confidence, 1, true, now()
  )
  on conflict(user_id, signal_type, signal_key) do update
    set value = excluded.value,
        confidence = least(1, greatest(0,
          ((public.job_agent_learned_preferences.confidence * public.job_agent_learned_preferences.sample_size) + excluded.confidence)
          / (public.job_agent_learned_preferences.sample_size + 1)
        )),
        sample_size = public.job_agent_learned_preferences.sample_size + 1,
        active = true,
        updated_at = now();
end $$;

create or replace function public.job_application_require_submission_evidence()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.status in ('submitted','applied') and coalesce(nullif(trim(new.submission_receipt),''), new.submission_evidence->>'attestedBy') is null then
    raise exception 'SUBMISSION_EVIDENCE_REQUIRED';
  end if;
  if new.status in ('submitted','applied') and new.submitted_at is null then
    new.submitted_at = now();
  end if;
  return new;
end $$;
drop trigger if exists job_application_submission_evidence on public.applications;
create trigger job_application_submission_evidence
before insert or update of status, submission_receipt, submission_evidence on public.applications
for each row execute function public.job_application_require_submission_evidence();

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'job_search_intents','job_evidence_items','job_search_runs','job_provider_attempts',
    'job_opportunity_sources','job_verifications','job_fit_assessments',
    'job_application_readiness','job_approval_requests','job_agent_inbox',
    'application_status_events','application_execution_attempts','job_notification_deliveries',
    'job_follow_ups','job_agent_learned_preferences'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_own_rows', table_name);
    execute format(
      'create policy %I on public.%I for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',
      table_name || '_own_rows', table_name
    );
    execute format('grant select, insert, update, delete on public.%I to authenticated', table_name);
  end loop;
end $$;

grant select, insert, update, delete on public.job_agents, public.job_opportunities,
  public.applications, public.application_assets, public.application_events to authenticated;
grant execute on function public.record_job_agent_learning_signal(text, text, jsonb, numeric) to authenticated;

commit;
