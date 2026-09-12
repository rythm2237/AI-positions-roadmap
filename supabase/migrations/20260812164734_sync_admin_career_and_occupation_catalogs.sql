begin;

-- Register the complete product-level occupation-family catalog. These rows do
-- not approve any country mapping, source, candidate, observation or public
-- statistical publication. Existing Admin-managed definitions are preserved.
insert into public.occupation_families (
  slug,
  name,
  short_name,
  description,
  status,
  classification_scope,
  aliases,
  included_occupations,
  excluded_occupations,
  methodology_summary,
  mapping_version
)
values
  (
    'ai-ml-engineering',
    'AI and Machine Learning Engineering',
    'AI/ML Engineering',
    'Statistical identity for careers that design, build, evaluate, deploy and operate AI and machine-learning systems.',
    'draft',
    'Country-specific official classifications; no single global AI-engineering code or combined statistic is asserted.',
    array['Artificial Intelligence Engineering','Machine Learning Engineering'],
    array['AI Engineer'],
    array['Generic IT management','Unrelated data-entry occupations'],
    'Each country requires independently reviewed official occupation mappings. Family membership is product taxonomy only and must not be used to combine official statistics across occupation codes.',
    '1.0.0'
  ),
  (
    'ai-product-management',
    'AI Product Management',
    'AI Product',
    'Statistical identity for product professionals responsible for useful, responsible and commercially viable AI products.',
    'draft',
    'Country mappings may span product, project and technology-management classifications; no universal code is asserted.',
    array['Artificial Intelligence Product Management','AI Product Leadership'],
    array['AI Product Manager'],
    array['General sales management','Unrelated administrative management'],
    'Each country requires independently reviewed official occupation mappings. Family membership is product taxonomy only and must not be used to combine official statistics across occupation codes.',
    '1.0.0'
  ),
  (
    'ai-automation',
    'AI Automation and Workflow Engineering',
    'AI Automation',
    'Statistical identity for careers that connect AI, automation platforms, agents, APIs and enterprise workflows.',
    'draft',
    'Country mappings may span software development, systems analysis, automation and consulting occupations; each mapping remains separate.',
    array['Intelligent Automation','AI Workflow Engineering'],
    array['AI Automation Specialist','Intelligent Automation Engineer','Microsoft Copilot Consultant','AI Integration Specialist','AI Workflow Architect'],
    array['Purely mechanical automation','Unrelated clerical processing'],
    'Each country requires independently reviewed official occupation mappings. Family membership is product taxonomy only and must not be used to combine official statistics across occupation codes.',
    '1.0.0'
  ),
  (
    'enterprise-ai-consulting',
    'Enterprise AI Strategy and Consulting',
    'Enterprise AI Consulting',
    'Statistical identity for careers that guide organizations through AI strategy, solution design, transformation, adoption and value realization.',
    'draft',
    'Country mappings may span management analysis, technology consulting and organizational-change occupations; no blended benchmark is asserted.',
    array['AI Transformation Consulting','Business AI Consulting'],
    array['AI Solutions Consultant','AI Transformation Consultant','Business AI Consultant','Enterprise AI Consultant','AI Adoption Consultant'],
    array['Generic management consulting without technology scope','Direct software sales'],
    'Each country requires independently reviewed official occupation mappings. Family membership is product taxonomy only and must not be used to combine official statistics across occupation codes.',
    '1.0.0'
  ),
  (
    'ai-data-analytics',
    'AI Data, Analytics and Knowledge Engineering',
    'AI Data & Analytics',
    'Statistical identity for careers that build data systems, analysis, business intelligence, data science and AI-ready knowledge.',
    'draft',
    'Official data, analytics, science and engineering occupation codes remain independently mapped and reported by country.',
    array['Data and Analytics','AI Data Engineering'],
    array['Data Analyst','BI Developer','Data Engineer','Data Scientist','AI Knowledge Engineer'],
    array['Unrelated data entry','Generic database administration without analytics or engineering scope'],
    'Each country requires independently reviewed official occupation mappings. Family membership is product taxonomy only and must not be used to combine official statistics across occupation codes.',
    '1.0.0'
  ),
  (
    'ai-infrastructure-security',
    'Cloud, DevOps and Cybersecurity',
    'Infrastructure & Security',
    'Statistical identity for careers that build, operate, secure and improve cloud and software-delivery infrastructure.',
    'draft',
    'Cloud, DevOps and cybersecurity mappings remain separate official occupations; family-level aggregation is prohibited without an approved method.',
    array['Cloud Infrastructure and Security','Platform Operations and Cybersecurity'],
    array['Cloud Engineer','DevOps Engineer','Cybersecurity Analyst'],
    array['General help-desk support','Physical security occupations'],
    'Each country requires independently reviewed official occupation mappings. Family membership is product taxonomy only and must not be used to combine official statistics across occupation codes.',
    '1.0.0'
  ),
  (
    'ai-marketing',
    'AI Marketing, Content and Generative Discovery',
    'AI Marketing',
    'Statistical identity for careers applying AI to marketing, content systems and visibility across generative answer engines.',
    'draft',
    'Country mappings may span marketing, market research, content strategy and search-related occupations; each source statistic remains separate.',
    array['Artificial Intelligence Marketing','Generative Discovery and Content'],
    array['Generative Engine Optimization (GEO) Specialist','AI Marketing Specialist','AI Content Strategist'],
    array['Unrelated advertising sales','Pure graphic-production roles'],
    'Each country requires independently reviewed official occupation mappings. Family membership is product taxonomy only and must not be used to combine official statistics across occupation codes.',
    '1.0.0'
  )
on conflict (slug) do nothing;

with catalog_links(family_slug,career_slug,priority) as (
  values
    ('ai-ml-engineering','ai-engineer',1),
    ('ai-product-management','ai-product-manager',1),
    ('ai-automation','ai-automation-specialist',1),
    ('ai-automation','intelligent-automation-engineer',2),
    ('ai-automation','microsoft-copilot-consultant',3),
    ('ai-automation','ai-integration-specialist',4),
    ('ai-automation','ai-workflow-architect',5),
    ('enterprise-ai-consulting','ai-solutions-consultant',1),
    ('enterprise-ai-consulting','ai-transformation-consultant',2),
    ('enterprise-ai-consulting','business-ai-consultant',3),
    ('enterprise-ai-consulting','enterprise-ai-consultant',4),
    ('enterprise-ai-consulting','ai-adoption-consultant',5),
    ('ai-data-analytics','data-analyst',1),
    ('ai-data-analytics','bi-developer',2),
    ('ai-data-analytics','data-engineer',3),
    ('ai-data-analytics','data-scientist',4),
    ('ai-data-analytics','ai-knowledge-engineer',5),
    ('ai-infrastructure-security','cloud-engineer',1),
    ('ai-infrastructure-security','devops-engineer',2),
    ('ai-infrastructure-security','cybersecurity-analyst',3),
    ('ai-marketing','generative-engine-optimization-specialist',1),
    ('ai-marketing','ai-marketing-specialist',2),
    ('ai-marketing','ai-content-strategist',3)
)
insert into public.occupation_roadmap_links (
  occupation_family_id,
  career_slug,
  relationship_type,
  priority,
  status
)
select
  family.id,
  link.career_slug,
  'primary-roadmap',
  link.priority,
  'active'
from catalog_links link
join public.occupation_families family on family.slug=link.family_slug
on conflict (occupation_family_id,career_slug,relationship_type) do nothing;

commit;
