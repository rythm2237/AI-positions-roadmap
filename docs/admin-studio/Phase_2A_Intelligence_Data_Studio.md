# Phase 2A — Admin Intelligence Data Studio

Apply `supabase/migrations/202607170002_admin_intelligence_studio.sql` after the Phase 1 Admin migration. It is additive: existing published snapshots remain published, review metadata is added, Admin read policies are enabled, queued items can be claimed atomically, and publish/reject RPCs are restricted to authenticated database-backed Admins.

Apply `supabase/migrations/202607180001_salary_candidate_review.sql` next. It preserves existing snapshots, adds an audited high-change acknowledgement, and replaces the publish RPC with salary-specific structural validation.

## Execution model

Manual refresh creates a persisted run and queued Career/country/type items. The run page processes one atomically claimed item per authenticated request, so Vercel work stays bounded and reloads do not lose progress. Duplicate active or recently completed Career refreshes are blocked for 30 minutes. A provider timeout or rate limit may become retryable with a five-minute delay; other failures store only safe error codes/messages.

Cron and CLI refreshes retain their existing endpoints and authentication, but now create validated candidates instead of publishing immediately. The currently published snapshot remains public until an Admin uses the atomic publish operation. Rejection retains the candidate and never affects current public data.

## Adzuna retrieval

Search uses page size 50, default maximum 100 records per item, and hard maximum 200. Set `ADZUNA_MAX_RESULTS_PER_ITEM` conservatively; Admin requests still cannot exceed 200 or `ADZUNA_MAX_CALLS_PER_RUN`. Transient provider failures retry at most twice with bounded backoff. Stored metadata separates provider-reported total, pages requested, records retrieved, unique records analyzed, exact/equivalent matches, adjacent matches, employer-disclosed salaries, and provider estimates.

## Session rotation and security

Admin access and refresh tokens are HttpOnly, SameSite cookies and Secure on HTTPS. Admin middleware rotates both tokens server-side when access is missing or within five minutes of expiry; invalid refresh clears both. Every page, refresh processor, publish, and reject mutation still calls `requireAdmin()`. No browser component receives Supabase, Adzuna, Cron, cookie, or authorization values.

## Required server variables

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY` (existing `SUPABASE_SERVICE_KEY` remains a temporary server-only fallback)
- `ADZUNA_APP_ID`
- `ADZUNA_APP_KEY`
- `CRON_SECRET`
- `INTELLIGENCE_REFRESH_ENABLED=true`
- `ADZUNA_MAX_CALLS_PER_RUN`
- `ADZUNA_MAX_RESULTS_PER_ITEM` (recommended Preview default: `100`)

Do not add any privileged value to a `NEXT_PUBLIC_*` variable. Phase 2A adds no Jooble, Greenhouse, Lever, LinkedIn, or Indeed collection.
