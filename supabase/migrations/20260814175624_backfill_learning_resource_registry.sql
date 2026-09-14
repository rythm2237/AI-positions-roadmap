-- Backfill existing Admin-managed Career resources into the normalized registry.
with source as (
  select
    c.id as career_id,
    r,
    regexp_replace(trim(r->>'url'), '/+$', '') as canonical_url,
    case
      when r->>'type' = 'Video' then 'video'
      when r->>'type' in ('Course', 'Learning Path') then 'course'
      when r->>'type' in ('Practice', 'Exam') then 'practice'
      else 'reading'
    end as mode
  from public.careers c
  cross join lateral jsonb_array_elements(coalesce(c.workspace_data->'globalResources', '[]'::jsonb)) as r
  where c.workspace_data is not null
    and coalesce(trim(r->>'url'), '') ~ '^https://'
)
insert into public.learning_resources (
  canonical_url, mode, title, provider, content_type, cost,
  is_official, direct_destination_verified, status, verified_at,
  review_interval_days, next_review_at, last_seen_at, source_metadata, updated_at
)
select
  canonical_url,
  mode,
  coalesce(nullif(trim(r->>'title'), ''), 'Untitled resource'),
  coalesce(nullif(trim(r->>'provider'), ''), 'Unknown provider'),
  coalesce(nullif(trim(r->>'contentType'), ''), case mode when 'video' then 'video' when 'course' then 'official-course' when 'practice' then 'hands-on-lab' else 'documentation' end),
  case when r->>'cost' in ('Free','Paid','Free/Paid') then r->>'cost' else 'Free/Paid' end,
  coalesce((r->>'isOfficial')::boolean, false),
  coalesce((r->>'directDestinationVerified')::boolean, false),
  case when coalesce((r->>'directDestinationVerified')::boolean, false) = true and (nullif(r->>'nextReviewAt','') is null or (r->>'nextReviewAt')::timestamptz >= now()) then 'active' else 'needs_review' end,
  nullif(r->>'verifiedAt','')::timestamptz,
  greatest(1, least(365, coalesce(nullif(r->>'reviewIntervalDays','')::integer, 30))),
  nullif(r->>'nextReviewAt','')::timestamptz,
  now(),
  jsonb_strip_nulls(jsonb_build_object(
    'workspaceResourceId', r->>'id',
    'careerId', career_id,
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

with mappings as (
  select c.id as career_id, m
  from public.careers c
  cross join lateral jsonb_array_elements(coalesce(c.workspace_data->'resourceMappings', '[]'::jsonb)) as m
  where c.workspace_data is not null
),
expanded as (
  select career_id, m, x.mode, x.workspace_resource_id
  from mappings
  cross join lateral (
    values
      ('reading'::text, nullif(m->>'reading','')),
      ('video'::text, nullif(m->>'video','')),
      ('course'::text, nullif(m->>'course','')),
      ('practice'::text, nullif(m->>'practice',''))
  ) as x(mode, workspace_resource_id)
  where x.workspace_resource_id is not null
),
resolved as (
  select e.career_id, e.m, e.mode, regexp_replace(trim(r->>'url'), '/+$', '') as canonical_url
  from expanded e
  join public.careers c on c.id = e.career_id
  join lateral (
    select item as r
    from jsonb_array_elements(coalesce(c.workspace_data->'globalResources', '[]'::jsonb)) as item
    where item->>'id' = e.workspace_resource_id
    limit 1
  ) found on true
)
insert into public.career_learning_resources (
  career_id, requirement_id, milestone_id, mode, resource_id, approved, updated_at
)
select
  r.career_id,
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
where coalesce(r.m->>'requirementId','') <> ''
  and coalesce(r.m->>'milestoneId','') <> ''
on conflict (career_id, requirement_id, mode) do update set
  milestone_id = excluded.milestone_id,
  resource_id = excluded.resource_id,
  approved = excluded.approved,
  updated_at = now();
