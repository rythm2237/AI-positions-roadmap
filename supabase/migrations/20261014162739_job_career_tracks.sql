-- Additive preferences only. Existing owner-based job_agents RLS continues to apply.
begin;
alter table public.job_agents
  add column if not exists career_tracks jsonb not null default '[]'::jsonb,
  add column if not exists include_stretch boolean not null default false,
  add column if not exists minimum_match_score integer not null default 68;
alter table public.job_agents add constraint job_agents_career_tracks_array
  check (jsonb_typeof(career_tracks) = 'array' and jsonb_array_length(career_tracks) <= 12);
alter table public.job_agents add constraint job_agents_minimum_match_score_range
  check (minimum_match_score between 0 and 100);
comment on column public.job_agents.career_tracks is 'Independent confirmed career tracks. Projects never become years of employment. Empty uses conservative evidence-derived defaults.';
commit;
