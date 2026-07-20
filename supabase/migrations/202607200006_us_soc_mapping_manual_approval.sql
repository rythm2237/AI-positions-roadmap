begin;

alter table public.occupation_mappings
  add column if not exists weight_purpose text not null default 'relevance-only'
    check(weight_purpose='relevance-only'),
  add column if not exists statistical_aggregation_allowed boolean not null default false
    check(statistical_aggregation_allowed=false),
  add column if not exists methodological_limitations text[] not null default '{}'::text[],
  add column if not exists approval_method text,
  add column if not exists approval_evidence_url text check(approval_evidence_url is null or approval_evidence_url ~ '^https://');

do $$
declare changed_count integer;
begin
  update public.occupation_mappings set
    review_status='approved',
    mapping_confidence='moderate',
    reviewed_at='2026-07-20T00:00:00Z'::timestamptz,
    updated_at=now(),
    weight_purpose='relevance-only',
    statistical_aggregation_allowed=false,
    methodological_limitations=array[
      'OEWS cannot filter AI Engineer sub-roles inside a SOC occupation.',
      'Publish each SOC occupation statistic separately.',
      'Do not use relevance weights to calculate a combined median, percentile, employment count, or other official statistic.'
    ],
    approval_method='manual-product-approval',
    approval_evidence_url='https://www.bls.gov/soc/2018/soc_2018_definitions.pdf',
    evidence_urls=array['https://www.bls.gov/soc/2018/soc_2018_definitions.pdf'],
    notes='Manually approved as an Official occupation-family benchmark, not an exact AI Engineer statistic. Relevance weights are display metadata only; source statistics must remain separate by SOC occupation.'
  where occupation_family_id='10000000-0000-4000-8000-000000000001'
    and country_code='us' and mapping_version='us-soc-2026.1'
    and occupation_code in ('15-2051','15-1252','15-1221');
  get diagnostics changed_count = row_count;
  if changed_count <> 3 then raise exception 'expected_three_us_soc_mappings_for_manual_approval'; end if;
end $$;

insert into public.occupation_admin_audit(actor_user_id,action,entity_type,entity_id,changed_fields)
select null,'mapping.upserted','occupation-mapping',mapping.id::text,
  jsonb_build_object(
    'decision','manually-approved',
    'approvalAuthority','Product owner manual approval',
    'reviewStatus',mapping.review_status,
    'mappingConfidence',mapping.mapping_confidence,
    'weightPurpose',mapping.weight_purpose,
    'statisticalAggregationAllowed',mapping.statistical_aggregation_allowed,
    'publicLabel','Official occupation-family benchmark',
    'approvalEvidenceUrl',mapping.approval_evidence_url
  )
from public.occupation_mappings mapping
where mapping.occupation_family_id='10000000-0000-4000-8000-000000000001'
  and mapping.country_code='us' and mapping.mapping_version='us-soc-2026.1'
  and mapping.occupation_code in ('15-2051','15-1252','15-1221');

commit;
