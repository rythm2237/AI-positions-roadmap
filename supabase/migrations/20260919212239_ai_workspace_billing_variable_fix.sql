-- Fix PL/pgSQL variable/column ambiguity found by real staging rollback tests.
create or replace function public.aiw_sync_subscription_event(
  p_user uuid,p_event_id text,p_event_created timestamptz,p_event_type text,p_status text,
  p_subscription text,p_customer text,p_period_start timestamptz,p_period_end timestamptz,
  p_cancel_at_end boolean,p_plan_key text
)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare
  v_owner uuid; v_state public.aiw_billing_state; v_plan_config jsonb; v_plan_active boolean:=false;
  v_enabled_status boolean; v_daily_limit bigint:=0; v_monthly_limit bigint:=0; v_period_credit bigint:=0; v_grant_id uuid;
  v_disabled_entitlements jsonb:=jsonb_build_object('enabled',false,'modes','[]'::jsonb,'models','[]'::jsonb,'tools','[]'::jsonb,'maxOutputTokens',0,'maxContextTokens',0,'maxRequestMicros','0');
begin
  if p_event_id is null or length(p_event_id) not between 3 and 255 or p_event_created is null or p_event_type is null then raise exception 'INVALID_BILLING_EVENT'; end if;
  insert into public.aiw_billing_events(event_id,event_created,event_type,metadata)
  values(p_event_id,p_event_created,p_event_type,jsonb_build_object('status',p_status,'subscription',p_subscription,'customer',p_customer)) on conflict(event_id) do nothing;
  if not found then return jsonb_build_object('duplicate',true); end if;
  v_owner:=public.aiw_ensure_registered_account(p_user);
  perform 1 from public.aiw_accounts where id=v_owner for update;
  select * into v_state from public.aiw_billing_state where owner_id=v_owner for update;
  if found and (v_state.last_event_created>p_event_created or (v_state.last_event_created=p_event_created and v_state.last_event_id>p_event_id)) then
    update public.aiw_billing_events set owner_id=v_owner,status='ignored' where event_id=p_event_id;
    return jsonb_build_object('duplicate',false,'ignored',true,'ownerId',v_owner);
  end if;
  if p_plan_key is not null then select config,active into v_plan_config,v_plan_active from public.aiw_plan_entitlements where plan_key=p_plan_key; end if;
  v_enabled_status:=p_status in ('active','trialing','past_due');
  if v_plan_active and v_enabled_status then
    if coalesce(v_plan_config->>'dailyLimitMicros','') ~ '^[0-9]+$' then v_daily_limit:=(v_plan_config->>'dailyLimitMicros')::bigint; end if;
    if coalesce(v_plan_config->>'monthlyLimitMicros','') ~ '^[0-9]+$' then v_monthly_limit:=(v_plan_config->>'monthlyLimitMicros')::bigint; end if;
    if coalesce(v_plan_config->>'periodCreditMicros','') ~ '^[0-9]+$' then v_period_credit:=(v_plan_config->>'periodCreditMicros')::bigint; end if;
    update public.aiw_accounts a set plan_key=p_plan_key,billing_period_start=p_period_start,billing_period_end=p_period_end,daily_limit=v_daily_limit,monthly_limit=v_monthly_limit,entitlements=coalesce(v_plan_config->'entitlements',v_disabled_entitlements),status='active' where a.id=v_owner;
    if v_period_credit>0 and p_subscription is not null and p_period_start is not null then
      insert into public.aiw_billing_period_grants(owner_id,provider_subscription_id,period_start,amount) values(v_owner,p_subscription,p_period_start,v_period_credit)
      on conflict(owner_id,provider_subscription_id,period_start) do nothing returning id into v_grant_id;
      if v_grant_id is not null then insert into public.aiw_ledger(owner_id,amount,kind,source,reason) values(v_owner,v_period_credit,'credit','subscription_period_credit',p_plan_key||':'||p_subscription||':'||p_period_start::text); end if;
    end if;
  else
    update public.aiw_accounts a set plan_key=case when v_plan_active then p_plan_key else null end,billing_period_start=p_period_start,billing_period_end=p_period_end,daily_limit=0,monthly_limit=0,entitlements=v_disabled_entitlements where a.id=v_owner;
  end if;
  insert into public.aiw_billing_state(owner_id,last_event_created,last_event_id) values(v_owner,p_event_created,p_event_id)
  on conflict(owner_id) do update set last_event_created=excluded.last_event_created,last_event_id=excluded.last_event_id,updated_at=now();
  update public.aiw_billing_events set owner_id=v_owner,status='processed',metadata=metadata||jsonb_build_object('planKey',p_plan_key,'periodStart',p_period_start,'periodEnd',p_period_end,'cancelAtPeriodEnd',p_cancel_at_end,'grantCreated',v_grant_id is not null) where event_id=p_event_id;
  insert into public.aiw_audit(actor_id,owner_id,action,details) values(p_user,v_owner,'billing_event_processed',jsonb_build_object('eventId',p_event_id,'type',p_event_type,'planKey',p_plan_key,'grantCreated',v_grant_id is not null));
  return jsonb_build_object('duplicate',false,'ignored',false,'ownerId',v_owner,'grantCreated',v_grant_id is not null,'aiEnabled',v_plan_active and v_enabled_status);
end $$;
revoke all on function public.aiw_sync_subscription_event(uuid,text,timestamptz,text,text,text,text,timestamptz,timestamptz,boolean,text) from public,anon,authenticated;
grant execute on function public.aiw_sync_subscription_event(uuid,text,timestamptz,text,text,text,text,timestamptz,timestamptz,boolean,text) to service_role;
