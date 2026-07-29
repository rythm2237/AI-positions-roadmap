begin;

alter table public.statistical_source_capability_approvals
  add column if not exists approval_scope text not null default '',
  add column if not exists approval_evidence_urls text[] not null default '{}'::text[];

insert into public.statistical_sources(
  slug,country_code,source_name,agency_name,canonical_url,methodology_url,licence_url,
  endpoint_allowlist,authentication_model,rate_limit_notes,cost_notes
) values (
  'us-bls-oews','us','Occupational Employment and Wage Statistics','U.S. Bureau of Labor Statistics',
  'https://www.bls.gov/oes/','https://www.bls.gov/oes/methods_24.pdf',
  'https://www.bls.gov/opub/copyright-information.htm',
  array['https://api.bls.gov','https://www.bls.gov','https://download.bls.gov'],
  'none or optional BLS API registration',
  'Use only documented BLS endpoints and remain within published limits.',
  'Public-domain numerical data; operating costs only.'
) on conflict(slug) do nothing;

insert into public.statistical_source_capability_approvals(
  source_id,capability,approval_status,commercial_use,redistribution,aggregation,
  derived_statistics,local_storage,attribution_text,approval_conditions,
  approval_scope,approval_evidence_urls,terms_reviewed_at,approval_expires_at,updated_at
)
select source.id,capability,'approved','yes','yes','yes','yes','yes',
  'Source: U.S. Bureau of Labor Statistics',
  'Attribution is mandatory. Preserve release dates, retrieval dates, methodology, and the BLS post-retrieval disclaimer. Excludes narrative/editorial content, logos, third-party material, O*NET data, and every non-BLS dataset.',
  'BLS-published OEWS numerical salary and employment statistics only.',
  array['https://www.bls.gov/opub/copyright-information.htm'],
  '2026-07-20T00:00:00Z'::timestamptz,'2027-07-20T00:00:00Z'::timestamptz,now()
from public.statistical_sources source
cross join unnest(array['salary','employment_count']) capability
where source.slug='us-bls-oews'
on conflict(source_id,capability) do update set
  approval_status=excluded.approval_status,commercial_use=excluded.commercial_use,
  redistribution=excluded.redistribution,aggregation=excluded.aggregation,
  derived_statistics=excluded.derived_statistics,local_storage=excluded.local_storage,
  attribution_text=excluded.attribution_text,approval_conditions=excluded.approval_conditions,
  approval_scope=excluded.approval_scope,approval_evidence_urls=excluded.approval_evidence_urls,
  terms_reviewed_at=excluded.terms_reviewed_at,approval_expires_at=excluded.approval_expires_at,
  updated_at=now();

commit;
