-- Server-only, idempotent refunds for requests rejected before model inference.
create table public.beta_ai_rejected_request_refunds (
  request_id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null,
  kind text not null check (kind in ('project_review', 'interview_review')),
  created_at timestamptz not null default now()
);
alter table public.beta_ai_rejected_request_refunds enable row level security;
revoke all on public.beta_ai_rejected_request_refunds from public, anon, authenticated;
grant select, insert, update, delete on public.beta_ai_rejected_request_refunds to service_role;

create function public.refund_rejected_beta_ai_quota(p_user_id uuid, p_kind text, p_usage_date date, p_request_id uuid)
returns boolean language plpgsql security invoker set search_path = public
as $$
declare v_request_id uuid;
begin
  if p_user_id is null or p_request_id is null or p_usage_date is null or p_usage_date > (timezone('utc', now()))::date
    or p_kind not in ('project_review','interview_review') then raise exception 'Invalid quota refund'; end if;
  insert into public.beta_ai_rejected_request_refunds(request_id,user_id,usage_date,kind)
    values(p_request_id,p_user_id,p_usage_date,p_kind)
    on conflict (request_id) do nothing returning request_id into v_request_id;
  if v_request_id is null then return false; end if;
  if p_kind = 'project_review' then
    update public.beta_ai_usage_daily set project_reviews=project_reviews-1, updated_at=now()
      where user_id=p_user_id and usage_date=p_usage_date and project_reviews>0;
  else
    update public.beta_ai_usage_daily set interview_reviews=interview_reviews-1, updated_at=now()
      where user_id=p_user_id and usage_date=p_usage_date and interview_reviews>0;
  end if;
  return found;
end;
$$;
revoke all on function public.refund_rejected_beta_ai_quota(uuid,text,date,uuid) from public, anon, authenticated;
grant execute on function public.refund_rejected_beta_ai_quota(uuid,text,date,uuid) to service_role;
