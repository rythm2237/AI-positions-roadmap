# AI Workspace implementation checkpoint

Date: 2026-09-19. Status: **active implementation; not yet ready for production merge**.

The complete requirements remain in `docs/requirements/ai-workspace-platform.md`.

## Verified current state

- Repository: `rythm2237/AI-positions-roadmap`.
- Branch: `feat/ai-workspace-platform`.
- PR: `#146`.
- Isolated Supabase staging project: `cspsideklljlbdusjasg` (`ai-roadmap-preview`) is `ACTIVE_HEALTHY`.
- Production Supabase and the unrelated RYTHM project have not been modified by this implementation phase.
- The staging database contains the AI Workspace financial/guest/domain migrations through `20260919203122_ai_workspace_financial_state_hardening`.
- `anon` and `authenticated` do not have direct CRUD access to `aiw_*` financial/domain tables; financial RPCs are service-role-only.

## Implemented

- Integer micro-USD accounting, verified-price routing, bounded context, immutable/scoped skills, OpenAI Responses streaming adapter, tool policy, guest credential primitives.
- Persistent workspace principals, projects, conversations, messages, model registry, immutable skill versions, project instruction versions, saved prompts, memory, file metadata, plan entitlements, plugin catalog/connections, project plugin permissions, tool approvals/executions, guest sessions, budget reservations and audit records.
- Atomic budget lifecycle: reserve, provider-start state, settle, uncertain reconciliation state, release only when provider is provably unstarted, administrator reconciliation for unknown spend.
- Supabase execution-store adapter wired to the orchestration layer.
- Protected same-origin APIs for Projects, Conversations, Messages, Usage and streaming Chat.
- Skills API with immutable version creation instead of destructive overwrite.
- Saved Prompts API.
- Dedicated `AI Workspace validation` GitHub workflow.

## Verified

- Latest feature commit before this checkpoint: `11e34ecb192aa346f645ed6113492dcb5ca809bc`.
- `AI Workspace validation`: success.
- `Job Agent validation`: success.
- AI Workspace unit suite: `19/19` passing.
- TypeScript no-emit typecheck: passing.
- Real staging PostgreSQL rollback-based tests passed for reserve, duplicate rejection, settlement idempotency, hard budget enforcement, uncertain spend retention, no refund after provider start, safe pre-provider release, billing-period expiry, guest activation/session/device limits and one-time exact tool approval consumption.
- Synthetic staging model `test-concurrency` is disabled and must never be treated as a production model.

## Product change approved on 2026-09-19

Prompt enhancement must be optional. The workspace will expose two user-selectable prompt modes:

- `Normal`: execute the user's prompt directly through the normal routing/context pipeline.
- `Professional`: first transform the user's request into a structured, higher-quality professional prompt using a bounded prompt-engineering stage, then execute that transformed prompt. The UI must explain temporarily when this mode is selected that the request is enhanced before answering and that this can consume more AI budget.

Requirements for Professional mode:

- opt-in per request or user preference; never silently forced;
- preserve the user's actual intent and constraints; do not invent goals, facts, permissions or consequential actions;
- the enhancement stage is separately metered/reserved/settled and visible in cost/usage records;
- hard account/request limits still apply to the combined workflow before provider calls;
- if the enhancement step becomes financially or technically unavailable, fail closed or allow an explicit user-selected fallback to Normal; never silently spend beyond limits;
- the original user prompt and the enhanced prompt must be distinguishable in request metadata for audit/debugging, without exposing hidden model reasoning;
- the UI must clearly communicate the higher-cost nature of Professional mode without dark patterns.

## Remaining release sequence

1. Implement and test Professional/Normal prompt mode end-to-end, including budget accounting and UI explanation.
2. Finish Guest HTTP activation/session/logout plus admin reset/revocation and guest-to-account conversion.
3. Build the responsive branded Workspace UI: chat, projects, conversations, skills, saved prompts, usage, loading/error/limit/mobile states and accessibility.
4. Finish plans/entitlements and idempotent Stripe webhook/period synchronization without inventing commercial pricing.
5. Implement private file upload/ingestion/retrieval and memory lifecycle with ownership, MIME/size limits, provenance and deletion.
6. Expose only actually available connectors; enforce project permissions and atomic consequential-action approvals.
7. Build Admin AI Control Center for guests/codes/devices, account budgets/credits, plans, model registry/pricing, skills, usage, health and audits.
8. Run multi-connection database concurrency tests, security/adversarial tests, registered/guest/admin E2E, mobile checks, secret-leak checks, and real provider test with verified configured pricing.
9. Review PR, merge once only after all gates pass, apply migrations/configuration to production deliberately, deploy once, configure/verify `ai.airolepath.com`, and verify real production journeys.

## Current classifications

**IMPLEMENTED:** persistent domain/financial foundation, execution store, protected core APIs, skills and saved prompts.

**VERIFIED:** 19-unit-test suite, typecheck, current GitHub validations, staging transactional database tests listed above.

**PARTIALLY IMPLEMENTED:** chat gateway, guest system, entitlements, files/memory, connector/tool framework.

**REQUIRES HUMAN ACTION:** only provider/DNS/payment actions that cannot be performed through connected tooling when reached. The user has approved required implementation actions, but secrets/passwords/MFA must still be entered only in provider UI when necessary.

**REQUIRES PROVIDER ACTION:** live AI credential/model availability, OAuth integrations, Stripe configuration and DNS/domain operations where provider-side setup is required.

**NOT YET RELEASED:** no production merge, no production AI Workspace migration/configuration and no verified `ai.airolepath.com` release yet.
