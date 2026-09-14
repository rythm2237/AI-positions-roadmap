create table if not exists public.job_saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.job_opportunities(id) on delete cascade,
  saved_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, job_id)
);

create index if not exists job_saved_jobs_user_saved_idx
  on public.job_saved_jobs(user_id, saved_at desc);

alter table public.job_saved_jobs enable row level security;

do $$ begin
  create policy "Users can read own saved jobs"
    on public.job_saved_jobs for select
    using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can insert own saved jobs"
    on public.job_saved_jobs for insert
    with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can delete own saved jobs"
    on public.job_saved_jobs for delete
    using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

grant select, insert, delete on public.job_saved_jobs to authenticated;
