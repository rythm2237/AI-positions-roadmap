# Multi-Source Job Discovery v2

Status: feature branch implementation; production promotion is blocked on shadow and authenticated real-vacancy evidence.

## Architecture

The existing Job Acquisition downstream pipeline remains authoritative after discovery. Provider-specific records enter a single `CanonicalJobCandidate` contract before requirement extraction, hard eligibility, CV evidence fit, ranking, preparation, submission handoff, tracking, and notifications.

1. The provider registry reads server-side configuration and sorts adapters by one centralized priority.
2. Direct structured sources run first: Greenhouse, Lever, and configured Workday public CXS sites.
3. Configured Apify Actors run as source-specific secondary collectors. LinkedIn is public-listing discovery only; no account, session, login automation, or application automation exists.
4. Adzuna remains an optional coverage provider.
5. SerpApi is `FALLBACK` in v2 primary mode and runs only below the configured canonical-result threshold or in shadow comparison.
6. Results pass through centralized URL/text/date/company normalization and conservative cross-source deduplication.
7. The preferred official/ATS URL is independently verified with redirect limits, public DNS enforcement, response limits, job identity checks, closed signals, generic-page rejection, and login-page rejection.
8. Existing eligibility, evidence matching, ranking, readiness, application pack, lifecycle, and notification code runs unchanged.

Provider failures are isolated as typed attempts. Requests have adapter timeouts, an overall gateway deadline, bounded concurrency, bounded retries, per-provider result caps, per-cycle Apify run caps, optional per-user daily Apify cost caps, and a minimum-results fallback threshold.

## Rollout modes

- `legacy`: preserves the currently deployed aggregate provider behavior while the migration and configuration are staged.
- `shadow`: executes the fallback baseline and computes overlap, legacy-only, multisource-only, direct-only, Apify-only, and fallback-only counts. Current aggregate results remain authoritative.
- `primary`: executes Direct + Apify/coverage first and invokes SerpApi only when the canonical result count is below threshold.

Recommended rollout:

1. Apply the additive migration in Preview and deploy with `legacy`.
2. Configure approved direct sources and one approved public-jobs Apify Actor; switch Preview to `shadow`.
3. Compare count, verified rate, duplicate rate, invalid URL rate, latency, and cost for representative user intents.
4. Promote `primary` in Preview, complete authenticated desktop/mobile E2E, then promote gradually in Production.
5. Keep all provider flags and `JOB_DISCOVERY_V2_MODE=legacy` available for immediate code/config rollback.

## Configuration

All variables are server-only unless already documented as public:

| Variable | Purpose |
|---|---|
| `JOB_DISCOVERY_V2_MODE` | `legacy`, `shadow`, or `primary` |
| `JOB_PROVIDER_DIRECT_ENABLED` | Enables Greenhouse, Lever, and Workday adapters |
| `JOB_PROVIDER_APIFY_ENABLED` | Enables configured Apify Actors |
| `JOB_PROVIDER_SERPAPI_ENABLED` | Keeps SerpApi available as fallback |
| `JOB_PROVIDER_ADZUNA_ENABLED` | Keeps Adzuna coverage configurable |
| `JOB_PROVIDER_*_PRIORITY` | Central numeric defaults for Greenhouse, Lever, Adzuna, and SerpApi ordering |
| `APIFY_API_TOKEN` | Server-side Apify API credential |
| `JOB_DISCOVERY_APIFY_ACTORS` | JSON allowlist of Actor/source/input-template configuration |
| `JOB_DISCOVERY_WORKDAY_SITES` | JSON allowlist of public Workday tenant/site/host/company tuples |
| `JOB_DISCOVERY_MIN_RESULTS_BEFORE_FALLBACK` | Canonical-result threshold before SerpApi |
| `JOB_DISCOVERY_MAX_RESULTS_PER_PROVIDER` | Per-request normalization cap |
| `JOB_DISCOVERY_MAX_REQUESTS` | Total provider-request cap |
| `JOB_DISCOVERY_MAX_APIFY_RUNS` | Actor-run cap per discovery cycle |
| `JOB_DISCOVERY_APIFY_DAILY_BUDGET_USD` | Optional per-user UTC-day cost guard |
| `JOB_DISCOVERY_REQUEST_TIMEOUT_MS` | Provider request timeout |
| `JOB_DISCOVERY_GATEWAY_DEADLINE_MS` | Whole-gateway deadline |
| `JOB_DISCOVERY_APIFY_TIMEOUT_MS` | Actor polling deadline |
| `JOB_DISCOVERY_MIN_INTERVAL_SECONDS` | User search rate limit |
| `JOB_DISCOVERY_SCHEDULED_ENABLED` | Enables discovery inside the existing Job Agent cron |
| `JOB_DISCOVERY_SCHEDULED_MAX_USERS` | Bounds users processed per cron invocation |

