begin;

create table public.intelligence_countries (
  country_code text primary key check(country_code ~ '^[a-z]{2}$'),
  country_name text not null check(char_length(trim(country_name)) between 2 and 100),
  currency_code text not null check(currency_code ~ '^[A-Z]{3}$'),
  region_group text not null check(region_group in ('north-america','europe','oceania','other')),
  status text not null default 'active' check(status in ('active','inactive')),
  sort_order integer not null default 100 check(sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.intelligence_countries(country_code,country_name,currency_code,region_group,sort_order) values
  ('us','United States','USD','north-america',10),
  ('ca','Canada','CAD','north-america',20),
  ('au','Australia','AUD','oceania',30),
  ('gb','United Kingdom','GBP','europe',40),
  ('de','Germany','EUR','europe',50),
  ('fr','France','EUR','europe',60),
  ('nl','Netherlands','EUR','europe',70),
  ('ie','Ireland','EUR','europe',80),
  ('ch','Switzerland','CHF','europe',90),
  ('se','Sweden','SEK','europe',100),
  ('dk','Denmark','DKK','europe',110),
  ('no','Norway','NOK','europe',120),
  ('fi','Finland','EUR','europe',130),
  ('at','Austria','EUR','europe',140)
on conflict(country_code) do nothing;

with legacy_codes as (
  select country_code from public.intelligence_refresh_items
  union select country_code from public.intelligence_snapshots
  union select country_code from public.occupation_mappings
  union select country_code from public.statistical_sources
  union select country_code from public.statistical_source_releases
  union select country_code from public.occupation_observations
  union select country_code from public.occupation_intelligence_candidates
  union select country_code from public.occupation_intelligence_publications
), legacy_currency as (
  select country_code,max(currency_code) filter(where currency_code ~ '^[A-Z]{3}$') as currency_code
  from public.intelligence_snapshots group by country_code
)
insert into public.intelligence_countries(country_code,country_name,currency_code,region_group,status,sort_order)
select legacy.country_code,upper(legacy.country_code)||' (legacy)',coalesce(currency.currency_code,'XXX'),'other','inactive',1000
from legacy_codes legacy left join legacy_currency currency using(country_code)
where legacy.country_code ~ '^[a-z]{2}$'
on conflict(country_code) do nothing;

do $$
declare item record;
begin
  for item in
    select constraint_table::regclass as table_name, constraint_name
    from (
      select conrelid as constraint_table, conname as constraint_name
      from pg_constraint
      where contype='c'
        and conrelid=any(array[
          'public.intelligence_refresh_items'::regclass,
          'public.intelligence_snapshots'::regclass,
          'public.occupation_mappings'::regclass,
          'public.statistical_sources'::regclass,
          'public.statistical_source_releases'::regclass,
          'public.occupation_observations'::regclass,
          'public.occupation_intelligence_candidates'::regclass,
          'public.occupation_intelligence_publications'::regclass
        ])
        and pg_get_constraintdef(oid) ~* 'country_code'
    ) constraints_to_replace
  loop
    execute format('alter table %s drop constraint %I',item.table_name,item.constraint_name);
  end loop;
end $$;

alter table public.intelligence_refresh_items add constraint intelligence_refresh_items_country_fk foreign key(country_code) references public.intelligence_countries(country_code) not valid;
alter table public.intelligence_snapshots add constraint intelligence_snapshots_country_fk foreign key(country_code) references public.intelligence_countries(country_code) not valid;
alter table public.occupation_mappings add constraint occupation_mappings_country_fk foreign key(country_code) references public.intelligence_countries(country_code) not valid;
alter table public.statistical_sources add constraint statistical_sources_country_fk foreign key(country_code) references public.intelligence_countries(country_code) not valid;
alter table public.statistical_source_releases add constraint statistical_source_releases_country_fk foreign key(country_code) references public.intelligence_countries(country_code) not valid;
alter table public.occupation_observations add constraint occupation_observations_country_fk foreign key(country_code) references public.intelligence_countries(country_code) not valid;
alter table public.occupation_intelligence_candidates add constraint occupation_intelligence_candidates_country_fk foreign key(country_code) references public.intelligence_countries(country_code) not valid;
alter table public.occupation_intelligence_publications add constraint occupation_intelligence_publications_country_fk foreign key(country_code) references public.intelligence_countries(country_code) not valid;

alter table public.intelligence_refresh_items validate constraint intelligence_refresh_items_country_fk;
alter table public.intelligence_snapshots validate constraint intelligence_snapshots_country_fk;
alter table public.occupation_mappings validate constraint occupation_mappings_country_fk;
alter table public.statistical_sources validate constraint statistical_sources_country_fk;
alter table public.statistical_source_releases validate constraint statistical_source_releases_country_fk;
alter table public.occupation_observations validate constraint occupation_observations_country_fk;
alter table public.occupation_intelligence_candidates validate constraint occupation_intelligence_candidates_country_fk;
alter table public.occupation_intelligence_publications validate constraint occupation_intelligence_publications_country_fk;

alter table public.statistical_sources
  add column source_type text not null default 'official_statistics'
  check(source_type in ('official_statistics','market_salary_guide'));

alter table public.occupation_observations
  add column experience_level text not null default 'overall'
  check(experience_level in ('overall','junior','mid','senior','lead'));

drop index public.occupation_observation_idempotency;
create unique index occupation_observation_idempotency on public.occupation_observations(
  source_release_id,occupation_family_id,occupation_mapping_id,country_code,
  coalesce(region_code,''),experience_level,metric_code,period_start,period_end,
  provenance,coalesce(derivation_version,'')
);

alter table public.occupation_intelligence_candidates add column manual_entry_key text;
create unique index occupation_manual_candidate_idempotency
  on public.occupation_intelligence_candidates(manual_entry_key)
  where manual_entry_key is not null;

create table public.intelligence_country_audit (
  id uuid primary key default gen_random_uuid(),
  country_code text not null references public.intelligence_countries(country_code),
  actor_user_id uuid not null references auth.users(id),
  action text not null check(action in ('country.created','country.updated')),
  changed_fields jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index intelligence_country_audit_lookup on public.intelligence_country_audit(country_code,created_at desc);

create table public.occupation_intelligence_audit (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.occupation_intelligence_candidates(id),
  actor_user_id uuid not null references auth.users(id),
  action text not null check(action in ('manual_salary_candidate.created','manual_salary_candidate.reused','occupation_candidate.rejected')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index occupation_intelligence_audit_candidate on public.occupation_intelligence_audit(candidate_id,created_at desc);

alter table public.intelligence_countries enable row level security;
alter table public.intelligence_country_audit enable row level security;
alter table public.occupation_intelligence_audit enable row level security;
create policy intelligence_countries_admin_read on public.intelligence_countries for select to authenticated using(public.is_app_admin());
create policy intelligence_country_audit_admin_read on public.intelligence_country_audit for select to authenticated using(public.is_app_admin());
create policy occupation_intelligence_audit_admin_read on public.occupation_intelligence_audit for select to authenticated using(public.is_app_admin());
revoke all on public.intelligence_countries,public.intelligence_country_audit,public.occupation_intelligence_audit from anon;
revoke insert,update,delete on public.intelligence_countries,public.intelligence_country_audit,public.occupation_intelligence_audit from authenticated;
grant select on public.intelligence_countries,public.intelligence_country_audit,public.occupation_intelligence_audit to authenticated;

create or replace function public.admin_upsert_intelligence_country(p_value jsonb)
returns public.intelligence_countries language plpgsql security definer set search_path=public as $$
declare result public.intelligence_countries; existed boolean;
begin
  if not public.is_app_admin() then raise exception 'admin_required' using errcode='42501'; end if;
  if lower(coalesce(p_value->>'countryCode','')) !~ '^[a-z]{2}$'
    or upper(coalesce(p_value->>'currencyCode','')) !~ '^[A-Z]{3}$'
    or coalesce(p_value->>'regionGroup','') not in ('north-america','europe','oceania','other')
    or coalesce(p_value->>'status','') not in ('active','inactive')
  then raise exception 'invalid_country' using errcode='22023'; end if;
  select exists(select 1 from intelligence_countries where country_code=lower(p_value->>'countryCode')) into existed;
  insert into intelligence_countries(country_code,country_name,currency_code,region_group,status,sort_order)
  values(lower(p_value->>'countryCode'),trim(p_value->>'countryName'),upper(p_value->>'currencyCode'),p_value->>'regionGroup',p_value->>'status',coalesce((p_value->>'sortOrder')::integer,100))
  on conflict(country_code) do update set country_name=excluded.country_name,currency_code=excluded.currency_code,region_group=excluded.region_group,status=excluded.status,sort_order=excluded.sort_order,updated_at=now()
  returning * into result;
  insert into intelligence_country_audit(country_code,actor_user_id,action,changed_fields)
  values(result.country_code,auth.uid(),case when existed then 'country.updated' else 'country.created' end,jsonb_build_object('countryName',result.country_name,'currencyCode',result.currency_code,'regionGroup',result.region_group,'status',result.status,'sortOrder',result.sort_order));
  return result;
end $$;

create or replace function public.admin_create_manual_salary_candidate(p_value jsonb)
returns public.occupation_intelligence_candidates language plpgsql security definer set search_path=public as $$
declare
  v_country public.intelligence_countries;
  v_family public.occupation_families;
  v_mapping public.occupation_mappings;
  v_source public.statistical_sources;
  v_approval public.statistical_source_capability_approvals;
  v_release public.statistical_source_releases;
  v_candidate public.occupation_intelligence_candidates;
  v_metric jsonb;
  v_expected_evidence jsonb;
  v_observation_id uuid;
  v_existing_observation public.occupation_observations;
  v_observation_ids uuid[]='{}'::uuid[];
  v_metrics jsonb:=p_value->'metrics';
  v_canonical_metrics jsonb;
  v_release_value jsonb:=p_value->'sourceRelease';
  v_country_code text:=lower(coalesce(p_value->>'countryCode',''));
  v_currency_code text:=upper(coalesce(p_value->>'currencyCode',''));
  v_manual_key text;
  v_min numeric;
  v_max numeric;
  v_previous_percentile numeric;
  v_previous_value numeric;
  v_experience text;
  v_unit text;
  v_region text;
  v_created boolean:=false;
begin
  if not public.is_app_admin() then raise exception 'admin_required' using errcode='42501'; end if;
  if v_metrics is null or jsonb_typeof(v_metrics) is distinct from 'array' then raise exception 'salary_metrics_required' using errcode='22023'; end if;
  if jsonb_array_length(v_metrics)<1 or jsonb_array_length(v_metrics)>25 then raise exception 'salary_metrics_required' using errcode='22023'; end if;
  if v_release_value is null or jsonb_typeof(v_release_value) is distinct from 'object'
    or char_length(trim(coalesce(v_release_value->>'providerReleaseId','')))<1
    or nullif(v_release_value->>'releaseDate','') is null
    or nullif(v_release_value->>'referencePeriodStart','') is null
    or nullif(v_release_value->>'referencePeriodEnd','') is null
    or (v_release_value ? 'sourceMetadata' and jsonb_typeof(v_release_value->'sourceMetadata') is distinct from 'object')
  then raise exception 'source_release_invalid' using errcode='22023'; end if;

  select * into v_country from intelligence_countries where country_code=v_country_code and status='active';
  if v_country.country_code is null then raise exception 'country_not_supported' using errcode='22023'; end if;
  if v_currency_code !~ '^[A-Z]{3}$' or v_currency_code<>v_country.currency_code then raise exception 'currency_mismatch' using errcode='22023'; end if;

  select * into v_family from occupation_families where id=(p_value->>'occupationFamilyId')::uuid and status='active';
  if v_family.id is null then raise exception 'occupation_family_not_active' using errcode='22023'; end if;
  select * into v_mapping from occupation_mappings where id=(p_value->>'occupationMappingId')::uuid and occupation_family_id=v_family.id and country_code=v_country_code and review_status='approved';
  if v_mapping.id is null then raise exception 'occupation_mapping_not_approved' using errcode='22023'; end if;
  if coalesce(v_mapping.statistical_aggregation_allowed,true) then raise exception 'mapping_statistical_aggregation_forbidden' using errcode='22023'; end if;

  select * into v_source from statistical_sources where id=(p_value->>'sourceId')::uuid and country_code=v_country_code;
  if v_source.id is null or v_source.source_type not in ('official_statistics','market_salary_guide') then raise exception 'salary_source_invalid' using errcode='22023'; end if;
  select * into v_approval from statistical_source_capability_approvals where source_id=v_source.id and capability='salary';
  if v_approval.id is null
    or v_approval.approval_status not in ('approved','conditional')
    or v_approval.terms_reviewed_at is null
    or v_approval.terms_reviewed_at>now()
    or v_approval.approval_expires_at is null or v_approval.approval_expires_at<=now()
    or (v_approval.approval_status='conditional' and char_length(trim(v_approval.approval_conditions))=0)
    or v_approval.commercial_use<>'yes' or v_approval.redistribution<>'yes'
    or v_approval.aggregation<>'yes' or v_approval.derived_statistics<>'yes' or v_approval.local_storage<>'yes'
    or char_length(trim(v_approval.attribution_text))=0
  then raise exception 'salary_source_not_approved' using errcode='42501'; end if;

  for v_metric in select value from jsonb_array_elements(v_metrics)
  loop
    v_experience:=coalesce(v_metric->>'experienceLevel','overall');
    if coalesce(v_metric->>'metricMeaning','') not in ('median','mean','percentile','minimum','maximum')
      or coalesce(v_metric->>'metricCode','') !~ '^[a-z][a-z0-9_]{1,79}$'
      or v_experience not in ('overall','junior','mid','senior','lead')
    or coalesce(v_metric->>'unit','') not in ('currency_per_year','currency_per_hour')
    or char_length(trim(coalesce(v_metric->>'label','')))<1
    or coalesce(v_metric->>'sourceUrl','') !~ '^https://'
      or jsonb_typeof(v_metric->'value') is distinct from 'number'
    then raise exception 'salary_metric_invalid' using errcode='22023'; end if;
    if (v_metric->>'value')::numeric<0 then raise exception 'salary_metric_invalid' using errcode='22023'; end if;
    if (v_metric->>'metricMeaning')='percentile' and (jsonb_typeof(v_metric->'percentile') is distinct from 'number' or (v_metric->>'percentile')::numeric<0 or (v_metric->>'percentile')::numeric>100)
      or (v_metric->>'metricMeaning')<>'percentile' and v_metric ? 'percentile'
    then raise exception 'salary_percentile_invalid' using errcode='22023'; end if;
  end loop;

  if exists(select 1 from jsonb_array_elements(v_metrics) metric group by metric->>'metricCode',coalesce(nullif(trim(metric->>'regionCode'),''),''),coalesce(metric->>'experienceLevel','overall'),metric->>'unit' having count(*)>1)
  then raise exception 'duplicate_salary_metric' using errcode='22023'; end if;

  for v_region,v_experience,v_unit in select distinct coalesce(nullif(trim(metric->>'regionCode'),''),''),coalesce(metric->>'experienceLevel','overall'),metric->>'unit' from jsonb_array_elements(v_metrics) metric
  loop
    select max((metric->>'value')::numeric) filter(where metric->>'metricMeaning'='minimum'),min((metric->>'value')::numeric) filter(where metric->>'metricMeaning'='maximum') into v_min,v_max
    from jsonb_array_elements(v_metrics) metric where coalesce(nullif(trim(metric->>'regionCode'),''),'')=v_region and coalesce(metric->>'experienceLevel','overall')=v_experience and metric->>'unit'=v_unit;
    if v_min is not null and v_max is not null and v_min>v_max then raise exception 'contradictory_salary_range' using errcode='22023'; end if;
    if exists(select 1 from jsonb_array_elements(v_metrics) metric where coalesce(nullif(trim(metric->>'regionCode'),''),'')=v_region and coalesce(metric->>'experienceLevel','overall')=v_experience and metric->>'unit'=v_unit and metric->>'metricMeaning' not in ('minimum','maximum') and (v_min is not null and (metric->>'value')::numeric<v_min or v_max is not null and (metric->>'value')::numeric>v_max))
    then raise exception 'salary_metric_outside_range' using errcode='22023'; end if;
    v_previous_percentile:=null;v_previous_value:=null;
    for v_metric in select metric from jsonb_array_elements(v_metrics) metric where coalesce(nullif(trim(metric->>'regionCode'),''),'')=v_region and coalesce(metric->>'experienceLevel','overall')=v_experience and metric->>'unit'=v_unit and metric->>'metricMeaning'='percentile' order by (metric->>'percentile')::numeric
    loop
      if v_previous_percentile is not null and ((v_metric->>'percentile')::numeric<=v_previous_percentile or (v_metric->>'value')::numeric<v_previous_value) then raise exception 'contradictory_salary_percentiles' using errcode='22023'; end if;
      v_previous_percentile:=(v_metric->>'percentile')::numeric;v_previous_value:=(v_metric->>'value')::numeric;
    end loop;
  end loop;

  insert into statistical_source_releases(source_id,capability,country_code,provider_release_id,release_date,reference_period_start,reference_period_end,correction_sequence,correction_status,source_metadata,retrieved_at)
  values(v_source.id,'salary',v_country_code,v_release_value->>'providerReleaseId',(v_release_value->>'releaseDate')::date,(v_release_value->>'referencePeriodStart')::date,(v_release_value->>'referencePeriodEnd')::date,coalesce((v_release_value->>'correctionSequence')::integer,0),coalesce(v_release_value->>'correctionStatus','original'),coalesce(v_release_value->'sourceMetadata','{}'::jsonb),coalesce(nullif(v_release_value->>'retrievedAt','')::timestamptz,now()))
  on conflict(source_id,capability,provider_release_id,correction_sequence) do nothing;
  select * into v_release from statistical_source_releases where source_id=v_source.id and capability='salary' and provider_release_id=v_release_value->>'providerReleaseId' and correction_sequence=coalesce((v_release_value->>'correctionSequence')::integer,0);
  if v_release.id is null or v_release.country_code<>v_country_code
    or v_release.release_date<>(v_release_value->>'releaseDate')::date
    or v_release.reference_period_start<>(v_release_value->>'referencePeriodStart')::date
    or v_release.reference_period_end<>(v_release_value->>'referencePeriodEnd')::date
    or v_release.correction_status<>coalesce(v_release_value->>'correctionStatus','original')
    or v_release.source_metadata<>coalesce(v_release_value->'sourceMetadata','{}'::jsonb)
  then raise exception 'source_release_conflict' using errcode='23505'; end if;

  for v_metric in select value from jsonb_array_elements(v_metrics)
  loop
    v_expected_evidence:=jsonb_build_object('metricMeaning',v_metric->>'metricMeaning','percentile',case when v_metric ? 'percentile' then v_metric->'percentile' else null end,'label',v_metric->>'label','sourceUrl',v_metric->>'sourceUrl','notes',v_metric->>'notes','attribution',v_approval.attribution_text);
    insert into occupation_observations(occupation_family_id,occupation_mapping_id,source_id,source_release_id,country_code,region_code,capability,experience_level,metric_code,period_start,period_end,value,unit,currency_code,provenance,derivation_method,derivation_version,evidence,confidence,quality_flags)
    values(v_family.id,v_mapping.id,v_source.id,v_release.id,v_country_code,nullif(trim(v_metric->>'regionCode'),''),'salary',coalesce(v_metric->>'experienceLevel','overall'),v_metric->>'metricCode',v_release.reference_period_start,v_release.reference_period_end,(v_metric->>'value')::numeric,v_metric->>'unit',v_currency_code,'source',null,null,v_expected_evidence,coalesce(v_metric->>'confidence','moderate'),array['manual-source-backed'])
    on conflict do nothing;
    select * into v_existing_observation from occupation_observations where source_release_id=v_release.id and occupation_family_id=v_family.id and occupation_mapping_id=v_mapping.id and country_code=v_country_code and coalesce(region_code,'')=coalesce(nullif(trim(v_metric->>'regionCode'),''),'') and experience_level=coalesce(v_metric->>'experienceLevel','overall') and metric_code=v_metric->>'metricCode' and period_start=v_release.reference_period_start and period_end=v_release.reference_period_end and provenance='source' and coalesce(derivation_version,'')='';
    if v_existing_observation.id is null or v_existing_observation.value<>(v_metric->>'value')::numeric or v_existing_observation.unit<>v_metric->>'unit' or v_existing_observation.currency_code<>v_currency_code or v_existing_observation.evidence<>v_expected_evidence or v_existing_observation.confidence<>coalesce(v_metric->>'confidence','moderate')
    then raise exception 'observation_idempotency_conflict' using errcode='23505'; end if;
    v_observation_id:=v_existing_observation.id;v_observation_ids:=array_append(v_observation_ids,v_observation_id);
  end loop;

  select jsonb_agg(metric order by coalesce(nullif(trim(metric->>'regionCode'),''),''),coalesce(metric->>'experienceLevel','overall'),metric->>'unit',metric->>'metricCode',metric->>'metricMeaning',coalesce((metric->>'percentile')::numeric,-1)) into v_canonical_metrics from jsonb_array_elements(v_metrics) metric;
  v_manual_key:='manual-salary:'||encode(digest(jsonb_build_object('family',v_family.id,'mapping',v_mapping.id,'release',v_release.id,'currency',v_currency_code,'metrics',v_canonical_metrics)::text,'sha256'),'hex');
  insert into occupation_intelligence_candidates(occupation_family_id,country_code,capability,status,mapping_version,query_definition_version,transformation_version,normalized_payload,validation_result,evidence_count,manual_entry_key)
  values(v_family.id,v_country_code,'salary','validating',v_mapping.mapping_version,'manual-salary-v1','manual-source-preservation-v1',jsonb_build_object('entryMethod','manual','sourceId',v_source.id,'sourceType',v_source.source_type,'sourceReleaseId',v_release.id,'currencyCode',v_currency_code,'metrics',v_canonical_metrics),jsonb_build_object('valid',true,'entryMethod','manual','checks',jsonb_build_array('admin-authorized','country-active','mapping-approved','source-rights-approved','source-release-valid','metric-meanings-explicit','ranges-consistent','observations-idempotent'),'publication','not-published'),cardinality(v_observation_ids),v_manual_key)
  on conflict(manual_entry_key) where manual_entry_key is not null do nothing
  returning * into v_candidate;
  if v_candidate.id is null then select * into v_candidate from occupation_intelligence_candidates where manual_entry_key=v_manual_key; else v_created:=true; end if;
  insert into occupation_candidate_observations(candidate_id,observation_id) select v_candidate.id,unnest(v_observation_ids) on conflict do nothing;
  insert into occupation_intelligence_audit(candidate_id,actor_user_id,action,details) values(v_candidate.id,auth.uid(),case when v_created then 'manual_salary_candidate.created' else 'manual_salary_candidate.reused' end,jsonb_build_object('sourceId',v_source.id,'sourceReleaseId',v_release.id,'evidenceCount',cardinality(v_observation_ids),'published',false));
  return v_candidate;
end $$;

create or replace function public.admin_reject_occupation_candidate(p_candidate_id uuid,p_reason text)
returns public.occupation_intelligence_candidates language plpgsql security definer set search_path=public as $$
declare candidate public.occupation_intelligence_candidates;
begin
  if not public.is_app_admin() then raise exception 'admin_required' using errcode='42501'; end if;
  if char_length(trim(coalesce(p_reason,'')))<3 or char_length(trim(p_reason))>500 then raise exception 'rejection_reason_invalid' using errcode='22023'; end if;
  select * into candidate from occupation_intelligence_candidates where id=p_candidate_id for update;
  if candidate.id is null then raise exception 'candidate_not_found' using errcode='P0002'; end if;
  if candidate.status not in ('draft','validating') then raise exception 'candidate_not_rejectable' using errcode='P0001'; end if;
  update occupation_intelligence_candidates set status='rejected',reviewed_by=auth.uid(),reviewed_at=now(),rejection_reason=trim(p_reason) where id=candidate.id returning * into candidate;
  insert into occupation_intelligence_audit(candidate_id,actor_user_id,action,details) values(candidate.id,auth.uid(),'occupation_candidate.rejected',jsonb_build_object('reason',candidate.rejection_reason));
  return candidate;
end $$;

revoke all on function public.admin_upsert_intelligence_country(jsonb),public.admin_create_manual_salary_candidate(jsonb),public.admin_reject_occupation_candidate(uuid,text) from public,anon;
grant execute on function public.admin_upsert_intelligence_country(jsonb),public.admin_create_manual_salary_candidate(jsonb),public.admin_reject_occupation_candidate(uuid,text) to authenticated;

commit;
