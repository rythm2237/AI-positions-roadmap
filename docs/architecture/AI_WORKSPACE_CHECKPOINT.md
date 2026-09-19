# AI Workspace implementation checkpoint

Date: 2026-09-19. Status: **incomplete; do not merge or deploy as the requested product**.

The complete user requirements are preserved in `docs/requirements/ai-workspace-platform.md`.
This checkpoint implements isolated, tested execution primitives. It does not deliver a usable chat workspace.

## Existing project and audit evidence

- Repository: `rythm2237/AI-positions-roadmap`; inspected baseline `4325c51cc69fbed20f1d29b9df7e4fed8ceb34d4`.
- Next.js App Router, React, TypeScript, Tailwind; reuse the existing dark/indigo design tokens.
- Account authentication: `src/lib/auth/session.ts` and `src/lib/supabase/server.ts` call Supabase `getUser`.
- Admin authentication: `src/lib/admin/adminAuth.ts` verifies the existing admin access token and `app_user_roles` record. Do not introduce another admin login.
- Billing: existing checkout, portal, Stripe signature verification and application metadata synchronization. Reuse these; final AI allowances and prices are not approved/configured.
- The existing billing webhook has no event-ID deduplication visible in its current handler. Add transactional idempotency and ordering protection before credit grants; do not award credit on every subscription update.
- Existing beta quotas count project/interview reviews; they are not a USD cost ledger and the billing-enabled path bypasses these counts. The new workspace must not depend on that bypass for budget enforcement. Existing routes were not changed.
- Production Supabase project `dqpdyschjpbdhhotmojs` (ai roadmap) is `ACTIVE_HEALTHY`. A read-only schema query found `profiles`, `subscriptions`, `beta_ai_usage_daily`, and no existing workspace account/project/ledger tables in the queried name families. A complete schema/RLS/storage audit is still needed.
- Vercel project `prj_ghCx0MF0CORfESDMmYUde0xxMLxk`, team `team_wHasdai6ZNklc098xVkVV3KV`. Existing production deployment `dpl_7srzr3e9Nkc1DzbkF2vUjugaLFg8` was reported `READY` by the connector. This is the pre-existing site, not this feature.
- Existing domains include `airolepath.com` and `www.airolepath.com`. `ai.airolepath.com` was absent. It has not been added, and DNS ownership/configuration has not been verified.
- Environment variable values were not read or changed. Provider access and live pricing are not verified.

## Implemented primitives

`src/lib/ai-workspace/` contains:

- `contracts.ts`: typed model, skill, entitlement, usage and execution contracts. No final provider model names or live prices are invented.
- `money.ts`: integer USD micro-unit arithmetic using BigInt, safe string serialization, validation, cached-input pricing, upward rounding, uncached maximum-cost reservation.
- `routing.ts`: deterministic intent classification, Auto/Fast/Best selection, budget filtering, capability and context checks, reasoning selection, stale-price rejection. The 30-day pricing freshness rule fails closed.
- `context.ts`: separate platform and developer customization instructions; project/user skill scope validation; conservative text byte bounds and recent-history trimming. It reports truncation. Prompt hierarchy is not a security boundary; authorization stays in code.
- `execution.ts`: orchestration through an injected persistence contract: load/verify ownership, route, reserve, stream, settle before completion, retain unknown spend for reconciliation. No implicit retry after an uncertain execution.
- `openaiProvider.ts`: OpenAI Responses streaming adapter with fixed provider URL, output bound, request correlation, timeout, split UTF-8/SSE handling and final usage extraction. It drops hidden-reasoning events. Live provider compatibility is not yet verified.
- `toolPolicy.ts`: authorization intersection across user, project, skill, connection and entitlements. Consequential approvals bind the exact arguments, tool, connection, owner, project and expiry. Persistence must atomically consume approvals; this module alone does not implement a connector.
- `guestCredentials.ts`: high-entropy invitation/device generation, domain-separated hashes, constant-time device comparison, strict host-only secure cookie settings, expiration/revocation validation. These are primitives, not a working guest activation system. A copied bearer device cookie can be replayed; do not describe this fallback as physical-device proof. Implement stronger proof-of-possession if strict anti-copy protection is required.

No new API routes, pages, tables, production credentials, or domains are enabled by this checkpoint.

## Verification

- `node --experimental-strip-types --test scripts/test-ai-workspace.mjs`: **16 tests passed**.
- `node node_modules/typescript/bin/tsc --noEmit --pretty false`: passed after the core changes.
- Tests use synthetic prices and injected provider/store fixtures. They establish routing and orchestration behavior, not live billing, database atomicity, guest activation, RLS or production functionality.
- `next build --webpack`: passed using the installed dependency tree (Next.js 16.2.12); 99 static pages generated. This did not execute the project prebuild patch pipeline or enable a new workspace route. It is not evidence of feature completion.

## Blocking staging condition

The existing AI Career preview project `cspsideklljlbdusjasg` is inactive. A restore attempt returned:

> The following organization members have reached their maximum limits for the number of active free projects ... rythm2237 (2 project limit).

