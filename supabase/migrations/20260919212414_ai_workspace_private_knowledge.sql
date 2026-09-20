-- AI Workspace private project knowledge: private storage, bounded chunks, server-only retrieval.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('ai-workspace-private','ai-workspace-private',false,10485760,array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain','text/markdown','text/csv'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create table public.aiw_file_chunks (
  id uuid primary key default gen_random_uuid(),
  file_id uuid not null references public.aiw_files(id) on delete cascade,
  owner_id uuid not null references public.aiw_accounts(id) on delete cascade,
  project_id uuid not null,
  ordinal integer not null check(ordinal>=0 and ordinal<1000),
  content text not null check(length(content) between 1 and 8000),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique(file_id,ordinal),
  foreign key(project_id,owner_id) references public.aiw_projects(id,owner_id) on delete cascade
);
create index aiw_file_chunks_project on public.aiw_file_chunks(owner_id,project_id,file_id,ordinal);
create index aiw_file_chunks_search on public.aiw_file_chunks using gin(to_tsvector('simple',content));
create index aiw_memories_search on public.aiw_memories using gin(to_tsvector('simple',content));
alter table public.aiw_file_chunks enable row level security;
revoke all on public.aiw_file_chunks from public,anon,authenticated;
grant select,insert,update,delete on public.aiw_file_chunks to service_role;

create function public.aiw_retrieve_project_context(
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
    where m.owner_id=p_owner and m.project_id=p_project and m.scope='project' and m.status='active'
    union all
    select 'file'::text,c.id,c.file_id,c.content,
      case when q::text='' then 0::real else ts_rank(to_tsvector('simple',c.content),q) end,
      c.created_at
    from public.aiw_file_chunks c join public.aiw_files f on f.id=c.file_id
    where c.owner_id=p_owner and c.project_id=p_project and f.status='ready' and f.deleted_at is null
  ), ranked as (
    select * from candidates where q::text='' or rank>0 order by rank desc,source_time desc limit lim
  )
  select coalesce(jsonb_agg(jsonb_build_object('sourceType',source_type,'sourceId',source_id,'fileId',file_id,'content',content,'rank',rank)),'[]'::jsonb) into result from ranked;
  return result;
end $$;
revoke all on function public.aiw_retrieve_project_context(uuid,uuid,text,integer) from public,anon,authenticated;
grant execute on function public.aiw_retrieve_project_context(uuid,uuid,text,integer) to service_role;
