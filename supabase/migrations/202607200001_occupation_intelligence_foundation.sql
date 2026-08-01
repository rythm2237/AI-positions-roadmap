begin;

create table if not exists public.occupation_families (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check(slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check(char_length(trim(name)) between 2 and 120),
  short_name text not null check(char_length(trim(short_name)) between 2 and 80),
  description text not null check(char_length(trim(description)) between 1 and 2000),
  status text not null default 'draft' check(status in ('draft','active','archived')),
  classification_scope text not null,
  aliases text[] not null default '{}',
  included_occupations text[] not null default '{}',
  excluded_occupations text[] not null default '{}',
  methodology_summary text not null,
  mapping_version text not null check(mapping_version ~ '^[a-zA-Z0-9._-]{1,40}$'),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  check(cardinality(aliases)<=50 and cardinality(included_occupations)<=50 and cardinality(excluded_occupations)<=50)
);

create table if not exists public.occupation_mappings (
  id uuid primary key default gen_random_uuid(),
  occupation_family_id uuid not null references public.occupation_families(id),
  country_code text not null check(country_code in ('us','ca','au','gb','fr','de','ie','no')),
  classification_system text not null,
  occupation_code text not null,
  occupation_title text not null,
  relevance_level text not null check(relevance_level in ('primary','related','adjacent')),
  weight numeric(5,4) not null check(weight>0 and weight<=1),
  inclusion_reason text not null,
  exclusions text[] not null default '{}',
  mapping_confidence text not null check(mapping_confidence in ('low','moderate','high')),
  mapping_version text not null check(mapping_version ~ '^[a-zA-Z0-9._-]{1,40}$'),
  effective_from date,
  effective_to date,
  review_status text not null default 'draft' check(review_status in ('draft','under-review','approved','rejected')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  evidence_urls text[] not null default '{}',
  notes text,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check(effective_to is null or effective_from is null or effective_to>=effective_from),
  unique(occupation_family_id,country_code,classification_system,occupation_code,mapping_version)
);

create table if not exists public.occupation_roadmap_links (
  occupation_family_id uuid not null references public.occupation_families(id),
  career_slug text not null check(career_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  relationship_type text not null check(relationship_type in ('primary-roadmap','related-roadmap','adjacent-roadmap')),
  priority integer not null default 100 check(priority>=0),
  status text not null default 'active' check(status in ('active','inactive')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(occupation_family_id,career_slug,relationship_type)
);

create table if not exists public.intelligence_snapshot_occupation_links (
  snapshot_id uuid primary key references public.intelligence_snapshots(id),
  occupation_family_id uuid not null references public.occupation_families(id),
  link_type text not null check(link_type in ('legacy-career-mapping','native-occupation')),
  mapping_version text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.occupation_admin_audit (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id),
  action text not null check(action in ('occupation.created','occupation.updated','occupation.archived','occupation.restored','mapping.upserted','roadmap-link.upserted')),
  entity_type text not null check(entity_type in ('occupation-family','occupation-mapping','occupation-roadmap-link')),
  entity_id text not null,
  changed_fields jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.intelligence_snapshots add column if not exists occupation_family_id uuid references public.occupation_families(id);
alter table public.intelligence_refresh_items add column if not exists occupation_family_id uuid references public.occupation_families(id);

create index if not exists occupation_families_status_idx on public.occupation_families(status,updated_at desc);
create index if not exists occupation_mappings_family_country_idx on public.occupation_mappings(occupation_family_id,country_code,review_status);
create index if not exists occupation_roadmap_career_idx on public.occupation_roadmap_links(career_slug,status,priority);
create index if not exists intelligence_snapshot_occupation_idx on public.intelligence_snapshots(occupation_family_id,country_code,snapshot_type,published_at desc);
create index if not exists occupation_audit_entity_idx on public.occupation_admin_audit(entity_type,entity_id,created_at desc);

alter table public.occupation_families enable row level security;
alter table public.occupation_mappings enable row level security;
alter table public.occupation_roadmap_links enable row level security;
alter table public.intelligence_snapshot_occupation_links enable row level security;
alter table public.occupation_admin_audit enable row level security;

create policy occupation_families_admin_read on public.occupation_families for select to authenticated using(public.is_app_admin());
create policy occupation_mappings_admin_read on public.occupation_mappings for select to authenticated using(public.is_app_admin());
create policy occupation_roadmap_links_admin_read on public.occupation_roadmap_links for select to authenticated using(public.is_app_admin());
create policy intelligence_snapshot_occupation_links_admin_read on public.intelligence_snapshot_occupation_links for select to authenticated using(public.is_app_admin());
create policy occupation_admin_audit_admin_read on public.occupation_admin_audit for select to authenticated using(public.is_app_admin());

revoke all on public.occupation_families,public.occupation_mappings,public.occupation_roadmap_links,public.intelligence_snapshot_occupation_links,public.occupation_admin_audit from anon;
revoke insert,update,delete on public.occupation_families,public.occupation_mappings,public.occupation_roadmap_links,public.intelligence_snapshot_occupation_links,public.occupation_admin_audit from authenticated;
grant select on public.occupation_families,public.occupation_mappings,public.occupation_roadmap_links,public.intelligence_snapshot_occupation_links,public.occupation_admin_audit to authenticated;

create or replace function public.admin_save_occupation_family(p_id uuid,p_value jsonb)
returns public.occupation_families language plpgsql security definer set search_path=public as $$
declare result public.occupation_families; action_name text;
begin
  if not public.is_app_admin() then raise exception 'admin_required' using errcode='42501'; end if;
  if p_id is null then
    insert into occupation_families(slug,name,short_name,description,classification_scope,aliases,included_occupations,excluded_occupations,methodology_summary,mapping_version,created_by,updated_by)
    values(p_value->>'slug',trim(p_value->>'name'),trim(p_value->>'shortName'),trim(p_value->>'description'),trim(p_value->>'classificationScope'),
      array(select jsonb_array_elements_text(coalesce(p_value->'aliases','[]'))),array(select jsonb_array_elements_text(coalesce(p_value->'includedOccupations','[]'))),
      array(select jsonb_array_elements_text(coalesce(p_value->'excludedOccupations','[]'))),trim(p_value->>'methodologySummary'),p_value->>'mappingVersion',auth.uid(),auth.uid()) returning * into result;
    action_name:='occupation.created';
  else
    update occupation_families set name=trim(p_value->>'name'),short_name=trim(p_value->>'shortName'),description=trim(p_value->>'description'),
      classification_scope=trim(p_value->>'classificationScope'),aliases=array(select jsonb_array_elements_text(coalesce(p_value->'aliases','[]'))),
      included_occupations=array(select jsonb_array_elements_text(coalesce(p_value->'includedOccupations','[]'))),excluded_occupations=array(select jsonb_array_elements_text(coalesce(p_value->'excludedOccupations','[]'))),
      methodology_summary=trim(p_value->>'methodologySummary'),mapping_version=p_value->>'mappingVersion',updated_by=auth.uid(),updated_at=now()
      where id=p_id returning * into result;
    action_name:='occupation.updated';
  end if;
  if result.id is null then raise exception 'occupation_not_found' using errcode='P0002'; end if;
  insert into occupation_admin_audit(actor_user_id,action,entity_type,entity_id,changed_fields)
    values(auth.uid(),action_name,'occupation-family',result.id::text,jsonb_build_object('fields',jsonb_build_array('name','short_name','description','classification_scope','aliases','included_occupations','excluded_occupations','methodology_summary','mapping_version')));
  return result;
end $$;

create or replace function public.admin_set_occupation_archived(p_id uuid,p_archived boolean)
returns public.occupation_families language plpgsql security definer set search_path=public as $$
declare result public.occupation_families;
begin
  if not public.is_app_admin() then raise exception 'admin_required' using errcode='42501'; end if;
  update occupation_families set status=case when p_archived then 'archived' else 'draft' end,archived_at=case when p_archived then now() else null end,updated_by=auth.uid(),updated_at=now() where id=p_id returning * into result;
  if result.id is null then raise exception 'occupation_not_found' using errcode='P0002'; end if;
  insert into occupation_admin_audit(actor_user_id,action,entity_type,entity_id,changed_fields) values(auth.uid(),case when p_archived then 'occupation.archived' else 'occupation.restored' end,'occupation-family',result.id::text,jsonb_build_object('fields',jsonb_build_array('status','archived_at')));
  return result;
end $$;

create or replace function public.admin_upsert_occupation_mapping(p_value jsonb)
returns public.occupation_mappings language plpgsql security definer set search_path=public as $$
declare result public.occupation_mappings;
begin
  if not public.is_app_admin() then raise exception 'admin_required' using errcode='42501'; end if;
  insert into occupation_mappings(occupation_family_id,country_code,classification_system,occupation_code,occupation_title,relevance_level,weight,inclusion_reason,exclusions,mapping_confidence,mapping_version,review_status,evidence_urls,notes,created_by,updated_by)
  values((p_value->>'occupationFamilyId')::uuid,lower(p_value->>'countryCode'),p_value->>'classificationSystem',p_value->>'occupationCode',p_value->>'occupationTitle',p_value->>'relevanceLevel',(p_value->>'weight')::numeric,p_value->>'inclusionReason',array(select jsonb_array_elements_text(coalesce(p_value->'exclusions','[]'))),p_value->>'mappingConfidence',p_value->>'mappingVersion',p_value->>'reviewStatus',array(select jsonb_array_elements_text(coalesce(p_value->'evidenceUrls','[]'))),nullif(trim(p_value->>'notes'),''),auth.uid(),auth.uid())
  on conflict(occupation_family_id,country_code,classification_system,occupation_code,mapping_version) do update set occupation_title=excluded.occupation_title,relevance_level=excluded.relevance_level,weight=excluded.weight,inclusion_reason=excluded.inclusion_reason,exclusions=excluded.exclusions,mapping_confidence=excluded.mapping_confidence,review_status=excluded.review_status,evidence_urls=excluded.evidence_urls,notes=excluded.notes,updated_by=auth.uid(),updated_at=now() returning * into result;
  insert into occupation_admin_audit(actor_user_id,action,entity_type,entity_id,changed_fields) values(auth.uid(),'mapping.upserted','occupation-mapping',result.id::text,jsonb_build_object('reviewStatus',result.review_status,'mappingVersion',result.mapping_version));
  return result;
end $$;

create or replace function public.admin_upsert_occupation_roadmap_link(p_occupation_family_id uuid,p_career_slug text,p_relationship_type text,p_priority integer,p_status text)
returns public.occupation_roadmap_links language plpgsql security definer set search_path=public as $$
declare result public.occupation_roadmap_links;
begin
  if not public.is_app_admin() then raise exception 'admin_required' using errcode='42501'; end if;
  insert into occupation_roadmap_links(occupation_family_id,career_slug,relationship_type,priority,status,created_by)
  values(p_occupation_family_id,p_career_slug,p_relationship_type,p_priority,p_status,auth.uid())
  on conflict(occupation_family_id,career_slug,relationship_type) do update set priority=excluded.priority,status=excluded.status,updated_at=now() returning * into result;
  insert into occupation_admin_audit(actor_user_id,action,entity_type,entity_id,changed_fields) values(auth.uid(),'roadmap-link.upserted','occupation-roadmap-link',result.occupation_family_id::text||':'||result.career_slug,jsonb_build_object('relationshipType',result.relationship_type,'status',result.status));
  return result;
end $$;

revoke all on function public.admin_save_occupation_family(uuid,jsonb),public.admin_set_occupation_archived(uuid,boolean),public.admin_upsert_occupation_mapping(jsonb),public.admin_upsert_occupation_roadmap_link(uuid,text,text,integer,text) from public,anon;
grant execute on function public.admin_save_occupation_family(uuid,jsonb),public.admin_set_occupation_archived(uuid,boolean),public.admin_upsert_occupation_mapping(jsonb),public.admin_upsert_occupation_roadmap_link(uuid,text,text,integer,text) to authenticated;

insert into occupation_families(id,slug,name,short_name,description,status,classification_scope,aliases,included_occupations,excluded_occupations,methodology_summary,mapping_version)
values('10000000-0000-4000-8000-000000000001','ai-ml-engineering','AI and Machine Learning Engineering','AI/ML Engineering','An occupation family for official statistical benchmarks related to designing, building and operating artificial-intelligence and machine-learning systems.','active','Country-specific official occupation classifications; no single global code is asserted.',array['Artificial Intelligence Engineering','Machine Learning Engineering'],array['Software Developers','Data Scientists','Computer and Information Research Scientists'],array['Generic IT management','Unrelated data-entry occupations'],'Country mappings require independent review. Source evidence quality and mapping confidence remain separate.','1.0.0')
on conflict(slug) do nothing;

insert into occupation_roadmap_links(occupation_family_id,career_slug,relationship_type,priority,status)
values('10000000-0000-4000-8000-000000000001','ai-engineer','primary-roadmap',1,'active') on conflict do nothing;

insert into intelligence_snapshot_occupation_links(snapshot_id,occupation_family_id,link_type,mapping_version)
select snapshot.id,'10000000-0000-4000-8000-000000000001','legacy-career-mapping','legacy-ai-engineer-v1'
from intelligence_snapshots snapshot where snapshot.career_slug='ai-engineer'
on conflict(snapshot_id) do nothing;

commit;
