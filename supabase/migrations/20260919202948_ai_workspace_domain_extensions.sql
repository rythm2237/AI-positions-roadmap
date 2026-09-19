alter table public.aiw_accounts
  add column if not exists plan_key text,
  add column if not exists billing_period_start timestamptz,
  add column if not exists billing_period_end timestamptz;

alter table public.aiw_requests
  add column if not exists provider_state text not null default 'not_started',
  add column if not exists provider_request_id text,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists uncertain_at timestamptz,
  add column if not exists released_at timestamptz;

alter table public.aiw_requests
  add constraint aiw_requests_provider_state_check
  check (provider_state in ('not_started','started','unknown','completed'));

alter table public.aiw_requests
  add constraint aiw_requests_project_owner_fkey
  foreign key (project_id, owner_id)
  references public.aiw_projects(id, owner_id)
  on delete cascade;

alter table public.aiw_requests
  add constraint aiw_requests_conversation_project_owner_fkey
  foreign key (conversation_id, project_id, owner_id)
  references public.aiw_conversations(id, project_id, owner_id)
  on delete cascade;

create table public.aiw_budget_reservations (
  request_id uuid primary key references public.aiw_requests(id) on delete restrict,
  owner_id uuid not null references public.aiw_accounts(id) on delete restrict,
  amount bigint not null check (amount between 0 and 1000000000000),
  status text not null check (status in ('reserved','uncertain','settled','released')),
  provider_state text not null default 'not_started' check (provider_state in ('not_started','started','unknown','completed')),
  provider_request_id text,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  settled_at timestamptz,
  released_at timestamptz,
  unique (request_id, owner_id)
);

insert into public.aiw_budget_reservations(
  request_id, owner_id, amount, status, provider_state, provider_request_id,
  error_code, created_at, updated_at, settled_at, released_at
)
select
  id,
  owner_id,
  reserved_micros,
  status,
  case
    when status='settled' then 'completed'
    when status='uncertain' then 'unknown'
    else coalesce(provider_state,'not_started')
  end,
  provider_request_id,
  error_code,
  created_at,
  updated_at,
  settled_at,
  released_at
from public.aiw_requests
on conflict (request_id) do nothing;

create index aiw_budget_reservations_owner_status
  on public.aiw_budget_reservations(owner_id, status);

create table public.aiw_account_preferences (
  owner_id uuid primary key references public.aiw_accounts(id) on delete cascade,
  custom_instructions text not null default '' check (length(custom_instructions) <= 12000),
  preferred_language text,
  settings jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.aiw_project_instruction_versions (
  project_id uuid not null,
  owner_id uuid not null,
  version integer not null check (version > 0),
  instructions text not null check (length(instructions) <= 12000),
  created_at timestamptz not null default now(),
  primary key (project_id, version),
  foreign key (project_id, owner_id)
    references public.aiw_projects(id, owner_id)
    on delete cascade
);

create table public.aiw_saved_prompts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.aiw_accounts(id) on delete cascade,
  project_id uuid,
  name text not null check (length(name) between 1 and 160),
  content text not null check (length(content) between 1 and 24000),
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (project_id, owner_id)
    references public.aiw_projects(id, owner_id)
    on delete cascade
);

create index aiw_saved_prompts_owner_project
  on public.aiw_saved_prompts(owner_id, project_id, updated_at desc);

