create or replace function public.aiw_balance(p_owner uuid)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  a public.aiw_accounts;
  pending bigint;
  credit bigint;
  daily bigint;
  monthly bigint;
  monthly_start timestamptz;
begin
  select * into a from public.aiw_accounts where id = p_owner;
  if not found then return null; end if;

  monthly_start := case
    when a.billing_period_start is not null
      and (a.billing_period_end is null or now() < a.billing_period_end)
      then a.billing_period_start
    else date_trunc('month', now() at time zone 'UTC') at time zone 'UTC'
  end;

  select coalesce(sum(amount), 0)
    into pending
  from public.aiw_budget_reservations
  where owner_id = p_owner and status in ('reserved','uncertain');

  select
    coalesce(sum(amount), 0),
    coalesce(-sum(amount) filter (
      where kind = 'usage'
        and created_at >= date_trunc('day', now() at time zone 'UTC') at time zone 'UTC'
    ), 0),
    coalesce(-sum(amount) filter (
      where kind = 'usage' and created_at >= monthly_start
    ), 0)
  into credit, daily, monthly
  from public.aiw_ledger
  where owner_id = p_owner;

  return jsonb_build_object(
    'creditMicros', credit::text,
    'reservedMicros', pending::text,
    'dailyUsedMicros', daily::text,
    'monthlyUsedMicros', monthly::text,
    'availableMicros', greatest(
      0,
      least(
        credit - pending,
        a.daily_limit - daily - pending,
        a.monthly_limit - monthly - pending
      )
    )::text,
    'dailyLimitMicros', a.daily_limit::text,
    'monthlyLimitMicros', a.monthly_limit::text,
    'billingPeriodStart', a.billing_period_start,
    'billingPeriodEnd', a.billing_period_end
  );
end $$;

