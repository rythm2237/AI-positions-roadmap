alter table public.job_opportunities
  add column if not exists decision_status text not null default 'pending',
  add column if not exists decision_at timestamptz,
  add column if not exists snoozed_until timestamptz,
  add column if not exists last_surfaced_at timestamptz,
  add column if not exists surfaced_count integer not null default 0,
  add column if not exists salary_min numeric,
  add column if not exists salary_max numeric,
  add column if not exists salary_currency text,
  add column if not exists submission_method text,
  add column if not exists submission_receipt text;

do $$ begin
  alter table public.job_opportunities add constraint job_opportunities_decision_status_check check (decision_status in ('pending','approved','rejected','snoozed'));
exception when duplicate_object then null; end $$;

create index if not exists job_opportunities_decision_due_idx
  on public.job_opportunities(user_id, decision_status, snoozed_until, discovered_at desc);
