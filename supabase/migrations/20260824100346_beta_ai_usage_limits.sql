create table if not exists public.beta_ai_usage_daily (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null default (timezone('utc', now()))::date,
  project_reviews integer not null default 0 check (project_reviews >= 0),
  interview_reviews integer not null default 0 check (interview_reviews >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_date)
);

alter table public.beta_ai_usage_daily enable row level security;
revoke all on table public.beta_ai_usage_daily from anon, authenticated;
grant select, insert, update, delete on table public.beta_ai_usage_daily to service_role;

create or replace function public.consume_beta_ai_quota(
  p_user_id uuid,
  p_kind text,
  p_limit integer
)
returns table (allowed boolean, used integer, quota_limit integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_used integer;
  v_date date := (timezone('utc', now()))::date;
begin
  if p_user_id is null then
    raise exception 'user id is required';
  end if;
  if p_limit < 1 or p_limit > 1000 then
    raise exception 'quota limit is invalid';
  end if;

  insert into public.beta_ai_usage_daily (user_id, usage_date)
  values (p_user_id, v_date)
  on conflict (user_id, usage_date) do nothing;

  if p_kind = 'project_review' then
    update public.beta_ai_usage_daily
      set project_reviews = project_reviews + 1, updated_at = now()
      where user_id = p_user_id and usage_date = v_date and project_reviews < p_limit
      returning project_reviews into v_used;

    if v_used is null then
      select project_reviews into v_used
      from public.beta_ai_usage_daily
      where user_id = p_user_id and usage_date = v_date;
      return query select false, coalesce(v_used, p_limit), p_limit;
    end if;
  elsif p_kind = 'interview_review' then
    update public.beta_ai_usage_daily
      set interview_reviews = interview_reviews + 1, updated_at = now()
      where user_id = p_user_id and usage_date = v_date and interview_reviews < p_limit
      returning interview_reviews into v_used;

    if v_used is null then
      select interview_reviews into v_used
      from public.beta_ai_usage_daily
      where user_id = p_user_id and usage_date = v_date;
      return query select false, coalesce(v_used, p_limit), p_limit;
    end if;
  else
    raise exception 'unsupported quota kind';
  end if;

  return query select true, v_used, p_limit;
end;
$$;

revoke all on function public.consume_beta_ai_quota(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.consume_beta_ai_quota(uuid, text, integer) to service_role;
