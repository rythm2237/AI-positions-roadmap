-- AI Workspace guest activation creates an immediately usable isolated workspace atomically.
create or replace function public.aiw_activate_guest_session(
  p_code_hash text,
  p_device_hash text,
  p_session_hash text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  owner uuid;
  sid uuid;
  project_id uuid;
  conversation_id uuid;
begin
  if p_code_hash !~ '^[a-f0-9]{64}$' or p_device_hash !~ '^[a-f0-9]{64}$' or p_session_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'INVALID_GUEST_CREDENTIAL';
  end if;
  owner := public.aiw_activate_guest(p_code_hash, p_device_hash);
  sid := public.aiw_create_guest_session(owner, p_device_hash, p_session_hash);
  insert into public.aiw_projects(owner_id,name,description)
    values(owner,'My Workspace','Guest AI workspace') returning id into project_id;
  insert into public.aiw_project_instruction_versions(project_id,owner_id,version,instructions)
    values(project_id,owner,1,'');
  insert into public.aiw_conversations(owner_id,project_id,title)
    values(owner,project_id,'New conversation') returning id into conversation_id;
  return jsonb_build_object('ownerId',owner,'sessionId',sid,'projectId',project_id,'conversationId',conversation_id);
end $$;

revoke all on function public.aiw_activate_guest_session(text,text,text) from public, anon, authenticated;
grant execute on function public.aiw_activate_guest_session(text,text,text) to service_role;
