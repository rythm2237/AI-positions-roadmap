# Job Acquisition System

## Current-state audit (2026-09-03)

The audited Job Agent was an early MVP and was not production-ready. Search was coupled directly to Adzuna and SerpApi, provider errors could become an indistinguishable empty result, and the production deployment lagged behind the Save & Search fix. Search snippets were treated as if they were complete descriptions, zero-skill profiles could be scored, and duplicate provider/query records produced PostgreSQL `21000` upsert failures. `UNVERIFIED` vacancies were effectively prevented from progressing, while the application tracker in the UI was partly disconnected from persisted lifecycle state.

Production data was inspected non-destructively: 83 opportunities, 4 applications, no application assets/events, no Job Agent inbox, and no persisted CV Analyzer evidence. Forty-two opportunities were blocked, 41 unverified, 81 skipped, and no result contained salary data. All four applications were still `preparing`. Reports existed, but scheduling ignored the configured report hour. The existing schema had per-user RLS on core Job Agent tables, but no data model for versioned intent, evidence provenance, provider attempts, verification, fit assessments, approvals, notification delivery, follow-ups, or inspectable learning.

Root causes were: implicit/stale form state, provider-specific business logic, incomplete source data treated as truth, title/keyword-heavy scoring, missing evidence interchange between CV Analyzer and Job Agent, insufficient persistence idempotency, an underspecified application lifecycle, and missing operational telemetry.

## Layer contracts

Every layer returns typed data or a classified error. Hard constraints are never downgraded to preferences, incomplete evidence is `UNVERIFIED` rather than `BLOCKED`, and no application becomes `SUBMITTED` without a receipt or explicit user attestation.

| Layer | Responsibility and input | Output | Classified failure / observability | Test contract |
|---|---|---|---|---|
| 1. Intent | Confirmed form + profile language defaults | Versioned, fingerprinted hard/soft intent | Validation codes; intent version on each run | Currency, hard constraints, fingerprint |
| 2. Evidence | Profile, latest Master CV, opt-in CV Analyzer facts | Provenance-linked evidence with type/confidence | Extraction warnings; no invented duration | Mentions vs demonstrated evidence |
| 3. Search strategy | Intent | Bounded queries with origin and priority | Expansion count and executed queries | Aliases, exclusions, maximum size |
| 4. Provider gateway | Query/country/location | Canonical provider outcomes | No results, provider error, rate limit, unsupported country, auth, invalid query | Adapter contract and failure isolation |
| 5. Collection | Provider records | Canonical candidates | Invalid/unsafe records excluded | HTTPS and canonical normalization |
| 6. Dedup/freshness | Canonical candidates | Cross-query/provider merge + freshness | Provider/source provenance retained | Tracking URL, stale and expired cases |
| 7. Eligibility | Job + hard intent + evidence | Eligible, blocked, or unverified with reason codes | Explicit rule evidence | Language, geography, workplace, salary, sponsorship |
| 8. Fit | Non-blocked job + evidence | Score, confidence, dimensions and rationale | Scoring version | Title-only score ceiling and evidence depth |
| 9. Verification | Source/application URL | Verified fields and provenance | Allowlist, DNS/private-host, timeout, size and HTTP errors | Snippet remains unverified |
| 10. Decision | Eligibility + freshness + fit | Strong, good, review, stretch, blocked, expired | Separate classification/confidence | Separation contract |
| 11. Readiness | Job, eligibility, Master CV and evidence | Structured checklist | Missing/unknown user inputs | Unverified and unsafe URL cases |
| 12. Pack | Vacancy + canonical CV/profile facts | Tailored CV content, cover note, recruiter message and drafts | Every substantive claim requires evidence IDs | Ungrounded claim rejection |
| 13. Execution | Mode + eligibility + approved integration | Auto, assisted, manual or blocked capability | Exact URL/reason/user action | Manual-safe default |
| 14. Approval | User decision + lifecycle state | Scoped approval or safe transition | Optimistic concurrency; evidence gate | Invalid transition/submission evidence |
| 15. Inbox | Domain event + preferences | Categorized in-app item and delivery queue | Dedupe key and channel status | Categories, read state, RLS |
| 16. Tracker | Current state + supported evidence | Timestamped lifecycle event | No inferred reply/submission | Transition matrix |
| 17. Learning | Explicit decisions/outcomes | Inspectable/editable signals | Never mutates hard constraints | Static mutation guard |
| 18. Observability | Search/application events | Correlation, provider, counts, latency, usage, estimated cost | Sanitized error codes/messages | Attempt aggregation |
| 19. Automation | Timezone, cadence and due work | Reports, inbox emails, follow-up reminders | Delivery outcome; no automatic external follow-up | Timezone/report-hour contract |
| 20. Release gate | Migration, test and E2E evidence | Ready, ready with warnings, or not ready | Missing gate list | Incomplete real journey refuses Ready |

## Persistence and security invariants

