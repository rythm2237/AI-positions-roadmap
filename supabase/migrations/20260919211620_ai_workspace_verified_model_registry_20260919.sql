-- AI Workspace verified OpenAI model registry snapshot.
-- Pricing verified 2026-09-19 from official OpenAI model documentation.
-- Rates are USD micro-units per 1M tokens and only cover standard short-context text usage.
-- Workspace context must remain below 272K until long-context multipliers are implemented.

insert into public.aiw_models(id,config,updated_at) values
('gpt-5.6-sol', jsonb_build_object(
  'id','gpt-5.6-sol','provider','openai','enabled',true,
  'inputRate','4000000','cachedInputRate','400000','outputRate','20000000',
  'contextTokens',1050000,'maxOutputTokens',128000,'quality',3,'latency',3,
  'reasoning',jsonb_build_array('none','low','medium','high'),'vision',true,'tools',true,
  'pricingVerifiedAt','2026-09-19T21:20:00Z'
),now()),
('gpt-5.6-terra', jsonb_build_object(
  'id','gpt-5.6-terra','provider','openai','enabled',true,
  'inputRate','2000000','cachedInputRate','200000','outputRate','12000000',
  'contextTokens',1050000,'maxOutputTokens',128000,'quality',2,'latency',2,
  'reasoning',jsonb_build_array('none','low','medium','high'),'vision',true,'tools',true,
  'pricingVerifiedAt','2026-09-19T21:20:00Z'
),now()),
('gpt-5.6-luna', jsonb_build_object(
  'id','gpt-5.6-luna','provider','openai','enabled',true,
  'inputRate','200000','cachedInputRate','20000','outputRate','1200000',
  'contextTokens',1050000,'maxOutputTokens',128000,'quality',1,'latency',1,
  'reasoning',jsonb_build_array('none','low','medium','high'),'vision',true,'tools',true,
  'pricingVerifiedAt','2026-09-19T21:20:00Z'
),now())
on conflict(id) do update set config=excluded.config,updated_at=now();

insert into public.aiw_audit(action,details)
values('model_registry_pricing_verified',jsonb_build_object(
  'verifiedAt','2026-09-19T21:20:00Z',
  'source','OpenAI official model documentation',
  'models',jsonb_build_array('gpt-5.6-sol','gpt-5.6-terra','gpt-5.6-luna'),
  'scope','standard short-context text token pricing; workspace maxContextTokens must remain below 272000 unless long-context pricing is implemented'
));
