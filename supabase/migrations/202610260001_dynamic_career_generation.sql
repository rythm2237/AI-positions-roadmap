begin;

-- Shared generation work is separate from user-owned request references.
-- No CV, assessment, or profile fields are accepted by these tables/functions.
create table if not exists public.career_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 2 and 120),
  title_key text not null unique,
  status text not null default 'queued'
    check (status in ('queued', 'running', 'review', 'failed')),
  attempts integer not null default 0 check (attempts between 0 and 3),
  result_career_id uuid references public.careers(id) on delete set null,
  error_code text,
  usage_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

create index if not exists career_generation_jobs_queue_idx
  on public.career_generation_jobs(status, created_at)
  where status in ('queued', 'running');

create table if not exists public.career_generation_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.career_generation_jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, job_id)
);
create index if not exists career_generation_requests_owner_idx
  on public.career_generation_requests(user_id, created_at desc);

create table if not exists public.career_generation_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_month date not null,
  generations integer not null default 0 check (generations >= 0),
  updated_at timestamptz not null default now(),
  primary key(user_id, usage_month),
  check (extract(day from usage_month) = 1)
);

alter table public.career_generation_jobs enable row level security;
alter table public.career_generation_requests enable row level security;
alter table public.career_generation_usage enable row level security;
revoke all on public.career_generation_jobs, public.career_generation_requests, public.career_generation_usage from public, anon, authenticated;
grant select, insert, update, delete on public.career_generation_jobs, public.career_generation_requests, public.career_generation_usage to service_role;

create or replace function public.enqueue_career_generation(
  p_user_id uuid,
  p_title text,
  p_monthly_limit integer
) returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_title text := trim(p_title);
  v_title_key text;
  v_month date := date_trunc('month', timezone('utc', now()))::date;
  v_job public.career_generation_jobs%rowtype;
  v_request_id uuid;
  v_count integer;
  v_charged boolean := false;
begin
  if coalesce(auth.jwt()->>'role', '') <> 'service_role' then
    raise exception 'service_role_required' using errcode = '42501';
  end if;
  if p_user_id is null or char_length(v_title) not between 2 and 120 then
    raise exception 'invalid_generation_request' using errcode = '22023';
  end if;
  if p_monthly_limit < 1 or p_monthly_limit > 50 then
    raise exception 'invalid_generation_limit' using errcode = '22023';
  end if;

  v_title_key := trim(regexp_replace(regexp_replace(lower(v_title), '[^a-z0-9]+', ' ', 'g'), '\s+', ' ', 'g'));
  if v_title_key = '' then
    raise exception 'invalid_generation_title' using errcode = '22023';
  end if;

  -- Serialize equivalent submitted titles. A second caller reuses the same
  -- queued/running/review job and does not spend a second generation credit.
  perform pg_advisory_xact_lock(hashtextextended(v_title_key, 0));
  select * into v_job from public.career_generation_jobs where title_key = v_title_key for update;

  if v_job.id is null then
    insert into public.career_generation_usage(user_id, usage_month)
      values(p_user_id, v_month) on conflict(user_id, usage_month) do nothing;
    update public.career_generation_usage
      set generations = generations + 1, updated_at = now()
      where user_id = p_user_id and usage_month = v_month and generations < p_monthly_limit
      returning generations into v_count;
    if v_count is null then
      select generations into v_count from public.career_generation_usage
        where user_id = p_user_id and usage_month = v_month;
      return jsonb_build_object('allowed', false, 'used', coalesce(v_count, 0), 'limit', p_monthly_limit);
    end if;
    v_charged := true;

    insert into public.career_generation_jobs(title, title_key)
      values(v_title, v_title_key) returning * into v_job;
  elsif v_job.status = 'failed' and v_job.attempts < 3 then
    update public.career_generation_jobs set status = 'queued', error_code = null,
      updated_at = now(), completed_at = null where id = v_job.id returning * into v_job;
  end if;

  insert into public.career_generation_requests(user_id, job_id)
    values(p_user_id, v_job.id)
    on conflict(user_id, job_id) do update set user_id = excluded.user_id
    returning id into v_request_id;

  select generations into v_count from public.career_generation_usage
    where user_id = p_user_id and usage_month = v_month;
  return jsonb_build_object(
    'allowed', true,
    'jobId', v_job.id,
    'requestId', v_request_id,
    'status', v_job.status,
    'careerId', v_job.result_career_id,
    'used', coalesce(v_count, 0),
    'limit', p_monthly_limit,
    'charged', v_charged
  );
end;
$$;

create or replace function public.claim_career_generation_job()
returns table(id uuid, title text, attempts integer)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if coalesce(auth.jwt()->>'role', '') <> 'service_role' then
    raise exception 'service_role_required' using errcode = '42501';
  end if;

  return query
  with picked as (
    select j.id from public.career_generation_jobs j
    where j.status = 'queued' and j.attempts < 3
    order by j.created_at
    for update skip locked
    limit 1
  ), claimed as (
    update public.career_generation_jobs j
    set status = 'running', attempts = j.attempts + 1, started_at = now(), updated_at = now()
    from picked where j.id = picked.id
    returning j.id, j.title, j.attempts
  )
  select claimed.id, claimed.title, claimed.attempts from claimed;
end;
$$;

