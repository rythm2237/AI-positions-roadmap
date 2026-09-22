-- AI Workspace: optional Professional prompt profile.
-- Professional mode pre-reserves both the visible answer and an internal prompt-enhancement stage
-- before any provider call, so the extra quality path cannot silently overspend the account.

alter table public.aiw_requests
  add column if not exists request_kind text not null default 'answer',
  add column if not exists parent_request_id uuid references public.aiw_requests(id) on delete set null,
  add column if not exists metadata jsonb not null default '{}';

alter table public.aiw_requests
  add constraint aiw_requests_request_kind_check
  check (request_kind in ('answer','prompt_enhancement'));

create index if not exists aiw_requests_parent_request
  on public.aiw_requests(parent_request_id)
  where parent_request_id is not null;

drop index if exists public.aiw_conversation_inflight;
create unique index aiw_conversation_answer_inflight
  on public.aiw_requests(conversation_id)
  where status in ('reserved','uncertain') and request_kind = 'answer';

create function public.aiw_reserve_stage(
  p_owner uuid,
  p_project uuid,
  p_conversation uuid,
  p_request uuid,
  p_content text,
  p_mode text,
  p_route jsonb,
  p_skill jsonb,
  p_request_kind text,
  p_parent_request uuid default null,
  p_metadata jsonb default '{}'::jsonb,
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
  if p_request_kind not in ('answer','prompt_enhancement') then return false; end if;
  if jsonb_typeof(coalesce(p_metadata, '{}'::jsonb)) <> 'object' then return false; end if;

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
  if exists (select 1 from public.aiw_requests where id = p_request) then return false; end if;

  if p_request_kind = 'answer' and exists (
    select 1 from public.aiw_requests
    where conversation_id = p_conversation
      and request_kind = 'answer'
      and status in ('reserved','uncertain')
  ) then return false; end if;

  if p_request_kind = 'prompt_enhancement' and not exists (
    select 1 from public.aiw_requests r
    where r.id = p_parent_request
      and r.owner_id = p_owner
      and r.project_id = p_project
      and r.conversation_id = p_conversation
      and r.request_kind = 'answer'
      and r.status = 'reserved'
      and r.provider_state = 'not_started'
  ) then return false; end if;

  if p_request_kind = 'answer' and p_parent_request is not null then return false; end if;

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
     ) then return false; end if;

  b := public.aiw_balance(p_owner);
  if b is null or amount > (b->>'availableMicros')::bigint then return false; end if;

  if (
    select count(*)
    from public.aiw_requests
    where owner_id = p_owner and created_at > now() - interval '1 minute'
  ) >= 12 then return false; end if;

  insert into public.aiw_requests(
    id, owner_id, project_id, conversation_id, mode, route, skill,
    reserved_micros, status, provider_state, updated_at,
    request_kind, parent_request_id, metadata
  ) values (
    p_request, p_owner, p_project, p_conversation, p_mode, p_route, p_skill,
    amount, 'reserved', 'not_started', now(),
    p_request_kind, p_parent_request, coalesce(p_metadata, '{}'::jsonb)
  );

  insert into public.aiw_budget_reservations(request_id, owner_id, amount, status, provider_state)
  values (p_request, p_owner, amount, 'reserved', 'not_started');

  insert into public.aiw_messages(owner_id, conversation_id, role, content, request_id, metadata)
  values (
    p_owner,
    p_conversation,
    'user',
    p_content,
    p_request,
    coalesce(p_metadata, '{}'::jsonb) ||
      case when p_request_kind = 'prompt_enhancement'
        then jsonb_build_object('internal', true, 'stage', 'prompt_enhancement')
        else jsonb_build_object('internal', false, 'stage', 'answer')
      end
  );

  update public.aiw_conversations set updated_at = now() where id = p_conversation;
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
  internal_message boolean;
begin
  perform 1 from public.aiw_accounts where id = p_owner for update;
  if not found then raise exception 'ACCOUNT_NOT_FOUND'; end if;

  select * into r from public.aiw_requests
  where id = p_request and owner_id = p_owner for update;
  if not found then raise exception 'REQUEST_NOT_FOUND'; end if;
  if r.status = 'settled' then return true; end if;
  if r.status not in ('reserved','uncertain') then raise exception 'INVALID_REQUEST_STATE'; end if;

  select * into br from public.aiw_budget_reservations
  where request_id = p_request and owner_id = p_owner for update;
  if not found then raise exception 'RESERVATION_NOT_FOUND'; end if;
  if br.status = 'settled' then return true; end if;
  if br.status not in ('reserved','uncertain') then raise exception 'INVALID_RESERVATION_STATE'; end if;

  if p_provider_request is null or length(p_provider_request) not between 1 and 240 then
    raise exception 'INVALID_PROVIDER_REQUEST';
  end if;

  input_n := (p_usage->>'inputTokens')::bigint;
  cached_n := (p_usage->>'cachedInputTokens')::bigint;
  output_n := (p_usage->>'outputTokens')::bigint;
  if input_n is null or cached_n is null or output_n is null
     or input_n < 0 or cached_n < 0 or cached_n > input_n or output_n < 0 then
    raise exception 'INVALID_USAGE';
  end if;

  m := r.route->'model';
  amount := ceil((
    (input_n - cached_n)::numeric * (m->>'inputRate')::numeric
    + cached_n::numeric * (m->>'cachedInputRate')::numeric
    + output_n::numeric * (m->>'outputRate')::numeric
  ) / 1000000)::bigint;
  if amount > br.amount then raise exception 'COST_BOUND_EXCEEDED'; end if;

  insert into public.aiw_ledger(owner_id, request_id, amount, kind, source, usage, provider_request_id)
  values (
    p_owner,
    p_request,
    -amount,
    'usage',
    case when r.request_kind = 'prompt_enhancement' then 'prompt_enhancement' else 'ai_execution' end,
    p_usage,
    p_provider_request
  );

  internal_message := r.request_kind = 'prompt_enhancement';
  insert into public.aiw_messages(owner_id, conversation_id, role, content, request_id, metadata)
  values (
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
      'providerRequestId', p_provider_request,
      'internal', internal_message,
      'stage', r.request_kind
    ) || coalesce(r.metadata, '{}'::jsonb)
  );

  update public.aiw_budget_reservations
  set status = 'settled', provider_state = 'completed', provider_request_id = p_provider_request,
      error_code = null, updated_at = now(), settled_at = now()
  where request_id = p_request;

  update public.aiw_requests
  set status = 'settled', provider_state = 'completed', provider_request_id = p_provider_request,
      error_code = null, updated_at = now(), settled_at = now()
  where id = p_request;

  return true;
end $$;

revoke all on function public.aiw_reserve_stage(uuid,uuid,uuid,uuid,text,text,jsonb,jsonb,text,uuid,jsonb,text) from public, anon, authenticated;
grant execute on function public.aiw_reserve_stage(uuid,uuid,uuid,uuid,text,text,jsonb,jsonb,text,uuid,jsonb,text) to service_role;
revoke all on function public.aiw_settle(uuid,uuid,text,jsonb,text,boolean) from public, anon, authenticated;
grant execute on function public.aiw_settle(uuid,uuid,text,jsonb,text,boolean) to service_role;
