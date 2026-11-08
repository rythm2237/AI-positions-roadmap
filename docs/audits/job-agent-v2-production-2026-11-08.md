# Job Agent production audit, 2026-11-08 (Europe/Budapest)

Production alias `www.airolepath.com` resolved in Vercel to `ai-positions-roadmap`, deployment `dpl_B4LfGpfJximcWnVGKchqunBzh2uc`, and GitHub `rythm2237/AI-positions-roadmap` at `main@95b9e9ea72cd0b990d569fc659f86443aae302f0`. The Supabase application database contains the matching job search runs and telemetry. The application cron is `/api/cron/job-agent-reports` at 20:00 UTC, with scheduled discovery and digest dispatch in the same route.

## Measured baseline

| Metric | Oct 28–Nov 8 | Preceding 30 calendar days |
| --- | ---: | ---: |
| Search runs | 10 | 33 |
| Canonical gateway candidates (stored as provider_records) | 1,608 | 5,579 |
| Evaluated non-expired records (sum of run counts) | 796 | 2,625 |
| Blocked | 447 | 1,503 |
| Needs review | 343 | 819 |
| Recommended | 0 | 0 |

The October 28–November 8 reporting window is inclusive in Budapest time. Ten runs were partial. The run funnel recorded 808 deferred before verification and 4 expired after selection. The 796 evaluations included 6 eligible, 343 needs review and 447 blocked. Current opportunity snapshots discovered within the window had maximum fit 51 and zero at or above 60. These mutable snapshots are not a historical score replay.

Source attempts returned 2,107 records in total across query/country repetitions. SerpApi logged 52 rate limits and 14 timeouts. Remotive returned no records in 90 attempts. DirectCompanyPortfolio and DirectCompanyExpansion returned 949 and 159 records respectively. Persisted direct-source provenance in the window covered N26 (3), SumUp (2), Celonis (1) and GetYourGuide (1). These are observed source links, not the total configured registry and not evidence of current availability. No IKEA source URL was found in those provenance rows.

Verification records included 239 JSON-LD verified and four source-page verified outcomes. Source-page verification can include closure evidence in the legacy model. There were also 71 partial text verifications, 28 source access blocks and 13 source rate limits. These are stored verification rows, not an additive daily vacancy count. The digest's previous Verified number counted only the two groups of eligible jobs selected for email.

## Root causes

- `src/app/(account)/job-agent/searchActions.ts` selected at most 80 gateway candidates and conflated provider volume with deduplicated gateway output. Deferred jobs were measured but not persisted as a queue. The production funnel matches this limit exactly.
- The same search action collapses unresolved vacancy verification and candidate eligibility into the legacy presentation gate. The recommendation gate in `recommendationPolicy.ts` also requires verified status, confirmed eligibility, the current gate version and a qualifying fit class/score.
- Frequent reason codes in current stored snapshots included CAREER_TRACK_UNKNOWN (178), SENIORITY_REVIEW_REQUIRED (167), MANDATORY_SKILL_EVIDENCE_UNKNOWN (146), EMPLOYMENT_TYPE_UNKNOWN (103), LANGUAGE_CONFLICT (102) and TRACK_SENIORITY_CONFLICT (62). More than one reason can apply. These counts alone do not establish false rejection.
- `fitIntelligence.ts` uses title overlap for role alignment and label/token matches for demonstrated implementation. A failure to match a label is an evidence matching result, not proof the candidate lacks the skill. Calibration against dated profile evidence is still required.
- `job_opportunity_sources` and `job_verifications` upsert existing source and verification keys. Deferred jobs and historical page bodies are not available for an exact time-correct replay.

## First change set

The patch adds a separate IKEA provider for public location/category pages and uses existing JSON-LD detail verification. The source is country-scoped and has a bounded page budget. It preserves the existing user recommendation preferences. It adds separate verification counts to diagnostics and digests, preserves independent eligibility in eligibility_detail, scores valid vacancies even when an eligibility check blocks them, and maps temporary verification HTTP/network failures to pending. The processing cap is configurable with the existing 80 default. The migration-free rollout preserves existing schema and reporting keys used by downstream code.

The current patch does not introduce a durable recovery queue, expand all ATS and employer coverage, supply a full evidence-grounded scoring recalibration, or supply a historical counterfactual. Do not interpret pre-release adapter tests as production verification.

A targeted scoring change reads actual implementation text when matching explicit vacancy skills. It records `career-fit-v2` and retains the existing recommendation threshold and domain experience constraints.

Controlled current-response probe: the new adapter parsed official listings fetched on November 8 and yielded 3 France, 45 Germany and 21 Hungary listings from its bounded pages. These are sampled discovery results, not recommendation counts. The test workspace's Node HTTPS/DNS path did not complete the native connector call. Official HTML was fetched with curl and replayed through the code, with a DNS test stub for detail verification. The sampled French job verified via JSON-LD, the German example remained partial, and the Hungary example exposed the additional IKEA ATS organization alias "Inter External". The alias is now recognized only for first-party IKEA postings.

The public SmartRecruiters posting endpoint for BEUMER Group returned 63 Germany postings on the audit date. The reusable adapter filters to PUBLIC results and supported countries, uses the employer's official ATS URL and checks the detail endpoint for active status and qualifications. Published and slugless SmartRecruiters posting URLs share a canonical posting identity.
