create table if not exists public.career_user_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  career_slug text not null check (career_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  state_key text not null check (state_key = any (array[
    'workspace_progress'::text,
    'starting_profile'::text,
    'baseline_diagnostic'::text,
    'project_evidence'::text,
    'job_matches'::text,
    'interview_evidence'::text,
    'applications'::text,
    'retention_snapshots'::text
  ])),
  payload jsonb not null default '{}'::jsonb,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, career_slug, state_key)
);

alter table public.career_user_state enable row level security;

revoke all on table public.career_user_state from anon;
revoke all on table public.career_user_state from authenticated;
grant select, insert, update, delete on table public.career_user_state to authenticated;

create policy "career_user_state_select_own"
  on public.career_user_state
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "career_user_state_insert_own"
  on public.career_user_state
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "career_user_state_update_own"
  on public.career_user_state
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "career_user_state_delete_own"
  on public.career_user_state
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.touch_career_user_state_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.touch_career_user_state_updated_at() from public;
revoke all on function public.touch_career_user_state_updated_at() from anon;
revoke all on function public.touch_career_user_state_updated_at() from authenticated;

create trigger career_user_state_touch_updated_at
before update on public.career_user_state
for each row execute function public.touch_career_user_state_updated_at();

comment on table public.career_user_state is
  'Per-user, per-career Zero-to-Hired state synchronized across devices. Browser localStorage remains a cache/fallback.';