### Apify Actor allowlist

Actor IDs never come from browser input. Each approved Actor is configured once on the server:

```json
[
  {
    "source": "linkedin",
    "actorId": "approved-owner~approved-public-jobs-actor",
    "enabled": true,
    "priority": 20,
    "maxResults": 25,
    "maxChargeUsd": 1,
    "inputTemplate": {
      "keywords": "{{query}}",
      "location": "{{location}}",
      "maxItems": "{{limit}}"
    }
  }
]
```

Input templates exist because Actor contracts differ. Only the placeholders `query`, `location`, `country`, `limit`, and `correlationId` are substituted. CareerOS does not accept an Actor ID or arbitrary Actor input from a user request.

## Persistence and observability

The design reuses `job_search_runs`, `job_provider_attempts`, and `job_opportunity_sources`. Migration `202609110001_multisource_job_discovery_v2.sql` adds criteria hash, fallback/shadow data, provider type/stage/raw/normalized/cost metadata, source confidence and first/last seen timestamps, plus canonical company/city/region/salary-period fields. Existing RLS policies remain enabled and all writes retain `user_id`.

The protected endpoint `GET /api/admin/job-agent/providers` reports configured health and 30-day attempt aggregates without returning user search text, user IDs, raw payloads, credentials, or authorization headers.

## Security review

- Apify and search credentials are read only by server modules and sent in authorization headers, never URLs or client props.
- Actor IDs and Workday destinations are configuration allowlists; user input cannot execute arbitrary Actors or select outbound hosts.
- Vacancy verification rejects unsafe schemes, credentials, ports, private/reserved DNS resolutions, excessive redirects, large responses, login destinations, generic career/search pages, and metadata conflicts.
- Raw Actor rows are retained only inside the existing per-user provider payload provenance. Admin diagnostics do not expose them.
- Search actions enforce authenticated ownership; scheduled execution requires a constant-time checked cron secret and a valid UUID, then uses the same pipeline with service-role persistence.
- Existing database submission-evidence triggers and lifecycle transition guards are unchanged.

## Test matrix status

| Case | Automated evidence | Status |
|---|---|---|
| A Direct succeeds | tiered orchestrator test | PASS |
| B Direct fails, Apify succeeds | isolated failure test | PASS |
| C Direct + Apify fail, SerpApi succeeds | fallback test | PASS |
| D all providers fail gracefully | aggregate failure test | PASS |
| E same job from three providers | canonical provenance test | PASS |
| F invalid canonical URL | URL safety test | PASS |
| G generic career homepage | verification contract/regression | PASS |
| H closed vacancy | closed-signal/404/410 contract | PASS |
| I redirect to login | login destination verification gate | PASS |
| J LinkedIn + official duplicate | conservative identity + official preference | PASS |
| K malformed provider payload | executed Apify adapter test | PASS |
| L Apify Actor timeout | executed bounded polling test | PASS |
| M Apify Actor failed state | executed failed-state test | PASS |
| N SerpApi rate limit | typed isolated outcome test | PASS |
| O zero results | empty aggregate test | PASS |
| P scheduled search | code/type/build contract; live cron not run | BLOCKED |
| Q user filters | existing intent/search tests | PASS |
| R tenant isolation | existing RLS contract; new migration not yet Preview-applied | BLOCKED |
| S secret exposure | executed Authorization/no-query-token test + static public-env test | PASS |
| T cost/fallback threshold | threshold, cap, and fallback suppression test | PASS |

## Current evidence and limitations

The repository environment available during implementation contains no configured `APIFY_API_TOKEN`, approved Actor configuration, provider keys, or Supabase credentials. Therefore no real Actor run, Preview migration, scheduled discovery, authenticated real vacancy, shadow comparison, or application preparation claim is made. IKEA, Microsoft, and Amazon do not have dedicated adapters in this phase; they can be reached through configured official ATS endpoints or fallback coverage, and dedicated adapters require a stable documented public endpoint before addition.

Production classification remains **NOT READY** until a real canonical vacancy completes Discovery → Verification → Eligibility → Ranking → Detail/Application preparation, the application content is proven grounded, the handoff URL is valid, and tracker evidence is recorded.

## Rollback

Set `JOB_DISCOVERY_V2_MODE=legacy`; if necessary disable `JOB_PROVIDER_APIFY_ENABLED`, `JOB_PROVIDER_DIRECT_ENABLED`, or scheduled discovery independently and redeploy the last known-good commit. The migration is additive and should remain in place during rollback. Do not drop provenance or telemetry columns because older code ignores them and they contain audit evidence.
