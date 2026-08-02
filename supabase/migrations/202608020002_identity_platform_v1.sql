begin;

create type public.subscription_plan as enum ('free', 'pro', 'enterprise');
create type public.subscription_status as enum ('active', 'trialing', 'past_due', 'canceled');
create type public.job_search_region as enum ('country', 'european_union', 'remote', 'worldwide');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text check (name is null or char_length(trim(name)) between 1 and 120),
  email text not null,
  avatar_url text,
  provider text,
  current_country text,
  current_position text,
  years_experience numeric(4,1) check (years_experience is null or years_experience between 0 and 80),
  skills text[] not null default '{}',
  certificates text[] not null default '{}',
  languages text[] not null default '{}',
  target_career text,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  job_search_region public.job_search_region,
  job_search_country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (job_search_region <> 'country' or nullif(trim(job_search_country), '') is not null)
);

create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 160),
  target_career text,
  version integer not null default 1 check (version > 0),
  file_type text not null check (file_type in ('pdf', 'doc', 'docx')),
  storage_path text not null unique,
  uploaded_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index resumes_user_uploaded_idx on public.resumes(user_id, uploaded_at desc);

create table public.saved_careers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  career_slug text not null check (career_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  created_at timestamptz not null default now(),
  unique (user_id, career_slug)
);
create index saved_careers_user_created_idx on public.saved_careers(user_id, created_at desc);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  plan public.subscription_plan not null default 'free',
  status public.subscription_status not null default 'active',
  provider_customer_id text unique,
  provider_subscription_id text unique,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 160),
  body text not null,
  kind text not null default 'info',
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_created_idx on public.notifications(user_id, created_at desc);

create table public.user_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  action text not null check (char_length(action) between 1 and 80),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index user_activity_user_created_idx on public.user_activity(user_id, created_at desc);

create or replace function public.identity_set_updated_at() returns trigger
language plpgsql set search_path = public as $$ begin new.updated_at = now(); return new; end $$;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.identity_set_updated_at();
create trigger preferences_updated_at before update on public.user_preferences for each row execute function public.identity_set_updated_at();
create trigger resumes_updated_at before update on public.resumes for each row execute function public.identity_set_updated_at();
create trigger subscriptions_updated_at before update on public.subscriptions for each row execute function public.identity_set_updated_at();

create or replace function public.provision_identity_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, name, email, avatar_url, provider)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'), new.raw_app_meta_data->>'provider');
  insert into public.user_preferences(user_id) values (new.id);
  insert into public.subscriptions(user_id) values (new.id);
  return new;
end $$;
create trigger identity_user_created after insert on auth.users for each row execute function public.provision_identity_user();

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.resumes enable row level security;
alter table public.saved_careers enable row level security;
alter table public.subscriptions enable row level security;
alter table public.notifications enable row level security;
alter table public.user_activity enable row level security;

create policy profiles_owner_admin on public.profiles for all to authenticated using (id = auth.uid() or public.is_app_admin()) with check (id = auth.uid() or public.is_app_admin());
create policy preferences_owner_admin on public.user_preferences for all to authenticated using (user_id = auth.uid() or public.is_app_admin()) with check (user_id = auth.uid() or public.is_app_admin());
create policy resumes_owner_admin on public.resumes for all to authenticated using (user_id = auth.uid() or public.is_app_admin()) with check (user_id = auth.uid() or public.is_app_admin());
create policy saved_careers_owner_admin on public.saved_careers for all to authenticated using (user_id = auth.uid() or public.is_app_admin()) with check (user_id = auth.uid() or public.is_app_admin());
create policy subscriptions_read_owner_admin on public.subscriptions for select to authenticated using (user_id = auth.uid() or public.is_app_admin());
create policy subscriptions_admin_write on public.subscriptions for all to authenticated using (public.is_app_admin()) with check (public.is_app_admin());
create policy notifications_owner_admin on public.notifications for all to authenticated using (user_id = auth.uid() or public.is_app_admin()) with check (user_id = auth.uid() or public.is_app_admin());
create policy activity_read_owner_admin on public.user_activity for select to authenticated using (user_id = auth.uid() or public.is_app_admin());
create policy activity_insert_owner_admin on public.user_activity for insert to authenticated with check (user_id = auth.uid() or public.is_app_admin());

grant select, insert, update, delete on public.profiles, public.user_preferences, public.resumes, public.saved_careers, public.notifications, public.user_activity to authenticated;
grant select on public.subscriptions to authenticated;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types) values
  ('resumes', 'resumes', false, 10485760, array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('avatars', 'avatars', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy resume_storage_read on storage.objects for select to authenticated using (bucket_id = 'resumes' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_app_admin()));
create policy resume_storage_insert on storage.objects for insert to authenticated with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);
create policy resume_storage_update on storage.objects for update to authenticated using (bucket_id = 'resumes' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_app_admin())) with check (bucket_id = 'resumes' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_app_admin()));
create policy resume_storage_delete on storage.objects for delete to authenticated using (bucket_id = 'resumes' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_app_admin()));
create policy avatar_storage_insert on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatar_storage_update on storage.objects for update to authenticated using (bucket_id = 'avatars' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_app_admin())) with check (bucket_id = 'avatars' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_app_admin()));
create policy avatar_storage_delete on storage.objects for delete to authenticated using (bucket_id = 'avatars' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_app_admin()));

commit;
