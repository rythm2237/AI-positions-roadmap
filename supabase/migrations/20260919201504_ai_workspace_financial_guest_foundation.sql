-- AI Workspace: server-owned financial and guest storage.
-- All RPCs are SECURITY INVOKER, service_role only. No client can grant credit.

create table public.aiw_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id),
  kind text not null check (kind in ('registered', 'guest')),
  status text not null default 'active' check (status in ('active', 'paused', 'blocked')),
  daily_limit bigint not null default 0 check (daily_limit between 0 and 1000000000000),
  monthly_limit bigint not null default 0 check (monthly_limit between 0 and 1000000000000),
  entitlements jsonb not null default '{"enabled":false,"modes":["auto","fast"],"models":[],"tools":[],"maxOutputTokens":4096,"maxContextTokens":20000,"maxRequestMicros":"100000"}',
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  check ((kind = 'registered' and user_id is not null) or (kind = 'guest' and user_id is null))
);

create table public.aiw_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.aiw_accounts(id),
  name text not null check (length(name) between 1 and 120),
  instructions text not null default '' check (length(instructions) <= 12000),
  description text not null default '' check (length(description) <= 2000),
  archived boolean not null default false,
  preferences jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique (id, owner_id)
);

create table public.aiw_conversations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  project_id uuid not null,
  title text not null default 'New conversation' check (length(title) between 1 and 160),
  archived boolean not null default false,
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (project_id, owner_id) references public.aiw_projects(id, owner_id) on delete cascade,
  unique (id, owner_id),
  unique (id, project_id, owner_id)
);

create table public.aiw_messages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  conversation_id uuid not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (length(content) <= 500000),
  request_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  foreign key (conversation_id, owner_id) references public.aiw_conversations(id, owner_id) on delete cascade,
  unique (request_id, role)
);

create table public.aiw_models (
  id text primary key check (length(id) between 1 and 150),
  config jsonb not null,
  updated_at timestamptz not null default now(),
  check (config->>'id' = id),
  check (config->>'provider' = 'openai')
);

create table public.aiw_skills (
  id uuid not null default gen_random_uuid(),
  version integer not null default 1 check (version > 0),
  owner_id uuid references public.aiw_accounts(id),
  project_id uuid,
  name text not null check (length(name) between 1 and 120),
  description text not null default '',
  category text not null default 'general',
  instructions text not null check (length(instructions) <= 16000),
  enabled boolean not null default true,
  allowed_tools jsonb not null default '[]',
  created_at timestamptz not null default now(),
  primary key (id, version),
  foreign key (project_id, owner_id) references public.aiw_projects(id, owner_id) on delete cascade,
  check (project_id is null or owner_id is not null)
);

create table public.aiw_requests (
  id uuid primary key,
  owner_id uuid not null references public.aiw_accounts(id),
  project_id uuid not null,
  conversation_id uuid not null,
  mode text not null check (mode in ('auto', 'fast', 'best')),
  route jsonb not null,
  skill jsonb,
  reserved_micros bigint not null check (reserved_micros >= 0),
  status text not null default 'reserved' check (status in ('reserved', 'uncertain', 'settled', 'released')),
  error_code text,
  created_at timestamptz not null default now(),
  settled_at timestamptz
);

create unique index aiw_conversation_inflight
  on public.aiw_requests(conversation_id)
  where status in ('reserved', 'uncertain');

create index aiw_requests_owner_created on public.aiw_requests(owner_id, created_at);

create table public.aiw_ledger (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.aiw_accounts(id),
  request_id uuid unique references public.aiw_requests(id),
  amount bigint not null check (amount between -1000000000000 and 1000000000000),
  kind text not null check (kind in ('credit', 'usage', 'adjustment')),
  source text not null,
  usage jsonb,
  provider_request_id text,
  actor_id uuid,
  reason text,
  created_at timestamptz not null default now(),
  check ((kind = 'usage' and amount <= 0 and request_id is not null) or (kind <> 'usage' and request_id is null))
);

create index aiw_ledger_owner_created on public.aiw_ledger(owner_id, created_at);

create table public.aiw_guest_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text unique not null check (code_hash ~ '^[a-f0-9]{64}$'),
  label text not null,
  status text not null default 'active' check (status in ('active', 'revoked')),
  expires_at timestamptz,
  max_activations integer not null default 1 check (max_activations between 1 and 1000),
  activation_count integer not null default 0 check (activation_count >= 0),
  device_limit integer not null default 1 check (device_limit between 1 and 10),
  initial_credit bigint not null check (initial_credit between 0 and 1000000000000),
  daily_limit bigint not null check (daily_limit >= 0),
  monthly_limit bigint not null check (monthly_limit >= 0),
  entitlements jsonb not null,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  check (activation_count <= max_activations)
);

