alter table public.job_opportunities
  add column if not exists eligibility_status text not null default 'unverified',
  add column if not exists eligibility_reasons text[] not null default '{}'::text[],
  add column if not exists eligibility_checked_at timestamptz,
  add column if not exists eligibility_version text not null default 'hard-gate-v1';

alter table public.job_opportunities
  drop constraint if exists job_opportunities_eligibility_status_check;

alter table public.job_opportunities
  add constraint job_opportunities_eligibility_status_check
  check (eligibility_status in ('eligible', 'blocked', 'unverified'));

-- Existing opportunities predate the hard eligibility contract. Keep them out of decision
-- surfaces until a fresh search has re-evaluated them against the current user criteria.
update public.job_opportunities
set
  eligibility_status = case
    when status = 'skipped' or recommendation = 'skip' then 'blocked'
    else 'unverified'
  end,
  eligibility_reasons = case
    when status = 'skipped' or recommendation = 'skip' then coalesce(array[nullif(skip_reason, '')]::text[], '{}'::text[])
    else array['Legacy opportunity requires re-evaluation against current hard filters.']::text[]
  end,
  eligibility_checked_at = case
    when status = 'skipped' or recommendation = 'skip' then updated_at
    else null
  end,
  eligibility_version = 'hard-gate-v1';

create index if not exists job_opportunities_user_eligibility_discovered_idx
  on public.job_opportunities (user_id, eligibility_status, discovered_at desc);
