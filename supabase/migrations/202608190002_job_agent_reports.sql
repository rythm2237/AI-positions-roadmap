create table if not exists public.job_agent_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_id uuid not null references public.job_agents(id) on delete cascade,
  report_type text not null check (report_type in ('daily','weekly')),
  period_key text not null,
  delivery_channel text not null default 'email',
  status text not null default 'pending' check (status in ('pending','sent','failed')),
  summary jsonb not null default '{}'::jsonb,
  sent_at timestamptz,
  error_code text,
  created_at timestamptz not null default now(),
  unique(agent_id, report_type, period_key, delivery_channel)
);

alter table public.job_agent_reports enable row level security;
drop policy if exists "job_agent_reports_own_rows" on public.job_agent_reports;
create policy "job_agent_reports_own_rows" on public.job_agent_reports
  for select to authenticated using (auth.uid() = user_id);

create index if not exists job_agent_reports_user_created_idx on public.job_agent_reports(user_id, created_at desc);
