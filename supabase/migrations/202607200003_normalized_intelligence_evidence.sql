begin;

create table if not exists public.statistical_source_releases (
 id uuid primary key default gen_random_uuid(), source_id uuid not null references public.statistical_sources(id), capability text not null check(capability in ('salary','employment_count','historical_trend','outlook','regional_hotspots')),
 country_code text not null check(country_code in ('us','ca','au','gb','fr','de','ie','no')), provider_release_id text not null,
 release_date date not null, reference_period_start date not null, reference_period_end date not null, correction_sequence integer not null default 0 check(correction_sequence>=0),
 correction_status text not null default 'original' check(correction_status in ('original','corrected','withdrawn')),
 source_metadata jsonb not null default '{}'::jsonb, retrieved_at timestamptz not null, created_at timestamptz not null default now(),
 unique(source_id,capability,provider_release_id,correction_sequence), check(reference_period_start<=reference_period_end)
);
create index if not exists source_release_lookup on public.statistical_source_releases(source_id,capability,country_code,release_date desc);

create table if not exists public.occupation_observations (
 id uuid primary key default gen_random_uuid(), occupation_family_id uuid not null references public.occupation_families(id), occupation_mapping_id uuid not null references public.occupation_mappings(id),
 source_id uuid not null references public.statistical_sources(id), source_release_id uuid not null references public.statistical_source_releases(id),
 country_code text not null check(country_code in ('us','ca','au','gb','fr','de','ie','no')), region_code text, capability text not null check(capability in ('salary','employment_count','historical_trend','outlook','regional_hotspots')),
 metric_code text not null, period_start date not null, period_end date not null, value numeric not null, unit text not null, currency_code text check(currency_code is null or currency_code ~ '^[A-Z]{3}$'),
 provenance text not null check(provenance in ('source','derived')), derivation_method text, derivation_version text,
 evidence jsonb not null, confidence text not null check(confidence in ('low','moderate','high')), quality_flags text[] not null default '{}'::text[], created_at timestamptz not null default now(),
 check(period_start<=period_end), check((provenance='source' and derivation_method is null and derivation_version is null) or (provenance='derived' and derivation_method is not null and derivation_version is not null))
);
create index if not exists occupation_observation_lookup on public.occupation_observations(occupation_family_id,country_code,capability,period_end desc);
create unique index if not exists occupation_observation_idempotency on public.occupation_observations(source_release_id,occupation_family_id,occupation_mapping_id,country_code,coalesce(region_code,''),metric_code,period_start,period_end,provenance,coalesce(derivation_version,''));

create table if not exists public.occupation_intelligence_candidates (
 id uuid primary key default gen_random_uuid(), occupation_family_id uuid not null references public.occupation_families(id), country_code text not null check(country_code in ('us','ca','au','gb','fr','de','ie','no')),
 capability text not null check(capability in ('salary','employment_count','historical_trend','outlook','regional_hotspots')), status text not null default 'draft' check(status in ('draft','validating','rejected','published','superseded')),
 mapping_version text not null, query_definition_version text not null, transformation_version text not null, normalized_payload jsonb not null,
 validation_result jsonb not null default '{}'::jsonb, evidence_count integer not null default 0 check(evidence_count>=0), created_by_run_id uuid references public.intelligence_refresh_runs(id),
 reviewed_by uuid references auth.users(id), reviewed_at timestamptz, rejection_reason text, created_at timestamptz not null default now(), published_at timestamptz, superseded_at timestamptz
);
create index if not exists occupation_candidate_review on public.occupation_intelligence_candidates(status,occupation_family_id,country_code,capability,created_at desc);
create table if not exists public.occupation_candidate_observations(candidate_id uuid not null references public.occupation_intelligence_candidates(id) on delete cascade,observation_id uuid not null references public.occupation_observations(id),primary key(candidate_id,observation_id));
create table if not exists public.occupation_intelligence_publications (
 id uuid primary key default gen_random_uuid(), occupation_family_id uuid not null references public.occupation_families(id),country_code text not null,capability text not null,
 candidate_id uuid not null unique references public.occupation_intelligence_candidates(id),status text not null check(status in ('published','superseded','withdrawn')),published_at timestamptz not null default now(),superseded_at timestamptz,
 check(country_code in ('us','ca','au','gb','fr','de','ie','no')),check(capability in ('salary','employment_count','historical_trend','outlook','regional_hotspots'))
);
create unique index if not exists one_current_occupation_publication on public.occupation_intelligence_publications(occupation_family_id,country_code,capability) where status='published';
create index if not exists occupation_publication_lookup on public.occupation_intelligence_publications(occupation_family_id,country_code,capability,published_at desc);

alter table public.statistical_source_releases enable row level security;alter table public.occupation_observations enable row level security;alter table public.occupation_intelligence_candidates enable row level security;alter table public.occupation_candidate_observations enable row level security;alter table public.occupation_intelligence_publications enable row level security;
create policy source_releases_admin_read on public.statistical_source_releases for select to authenticated using(public.is_app_admin());create policy observations_admin_read on public.occupation_observations for select to authenticated using(public.is_app_admin());create policy occupation_candidates_admin_read on public.occupation_intelligence_candidates for select to authenticated using(public.is_app_admin());create policy candidate_observations_admin_read on public.occupation_candidate_observations for select to authenticated using(public.is_app_admin());create policy occupation_publications_admin_read on public.occupation_intelligence_publications for select to authenticated using(public.is_app_admin());
revoke all on public.statistical_source_releases,public.occupation_observations,public.occupation_intelligence_candidates,public.occupation_candidate_observations,public.occupation_intelligence_publications from anon;revoke insert,update,delete on public.statistical_source_releases,public.occupation_observations,public.occupation_intelligence_candidates,public.occupation_candidate_observations,public.occupation_intelligence_publications from authenticated;grant select on public.statistical_source_releases,public.occupation_observations,public.occupation_intelligence_candidates,public.occupation_candidate_observations,public.occupation_intelligence_publications to authenticated;

create or replace function public.admin_publish_occupation_candidate(p_candidate_id uuid) returns public.occupation_intelligence_candidates language plpgsql security definer set search_path=public as $$
declare candidate public.occupation_intelligence_candidates;
begin
 if not public.is_app_admin() then raise exception 'admin_required' using errcode='42501'; end if;
 select * into candidate from occupation_intelligence_candidates where id=p_candidate_id for update;
 if candidate.id is null then raise exception 'candidate_not_found' using errcode='P0002'; end if;
 if candidate.status<>'validating' or coalesce((candidate.validation_result->>'valid')::boolean,false) is not true or candidate.evidence_count<1 then raise exception 'candidate_not_publishable' using errcode='P0001'; end if;
 update occupation_intelligence_publications set status='superseded',superseded_at=now() where occupation_family_id=candidate.occupation_family_id and country_code=candidate.country_code and capability=candidate.capability and status='published';
 update occupation_intelligence_candidates set status='superseded',superseded_at=now() where occupation_family_id=candidate.occupation_family_id and country_code=candidate.country_code and capability=candidate.capability and status='published';
 update occupation_intelligence_candidates set status='published',published_at=now(),reviewed_by=auth.uid(),reviewed_at=now() where id=candidate.id returning * into candidate;
 insert into occupation_intelligence_publications(occupation_family_id,country_code,capability,candidate_id,status) values(candidate.occupation_family_id,candidate.country_code,candidate.capability,candidate.id,'published');
 return candidate;
end $$;
revoke all on function public.admin_publish_occupation_candidate(uuid) from public,anon;grant execute on function public.admin_publish_occupation_candidate(uuid) to authenticated;
commit;
