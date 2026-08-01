begin;

alter table public.careers
  add column if not exists workspace_data jsonb,
  add column if not exists validation_errors jsonb not null default '[]'::jsonb,
  add column if not exists content_version integer not null default 1 check (content_version > 0),
  add column if not exists published_at timestamptz;

drop policy if exists careers_public_read_published on public.careers;
create policy careers_public_read_published on public.careers
  for select to anon, authenticated using (status = 'published' and workspace_data is not null);
grant select (id,slug,title,short_title,summary,status,taxonomy,default_country_codes,workspace_data,content_version,published_at,updated_at)
  on public.careers to anon;

create or replace function public.admin_update_career(
  p_id uuid,p_title text,p_short_title text,p_summary text,p_taxonomy jsonb,p_default_country_codes text[]
) returns public.careers language plpgsql security definer set search_path=public as $$
declare result public.careers;
begin
  if not public.is_app_admin() then raise exception 'admin_required' using errcode='42501'; end if;
  update public.careers set title=trim(p_title),short_title=trim(p_short_title),summary=nullif(trim(p_summary),''),
    taxonomy=p_taxonomy,default_country_codes=p_default_country_codes,
    status=case when status='published' then 'draft' else status end,
    published_at=case when status='published' then null else published_at end,
    updated_by=auth.uid(),updated_at=now()
  where id=p_id returning * into result;
  if result.id is null then raise exception 'career_not_found' using errcode='P0002'; end if;
  insert into public.admin_audit_log(actor_user_id,action,entity_type,entity_id,changed_fields)
    values(auth.uid(),'career.updated','career',result.id,jsonb_build_object('fields',jsonb_build_array('title','short_title','summary','taxonomy','default_country_codes','status')));
  return result;
end $$;

alter table public.admin_audit_log drop constraint if exists admin_audit_log_action_check;
alter table public.admin_audit_log add constraint admin_audit_log_action_check
  check (action in ('career.created','career.updated','career.archived','career.restored','career.content_updated','career.submitted','career.published','career.unpublished'));

create or replace function public.admin_save_career_content(p_id uuid,p_workspace_data jsonb,p_validation_errors jsonb)
returns public.careers language plpgsql security definer set search_path=public as $$
declare result public.careers;
begin
  if not public.is_app_admin() then raise exception 'admin_required' using errcode='42501'; end if;
  if jsonb_typeof(p_workspace_data) <> 'object' or jsonb_typeof(p_validation_errors) <> 'array' then raise exception 'invalid_content' using errcode='22023'; end if;
  update public.careers set workspace_data=p_workspace_data,validation_errors=p_validation_errors,
    content_version=content_version+1,status=case when status='published' then 'draft' else status end,
    published_at=case when status='published' then null else published_at end,updated_by=auth.uid(),updated_at=now()
  where id=p_id returning * into result;
  if result.id is null then raise exception 'career_not_found' using errcode='P0002'; end if;
  insert into public.admin_audit_log(actor_user_id,action,entity_type,entity_id,changed_fields)
    values(auth.uid(),'career.content_updated','career',p_id,jsonb_build_object('fields',jsonb_build_array('workspace_data','validation_errors','content_version','status')));
  return result;
end $$;

create or replace function public.admin_set_career_publication(p_id uuid,p_publish boolean)
returns public.careers language plpgsql security definer set search_path=public as $$
declare result public.careers;
begin
  if not public.is_app_admin() then raise exception 'admin_required' using errcode='42501'; end if;
  if p_publish and exists(select 1 from public.careers where id=p_id and (workspace_data is null or jsonb_array_length(validation_errors)>0)) then
    raise exception 'career_content_invalid' using errcode='22023';
  end if;
  update public.careers set status=case when p_publish then 'published' else 'draft' end,
    published_at=case when p_publish then now() else null end,updated_by=auth.uid(),updated_at=now()
  where id=p_id and status <> 'archived' returning * into result;
  if result.id is null then raise exception 'career_not_found' using errcode='P0002'; end if;
  insert into public.admin_audit_log(actor_user_id,action,entity_type,entity_id,changed_fields)
    values(auth.uid(),case when p_publish then 'career.published' else 'career.unpublished' end,'career',p_id,jsonb_build_object('fields',jsonb_build_array('status','published_at')));
  return result;
end $$;

revoke all on function public.admin_save_career_content(uuid,jsonb,jsonb),public.admin_set_career_publication(uuid,boolean) from public,anon;
grant execute on function public.admin_save_career_content(uuid,jsonb,jsonb),public.admin_set_career_publication(uuid,boolean) to authenticated;
commit;
