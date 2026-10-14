# Job Agent career intelligence audit — 2026-10-14

## Confirmed defects and evidence

| Component | Code/data evidence | Correction |
| --- | --- | --- |
| `fitIntelligence.ts` | Experience points came from first timed `role_history`, including `Total professional experience`; any seniority string earned points. | Domain-specific track years; seniority compatibility gate before ranking. |
| `hardEligibility.ts`, `eligibility.ts` | Only optional global min/max title/provider levels; no required domain-years comparison. Active reference configuration had both bounds null. | Independent track levels, mandatory professional years, leadership and unknown-evidence outcomes. |
| `dailyDigestReporting.ts` | Daily query filtered skip/reject decisions but did not require eligible, verified, minimum fit or classification. | Shared, versioned notification policy for daily, scheduled and pending-inbox recommendations. |
| `dailyDigestEmail.ts` | Eligible was labelled “Verified eligible”; pending jobs were displayed as recommendations. | Vacancy verification separate from eligibility; grouped quality recommendations and truthful empty report. |
| `requirements.ts` | Required-section branch ran before preferred wording; preferred degree/skill clauses became mandatory. | Preferred wording takes precedence. |
| `evidence.ts` | Delivered project actions in Master CV could be recorded as work implementation. | Explicit project sections keep project provenance; no conversion to professional duration. |
| `vacancyVerification.ts` | First embedded JobPosting was processed before generic listing-page rejection. | Generic URL/title check before JSON-LD adoption. |
| `normalization.ts` | Canonical deduplication primarily keyed application URL. | Conservative identical-content/employer/title/location duplicate check across sources. |
| `email-action/route.ts` | Service-key request called learning RPC whose body requires `auth.uid()`. | Signed-token-scoped feedback insert; no identity impersonation or broad preference change. |

Observed sent-report ledger (not inferred): October 11: 23 found / 10 pending; October 12: 9 / 8 pending; October 13: 22 / 11 pending. All three had zero strong matches. Signed-in production UI before release also displayed Senior Data Scientist and Senior Director roles as eligible and showed a generic search-results title.

## Data flow and files

Profile/CV (`unifiedEvidence.ts`, `evidence.ts`) → explicit intent (`intent.ts`, `job_agents`, `job_search_intents`) → query planning (`searchStrategy.ts`, provider gateway/attempts) → canonicalization (`normalization.ts`) → vacancy verification (`vacancyVerification.ts`, `job_verifications`) → requirement extraction (`requirements.ts`) → track/seniority/domain-years (`careerIntelligence.ts`) → hard eligibility (`hardEligibility.ts`) → explainable ranking (`fitIntelligence.ts`, `job_fit_assessments`) → opportunities/inbox (`searchActions.ts`) → shared notification policy (`recommendationPolicy.ts`) → daily/other email (`dailyDigestReporting.ts`, `reporting.ts`, `dailyDigestEmail.ts`) → signed Save/Not Relevant (`emailActionToken.ts`, email action route, `job_saved_jobs`, `job_agent_learned_preferences`).

The cron route remains `/api/cron/job-agent-reports`; existing scheduling and discovery integrations are reused. Application submission authority, authentication, saved-job and historical application decisions are preserved.

## Architecture implemented

- Multiple independently configured career tracks, direct years (including unknown), maximum level, maximum advertised required years, required/preferred skills, industries and transition preference.
- Conservative inferred defaults use role evidence rather than total employment years. Missing track duration needs confirmation where the vacancy demands years.
- Deterministic classification uses title, mandatory years, explicit team management and enterprise architecture ownership; specialist is not inherently senior and Project Manager is not inherently a people manager.
- Mandatory and preferred years are distinct. Projects support skills but never substitute employment years. Missing evidence is uncertainty, not fabricated qualification.
- Known unrelated domains are blocked; unknown domain/seniority requires review. Explicit track confirmation supports candidates qualified for higher levels.
- Ranking dimensions and default weights are exported/configurable; score is alignment, not hiring probability. Eligibility failures cannot be offset by score.
- Email eligibility requires verified vacancy, eligible candidate, current gate version, active status, allowed decision, configured threshold/classification and explicit stretch opt-in.
- Legacy results require reassessment before primary recommendations; no bulk rewriting of saved or applied records.
- Rejection reasons are recorded; only repeated exact-title signals can make a bounded ranking adjustment. Signals are inspectable and can be disabled.

## Database

Applied additive migration `20261014162739_job_career_tracks.sql` to the AI roadmap database only:

- `job_agents.career_tracks jsonb`, default `[]`, array length constraint.
- `job_agents.include_stretch boolean`, default false.
- `job_agents.minimum_match_score integer`, default 68, range 0–100.

Existing owner-only RLS remains enabled. A transaction under an authenticated synthetic non-owner returned zero visible agents, learning signals and saved jobs. Security advisor groups were unchanged before/after migration; pre-existing warnings include executable security-definer functions and leaked-password protection. No new function, grant or policy was added.

## Historical replay

Read-only replay of 89 currently stored October 11–13 vacancy rows against current reference evidence:

| Measure | Count |
| --- | ---: |
| Previously candidate-eligible | 16 |
| New career gate: blocked | 26 |
| New career gate: needs confirmation | 59 |
| New career gate: eligible | 4 |

These are career-gate outcomes, not complete notification outcomes or hiring probabilities. Stored rows may differ from original sent-email snapshots. No live vacancy re-fetch was performed during this replay. Old-version rows cannot enter the new primary digest until reassessed. No human-labelled precision/recall or classifier accuracy is claimed.

## Validation and release ledger

- User-specified scenarios covered by `scripts/test-career-aware-job-agent.mjs` (24 deterministic tests).
- Daily orchestration tests exercise fake database/email transports, grouping, no-match behavior and signed Save/Not Relevant links. No external test email is sent.
- Existing acquisition/provider/discovery/evidence regressions executed; one stale scoring-version assertion updated, and the preferred-education test corrected to require that preferred qualifications remain optional.
- Full-suite test maintenance: native Node import resolution now supports existing `@/` and extensionless TypeScript imports. Stale source assertions were aligned with the existing assessment label, YouTube rejection copy, adaptive resource generator, configurable public-intelligence gate and already-published 23-career catalog; no learning/admin production behavior was changed.
- Targeted ESLint was restored because the existing `next lint` command is unavailable in installed Next.js 16. Type checking covers the application.
- The 98-test combined Job Agent regression run passed. Full platform regression tests are also included in the PR workflow.
- Full standard build succeeded locally. Existing prebuild scripts rewrite generated career/UI files; unrelated generated changes are excluded from the commit.
- Migration constraints and existing RLS inspected in the live database.
- Signed-in production pre-change UI inspected. Post-change preview, PR checks and production release status must be recorded after deployment; local tests are not proof of production release.

## Limits and outstanding work

This is deterministic career intelligence, not an AI semantic reviewer. Unknown or ambiguous descriptions are held for review. Domain taxonomy and English/German numeric experience extraction do not cover every language, qualification alternative or employer phrasing. Automatic timeline extraction of overlapping roles is not claimed. Confirmed years must be reviewed by the candidate. A specialist's full preferred-skill/industry semantics remain ranking context rather than universal hard exclusions.

Full live end-to-end completion, independent human-labelled accuracy evaluation, real Gmail/Outlook rendering and delivery observation remain distinct from mocked integration tests. Do not mark these complete without evidence. No provider charge was intentionally incurred by the audit itself.

Security advisor remediation reference: https://supabase.com/docs/guides/database/database-linter

Synthetic digest layout preview: `job-agent-digest-preview.html` (test data and non-production action signatures).
