# AI Workspace implementation checkpoint

Date: 2026-09-20. Status: **staging implementation substantially complete; production release still gated**.

The complete requirements remain in `docs/requirements/ai-workspace-platform.md`.

## Current implementation

- Repository `rythm2237/AI-positions-roadmap`, branch `feat/ai-workspace-platform`, Draft PR `#146`.
- Isolated Supabase staging `cspsideklljlbdusjasg` is in use. Production Supabase has not been migrated by this branch.
- Persistent registered/guest workspace accounts, Projects, Conversations, Messages, settings, immutable Skill versions, Saved Prompts, Memories, private Files/Chunks, Plans, model registry, plugin/tool policy state, guest devices/sessions, budget reservations, immutable usage ledger and audit records.
- Atomic micro-USD financial lifecycle: hard-limit reserve, persisted provider-start, idempotent settle, uncertain-spend retention and safe pre-provider release.
- Protected same-origin APIs and shared registered/guest Workspace principal.
- Responsive `/ai` experience with Projects/Conversations, streaming, Stop, Auto/Fast/Best, Skills, Saved Prompts, Usage and Guest Code access.
- User-selectable `Normal` and `Professional` prompt profiles. Professional reserves both enhancement and final-answer maximum cost before the first provider call, meters the enhancement separately, hides the internal enhancement from visible conversation history and explains the additional budget use in UI.
- Official model registry entries for `gpt-5.6-luna`, `gpt-5.6-terra` and `gpt-5.6-sol`; the synthetic `test-concurrency` model remains disabled.
- Stripe synchronization hardened with event-ID idempotency, ordering protection and one AI-credit grant per subscription period. No commercial AI plan or allowance is invented automatically.
- Private Knowledge & Memory center at `/ai/knowledge`: PDF/DOCX/TXT/MD/CSV up to 10 MB, bounded extraction/chunking, SHA-256 dedupe, private Storage, project-scoped file retrieval, owner-level user memory, project memory, provenance and deletion/archive lifecycle.
- Retrieved text is lower-trust reference data only and cannot grant tool permissions or override platform policy. Professional enhancement does not receive retrieved project knowledge; the final answer does, and its cost is included in the pre-provider reservation bound.
- Fail-closed Plugins & Tools center at `/ai/plugins`. No connector is presented as connected without actual provider configuration; the staging catalog is currently empty.
- Admin AI Control Center at `/admin/ai-workspace` reuses existing admin authentication. It provides guest-code creation with one-time plaintext display, code/device revocation, account credit adjustments, uncertain-spend reconciliation, model enable/disable, plan/plugin visibility and immutable audit visibility.
- Explicit plan administration at `/admin/ai-workspace/plans`; subscription price and provider-cost allowance remain independent and must be configured deliberately.

## Verification evidence

- Latest functional head before this checkpoint: `5b1e17429f0d7e4c5a82f0b44d671f4153efec99`.
- `AI Workspace validation`: success on that head.
- `Job Agent validation`: success on that head.
- Core AI Workspace unit suite: `19/19` passing.
- Professional prompt-mode suite: `4/4` passing, including Knowledge reservation/isolation behavior.
- TypeScript no-emit typecheck: passing.
- Vercel Preview builds are succeeding for the stabilized Knowledge/Admin implementation; `/ai` was fetched from Preview with HTTP 200 and `noindex` headers.
- Staging transactional tests passed for budget reservation/idempotent settlement, hard limits, uncertain spend, safe release, guest activation/session/device limits, exact one-time tool approvals, Professional two-stage reservation/accounting, Stripe event dedupe/ordering/period grants, and owner/project Knowledge isolation.
- Knowledge isolation rollback test confirmed: user memory is available across Projects for the same owner; project memory and file chunks do not cross Project boundaries.
- Security regression audit: every `aiw_*` table has RLS enabled and no direct anon/authenticated CRUD grants; every `aiw_*` RPC has no anon/authenticated execute grant and is executable by service role only. Private Storage bucket has no public object policy.
- Preview deployment protection prevents unauthenticated external automation from reaching protected Admin/API routes; this is Vercel SSO protection, not an application failure.

## Known release gates / blockers

1. **True multi-connection concurrency test remains unverified.** `dblink` is available in staging but PostgreSQL correctly refuses a second connection without database credentials/GSSAPI. Do not claim the race test passed. A real independent DB client or approved staging connection credential is needed.
2. **Authenticated registered/guest/admin browser E2E remains required.** Current connector can fetch Preview but cannot maintain the full interactive authenticated browser journey through Vercel Deployment Protection.
3. **Live OpenAI provider test remains required.** It must use an environment-configured credential and stay within the user's approved cumulative test-spend ceiling of USD 0.10. Do not request the API key in chat.
4. **Preview environment parity must be confirmed** (staging Supabase + required server secrets). Environment secret values were not exposed through available tooling.
5. **Commercial plan values remain intentionally unset.** Admin tooling exists, but pricing/allowance is a product-owner decision.
6. **Actual OAuth/plugin provider setup remains external.** The application framework is fail-closed until real connector credentials/scopes are configured.
7. **Production domain/provider action:** `ai.airolepath.com` still requires Vercel/DNS configuration after merge; the available Vercel connector does not expose domain attachment or environment-secret mutation.

## Release sequence from here

1. Complete the independent-connection concurrency test and authenticated Preview E2E.
2. Confirm Preview uses staging infrastructure and configure/verify the live provider credential without exposing it in chat.
3. Run one bounded real-provider Normal request and one minimal Professional request only if their combined worst-case test spend stays below the remaining USD 0.10 authorization; record provider request IDs and actual ledger cost.
4. Review security/runtime logs and resolve any regressions. Keep unconfigured connectors disabled.
5. Product owner defines any commercial plan/AI allowance if paid access is part of the launch; otherwise keep paid AI entitlements inactive.
6. Mark PR ready, review and merge `#146` once.
7. Apply the already-tested AI Workspace migrations to production deliberately, configure production server secrets and `ai.airolepath.com`, wait for Vercel Production READY, and verify registered/guest/admin journeys.
8. Restore the intentionally paused unrelated RYTHM Supabase project only after AI Workspace no longer needs its temporary free-project slot.

## Classification

**IMPLEMENTED:** core Workspace, persistent domain, financial guard/ledger, Normal/Professional execution, registered/guest principal, responsive UI, Skills/Saved Prompts, private Files/Knowledge/Memory, usage, billing idempotency foundation, fail-closed plugin framework, Admin AI Control Center and plan administration.

**VERIFIED:** unit/typecheck CI, Preview build/shell, real staging financial/guest/Professional/billing/Knowledge transaction tests, RLS/grant audit and Knowledge isolation as listed above.

**PARTIALLY VERIFIED:** end-to-end interactive Preview behavior because Vercel Deployment Protection and authenticated browser state are outside the current connector's interactive capabilities.

**REQUIRES HUMAN/PROVIDER ACTION:** staging DB connection for a true independent concurrency test, Preview/Production environment secret configuration, authenticated browser/provider E2E, commercial plan decisions if applicable, OAuth connector setup, and final Vercel/DNS domain attachment.

**NOT RELEASED:** PR remains unmerged; Production database/domain have not been changed by this branch.