The two active projects are AI Career and RYTHM production. Neither was paused, deleted or modified. Restoring the preview requires a free project slot or an approved paid option. Do not pause the unrelated RYTHM project as a workaround under this task's scope.

The local runtime has no Supabase CLI or PostgreSQL test server. An offline CLI lookup failed (`ENOTCACHED`); a bounded connection check to `registry.npmjs.org` timed out. Installed project dependencies were reused for TypeScript/tests. Do not fabricate a passing database test or apply untested financial/identity schema directly to production.

## Next implementation sequence

1. Obtain a usable isolated database; confirm the project ref before any mutation. Finish the existing schema, RLS, environment-name and storage inspection. Follow the Supabase skill to generate migrations with the CLI. Do not manually invent a migration filename to work around missing tooling.
2. Implement persistent workspace principals linked to existing `auth.users` for registered users, and separate guest principals. Reuse existing account/billing identity, not a second account system.
3. Add projects, conversations, messages, immutable skill versions, model registry, scoped instructions, memory, saved prompts and private files. Enforce owner/project composite relationships and RLS. Limit and paginate all data access.
4. Implement the `ExecutionStore` adapter. In one transaction lock the budget principal and conversation; recheck current entitlements, guest/device state, daily/monthly/credit limits and rate limits; enforce unique owner/request idempotency; reserve funds and persist the input. Snapshot pricing and skill version. Concurrency tests must use real database transactions, not these unit fixtures.
5. Implement settlement and reconciliation. Atomically persist assistant output and append actual usage ledger entries, settle the reservation once, and release only the known unused difference. Keep uncertain cost reserved until reconciled. Never auto-refund a timed-out provider call. Handle a worker crash, billing period rollover, duplicate settlement, a disconnected client and a provider over-bound anomaly. Account for tool/image costs separately before enabling them.
6. Implement same-origin protected API routes using existing account/admin auth; add CSRF protection for cookie mutations, request-size validation, cross-instance rate limiting, service-role-only financial RPCs and audit trails. Refresh account sessions for new workspace routes in the existing proxy.
7. Build the branded responsive chat/project/skill/saved-prompt/usage experience, full conversation lifecycle and Markdown/code/table rendering. Include loading, disabled, retry, limit, mobile keyboard and accessible navigation states. Add authenticated noindex behavior and navigation integration.
8. Implement atomic guest activation, activation/device limits, hashed code lookup, secure session issuance, expiry, revocation, administrator reset/replacement and auditable transactional guest-to-account conversion. Test duplicate activation and replay policy across separate browsers.
9. Configure plans and AI allowances through admin settings. Integrate existing Stripe checkout/portal with idempotent authoritative webhook processing, renewal periods and explicit entitlements. Keep revenue separate from provider cost. Do not invent paid pricing or grant unbounded trial credit.
10. Implement files/knowledge/memory and background ingestion with private storage, MIME/size validation, ownership checks, extraction limits, retrieval provenance and deletion lifecycle. Untrusted retrieved text must not authorize tools.
11. Implement a normalized connector catalog, encrypted per-user OAuth credentials, least scopes, disconnect/revocation and per-project permissions. Wire policy checks plus atomic approval consumption into actual tools; unavailable integrations must be clearly disabled.
12. Build the Admin AI Control Center inside existing admin auth: guests/codes/devices, limits/credits, registry/prices, skill versions, plans, aggregate usage, health and immutable audit events. Do not expose conversation content in general analytics.
13. Complete real database/security/E2E tests from the original requirement, including concurrency and zero provider calls at hard limit. Test configured providers and pricing, cancel/retry, mobile layout, lack of secret leakage, and production parity.
14. Only after all release gates pass: review PR, merge once, deploy, configure `ai.airolepath.com` using verified DNS/provider access, wait for READY and verify the actual production journeys. Preserve the original final-report categories and report unknowns honestly.

## Deferred policy decisions

- Final prices and included AI allowance remain configurable and unset.
- Paid access must not inherit unlimited beta cost behavior.
- No live model registry has been seeded; synthetic test model IDs must never reach production.
- Exact cookie/passkey device semantics must be documented to users; neither IP nor ordinary synced passkeys prove one physical device.
- Text-only byte-bound estimation cannot be reused for images, PDFs or tool execution without additional pricing-aware estimation.
- Conversation compaction, retrieval and memory need their own provenance/retention policies; trimming alone is not the complete requested context system.

## Status

IMPLEMENTED: isolated primitives listed above.

VERIFIED: unit/adapter tests and TypeScript checks, scoped as described.

PARTIALLY IMPLEMENTED: gateway, model/reasoning routing, cost accounting, skills/tool policy and guest credential logic.

REQUIRES HUMAN ACTION: provide an available staging database slot or choose an approved infrastructure option without interrupting production.

REQUIRES PROVIDER ACTION: restore staging after quota permits; domain/OAuth/payment setup only as established during implementation.

NOT IMPLEMENTED: persistent financial/identity stores, actual guest flow, chat UI, admin UI, billing entitlements, files/retrieval, live connectors, database migrations, full E2E and production release.