create or replace function public.complete_career_generation(
  p_job_id uuid,
  p_slug text,
  p_title text,
  p_short_title text,
  p_summary text,
  p_taxonomy jsonb,
  p_workspace_data jsonb,
  p_validation_errors jsonb,
  p_usage_metadata jsonb,
  p_resource_mappings jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_job public.career_generation_jobs%rowtype;
  v_career public.careers%rowtype;
  v_actor uuid;
  v_status text;
  v_alias_match_count integer;
begin
  if coalesce(auth.jwt()->>'role', '') <> 'service_role' then
    raise exception 'service_role_required' using errcode = '42501';
  end if;
  select * into v_job from public.career_generation_jobs where id = p_job_id for update;
  if v_job.id is null then raise exception 'generation_job_not_found' using errcode = 'P0002'; end if;
  if v_job.result_career_id is not null then
    return jsonb_build_object('careerId', v_job.result_career_id, 'status', v_job.status);
  end if;
  if v_job.status <> 'running' then raise exception 'generation_job_not_running' using errcode = '22023'; end if;
  if jsonb_typeof(p_workspace_data) <> 'object' or jsonb_typeof(p_validation_errors) <> 'array'
    or jsonb_typeof(p_resource_mappings) <> 'array' then
    raise exception 'invalid_generated_career_payload' using errcode = '22023';
  end if;

  select user_id into v_actor from public.career_generation_requests
    where job_id = p_job_id order by created_at limit 1;

  -- A different submitted title may be an explicit alias of a career created
  -- by another concurrent job. Reuse it only for an exact normalized alias;
  -- similar-but-distinct roles are never merged here.
  select count(*) into v_alias_match_count
  from public.careers c
  where regexp_replace(lower(c.title), '[^a-z0-9]+', ' ', 'g') = regexp_replace(lower(trim(p_title)), '[^a-z0-9]+', ' ', 'g')
     or exists (
       select 1 from jsonb_array_elements_text(case when jsonb_typeof(c.taxonomy->'aliases') = 'array' then c.taxonomy->'aliases' else '[]'::jsonb end) alias_title
       where regexp_replace(lower(alias_title), '[^a-z0-9]+', ' ', 'g') = regexp_replace(lower(trim(p_title)), '[^a-z0-9]+', ' ', 'g')
     );
  if v_alias_match_count = 1 then
    select * into v_career from public.careers c
    where regexp_replace(lower(c.title), '[^a-z0-9]+', ' ', 'g') = regexp_replace(lower(trim(p_title)), '[^a-z0-9]+', ' ', 'g')
       or exists (
         select 1 from jsonb_array_elements_text(case when jsonb_typeof(c.taxonomy->'aliases') = 'array' then c.taxonomy->'aliases' else '[]'::jsonb end) alias_title
         where regexp_replace(lower(alias_title), '[^a-z0-9]+', ' ', 'g') = regexp_replace(lower(trim(p_title)), '[^a-z0-9]+', ' ', 'g')
       )
    limit 1;
    update public.career_generation_jobs set status = 'review', result_career_id = v_career.id,
      usage_metadata = coalesce(p_usage_metadata,'{}'::jsonb) || jsonb_build_object('canonicalCareerReused', true),
      completed_at = now(), updated_at = now() where id = p_job_id;
    return jsonb_build_object('careerId', v_career.id, 'slug', v_career.slug, 'careerStatus', v_career.status, 'status', 'review', 'canonicalCareerReused', true);
  end if;

  -- A concurrent admin import or career request may have created this slug.
  select * into v_career from public.careers where slug = p_slug for update;
  if v_career.id is null then
    insert into public.careers(slug,title,short_title,summary,status,taxonomy,default_country_codes,
      created_by,updated_by,workspace_data,validation_errors)
    values(p_slug,p_title,p_short_title,p_summary,'review',p_taxonomy,'{}',v_actor,v_actor,
      p_workspace_data,p_validation_errors)
    returning * into v_career;
  elsif lower(regexp_replace(v_career.title, '[^a-zA-Z0-9]+', ' ', 'g'))
      <> lower(regexp_replace(p_title, '[^a-zA-Z0-9]+', ' ', 'g')) then
    raise exception 'career_slug_conflict' using errcode = '23505';
  end if;

  insert into public.career_learning_resources(career_id, requirement_id, milestone_id, mode, resource_id, approved)
  select v_career.id, item->>'requirementId', item->>'milestoneId', item->>'mode',
    (item->>'resourceId')::uuid, false
  from jsonb_array_elements(p_resource_mappings) item
  where coalesce(item->>'resourceId','') <> ''
  on conflict(career_id, requirement_id, mode) do update
    set milestone_id = excluded.milestone_id, resource_id = excluded.resource_id,
      approved = false, updated_at = now();

  v_status := case when v_career.status = 'published' then 'review' else v_career.status end;
  update public.career_generation_jobs set status = 'review', result_career_id = v_career.id,
    usage_metadata = coalesce(p_usage_metadata,'{}'::jsonb), error_code = null,
    completed_at = now(), updated_at = now() where id = p_job_id;
  return jsonb_build_object('careerId', v_career.id, 'slug', v_career.slug, 'careerStatus', v_status, 'status', 'review');
end;
$$;

revoke all on function public.enqueue_career_generation(uuid,text,integer) from public, anon, authenticated;
revoke all on function public.claim_career_generation_job() from public, anon, authenticated;
revoke all on function public.complete_career_generation(uuid,text,text,text,text,jsonb,jsonb,jsonb,jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.enqueue_career_generation(uuid,text,integer) to service_role;
grant execute on function public.claim_career_generation_job() to service_role;
grant execute on function public.complete_career_generation(uuid,text,text,text,text,jsonb,jsonb,jsonb,jsonb,jsonb) to service_role;

commit;