create table public.aiw_guest_activations (
  owner_id uuid primary key references public.aiw_accounts(id),
  code_id uuid not null references public.aiw_guest_codes(id),
  created_at timestamptz not null default now()
);

create table public.aiw_guest_devices (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.aiw_guest_activations(owner_id),
  credential_hash text unique not null check (credential_hash ~ '^[a-f0-9]{64}$'),
  revoked boolean not null default false,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.aiw_audit (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  owner_id uuid,
  action text not null,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.aiw_rate_windows (
  key text not null,
  window_start timestamptz not null,
  hits integer not null check (hits > 0),
  primary key (key, window_start)
);

create index aiw_messages_conversation_created on public.aiw_messages(conversation_id, created_at);
create index aiw_projects_owner on public.aiw_projects(owner_id);
create index aiw_conversations_owner_updated on public.aiw_conversations(owner_id, updated_at desc);
create index aiw_guest_devices_owner on public.aiw_guest_devices(owner_id);
create index aiw_guest_activations_code on public.aiw_guest_activations(code_id);

-- Content access goes through verified backend identity, not client service credentials.
do $$
declare
  t text;
begin
  foreach t in array array[
    'aiw_accounts','aiw_projects','aiw_conversations','aiw_messages','aiw_models','aiw_skills',
    'aiw_requests','aiw_ledger','aiw_guest_codes','aiw_guest_activations','aiw_guest_devices',
    'aiw_audit','aiw_rate_windows'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from public, anon, authenticated', t);
    execute format('grant select,insert,update,delete on public.%I to service_role', t);
  end loop;
end $$;

create function public.aiw_immutable()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception 'IMMUTABLE_RECORD';
end $$;

create trigger aiw_ledger_immutable
before update or delete on public.aiw_ledger
for each row execute function public.aiw_immutable();

create trigger aiw_audit_immutable
before update or delete on public.aiw_audit
for each row execute function public.aiw_immutable();

create trigger aiw_skill_version_immutable
before update on public.aiw_skills
for each row execute function public.aiw_immutable();

create function public.aiw_rate(p_key text, p_limit integer)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  n integer;
begin
  if length(p_key) > 200 or p_limit < 1 or p_limit > 10000 then
    raise exception 'INVALID_RATE_POLICY';
  end if;

  insert into public.aiw_rate_windows(key, window_start, hits)
  values (p_key, date_trunc('minute', now()), 1)
  on conflict(key, window_start)
  do update set hits = public.aiw_rate_windows.hits + 1
  returning hits into n;

  return n <= p_limit;
end $$;

create function public.aiw_balance(p_owner uuid)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  with pending as (
    select coalesce(sum(reserved_micros), 0) n
    from public.aiw_requests
    where owner_id = p_owner and status in ('reserved', 'uncertain')
  ),
  balances as (
    select
      coalesce(sum(amount), 0) credit,
      coalesce(-sum(amount) filter (
        where kind = 'usage'
          and created_at >= date_trunc('day', now() at time zone 'UTC') at time zone 'UTC'
      ), 0) daily,
      coalesce(-sum(amount) filter (
        where kind = 'usage'
          and created_at >= date_trunc('month', now() at time zone 'UTC') at time zone 'UTC'
      ), 0) monthly
    from public.aiw_ledger
    where owner_id = p_owner
  )
  select jsonb_build_object(
    'creditMicros', credit::text,
    'reservedMicros', n::text,
    'dailyUsedMicros', daily::text,
    'monthlyUsedMicros', monthly::text,
    'availableMicros', greatest(0, least(credit - n, a.daily_limit - daily - n, a.monthly_limit - monthly - n))::text,
    'dailyLimitMicros', a.daily_limit::text,
    'monthlyLimitMicros', a.monthly_limit::text
  )
  from balances, pending, public.aiw_accounts a
  where a.id = p_owner;
$$;

create function public.aiw_reserve(
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
  select * into a from public.aiw_accounts where id = p_owner for update;
  if not found
     or a.status <> 'active'
     or (a.expires_at is not null and a.expires_at <= now())
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
  join public.aiw_projects p on p.id = c.project_id
  where c.id = p_conversation
    and c.owner_id = p_owner
    and c.project_id = p_project
    and not c.archived
    and not p.archived
  for update of c;

  if not found then return false; end if;

  if exists (
    select 1 from public.aiw_requests
    where id = p_request
       or (conversation_id = p_conversation and status in ('reserved', 'uncertain'))
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

  amount = (p_route->>'reservationMicros')::bigint;
  output_n = (p_route->>'maxOutputTokens')::integer;
  input_n = (p_route->>'inputTokenBound')::integer;

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

  expected = ceil((
    input_n::numeric * (m->>'inputRate')::numeric +
    output_n::numeric * (m->>'outputRate')::numeric
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

  b = public.aiw_balance(p_owner);
  if amount > (b->>'availableMicros')::bigint then return false; end if;

  if (
    select count(*) from public.aiw_requests
    where owner_id = p_owner and created_at > now() - interval '1 minute'
  ) >= 12 then
    return false;
  end if;

  insert into public.aiw_requests(
    id, owner_id, project_id, conversation_id, mode, route, skill, reserved_micros
  ) values (
    p_request, p_owner, p_project, p_conversation, p_mode, p_route, p_skill, amount
  );

  insert into public.aiw_messages(owner_id, conversation_id, role, content, request_id)
  values (p_owner, p_conversation, 'user', p_content, p_request);

  update public.aiw_conversations set updated_at = now() where id = p_conversation;
  return true;
end $$;

create function public.aiw_settle(
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
  m jsonb;
  input_n bigint;
  cached_n bigint;
  output_n bigint;
  amount bigint;
begin
  perform 1 from public.aiw_accounts where id = p_owner for update;
  select * into r
  from public.aiw_requests
  where id = p_request and owner_id = p_owner
  for update;

  if not found then raise exception 'REQUEST_NOT_FOUND'; end if;
  if r.status = 'settled' then return true; end if;
  if r.status not in ('reserved', 'uncertain') then raise exception 'INVALID_REQUEST_STATE'; end if;

  input_n = (p_usage->>'inputTokens')::bigint;
  cached_n = (p_usage->>'cachedInputTokens')::bigint;
  output_n = (p_usage->>'outputTokens')::bigint;

  if input_n is null
     or cached_n is null
     or output_n is null
     or input_n < 0
     or cached_n < 0
     or cached_n > input_n
     or output_n < 0 then
    raise exception 'INVALID_USAGE';
  end if;

  m = r.route->'model';
  amount = ceil((
    (input_n - cached_n)::numeric * (m->>'inputRate')::numeric +
    cached_n::numeric * (m->>'cachedInputRate')::numeric +
    output_n::numeric * (m->>'outputRate')::numeric
  ) / 1000000)::bigint;

  if amount > r.reserved_micros then raise exception 'COST_BOUND_EXCEEDED'; end if;

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
    jsonb_build_object('model', m->>'id', 'mode', r.mode, 'skill', r.skill, 'incomplete', p_incomplete)
  );

  update public.aiw_requests set status = 'settled', settled_at = now() where id = p_request;
  return true;
end $$;

create function public.aiw_activate_guest(p_code_hash text, p_device_hash text)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  g public.aiw_guest_codes;
  owner uuid;
  exp timestamptz;
begin
  select * into g
  from public.aiw_guest_codes
  where code_hash = p_code_hash
  for update;

  if not found
     or g.status <> 'active'
     or (g.expires_at is not null and g.expires_at <= now())
     or g.activation_count >= g.max_activations then
    raise exception 'INVALID_INVITATION';
  end if;

  if p_device_hash !~ '^[a-f0-9]{64}$' then raise exception 'INVALID_DEVICE'; end if;

  exp = least(coalesce(g.expires_at, now() + interval '30 days'), now() + interval '30 days');

  insert into public.aiw_accounts(kind, daily_limit, monthly_limit, entitlements, expires_at)
  values ('guest', g.daily_limit, g.monthly_limit, g.entitlements, g.expires_at)
  returning id into owner;

  insert into public.aiw_guest_activations(owner_id, code_id) values (owner, g.id);
  insert into public.aiw_guest_devices(owner_id, credential_hash, expires_at) values (owner, p_device_hash, exp);
  insert into public.aiw_ledger(owner_id, amount, kind, source, reason)
  values (owner, g.initial_credit, 'credit', 'guest_credit', g.label);

  update public.aiw_guest_codes set activation_count = activation_count + 1 where id = g.id;
  insert into public.aiw_audit(owner_id, action, details)
  values (owner, 'guest_activated', jsonb_build_object('code_id', g.id));

  return owner;
end $$;

create function public.aiw_admin_credit(
  p_actor uuid,
  p_owner uuid,
  p_amount bigint,
  p_reason text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.app_user_roles where user_id = p_actor and role = 'admin'
  ) then
    raise exception 'ADMIN_REQUIRED';
  end if;

  if length(trim(p_reason)) < 3 or p_amount = 0 then raise exception 'REASON_REQUIRED'; end if;

  perform 1 from public.aiw_accounts where id = p_owner for update;
  if not found then raise exception 'ACCOUNT_NOT_FOUND'; end if;

  insert into public.aiw_ledger(owner_id, amount, kind, source, actor_id, reason)
  values (
    p_owner,
    p_amount,
    case when p_amount > 0 then 'credit' else 'adjustment' end,
    'admin_credit',
    p_actor,
    p_reason
  );

  insert into public.aiw_audit(actor_id, owner_id, action, details)
  values (
    p_actor,
    p_owner,
    'credit_adjusted',
    jsonb_build_object('amount', p_amount::text, 'reason', p_reason)
  );
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
