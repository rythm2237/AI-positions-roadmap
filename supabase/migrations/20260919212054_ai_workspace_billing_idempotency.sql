-- AI Workspace billing idempotency and one-credit-per-subscription-period enforcement.
create table public.aiw_billing_events (
  event_id text primary key,
  event_created timestamptz not null,
  event_type text not null,
  owner_id uuid references public.aiw_accounts(id) on delete set null,
  status text not null default 'processed' check (status in ('processed','ignored')),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create table public.aiw_billing_state (
  owner_id uuid primary key references public.aiw_accounts(id) on delete cascade,
  last_event_created timestamptz not null,
  last_event_id text not null,
  updated_at timestamptz not null default now()
);
create table public.aiw_billing_period_grants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.aiw_accounts(id) on delete restrict,
  provider_subscription_id text not null,
  period_start timestamptz not null,
  amount bigint not null check (amount > 0 and amount <= 1000000000000),
  created_at timestamptz not null default now(),
  unique(owner_id,provider_subscription_id,period_start)
);
alter table public.aiw_billing_events enable row level security;
alter table public.aiw_billing_state enable row level security;
alter table public.aiw_billing_period_grants enable row level security;
revoke all on public.aiw_billing_events,public.aiw_billing_state,public.aiw_billing_period_grants from public,anon,authenticated;
grant select,insert,update,delete on public.aiw_billing_events,public.aiw_billing_state,public.aiw_billing_period_grants to service_role;

create function public.aiw_sync_subscription_event(
  p_user uuid,p_event_id text,p_event_created timestamptz,p_event_type text,p_status text,
  p_subscription text,p_customer text,p_period_start timestamptz,p_period_end timestamptz,
  p_cancel_at_end boolean,p_plan_key text
)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare
  owner uuid; state_row public.aiw_billing_state; plan_config jsonb; plan_active boolean:=false;
  enabled_status boolean; daily_limit bigint:=0; monthly_limit bigint:=0; period_credit bigint:=0; grant_id uuid;
  disabled_entitlements jsonb:=jsonb_build_object('enabled',false,'modes','[]'::jsonb,'models','[]'::jsonb,'tools','[]'::jsonb,'maxOutputTokens',0,'maxContextTokens',0,'maxRequestMicros','0');
begin
  if p_event_id is null or length(p_event_id) not between 3 and 255 or p_event_created is null or p_event_type is null then raise exception 'INVALID_BILLING_EVENT'; end if;
  insert into public.aiw_billing_events(event_id,event_created,event_type,metadata)
  values(p_event_id,p_event_created,p_event_type,jsonb_build_object('status',p_status,'subscription',p_subscription,'customer',p_customer))
  on conflict(event_id) do nothing;
  if not found then return jsonb_build_object('duplicate',true); end if;

  owner:=public.aiw_ensure_registered_account(p_user);
  perform 1 from public.aiw_accounts where id=owner for update;
  select * into state_row from public.aiw_billing_state where owner_id=owner for update;
  if found and (state_row.last_event_created>p_event_created or (state_row.last_event_created=p_event_created and state_row.last_event_id>p_event_id)) then
    update public.aiw_billing_events set owner_id=owner,status='ignored' where event_id=p_event_id;
    return jsonb_build_object('duplicate',false,'ignored',true,'ownerId',owner);
  end if;

  if p_plan_key is not null then select config,active into plan_config,plan_active from public.aiw_plan_entitlements where plan_key=p_plan_key; end if;
  enabled_status:=p_status in ('active','trialing','past_due');
  if plan_active and enabled_status then
    if coalesce(plan_config->>'dailyLimitMicros','') ~ '^[0-9]+$' then daily_limit:=(plan_config->>'dailyLimitMicros')::bigint; end if;
    if coalesce(plan_config->>'monthlyLimitMicros','') ~ '^[0-9]+$' then monthly_limit:=(plan_config->>'monthlyLimitMicros')::bigint; end if;
    if coalesce(plan_config->>'periodCreditMicros','') ~ '^[0-9]+$' then period_credit:=(plan_config->>'periodCreditMicros')::bigint; end if;
    update public.aiw_accounts set plan_key=p_plan_key,billing_period_start=p_period_start,billing_period_end=p_period_end,
      daily_limit=daily_limit,monthly_limit=monthly_limit,entitlements=coalesce(plan_config->'entitlements',disabled_entitlements),status='active' where id=owner;
    if period_credit>0 and p_subscription is not null and p_period_start is not null then
      insert into public.aiw_billing_period_grants(owner_id,provider_subscription_id,period_start,amount)
      values(owner,p_subscription,p_period_start,period_credit)
      on conflict(owner_id,provider_subscription_id,period_start) do nothing returning id into grant_id;
      if grant_id is not null then
        insert into public.aiw_ledger(owner_id,amount,kind,source,reason)
        values(owner,period_credit,'credit','subscription_period_credit',p_plan_key||':'||p_subscription||':'||p_period_start::text);
      end if;
    end if;
  else
    update public.aiw_accounts set plan_key=case when plan_active then p_plan_key else null end,billing_period_start=p_period_start,billing_period_end=p_period_end,
      daily_limit=0,monthly_limit=0,entitlements=disabled_entitlements where id=owner;
  end if;

  insert into public.aiw_billing_state(owner_id,last_event_created,last_event_id) values(owner,p_event_created,p_event_id)
  on conflict(owner_id) do update set last_event_created=excluded.last_event_created,last_event_id=excluded.last_event_id,updated_at=now();
  update public.aiw_billing_events set owner_id=owner,status='processed',metadata=metadata||jsonb_build_object('planKey',p_plan_key,'periodStart',p_period_start,'periodEnd',p_period_end,'cancelAtPeriodEnd',p_cancel_at_end,'grantCreated',grant_id is not null) where event_id=p_event_id;
  insert into public.aiw_audit(actor_id,owner_id,action,details)
  values(p_user,owner,'billing_event_processed',jsonb_build_object('eventId',p_event_id,'type',p_event_type,'planKey',p_plan_key,'grantCreated',grant_id is not null));
  return jsonb_build_object('duplicate',false,'ignored',false,'ownerId',owner,'grantCreated',grant_id is not null,'aiEnabled',plan_active and enabled_status);
end $$;
revoke all on function public.aiw_sync_subscription_event(uuid,text,timestamptz,text,text,text,text,timestamptz,timestamptz,boolean,text) from public,anon,authenticated;
grant execute on function public.aiw_sync_subscription_event(uuid,text,timestamptz,text,text,text,text,timestamptz,timestamptz,boolean,text) to service_role;
