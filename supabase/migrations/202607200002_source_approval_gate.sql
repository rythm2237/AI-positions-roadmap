begin;

create or replace function public.valid_https_origins(p_values text[]) returns boolean language sql immutable set search_path=public as $$
 select not exists(select 1 from unnest(p_values) value where value !~ '^https://[A-Za-z0-9.-]+(:[0-9]+)?$');
$$;

create table if not exists public.statistical_sources (
 id uuid primary key default gen_random_uuid(), slug text not null unique check(slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
 country_code text not null check(country_code in ('us','ca','au','gb','fr','de','ie','no')),
 source_name text not null, agency_name text not null, canonical_url text not null check(canonical_url ~ '^https://'),
 methodology_url text not null check(methodology_url ~ '^https://'), licence_url text not null check(licence_url ~ '^https://'),
 endpoint_allowlist text[] not null default '{}'::text[], authentication_model text not null default 'none',
 rate_limit_notes text not null default '', cost_notes text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(public.valid_https_origins(endpoint_allowlist))
);
create unique index if not exists statistical_sources_country_slug on public.statistical_sources(country_code,slug);

create table if not exists public.statistical_source_capability_approvals (
 id uuid primary key default gen_random_uuid(), source_id uuid not null references public.statistical_sources(id) on delete cascade,
 capability text not null check(capability in ('salary','employment_count','historical_trend','outlook','regional_hotspots')),
 approval_status text not null default 'draft' check(approval_status in ('draft','approved','conditional','suspended','expired')),
 commercial_use text not null default 'unknown' check(commercial_use in ('yes','no','unknown')),
 redistribution text not null default 'unknown' check(redistribution in ('yes','no','unknown')),
 aggregation text not null default 'unknown' check(aggregation in ('yes','no','unknown')),
 derived_statistics text not null default 'unknown' check(derived_statistics in ('yes','no','unknown')),
 local_storage text not null default 'unknown' check(local_storage in ('yes','no','unknown')),
 attribution_text text not null default '', approval_conditions text not null default '',
 terms_reviewed_at timestamptz, approval_expires_at timestamptz, reviewed_by uuid references auth.users(id), updated_at timestamptz not null default now(),
 unique(source_id,capability), check(approval_expires_at is null or terms_reviewed_at is null or approval_expires_at>terms_reviewed_at)
);
create index if not exists source_capability_approval_gate on public.statistical_source_capability_approvals(source_id,capability,approval_status,approval_expires_at);

create table if not exists public.statistical_source_audit (
 id uuid primary key default gen_random_uuid(), source_id uuid not null references public.statistical_sources(id), capability text,
 actor_user_id uuid not null references auth.users(id), action text not null check(action in ('source.created','source.updated','source.approval_reviewed')),
 changed_fields jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
alter table public.statistical_sources enable row level security;
alter table public.statistical_source_capability_approvals enable row level security;
alter table public.statistical_source_audit enable row level security;
create policy statistical_sources_admin_read on public.statistical_sources for select to authenticated using(public.is_app_admin());
create policy source_approvals_admin_read on public.statistical_source_capability_approvals for select to authenticated using(public.is_app_admin());
create policy source_audit_admin_read on public.statistical_source_audit for select to authenticated using(public.is_app_admin());
revoke all on public.statistical_sources,public.statistical_source_capability_approvals,public.statistical_source_audit from anon;
revoke insert,update,delete on public.statistical_sources,public.statistical_source_capability_approvals,public.statistical_source_audit from authenticated;
grant select on public.statistical_sources,public.statistical_source_capability_approvals,public.statistical_source_audit to authenticated;

create or replace function public.admin_review_statistical_source_capability(p_source_id uuid,p_capability text,p_value jsonb)
returns public.statistical_source_capability_approvals language plpgsql security definer set search_path=public as $$
declare result public.statistical_source_capability_approvals;
begin
 if not public.is_app_admin() then raise exception 'admin_required' using errcode='42501'; end if;
 if p_capability not in ('salary','employment_count','historical_trend','outlook','regional_hotspots') then raise exception 'invalid_capability' using errcode='22023'; end if;
 insert into statistical_source_capability_approvals(source_id,capability,approval_status,commercial_use,redistribution,aggregation,derived_statistics,local_storage,attribution_text,approval_conditions,terms_reviewed_at,approval_expires_at,reviewed_by,updated_at)
 values(p_source_id,p_capability,p_value->>'approvalStatus',p_value->>'commercialUse',p_value->>'redistribution',p_value->>'aggregation',p_value->>'derivedStatistics',p_value->>'localStorage',coalesce(p_value->>'attributionText',''),coalesce(p_value->>'approvalConditions',''),nullif(p_value->>'termsReviewedAt','')::timestamptz,nullif(p_value->>'approvalExpiresAt','')::timestamptz,auth.uid(),now())
 on conflict(source_id,capability) do update set approval_status=excluded.approval_status,commercial_use=excluded.commercial_use,redistribution=excluded.redistribution,aggregation=excluded.aggregation,derived_statistics=excluded.derived_statistics,local_storage=excluded.local_storage,attribution_text=excluded.attribution_text,approval_conditions=excluded.approval_conditions,terms_reviewed_at=excluded.terms_reviewed_at,approval_expires_at=excluded.approval_expires_at,reviewed_by=auth.uid(),updated_at=now() returning * into result;
 insert into statistical_source_audit(source_id,capability,actor_user_id,action,changed_fields) values(result.source_id,result.capability,auth.uid(),'source.approval_reviewed',jsonb_build_object('approvalStatus',result.approval_status,'rights',jsonb_build_object('commercialUse',result.commercial_use,'redistribution',result.redistribution,'aggregation',result.aggregation,'derivedStatistics',result.derived_statistics,'localStorage',result.local_storage),'expiresAt',result.approval_expires_at));
 return result;
end $$;
revoke all on function public.admin_review_statistical_source_capability(uuid,text,jsonb) from public,anon;
grant execute on function public.admin_review_statistical_source_capability(uuid,text,jsonb) to authenticated;
revoke all on function public.valid_https_origins(text[]) from public,anon,authenticated;

insert into public.statistical_sources(slug,country_code,source_name,agency_name,canonical_url,methodology_url,licence_url,endpoint_allowlist,authentication_model,rate_limit_notes,cost_notes) values
 ('us-bls','us','BLS Public Data','U.S. Bureau of Labor Statistics','https://www.bls.gov/','https://www.bls.gov/developers/','https://www.bls.gov/developers/termsOfService.htm',array['https://api.bls.gov'],'optional registration','Public API limits apply; preserve retrieval dates.','No API charge documented.'),
 ('ca-statcan','ca','Statistics Canada Data','Statistics Canada','https://www.statcan.gc.ca/','https://www.statcan.gc.ca/en/microdata/api','https://www.statcan.gc.ca/en/terms-conditions/open-licence',array['https://www150.statcan.gc.ca'],'none','Web Data Service limits must be reviewed.','Open Licence; operating costs only.'),
 ('au-abs','au','ABS Data API','Australian Bureau of Statistics','https://www.abs.gov.au/','https://www.abs.gov.au/statistics/application-programming-interfaces-apis/data-api-user-guide','https://www.abs.gov.au/about/data-services/application-programming-interfaces-apis/indicator-api/terms-use',array['https://data.api.abs.gov.au'],'none','Data API limits must be reviewed.','Operating costs only; product review required.'),
 ('gb-ons','gb','ONS Data','Office for National Statistics','https://www.ons.gov.uk/','https://developer.ons.gov.uk/','https://www.ons.gov.uk/help/terms-conditions',array['https://api.beta.ons.gov.uk'],'none','Fair-use constraints must be reviewed.','Operating costs only; usage confirmation may be required.'),
 ('fr-insee','fr','INSEE Data','Institut national de la statistique et des études économiques','https://www.insee.fr/','https://www.insee.fr/fr/information/8184146','https://www.insee.fr/fr/information/2008466',array['https://api.insee.fr'],'varies by API','API-specific limits and authentication must be reviewed.','Operating costs only.'),
 ('de-destatis','de','GENESIS-Online','Federal Statistical Office of Germany','https://www.destatis.de/','https://www.destatis.de/EN/Service/OpenData/api-webservice.html','https://www.destatis.de/EN/Service/OpenData/_node.html',array['https://www-genesis.destatis.de'],'none','API limits must be reviewed.','Data Licence Germany attribution applies.'),
 ('ie-cso','ie','PxStat','Central Statistics Office Ireland','https://www.cso.ie/','https://www.cso.ie/en/databases/userguides/pxstatuserguide/','https://www.cso.ie/en/aboutus/lgdp/copyrightanddisclaimer/',array['https://ws.cso.ie','https://data.cso.ie'],'none','PxStat limits must be reviewed.','Licence scope requires formal review.'),
 ('no-ssb','no','Statbank Norway','Statistics Norway','https://www.ssb.no/en/','https://www.ssb.no/en/api/pxwebapiv2','https://www.ssb.no/en/diverse/lisens',array['https://data.ssb.no'],'none','30 requests/minute documented for PxWeb API v2.','CC BY 4.0; operating costs only.')
on conflict(slug) do nothing;
insert into public.statistical_source_capability_approvals(source_id,capability)
 select source.id,capability from statistical_sources source cross join unnest(array['salary','employment_count','historical_trend','outlook','regional_hotspots']) capability
on conflict(source_id,capability) do nothing;
commit;
