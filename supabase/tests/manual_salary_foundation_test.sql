begin;
create extension if not exists pgtap with schema extensions;
select plan(18);

alter table public.occupation_intelligence_audit alter column actor_user_id drop not null;
alter table public.intelligence_country_audit alter column actor_user_id drop not null;
create or replace function public.is_app_admin() returns boolean language sql stable security definer set search_path=public as $$select true$$;
update public.statistical_source_capability_approvals set terms_reviewed_at=now()-interval '1 day',approval_expires_at=now()+interval '1 year' where capability='salary' and source_id=(select id from public.statistical_sources where slug='us-bls-oews');

create or replace function pg_temp.salary_payload(p_metrics jsonb,p_release_id text default 'manual-test-release',p_release_date text default '2026-04-01') returns jsonb language sql as $$
select jsonb_build_object(
  'countryCode','us','currencyCode','USD',
  'occupationFamilyId','10000000-0000-4000-8000-000000000001',
  'occupationMappingId',(select id from public.occupation_mappings where country_code='us' and occupation_code='15-2051' and review_status='approved' limit 1),
  'sourceId',(select id from public.statistical_sources where slug='us-bls-oews'),
  'sourceRelease',jsonb_build_object('providerReleaseId',p_release_id,'releaseDate',p_release_date,'referencePeriodStart','2025-05-01','referencePeriodEnd','2025-05-31','sourceMetadata',jsonb_build_object('fixture',true)),
  'metrics',p_metrics
)$$;

create or replace function pg_temp.valid_metrics() returns jsonb language sql immutable as $$select jsonb_build_array(
  jsonb_build_object('metricCode','annual_minimum','metricMeaning','minimum','label','Annual minimum','sourceUrl','https://example.test/source','value',80000,'unit','currency_per_year'),
  jsonb_build_object('metricCode','annual_median','metricMeaning','median','label','Annual median','sourceUrl','https://example.test/source','value',100000,'unit','currency_per_year'),
  jsonb_build_object('metricCode','annual_maximum','metricMeaning','maximum','label','Annual maximum','sourceUrl','https://example.test/source','value',120000,'unit','currency_per_year')
)$$;

select throws_ok($$select public.admin_create_manual_salary_candidate(pg_temp.salary_payload(null))$$,'22023','salary_metrics_required','missing metrics rejected');
select throws_ok($$select public.admin_create_manual_salary_candidate(pg_temp.salary_payload('[{"metricCode":"p50","metricMeaning":"percentile","label":"P50","sourceUrl":"https://example.test/source","value":100000,"unit":"currency_per_year"}]'::jsonb))$$,'22023','salary_percentile_invalid','missing percentile rejected');
select lives_ok($$select public.admin_create_manual_salary_candidate(pg_temp.salary_payload(pg_temp.valid_metrics()))$$,'valid range accepted');
select matches(pg_get_functiondef('public.admin_create_manual_salary_candidate(jsonb)'::regprocedure),'extensions\.digest.*''sha256''::text','manual candidate hash uses schema-qualified pgcrypto digest');
select throws_ok($$select public.admin_create_manual_salary_candidate(pg_temp.salary_payload('[{"metricCode":"min","metricMeaning":"minimum","label":"Minimum","sourceUrl":"https://example.test/source","value":120000,"unit":"currency_per_year"},{"metricCode":"max","metricMeaning":"maximum","label":"Maximum","sourceUrl":"https://example.test/source","value":80000,"unit":"currency_per_year"}]'::jsonb,'invalid-range'))$$,'22023','contradictory_salary_range','invalid range rejected');
select lives_ok($$select public.admin_create_manual_salary_candidate(pg_temp.salary_payload('[{"metricCode":"median","metricMeaning":"median","label":"East median","sourceUrl":"https://example.test/source","regionCode":"east","value":90000,"unit":"currency_per_year"},{"metricCode":"median","metricMeaning":"median","label":"West median","sourceUrl":"https://example.test/source","regionCode":"west","value":110000,"unit":"currency_per_year"}]'::jsonb,'regional'))$$,'same metric allowed for separate regions');

select throws_ok($$select public.admin_create_manual_salary_candidate(pg_temp.salary_payload(pg_temp.valid_metrics(),'manual-test-release','2026-05-01'))$$,'23505','source_release_conflict','release identity conflict rejected');
select is((select count(*) from public.statistical_source_releases where provider_release_id='invalid-range'),0::bigint,'failed call rolls back release');
select is((select count(*) from public.occupation_observations observation join public.statistical_source_releases release on release.id=observation.source_release_id where release.provider_release_id='invalid-range'),0::bigint,'failed call rolls back observations');

create temporary table manual_candidate_ids as
select (public.admin_create_manual_salary_candidate(pg_temp.salary_payload(pg_temp.valid_metrics(),'canonical-order'))).id as first_id;
insert into manual_candidate_ids select (public.admin_create_manual_salary_candidate(pg_temp.salary_payload((select jsonb_agg(metric order by ordinal desc) from jsonb_array_elements(pg_temp.valid_metrics()) with ordinality as valueset(metric,ordinal)),'canonical-order'))).id;
select is((select count(distinct first_id) from manual_candidate_ids),1::bigint,'canonical order reuses candidate');
select matches(pg_get_functiondef('public.admin_create_manual_salary_candidate(jsonb)'::regprocedure),'on conflict\s*\(manual_entry_key\)','candidate creation uses race-safe conflict handling');

create or replace function public.is_app_admin() returns boolean language sql stable security definer set search_path=public as $$select false$$;
select throws_ok($$select public.admin_create_manual_salary_candidate(pg_temp.salary_payload(pg_temp.valid_metrics(),'unauthorized'))$$,'42501','admin_required','non-admin candidate creation denied');
select throws_ok($$select public.admin_reject_occupation_candidate(gen_random_uuid(),'Not acceptable')$$,'42501','admin_required','non-admin rejection denied');
select ok(not has_table_privilege('authenticated','public.occupation_intelligence_candidates','INSERT'),'authenticated cannot insert candidates directly');
select ok(not has_function_privilege('anon','public.admin_create_manual_salary_candidate(jsonb)','EXECUTE'),'anon cannot execute candidate RPC');

create or replace function public.is_app_admin() returns boolean language sql stable security definer set search_path=public as $$select true$$;
create temporary table review_candidates as
select (public.admin_create_manual_salary_candidate(pg_temp.salary_payload(pg_temp.valid_metrics(),'publish-test'))).id as publish_id,
       (public.admin_create_manual_salary_candidate(pg_temp.salary_payload(pg_temp.valid_metrics(),'reject-test'))).id as reject_id;
select is((public.admin_publish_occupation_candidate((select publish_id from review_candidates))).status,'published','valid candidate publishes through existing RPC');
select is((public.admin_reject_occupation_candidate((select reject_id from review_candidates),'Fixture rejection')).status,'rejected','validating candidate rejects through admin RPC');
select throws_ok($$select public.admin_reject_occupation_candidate((select publish_id from review_candidates),'Cannot reject published')$$,'P0001','candidate_not_rejectable','published candidate cannot be rejected');

select * from finish();
rollback;