create table public.aiw_memories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.aiw_accounts(id) on delete cascade,
  project_id uuid,
  scope text not null check (scope in ('user','project')),
  kind text not null default 'fact' check (length(kind) between 1 and 80),
  content text not null check (length(content) between 1 and 12000),
  provenance jsonb not null default '{}',
  status text not null default 'active' check (status in ('active','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((scope='project' and project_id is not null) or (scope='user' and project_id is null)),
  foreign key (project_id, owner_id)
    references public.aiw_projects(id, owner_id)
    on delete cascade
);

create index aiw_memories_owner_scope
  on public.aiw_memories(owner_id, scope, project_id, status);

create table public.aiw_plan_entitlements (
  plan_key text primary key check (length(plan_key) between 1 and 80),
  config jsonb not null,
  active boolean not null default false,
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.aiw_accounts
  add constraint aiw_accounts_plan_key_fkey
  foreign key (plan_key)
  references public.aiw_plan_entitlements(plan_key)
  on update cascade
  on delete set null;

create table public.aiw_plugin_catalog (
  id text primary key check (length(id) between 1 and 120),
  display_name text not null check (length(display_name) between 1 and 160),
  status text not null default 'unavailable' check (status in ('available','unavailable','disabled')),
  auth_kind text not null default 'oauth' check (auth_kind in ('oauth','api_key','mcp','none')),
  capabilities jsonb not null default '{}',
  config jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.aiw_plugin_connections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.aiw_accounts(id) on delete cascade,
  plugin_id text not null references public.aiw_plugin_catalog(id) on delete restrict,
  status text not null default 'active' check (status in ('active','expired','revoked','error')),
  credential_ref text,
  scopes jsonb not null default '[]',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index aiw_plugin_connections_owner_plugin
  on public.aiw_plugin_connections(owner_id, plugin_id, status);

create table public.aiw_project_plugin_permissions (
  owner_id uuid not null,
  project_id uuid not null,
  connection_id uuid not null references public.aiw_plugin_connections(id) on delete cascade,
  enabled boolean not null default false,
  permissions jsonb not null default '[]',
  updated_at timestamptz not null default now(),
  primary key (project_id, connection_id),
  foreign key (project_id, owner_id)
    references public.aiw_projects(id, owner_id)
    on delete cascade
);

create table public.aiw_tool_approvals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.aiw_accounts(id) on delete cascade,
  project_id uuid not null,
  connection_id uuid references public.aiw_plugin_connections(id) on delete cascade,
  tool_id text not null check (length(tool_id) between 1 and 160),
  arguments_hash text not null check (arguments_hash ~ '^[a-f0-9]{64}$'),
  permissions jsonb not null default '[]',
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (project_id, owner_id)
    references public.aiw_projects(id, owner_id)
    on delete cascade
);

create index aiw_tool_approvals_lookup
  on public.aiw_tool_approvals(owner_id, project_id, tool_id, expires_at)
  where consumed_at is null;

create table public.aiw_tool_executions (
  id uuid primary key default gen_random_uuid(),
  approval_id uuid references public.aiw_tool_approvals(id) on delete set null,
  owner_id uuid not null references public.aiw_accounts(id) on delete cascade,
  project_id uuid not null,
  connection_id uuid references public.aiw_plugin_connections(id) on delete set null,
  tool_id text not null check (length(tool_id) between 1 and 160),
  arguments_hash text not null check (arguments_hash ~ '^[a-f0-9]{64}$'),
  status text not null check (status in ('started','succeeded','failed','uncertain')),
  result_meta jsonb not null default '{}',
  error_code text,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  foreign key (project_id, owner_id)
    references public.aiw_projects(id, owner_id)
    on delete cascade
);

create index aiw_tool_executions_owner_created
  on public.aiw_tool_executions(owner_id, created_at desc);

create table public.aiw_files (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.aiw_accounts(id) on delete cascade,
  project_id uuid not null,
  storage_bucket text not null check (length(storage_bucket) between 1 and 120),
  storage_path text not null check (length(storage_path) between 1 and 1000),
  original_name text not null check (length(original_name) between 1 and 500),
  mime_type text not null check (length(mime_type) between 1 and 200),
  size_bytes bigint not null check (size_bytes between 0 and 52428800),
  sha256 text not null check (sha256 ~ '^[a-f0-9]{64}$'),
  status text not null default 'uploaded' check (status in ('uploaded','processing','ready','failed','deleted')),
  extraction_meta jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (storage_bucket, storage_path),
  foreign key (project_id, owner_id)
    references public.aiw_projects(id, owner_id)
    on delete cascade
);

create index aiw_files_owner_project_status
  on public.aiw_files(owner_id, project_id, status, created_at desc);

create table public.aiw_guest_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.aiw_guest_activations(owner_id) on delete cascade,
  device_id uuid not null references public.aiw_guest_devices(id) on delete cascade,
  token_hash text unique not null check (token_hash ~ '^[a-f0-9]{64}$'),
  expires_at timestamptz not null,
  revoked boolean not null default false,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index aiw_guest_sessions_owner_device
  on public.aiw_guest_sessions(owner_id, device_id, expires_at desc);

create function public.aiw_version_immutable()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception 'IMMUTABLE_VERSION';
end $$;

create trigger aiw_project_instruction_version_immutable
before update on public.aiw_project_instruction_versions
for each row execute function public.aiw_version_immutable();

do $$
declare
  t text;
begin
  foreach t in array array[
    'aiw_budget_reservations','aiw_account_preferences','aiw_project_instruction_versions',
    'aiw_saved_prompts','aiw_memories','aiw_plan_entitlements','aiw_plugin_catalog',
    'aiw_plugin_connections','aiw_project_plugin_permissions','aiw_tool_approvals',
    'aiw_tool_executions','aiw_files','aiw_guest_sessions'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from public, anon, authenticated', t);
    execute format('grant select,insert,update,delete on public.%I to service_role', t);
  end loop;
end $$;

revoke all on function public.aiw_version_immutable() from public, anon, authenticated;
grant execute on function public.aiw_version_immutable() to service_role;
