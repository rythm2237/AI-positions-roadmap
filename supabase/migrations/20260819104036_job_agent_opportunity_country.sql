alter table public.job_opportunities add column if not exists country text;
create index if not exists job_opportunities_country_idx on public.job_opportunities(user_id, country);