create or replace function public.aiw_reserve(
  p_owner uuid,
  p_project uuid,
  p_conversation uuid,
  p_request uuid,
  p_content text,
  p_mode text,
  p_route jsonb,
  p_skill jsonb,
  p_device_hash text default null
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  a public.aiw_accounts;
  m jsonb;
  amount bigint;
  expected bigint;
  b jsonb;
  output_n integer;
  input_n integer;
begin
  select * into a
  from public.aiw_accounts
  where id = p_owner
  for update;

  if not found
     or a.status <> 'active'
     or (a.expires_at is not null and a.expires_at <= now())
     or (a.billing_period_end is not null and now() >= a.billing_period_end)
     or not coalesce((a.entitlements->>'enabled')::boolean, false) then
    return false;
  end if;

  if a.kind = 'guest' and not exists (
    select 1
    from public.aiw_guest_devices d
    join public.aiw_guest_activations ga on ga.owner_id = d.owner_id
    join public.aiw_guest_codes g on g.id = ga.code_id
    where d.owner_id = p_owner
      and d.credential_hash = p_device_hash
      and not d.revoked
      and d.expires_at > now()
      and g.status = 'active'
      and (g.expires_at is null or g.expires_at > now())
  ) then
    return false;
  end if;

  perform 1
  from public.aiw_conversations c
  join public.aiw_projects p on p.id = c.project_id and p.owner_id = c.owner_id
  where c.id = p_conversation
    and c.owner_id = p_owner
    and c.project_id = p_project
    and not c.archived
    and not p.archived
  for update of c;

  if not found then return false; end if;

  if exists (
    select 1
    from public.aiw_requests
    where id = p_request
       or (conversation_id = p_conversation and status in ('reserved','uncertain'))
  ) then
    return false;
  end if;

  if length(p_content) not between 1 and 24000
     or not (a.entitlements->'modes' ? p_mode)
     or not (a.entitlements->'models' ? (p_route->'model'->>'id')) then
    return false;
  end if;

  select config into m
  from public.aiw_models
  where id = p_route->'model'->>'id'
  for share;

  if m is null
     or m <> p_route->'model'
     or not coalesce((m->>'enabled')::boolean, false)
     or (m->>'pricingVerifiedAt')::timestamptz < now() - interval '30 days'
     or (m->>'pricingVerifiedAt')::timestamptz > now() then
    return false;
  end if;

  amount := (p_route->>'reservationMicros')::bigint;
  output_n := (p_route->>'maxOutputTokens')::integer;
  input_n := (p_route->>'inputTokenBound')::integer;

  if amount is null
     or input_n is null
     or output_n is null
     or input_n < 1
     or output_n < 1
     or input_n > (a.entitlements->>'maxContextTokens')::integer
     or output_n > (a.entitlements->>'maxOutputTokens')::integer
     or output_n > (m->>'maxOutputTokens')::integer
     or input_n + output_n > (m->>'contextTokens')::integer
     or not (m->'reasoning' ? (p_route->>'reasoning')) then
    return false;
  end if;

  expected := ceil((
    input_n::numeric * (m->>'inputRate')::numeric
    + output_n::numeric * (m->>'outputRate')::numeric
  ) / 1000000)::bigint;

  if amount < expected
     or amount < 0
     or amount > (a.entitlements->>'maxRequestMicros')::bigint then
    return false;
  end if;

  if p_skill is not null
     and p_skill <> 'null'::jsonb
     and not exists (
       select 1
       from public.aiw_skills s
       where s.id = (p_skill->>'id')::uuid
         and s.version = (p_skill->>'version')::integer
         and s.enabled
         and (s.owner_id is null or s.owner_id = p_owner)
         and (s.project_id is null or s.project_id = p_project)
     ) then
    return false;
  end if;

  b := public.aiw_balance(p_owner);
  if b is null or amount > (b->>'availableMicros')::bigint then return false; end if;

  if (
    select count(*)
    from public.aiw_requests
    where owner_id = p_owner and created_at > now() - interval '1 minute'
  ) >= 12 then
    return false;
  end if;

  insert into public.aiw_requests(
    id, owner_id, project_id, conversation_id, mode, route, skill,
    reserved_micros, status, provider_state, updated_at
  ) values (
    p_request, p_owner, p_project, p_conversation, p_mode, p_route, p_skill,
    amount, 'reserved', 'not_started', now()
  );

  insert into public.aiw_budget_reservations(
    request_id, owner_id, amount, status, provider_state
  ) values (
    p_request, p_owner, amount, 'reserved', 'not_started'
  );

  insert into public.aiw_messages(owner_id, conversation_id, role, content, request_id)
  values (p_owner, p_conversation, 'user', p_content, p_request);

  update public.aiw_conversations
  set updated_at = now()
  where id = p_conversation;

  return true;
end $$;

create or replace function public.aiw_settle(
  p_owner uuid,
  p_request uuid,
  p_content text,
  p_usage jsonb,
  p_provider_request text,
  p_incomplete boolean default false
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  r public.aiw_requests;
  br public.aiw_budget_reservations;
  m jsonb;
  input_n bigint;
  cached_n bigint;
  output_n bigint;
  amount bigint;
begin
  perform 1 from public.aiw_accounts where id = p_owner for update;
  if not found then raise exception 'ACCOUNT_NOT_FOUND'; end if;

  select * into r
  from public.aiw_requests
  where id = p_request and owner_id = p_owner
  for update;

  if not found then raise exception 'REQUEST_NOT_FOUND'; end if;
  if r.status = 'settled' then return true; end if;
  if r.status not in ('reserved','uncertain') then raise exception 'INVALID_REQUEST_STATE'; end if;

  select * into br
  from public.aiw_budget_reservations
  where request_id = p_request and owner_id = p_owner
  for update;

  if not found then raise exception 'RESERVATION_NOT_FOUND'; end if;
  if br.status = 'settled' then return true; end if;
  if br.status not in ('reserved','uncertain') then raise exception 'INVALID_RESERVATION_STATE'; end if;

  if p_provider_request is null or length(p_provider_request) not between 1 and 240 then
    raise exception 'INVALID_PROVIDER_REQUEST';
  end if;

  input_n := (p_usage->>'inputTokens')::bigint;
  cached_n := (p_usage->>'cachedInputTokens')::bigint;
  output_n := (p_usage->>'outputTokens')::bigint;

  if input_n is null
     or cached_n is null
     or output_n is null
     or input_n < 0
     or cached_n < 0
     or cached_n > input_n
     or output_n < 0 then
    raise exception 'INVALID_USAGE';
  end if;

  m := r.route->'model';
  amount := ceil((
    (input_n - cached_n)::numeric * (m->>'inputRate')::numeric
    + cached_n::numeric * (m->>'cachedInputRate')::numeric
    + output_n::numeric * (m->>'outputRate')::numeric
  ) / 1000000)::bigint;

  if amount > br.amount then raise exception 'COST_BOUND_EXCEEDED'; end if;

  insert into public.aiw_ledger(
    owner_id, request_id, amount, kind, source, usage, provider_request_id
  ) values (
    p_owner, p_request, -amount, 'usage', 'ai_execution', p_usage, p_provider_request
  );

  insert into public.aiw_messages(
    owner_id, conversation_id, role, content, request_id, metadata
  ) values (
    p_owner,
    r.conversation_id,
    'assistant',
    p_content,
    p_request,
    jsonb_build_object(
      'model', m->>'id',
      'mode', r.mode,
      'skill', r.skill,
      'incomplete', p_incomplete,
      'providerRequestId', p_provider_request
    )
  );

  update public.aiw_budget_reservations
  set status = 'settled',
      provider_state = 'completed',
      provider_request_id = p_provider_request,
      error_code = null,
      updated_at = now(),
      settled_at = now()
  where request_id = p_request;

  update public.aiw_requests
  set status = 'settled',
      provider_state = 'completed',
      provider_request_id = p_provider_request,
      error_code = null,
      updated_at = now(),
      settled_at = now()
  where id = p_request;

  return true;
end $$;

create function public.aiw_mark_provider_started(
  p_owner uuid,
  p_request uuid,
  p_provider_request text default null
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  r public.aiw_requests;
begin
  perform 1 from public.aiw_accounts where id = p_owner for update;
  if not found then return false; end if;

  select * into r
  from public.aiw_requests
  where id = p_request and owner_id = p_owner
  for update;

  if not found or r.status <> 'reserved' then return false; end if;

  update public.aiw_requests
  set provider_state = 'started',
      provider_request_id = coalesce(p_provider_request, provider_request_id),
      updated_at = now()
  where id = p_request;

  update public.aiw_budget_reservations
  set provider_state = 'started',
      provider_request_id = coalesce(p_provider_request, provider_request_id),
      updated_at = now()
  where request_id = p_request and owner_id = p_owner and status = 'reserved';

  return found;
end $$;

create function public.aiw_mark_uncertain(
  p_owner uuid,
  p_request uuid,
  p_code text,
  p_provider_request text default null
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  r public.aiw_requests;
begin
  if p_code is null or length(p_code) not between 1 and 120 then
    raise exception 'INVALID_ERROR_CODE';
  end if;

  perform 1 from public.aiw_accounts where id = p_owner for update;
  if not found then return false; end if;

  select * into r
  from public.aiw_requests
  where id = p_request and owner_id = p_owner
  for update;

  if not found then return false; end if;
  if r.status = 'settled' then return true; end if;
  if r.status = 'released' then return false; end if;

  update public.aiw_requests
  set status = 'uncertain',
      provider_state = 'unknown',
      provider_request_id = coalesce(p_provider_request, provider_request_id),
      error_code = p_code,
      uncertain_at = coalesce(uncertain_at, now()),
      updated_at = now()
  where id = p_request;

  update public.aiw_budget_reservations
  set status = 'uncertain',
      provider_state = 'unknown',
      provider_request_id = coalesce(p_provider_request, provider_request_id),
      error_code = p_code,
      updated_at = now()
  where request_id = p_request and owner_id = p_owner and status in ('reserved','uncertain');

  insert into public.aiw_audit(owner_id, action, details)
  values (
    p_owner,
    'request_uncertain',
    jsonb_build_object('request_id', p_request, 'code', p_code)
  );

  return true;
end $$;

create function public.aiw_release_unstarted(
  p_owner uuid,
  p_request uuid,
  p_code text
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  r public.aiw_requests;
begin
  if p_code is null or length(p_code) not between 1 and 120 then
    raise exception 'INVALID_ERROR_CODE';
  end if;

  perform 1 from public.aiw_accounts where id = p_owner for update;
  if not found then return false; end if;

  select * into r
  from public.aiw_requests
  where id = p_request and owner_id = p_owner
  for update;

  if not found then return false; end if;
  if r.status = 'released' then return true; end if;

  if r.status <> 'reserved' or r.provider_state <> 'not_started' then
    return false;
  end if;

  update public.aiw_budget_reservations
  set status = 'released',
      error_code = p_code,
      updated_at = now(),
      released_at = now()
  where request_id = p_request
    and owner_id = p_owner
    and status = 'reserved'
    and provider_state = 'not_started';

  if not found then return false; end if;

  update public.aiw_requests
  set status = 'released',
      error_code = p_code,
      updated_at = now(),
      released_at = now()
  where id = p_request;

  insert into public.aiw_audit(owner_id, action, details)
  values (
    p_owner,
    'reservation_released_unstarted',
    jsonb_build_object('request_id', p_request, 'code', p_code)
  );

  return true;
end $$;

create function public.aiw_admin_release_uncertain(
  p_actor uuid,
  p_owner uuid,
  p_request uuid,
  p_reason text
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  r public.aiw_requests;
begin
  if not exists (
    select 1 from public.app_user_roles where user_id = p_actor and role = 'admin'
  ) then
    raise exception 'ADMIN_REQUIRED';
  end if;

  if p_reason is null or length(trim(p_reason)) < 8 then
    raise exception 'REASON_REQUIRED';
  end if;

  perform 1 from public.aiw_accounts where id = p_owner for update;
  if not found then return false; end if;

  select * into r
  from public.aiw_requests
  where id = p_request and owner_id = p_owner
  for update;

  if not found or r.status <> 'uncertain' then return false; end if;

  update public.aiw_budget_reservations
  set status = 'released',
      error_code = 'ADMIN_RECONCILED_NO_CHARGE',
      updated_at = now(),
      released_at = now()
  where request_id = p_request and owner_id = p_owner and status = 'uncertain';

  if not found then return false; end if;

  update public.aiw_requests
  set status = 'released',
      error_code = 'ADMIN_RECONCILED_NO_CHARGE',
      updated_at = now(),
      released_at = now()
  where id = p_request;

  insert into public.aiw_audit(actor_id, owner_id, action, details)
  values (
    p_actor,
    p_owner,
    'uncertain_request_released',
    jsonb_build_object('request_id', p_request, 'reason', p_reason)
  );

  return true;
end $$;

create function public.aiw_ensure_registered_account(p_user uuid)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  owner uuid;
begin
  if not exists (select 1 from auth.users where id = p_user) then
    raise exception 'USER_NOT_FOUND';
  end if;

  select id into owner
  from public.aiw_accounts
  where user_id = p_user
  for update;

  if found then return owner; end if;

  insert into public.aiw_accounts(user_id, kind)
  values (p_user, 'registered')
  returning id into owner;

  insert into public.aiw_account_preferences(owner_id)
  values (owner)
  on conflict (owner_id) do nothing;

  insert into public.aiw_audit(actor_id, owner_id, action, details)
  values (p_user, owner, 'registered_account_provisioned', '{}');

  return owner;
end $$;

create function public.aiw_register_guest_device(
  p_owner uuid,
  p_device_hash text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  g public.aiw_guest_codes;
  device_id uuid;
  exp timestamptz;
begin
  if p_device_hash !~ '^[a-f0-9]{64}$' then raise exception 'INVALID_DEVICE'; end if;

  select gc.* into g
  from public.aiw_guest_activations ga
  join public.aiw_guest_codes gc on gc.id = ga.code_id
  where ga.owner_id = p_owner
  for update of gc;

  if not found
     or g.status <> 'active'
     or (g.expires_at is not null and g.expires_at <= now()) then
    raise exception 'INVALID_GUEST';
  end if;

  if exists (
    select 1 from public.aiw_guest_devices
    where owner_id = p_owner and credential_hash = p_device_hash and not revoked and expires_at > now()
  ) then
    select id into device_id
    from public.aiw_guest_devices
    where owner_id = p_owner and credential_hash = p_device_hash and not revoked and expires_at > now()
    limit 1;
    return device_id;
  end if;

  if (
    select count(*) from public.aiw_guest_devices
    where owner_id = p_owner and not revoked and expires_at > now()
  ) >= g.device_limit then
    raise exception 'DEVICE_LIMIT_REACHED';
  end if;

  exp := least(coalesce(g.expires_at, now() + interval '30 days'), now() + interval '30 days');

  insert into public.aiw_guest_devices(owner_id, credential_hash, expires_at)
  values (p_owner, p_device_hash, exp)
  returning id into device_id;

  insert into public.aiw_audit(owner_id, action, details)
  values (p_owner, 'guest_device_registered', jsonb_build_object('device_id', device_id));

  return device_id;
end $$;

create function public.aiw_create_guest_session(
  p_owner uuid,
  p_device_hash text,
  p_session_hash text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  d public.aiw_guest_devices;
  sid uuid;
  exp timestamptz;
begin
  if p_session_hash !~ '^[a-f0-9]{64}$' then raise exception 'INVALID_SESSION'; end if;

  select gd.* into d
  from public.aiw_guest_devices gd
  join public.aiw_guest_activations ga on ga.owner_id = gd.owner_id
  join public.aiw_guest_codes gc on gc.id = ga.code_id
  where gd.owner_id = p_owner
    and gd.credential_hash = p_device_hash
    and not gd.revoked
    and gd.expires_at > now()
    and gc.status = 'active'
    and (gc.expires_at is null or gc.expires_at > now())
  for update of gd;

  if not found then raise exception 'INVALID_DEVICE'; end if;

  exp := least(d.expires_at, now() + interval '7 days');

  insert into public.aiw_guest_sessions(owner_id, device_id, token_hash, expires_at)
  values (p_owner, d.id, p_session_hash, exp)
  returning id into sid;

  return sid;
end $$;

create function public.aiw_validate_guest_session(
  p_session_hash text,
  p_device_hash text
)
returns uuid
language sql
security invoker
set search_path = ''
as $$
  select s.owner_id
  from public.aiw_guest_sessions s
  join public.aiw_guest_devices d on d.id = s.device_id and d.owner_id = s.owner_id
  join public.aiw_guest_activations ga on ga.owner_id = s.owner_id
  join public.aiw_guest_codes gc on gc.id = ga.code_id
  where s.token_hash = p_session_hash
    and d.credential_hash = p_device_hash
    and not s.revoked
    and s.expires_at > now()
    and not d.revoked
    and d.expires_at > now()
    and gc.status = 'active'
    and (gc.expires_at is null or gc.expires_at > now())
  limit 1;
$$;

create function public.aiw_consume_tool_approval(
  p_approval uuid,
  p_owner uuid,
  p_project uuid,
  p_connection uuid,
  p_tool text,
  p_arguments_hash text
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  a public.aiw_tool_approvals;
begin
  select * into a
  from public.aiw_tool_approvals
  where id = p_approval
  for update;

  if not found
     or a.owner_id <> p_owner
     or a.project_id <> p_project
     or a.connection_id is distinct from p_connection
     or a.tool_id <> p_tool
     or a.arguments_hash <> p_arguments_hash
     or a.expires_at <= now()
     or a.consumed_at is not null then
    return false;
  end if;

  update public.aiw_tool_approvals
  set consumed_at = now()
  where id = p_approval and consumed_at is null;

  return found;
end $$;

do $$
declare
  f record;
begin
  for f in
    select p.oid::regprocedure sig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname like 'aiw\_%' escape '\'
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop;
end $$;
