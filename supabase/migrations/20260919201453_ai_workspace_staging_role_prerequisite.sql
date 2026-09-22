create table if not exists public.app_user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  primary key (user_id, role)
);

alter table public.app_user_roles enable row level security;
revoke all on public.app_user_roles from public, anon, authenticated;
grant all on public.app_user_roles to service_role;
