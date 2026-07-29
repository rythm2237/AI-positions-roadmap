begin;

create extension if not exists pgcrypto;

create table if not exists public.app_user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','user')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  primary key (user_id, role)
);
create index if not exists app_user_roles_role_idx on public.app_user_roles(role, user_id);

create or replace function public.valid_admin_country_codes(codes text[]) returns boolean
language sql immutable set search_path = public as $$
  select coalesce(array_length(codes,1),0) <= 10
    and not exists(select 1 from unnest(codes) code where code !~ '^[a-z]{2}$')
    and cardinality(codes) = cardinality(array(select distinct code from unnest(codes) code));
$$;
create or replace function public.valid_career_taxonomy(value jsonb) returns boolean
language sql immutable set search_path = public as $$
  select jsonb_typeof(value)='object'
    and jsonb_typeof(value->'primaryTitle')='string'
    and char_length(trim(value->>'primaryTitle')) between 2 and 120
    and jsonb_typeof(value->'aliases')='array'
    and jsonb_array_length(value->'aliases') <= 20
    and not exists(select 1 from jsonb_array_elements(value->'aliases') alias where jsonb_typeof(alias) <> 'string' or char_length(trim(alias #>> '{}')) > 120);
$$;

create table if not exists public.careers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(trim(title)) between 2 and 120),
  short_title text not null check (char_length(trim(short_title)) between 2 and 80),
  summary text check (summary is null or char_length(summary) <= 1200),
  status text not null default 'draft' check (status in ('draft','archived','review','published')),
  taxonomy jsonb not null,
  default_country_codes text[] not null default '{}'::text[],
  created_by uuid not null references auth.users(id),
  updated_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  check (public.valid_career_taxonomy(taxonomy)),
  check (public.valid_admin_country_codes(default_country_codes))
);
create index if not exists careers_status_updated_idx on public.careers(status, updated_at desc);

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references auth.users(id),
  action text not null check (action in ('career.created','career.updated','career.archived','career.restored')),
  entity_type text not null check (entity_type = 'career'),
  entity_id uuid not null references public.careers(id),
  changed_fields jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists admin_audit_entity_idx on public.admin_audit_log(entity_type, entity_id, created_at desc);
create index if not exists admin_audit_actor_idx on public.admin_audit_log(actor_user_id, created_at desc);

alter table public.app_user_roles enable row level security;
alter table public.careers enable row level security;
alter table public.admin_audit_log enable row level security;

create or replace function public.is_app_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.app_user_roles where app_user_roles.user_id = auth.uid() and role = 'admin');
$$;

drop policy if exists app_user_roles_read_own on public.app_user_roles;
create policy app_user_roles_read_own on public.app_user_roles for select to authenticated using (user_id = auth.uid());
drop policy if exists careers_admin_read on public.careers;
create policy careers_admin_read on public.careers for select to authenticated using (public.is_app_admin());
drop policy if exists admin_audit_admin_read on public.admin_audit_log;
create policy admin_audit_admin_read on public.admin_audit_log for select to authenticated using (public.is_app_admin());

revoke all on public.app_user_roles, public.careers, public.admin_audit_log from anon;
revoke insert, update, delete on public.app_user_roles, public.careers, public.admin_audit_log from authenticated;
grant select on public.app_user_roles, public.careers, public.admin_audit_log to authenticated;

create or replace function public.admin_create_career(
  p_slug text, p_title text, p_short_title text, p_summary text,
  p_taxonomy jsonb, p_default_country_codes text[]
) returns public.careers language plpgsql security definer set search_path = public as $$
declare result public.careers;
begin
  if not public.is_app_admin() then raise exception 'admin_required' using errcode = '42501'; end if;
  insert into public.careers(slug,title,short_title,summary,status,taxonomy,default_country_codes,created_by,updated_by)
  values(p_slug,trim(p_title),trim(p_short_title),nullif(trim(p_summary),''),'draft',p_taxonomy,p_default_country_codes,auth.uid(),auth.uid())
  returning * into result;
  insert into public.admin_audit_log(actor_user_id,action,entity_type,entity_id,changed_fields)
  values(auth.uid(),'career.created','career',result.id,jsonb_build_object('fields',jsonb_build_array('slug','title','short_title','summary','taxonomy','default_country_codes','status')));
  return result;
end $$;

create or replace function public.admin_update_career(
  p_id uuid, p_title text, p_short_title text, p_summary text,
  p_taxonomy jsonb, p_default_country_codes text[]
) returns public.careers language plpgsql security definer set search_path = public as $$
declare result public.careers;
begin
  if not public.is_app_admin() then raise exception 'admin_required' using errcode = '42501'; end if;
  update public.careers set title=trim(p_title),short_title=trim(p_short_title),summary=nullif(trim(p_summary),''),taxonomy=p_taxonomy,default_country_codes=p_default_country_codes,updated_by=auth.uid(),updated_at=now()
  where id=p_id returning * into result;
  if result.id is null then raise exception 'career_not_found' using errcode = 'P0002'; end if;
  insert into public.admin_audit_log(actor_user_id,action,entity_type,entity_id,changed_fields)
  values(auth.uid(),'career.updated','career',result.id,jsonb_build_object('fields',jsonb_build_array('title','short_title','summary','taxonomy','default_country_codes')));
  return result;
end $$;

create or replace function public.admin_set_career_archived(p_id uuid, p_archived boolean) returns public.careers
language plpgsql security definer set search_path = public as $$
declare result public.careers;
begin
  if not public.is_app_admin() then raise exception 'admin_required' using errcode = '42501'; end if;
  update public.careers set status=case when p_archived then 'archived' else 'draft' end,archived_at=case when p_archived then now() else null end,updated_by=auth.uid(),updated_at=now()
  where id=p_id and ((p_archived and status <> 'archived') or (not p_archived and status = 'archived')) returning * into result;
  if result.id is null then raise exception 'career_state_unchanged' using errcode = 'P0001'; end if;
  insert into public.admin_audit_log(actor_user_id,action,entity_type,entity_id,changed_fields)
  values(auth.uid(),case when p_archived then 'career.archived' else 'career.restored' end,'career',result.id,jsonb_build_object('fields',jsonb_build_array('status','archived_at')));
  return result;
end $$;

revoke all on function public.valid_admin_country_codes(text[]), public.valid_career_taxonomy(jsonb), public.is_app_admin(), public.admin_create_career(text,text,text,text,jsonb,text[]), public.admin_update_career(uuid,text,text,text,jsonb,text[]), public.admin_set_career_archived(uuid,boolean) from public, anon;
grant execute on function public.is_app_admin(), public.admin_create_career(text,text,text,text,jsonb,text[]), public.admin_update_career(uuid,text,text,text,jsonb,text[]), public.admin_set_career_archived(uuid,boolean) to authenticated;

commit;
