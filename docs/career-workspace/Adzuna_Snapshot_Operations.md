# Adzuna snapshot operations

Career Intelligence reads only published Supabase snapshots. Adzuna is called exclusively by protected refresh routes. The flow is Adzuna → normalization → validation → validating snapshot → atomic publication → published-only API → accordion UI. A failed refresh never supersedes the last published snapshot.

## Setup

1. Review and run `supabase/migrations/202607160001_intelligence_snapshots.sql` in the Supabase SQL Editor. It creates three RLS-protected tables and the atomic publication function. It is non-destructive.
2. Configure `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`, and a strong `CRON_SECRET` as server-only Vercel variables.
3. Set `ADZUNA_MAX_CALLS_PER_RUN` (default 60) and then set `INTELLIGENCE_REFRESH_ENABLED=true` only after the migration is verified.
4. Deploy. `vercel.json` runs market refresh Mondays at 03:00 UTC and salary refresh on day 1 monthly at 04:00 UTC.

## Operations

Start the application locally before using the CLI. Preview without provider calls or writes:

`npm run intelligence:refresh -- --career ai-engineer --countries gb,us,ca --type all --dry-run`

Run a selected refresh:

`npm run intelligence:refresh -- --career ai-engineer --countries gb,us,ca --type all`

Use `--force` only to intentionally bypass the normal time-window idempotency key. Inspect `intelligence_refresh_runs`, then its `intelligence_refresh_items`, in Supabase. Draft/validating/rejected snapshots are never returned publicly.

To reject a bad unpublished snapshot, update its status to `rejected` using an authenticated administrative SQL session. To restore a previous publication, mark the current row superseded and the selected verified historical row published in one transaction; never delete history. Disable schedules immediately with `INTELLIGENCE_REFRESH_ENABLED=false`. Rotate provider, database, and cron secrets in their respective consoles, update Vercel, and redeploy.

## Configuration and recovery

Add careers in `career-query-registry.json`; titles remain grouped as direct, equivalent, adjacent, and excluded. Add countries in `country-registry.json`; `scheduled` controls rollout but runtime snapshots determine actual capability. Freshness thresholds and request policy live in `refresh-policy.json`.

If a run fails, inspect item error codes and leave the published snapshot unchanged. Stale published data remains available and is labeled stale. If provider access ends, disable refresh, remove provider-derived published data according to the provider agreement, and retain only permitted operational audit metadata.

## Governance

Adzuna attribution must accompany published evidence. Store normalized aggregates and minimal traceability metadata, not full job descriptions. Employer-disclosed and Adzuna-predicted salaries remain separate; currencies, countries, periods, and adjacent titles are never combined. API quotas and retention must follow the connected account terms. Commercial publication and retention rights require separate legal/licensing review; this implementation is not legal approval.
