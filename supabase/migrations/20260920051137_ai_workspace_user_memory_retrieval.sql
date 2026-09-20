-- Include owner-level memory alongside current-project memory; keep files strictly project-scoped.
create or replace function public.aiw_retrieve_project_context(
  p_owner uuid,p_project uuid,p_query text,p_limit integer default 8
)
returns jsonb
language plpgsql security invoker set search_path=''
as $$
declare q tsquery; lim integer; result jsonb;
begin
  lim:=greatest(1,least(coalesce(p_limit,8),20));
  if not exists(select 1 from public.aiw_projects where id=p_project and owner_id=p_owner and not archived) then return '[]'::jsonb; end if;
  begin q:=websearch_to_tsquery('simple',left(coalesce(p_query,''),2000)); exception when others then q:=plainto_tsquery('simple',left(coalesce(p_query,''),2000)); end;
  with candidates as (
    select 'memory'::text source_type,m.id source_id,null::uuid file_id,m.content,
      case when q::text='' then 0::real else ts_rank(to_tsvector('simple',m.content),q) end rank,
      m.updated_at source_time
    from public.aiw_memories m
    where m.owner_id=p_owner and m.status='active'
      and ((m.scope='user' and m.project_id is null) or (m.scope='project' and m.project_id=p_project))
    union all
    select 'file'::text,c.id,c.file_id,c.content,
      case when q::text='' then 0::real else ts_rank(to_tsvector('simple',c.content),q) end,
      c.created_at
    from public.aiw_file_chunks c join public.aiw_files f on f.id=c.file_id
    where c.owner_id=p_owner and c.project_id=p_project and f.owner_id=p_owner and f.project_id=p_project
      and f.status='ready' and f.deleted_at is null
  ), ranked as (
    select * from candidates where q::text='' or rank>0 order by rank desc,source_time desc limit lim
  )
  select coalesce(jsonb_agg(jsonb_build_object('sourceType',source_type,'sourceId',source_id,'fileId',file_id,'content',content,'rank',rank)),'[]'::jsonb) into result from ranked;
  return result;
end $$;
revoke all on function public.aiw_retrieve_project_context(uuid,uuid,text,integer) from public,anon,authenticated;
grant execute on function public.aiw_retrieve_project_context(uuid,uuid,text,integer) to service_role;
