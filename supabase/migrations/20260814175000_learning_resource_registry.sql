-- Central Learning Resource Registry
-- Stores every Admin-managed learning destination independently from a Career
-- so verification, cost/access and replacement can be maintained globally.

create table if not exists public.learning_resources (
  id uuid primary key default gen_random_uuid(),
  canonical_url text not null,
  mode text not null check (mode in ('reading', 'video', 'course', 'practice')),
  title text not null,
  provider text not null,
  content_type text not null,
  cost text not null default 'Free/Paid' check (cost in ('Free', 'Paid', 'Free/Paid')),
  is_official boolean not null default false,
  direct_destination_verified boolean not null default false,
  status text not null default 'needs_review' check (status in ('active', 'needs_review', 'broken', 'replaced', 'retired')),
  verified_at timestamptz,
  review_interval_days integer not null default 30 check (review_interval_days between 1 and 365),
  next_review_at timestamptz,
  last_seen_at timestamptz not null default now(),
  source_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (canonical_url, mode)
);

create index if not exists learning_resources_review_due_idx
  on public.learning_resources (status, next_review_at);
create index if not exists learning_resources_provider_idx
  on public.learning_resources (provider);

create table if not exists public.career_learning_resources (
  career_id uuid not null references public.careers(id) on delete cascade,
  requirement_id text not null,
  milestone_id text not null,
  mode text not null check (mode in ('reading', 'video', 'course', 'practice')),
  resource_id uuid not null references public.learning_resources(id) on delete restrict,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (career_id, requirement_id, mode)
);

create index if not exists career_learning_resources_resource_idx
  on public.career_learning_resources (resource_id);

alter table public.learning_resources enable row level security;
alter table public.career_learning_resources enable row level security;

revoke all on public.learning_resources from public;
revoke all on public.career_learning_resources from public;

grant select on public.learning_resources to anon, authenticated;
grant insert, update, delete on public.learning_resources to authenticated;
grant select on public.career_learning_resources to anon, authenticated;
grant insert, update, delete on public.career_learning_resources to authenticated;

drop policy if exists learning_resources_public_read_active on public.learning_resources;
create policy learning_resources_public_read_active
on public.learning_resources
for select
to anon, authenticated
using (
  status = 'active'
  and direct_destination_verified = true
  and (next_review_at is null or next_review_at >= now())
);

drop policy if exists learning_resources_admin_all on public.learning_resources;
create policy learning_resources_admin_all
on public.learning_resources
for all
to authenticated
using (public.is_app_admin())
with check (public.is_app_admin());

drop policy if exists career_learning_resources_public_read_published on public.career_learning_resources;
create policy career_learning_resources_public_read_published
on public.career_learning_resources
for select
to anon, authenticated
using (
  approved = true
  and exists (
    select 1
    from public.careers c
    where c.id = career_learning_resources.career_id
      and c.status = 'published'
      and c.workspace_data is not null
  )
);

drop policy if exists career_learning_resources_admin_all on public.career_learning_resources;
create policy career_learning_resources_admin_all
on public.career_learning_resources
for all
to authenticated
using (public.is_app_admin())
with check (public.is_app_admin());

