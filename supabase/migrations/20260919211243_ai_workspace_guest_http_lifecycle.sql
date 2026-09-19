-- AI Workspace guest HTTP lifecycle: atomic activation/session, logout/revocation and guest-to-account conversion.

create function public.aiw_activate_guest_session(
  p_code_hash text,
  p_device_hash text,
  p_session_hash text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare owner uuid; sid uuid;
begin
  if p_code_hash !~ '^[a-f0-9]{64}$' or p_device_hash !~ '^[a-f0-9]{64}$' or p_session_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'INVALID_GUEST_CREDENTIAL';
  end if;
  owner := public.aiw_activate_guest(p_code_hash, p_device_hash);
  sid := public.aiw_create_guest_session(owner, p_device_hash, p_session_hash);
  return jsonb_build_object('ownerId', owner, 'sessionId', sid);
end $$;

create function public.aiw_revoke_guest_session(p_session_hash text,p_device_hash text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare changed integer;
begin
  update public.aiw_guest_sessions s set revoked=true,last_seen_at=now()
  from public.aiw_guest_devices d
  where s.device_id=d.id and s.owner_id=d.owner_id and s.token_hash=p_session_hash
    and d.credential_hash=p_device_hash and not s.revoked;
  get diagnostics changed=row_count;
  return changed>0;
end $$;

create function public.aiw_admin_revoke_guest_device(p_actor uuid,p_device uuid,p_reason text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare owner uuid;
begin
  if not exists(select 1 from public.app_user_roles where user_id=p_actor and role='admin') then raise exception 'ADMIN_REQUIRED'; end if;
  if p_reason is null or length(trim(p_reason))<3 then raise exception 'REASON_REQUIRED'; end if;
  select owner_id into owner from public.aiw_guest_devices where id=p_device for update;
  if not found then return false; end if;
  update public.aiw_guest_devices set revoked=true where id=p_device;
  update public.aiw_guest_sessions set revoked=true where device_id=p_device and not revoked;
  insert into public.aiw_audit(actor_id,owner_id,action,details)
  values(p_actor,owner,'guest_device_revoked',jsonb_build_object('device_id',p_device,'reason',p_reason));
  return true;
end $$;

create function public.aiw_admin_revoke_guest_code(p_actor uuid,p_code uuid,p_reason text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare changed integer;
begin
  if not exists(select 1 from public.app_user_roles where user_id=p_actor and role='admin') then raise exception 'ADMIN_REQUIRED'; end if;
  if p_reason is null or length(trim(p_reason))<3 then raise exception 'REASON_REQUIRED'; end if;
  update public.aiw_guest_codes set status='revoked' where id=p_code and status<>'revoked';
  get diagnostics changed=row_count;
  if changed=0 then return false; end if;
  update public.aiw_guest_sessions s set revoked=true
  from public.aiw_guest_activations ga where ga.code_id=p_code and s.owner_id=ga.owner_id and not s.revoked;
  insert into public.aiw_audit(actor_id,action,details)
  values(p_actor,'guest_code_revoked',jsonb_build_object('code_id',p_code,'reason',p_reason));
  return true;
end $$;

create function public.aiw_convert_guest_to_registered(
  p_owner uuid,p_user uuid,p_session_hash text,p_device_hash text
)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare current_owner uuid;
begin
  if not exists(select 1 from auth.users where id=p_user) then raise exception 'USER_NOT_FOUND'; end if;
  current_owner := public.aiw_validate_guest_session(p_session_hash,p_device_hash);
  if current_owner is null or current_owner<>p_owner then raise exception 'INVALID_GUEST_SESSION'; end if;
  perform 1 from public.aiw_accounts where id=p_owner and kind='guest' for update;
  if not found then return false; end if;
  if exists(select 1 from public.aiw_accounts where user_id=p_user and id<>p_owner) then raise exception 'REGISTERED_ACCOUNT_EXISTS'; end if;
  update public.aiw_accounts set kind='registered',user_id=p_user,expires_at=null where id=p_owner;
  update public.aiw_guest_sessions set revoked=true where owner_id=p_owner and not revoked;
  update public.aiw_guest_devices set revoked=true where owner_id=p_owner and not revoked;
  insert into public.aiw_account_preferences(owner_id) values(p_owner) on conflict(owner_id) do nothing;
  insert into public.aiw_audit(actor_id,owner_id,action,details)
  values(p_user,p_owner,'guest_converted_to_registered','{}'::jsonb);
  return true;
end $$;

do $$ declare f record;
begin
  for f in select p.oid::regprocedure sig from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname in ('aiw_activate_guest_session','aiw_revoke_guest_session','aiw_admin_revoke_guest_device','aiw_admin_revoke_guest_code','aiw_convert_guest_to_registered')
  loop
    execute format('revoke all on function %s from public, anon, authenticated',f.sig);
    execute format('grant execute on function %s to service_role',f.sig);
  end loop;
end $$;