- New tables are additive and retain all existing users, CVs, jobs, applications and events.
- Every user-owned table has RLS and an `(select auth.uid()) = user_id` policy plus explicit authenticated grants.
- Resume files remain in the private `resumes` bucket; only derived evidence is persisted.
- External URLs require HTTPS, no credentials/custom port/private literal, and verification is limited to approved hosts whose DNS addresses are public.
- Provider secrets remain server-only environment variables. Telemetry stores no secret or raw authorization header.
- Search persistence uses canonicalized URLs and in-run cross-provider deduplication; writes are idempotent on existing business keys.
- Application state uses optimistic source-state filters. `submitted`/`applied` is rejected at the database boundary without submission evidence.
- Automatic external submission and external follow-up are disabled unless a specific official integration and scoped approval exist.

## Integration matrix

| Integration | Supported mechanism | Configuration | Runtime behavior |
|---|---|---|---|
| SerpApi | Official Google Search/Google Jobs API | `SERPAPI_API_KEY`; optional per-search cost estimate | Broad country fallback; request count and typed errors recorded |
| Adzuna | Official Search API | `ADZUNA_APP_ID`, `ADZUNA_APP_KEY` | Supported-country map; snippets remain incomplete/unverified |
| Greenhouse | Public Job Board GET API | Comma-separated `JOB_AGENT_GREENHOUSE_BOARDS` | Discovery/details only; submission remains manual without employer API key |
| Lever | Public Postings GET API | Comma-separated `JOB_AGENT_LEVER_SITES` | Discovery/details only; hosted application is preferred/manual |
| Direct career pages | Server verification allowlist | `JOB_AGENT_VERIFICATION_HOSTS` | Verification only after URL and DNS safety checks |
| Resend | Server-side email API | `RESEND_API_KEY`, `EMAIL_FROM` | Queued email deliveries; failures remain inspectable/retryable |
| Cron | Vercel Cron + secret authorization | `CRON_SECRET` | Hourly scheduler enforces each user's local report hour |
| LinkedIn | No unapproved scraping or submission | No integration configured | Link/manual workflow only |

## Release and rollback

The migration must first pass in an isolated Preview database, followed by an authenticated Preview deployment covering the complete user journey on desktop and mobile. Production receives the migration before code promotion, followed by a non-destructive authenticated smoke test. Rollback is code-first: redeploy the previous production deployment and disable the hourly cron. The database migration is additive; new tables/columns remain dormant during rollback and are not dropped, preserving user data. Automatic submission remains feature-inactive until an approved employer-side integration is explicitly configured and tested.

`READY` is prohibited unless a real authenticated search reaches a live relevant vacancy and a validated application action. A successful build or mocked provider test is not equivalent to release readiness.

## Validation evidence (2026-09-03)

- Focused layer suite: 21/21 passing, covering all twenty layers plus explicit authorization/responsive contracts.
- Existing hard-eligibility suite: passing for language, source confidence, geography and workplace rules.
- TypeScript: `tsc --noEmit` passing.
- Production build: Next.js 16.2.12 compiled, type-checked and generated 97/97 static pages; all Job Agent, Inbox-supporting API and cron routes were emitted.
- Repository lint command: not runnable because the existing `npm run lint` invokes the removed Next.js 16 `next lint` subcommand. This is a pre-existing tooling defect; it is not reported as a lint pass.
- Migration: the complete SQL migration executed successfully against the current Production schema inside `BEGIN … ROLLBACK`; a follow-up query confirmed that no new table or function remained.
- RLS/function transaction test: two existing authenticated identities were used without exposing their data. Repeated learning signals produced `sample_size = 2`, while the second identity saw zero rows owned by the first. The test transaction was rolled back.
- Supabase Preview branch: blocked before creation with `PaymentRequiredException`; database branching requires the organization to upgrade from its current plan. No charge or branch was created.
- Authenticated desktop/mobile Preview E2E: not executed because the isolated database branch and migrated Preview runtime do not exist yet.
- Production: inspected and tested non-destructively only. The migration and application code were not promoted.
- Production smoke: the protected `/job-agent` path resolves to the OAuth sign-in page for an anonymous request, and the cron endpoint rejects an unsigned request with HTTP 401. Seven-day runtime telemetry contains the previously reproduced duplicate-upsert `21000` group and no new-code evidence because the feature branch is not deployed.

Current release classification: **NOT READY**. The remaining release gate is environmental, not a claimed pass: provision a Supabase Preview branch (or another isolated staging project), apply the migration, configure provider/email credentials there, deploy the feature branch, and complete the authenticated desktop/mobile journey through a real vacancy and manual application action.

## Evidence coverage boundary

The unified store accepts profile, Master CV, explicitly saved CV Analyzer, experience, education, certification, language, project, portfolio, roadmap and assessment evidence with provenance. In the current product, profile/Master CV/CV Analyzer have server-side persistence and are ingested automatically or by explicit opt-in. Roadmap progress and assessment state are currently browser-local elsewhere in the product; Job Agent does not treat those local completion flags as professional evidence or silently upload them. They require a separate explicit, user-reviewed evidence-publication flow before they can safely affect ranking. Recruiter outcomes become evidence only when the user records an external response with an evidence note.