create or replace function public.admin_sync_career_learning_resources(
  p_career_id uuid,
  p_workspace_data jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_resource_count integer := 0;
  v_mapping_count integer := 0;
begin
  if not public.is_app_admin() then
    raise exception 'admin_required' using errcode = '42501';
  end if;

  if not exists (select 1 from public.careers where id = p_career_id) then
    raise exception 'career_not_found' using errcode = 'P0002';
  end if;

  with source as (
    select
      r,
      regexp_replace(trim(r->>'url'), '/+$', '') as canonical_url,
      case
        when r->>'type' = 'Video' then 'video'
        when r->>'type' in ('Course', 'Learning Path') then 'course'
        when r->>'type' in ('Practice', 'Exam') then 'practice'
        else 'reading'
      end as mode
    from jsonb_array_elements(coalesce(p_workspace_data->'globalResources', '[]'::jsonb)) as r
    where coalesce(trim(r->>'url'), '') ~ '^https://'
  )
  insert into public.learning_resources (
    canonical_url,
    mode,
    title,
    provider,
    content_type,
    cost,
    is_official,
    direct_destination_verified,
    status,
    verified_at,
    review_interval_days,
    next_review_at,
    last_seen_at,
    source_metadata,
    updated_at
  )
  select
    canonical_url,
    mode,
    coalesce(nullif(trim(r->>'title'), ''), 'Untitled resource'),
    coalesce(nullif(trim(r->>'provider'), ''), 'Unknown provider'),
    coalesce(
      nullif(trim(r->>'contentType'), ''),
      case mode
        when 'video' then 'video'
        when 'course' then 'official-course'
        when 'practice' then 'hands-on-lab'
        else 'documentation'
      end
    ),
    case when r->>'cost' in ('Free', 'Paid', 'Free/Paid') then r->>'cost' else 'Free/Paid' end,
    coalesce((r->>'isOfficial')::boolean, false),
    coalesce((r->>'directDestinationVerified')::boolean, false),
    case
      when coalesce((r->>'directDestinationVerified')::boolean, false) = true
       and (
         nullif(r->>'nextReviewAt', '') is null
         or (r->>'nextReviewAt')::timestamptz >= now()
       )
      then 'active'
      else 'needs_review'
    end,
    nullif(r->>'verifiedAt', '')::timestamptz,
    greatest(1, least(365, coalesce(nullif(r->>'reviewIntervalDays', '')::integer, 30))),
    nullif(r->>'nextReviewAt', '')::timestamptz,
    now(),
    jsonb_strip_nulls(jsonb_build_object(
      'workspaceResourceId', r->>'id',
      'estimatedTime', r->>'estimatedTime',
      'whyUseful', r->>'whyUseful',
      'priority', r->>'priority',
      'verificationSource', r->>'verificationSource'
    )),
    now()
  from source
  on conflict (canonical_url, mode) do update set
    title = excluded.title,
    provider = excluded.provider,
    content_type = excluded.content_type,
    cost = excluded.cost,
    is_official = excluded.is_official,
    direct_destination_verified = excluded.direct_destination_verified,
    status = excluded.status,
    verified_at = excluded.verified_at,
    review_interval_days = excluded.review_interval_days,
    next_review_at = excluded.next_review_at,
    last_seen_at = now(),
    source_metadata = public.learning_resources.source_metadata || excluded.source_metadata,
    updated_at = now();

  get diagnostics v_resource_count = row_count;

  delete from public.career_learning_resources
  where career_id = p_career_id;

  with mapping_source as (
    select m
    from jsonb_array_elements(coalesce(p_workspace_data->'resourceMappings', '[]'::jsonb)) as m
  ), expanded as (
    select
      m,
      x.mode,
      x.workspace_resource_id
    from mapping_source
    cross join lateral (
      values
        ('reading'::text, nullif(m->>'reading', '')),
        ('video'::text, nullif(m->>'video', '')),
        ('course'::text, nullif(m->>'course', '')),
        ('practice'::text, nullif(m->>'practice', ''))
    ) as x(mode, workspace_resource_id)
    where x.workspace_resource_id is not null
  ), resolved as (
    select
      e.m,
      e.mode,
      e.workspace_resource_id,
      regexp_replace(trim(r->>'url'), '/+$', '') as canonical_url
    from expanded e
    join lateral (
      select item as r
      from jsonb_array_elements(coalesce(p_workspace_data->'globalResources', '[]'::jsonb)) as item
      where item->>'id' = e.workspace_resource_id
      limit 1
    ) found on true
  )
  insert into public.career_learning_resources (
    career_id,
    requirement_id,
    milestone_id,
    mode,
    resource_id,
    approved,
    updated_at
  )
  select
    p_career_id,
    r.m->>'requirementId',
    r.m->>'milestoneId',
    r.mode,
    lr.id,
    (r.m->>'status' = 'complete'),
    now()
  from resolved r
  join public.learning_resources lr
    on lr.canonical_url = r.canonical_url
   and lr.mode = r.mode
  where coalesce(r.m->>'requirementId', '') <> ''
    and coalesce(r.m->>'milestoneId', '') <> ''
  on conflict (career_id, requirement_id, mode) do update set
    milestone_id = excluded.milestone_id,
    resource_id = excluded.resource_id,
    approved = excluded.approved,
    updated_at = now();

  get diagnostics v_mapping_count = row_count;

  return jsonb_build_object(
    'careerId', p_career_id,
    'resourcesSynced', v_resource_count,
    'mappingsSynced', v_mapping_count
  );
end;
$$;

revoke all on function public.admin_sync_career_learning_resources(uuid, jsonb) from public;
grant execute on function public.admin_sync_career_learning_resources(uuid, jsonb) to authenticated;

comment on table public.learning_resources is
  'Central Career OS learning-resource registry with destination fidelity, cost and freshness metadata.';
comment on table public.career_learning_resources is
  'Approved or review-pending mappings from Career learning requirements to the central learning-resource registry.';
comment on function public.admin_sync_career_learning_resources(uuid, jsonb) is
  'Synchronizes Admin-managed Career workspace resources into the central learning-resource registry.';