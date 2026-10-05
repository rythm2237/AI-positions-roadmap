# Application Studio

The shared Job Preparation workspace opens the application editor after learning and portfolio work. Resume/profile/job-search roadmap stations also link to this workspace. `/application-studio` is a direct browser test entry point; no Python installation is needed.

The editor preserves the original CV, keeps separate vacancy drafts, proposes reviewable changes, generates distinct letters, supports version history, and exports local PDFs and an application ZIP. The optional sample workspace uses a fully fictional CV, employer and vacancy without AI requests. It contains no user profile or real employer vacancy. Replacing it with a confirmed CV clears the sample vacancy, letters, match and application history before the real workflow continues.

## Profile and learning import

Import is explicit and always produces an editable, unconfirmed master-profile draft. The authenticated server scopes profile, resume and career state to `user.id`. Saved resumes use a two-minute signed storage URL. Account changes block importing or sending a previous account's draft.

Profile skills and certificates remain self-reported. Learning records marked complete are included as professional development, never employment or verified certification. Portfolio claims require an AI review that passed with at least 70 points plus an actual submission and artifact link. This is rubric-reviewed candidate evidence, not independent credential verification.

The career-specific entry imports cloud-synced records for that career. The direct test page imports the basic profile and saved CV only. Unsynced or uncompleted learning is not inferred. The editor asks the user to review facts before confirming or submitting text to AI.

## Service and storage

`/api/application-studio/[action]` reuses the central Supabase cookie session and the existing AI SDK Gateway. Model override: `APPLICATION_STUDIO_MODEL`, otherwise the site's `JOB_AGENT_MODEL`, otherwise `openai/gpt-5.4-mini`. No user API key is required. Production Gateway authentication uses Vercel OIDC or `AI_GATEWAY_API_KEY`. Provider availability and billing still apply; errors preserve drafts and never substitute synthetic results for real AI results.

AI and public-page retrieval share the existing durable beta `project_review` allowance with project reviews (normally 10 daily). This avoids a migration and prevents an unlimited new AI endpoint. The editor does not sync CV text or letters to a shared table. Optional device saving is account-scoped and unencrypted; an editable backup is available.

The shared frame keeps the existing tested document editor and bundled local PDF/DOCX readers out of the main roadmap bundle. It loads only when opened. Compiled document assets and third-party notices are under `public/application-studio`. Browser files never go to the AI endpoint; only the confirmed text goes on explicit AI actions. Scanned PDFs require OCR elsewhere; old binary `.doc` needs conversion to `.docx` or text. PDF export currently targets Latin scripts.

## Verification

- `node --experimental-strip-types scripts/test-application-studio.mjs`
- `npm run build` (includes existing prebuild regressions and TypeScript)
- Browser checks: open editor, synthetic analysis, truthful proposal review, versions, separate letters, actual PDF/ZIP downloads, profile draft review, guest error, account-change guard and mobile layout.
- Authenticated live AI needs a signed-in site user; local browser fixtures validate integration without representing a real provider run.

## Design references and templates

Eight preset designs share bounded `design.mjs` tokens with browser preview and the actual PDF engine. They vary in columns, centered/banner/rail mastheads, serif/sans fonts, spacing and heading rules. Two-column layouts move only recognized contact/skills/languages/education/certificate sections to the side; custom sections and all text are preserved. Letters keep a single-column layout. Long text wraps and paginates in each column; generated PDFs keep selectable text and links.

`Review & Edit` accepts a separate design reference (PDF, DOCX, PNG/JPEG/WebP, 10 MB maximum). PDF first-page positions/font sizes and locally rendered pixels, image color/column balance, or DOCX style XML produce supported design tokens. The user previews and explicitly applies/refines the result. This is an approximation of supported layout characteristics, not a pixel-perfect recreation. Images need manual typography refinement; photos, graphics and original fonts are not copied. No reference content is returned as candidate evidence or sent to AI. Thumbnail previews are memory-only and cleared on workspace/session replacement. Only style tokens and reference metadata persist in optional device saving/backups.

## Structured recruiter review

`recruiter.mjs` is shared by demo and server validation. The method follows the principle of job-related, structured evidence assessment described by [CIPD](https://www.cipd.org/en/knowledge/factsheets/selection-factsheet/) and [OPM](https://www.opm.gov/policy-data-oversight/assessment-and-selection/structured-interviews/). It is a candidate practice tool, not an employer screening service or a validated interview instrument.

Analysis sources are numbered lines from the **current submitted CV**, not master-profile/LinkedIn facts omitted from that CV. Every row must quote actual vacancy text; untraceable model criteria fail validation. Explicit mandatory language, license/qualification, seniority or authorization/attendance gates are reviewed separately. No eligibility is inferred from name, nationality or address; no protected characteristics or subjective culture-fit are scored.

Anchors: direct 4, partial 2.5, transferable 1.5, missing/unknown 0. Vacancy priorities: mandatory 4, preferred 2, optional 1. The overall weighted evidence score and per-category shares are calculated deterministically; fixed category weights were removed. Direct mandatory coverage, unknowns and gate outcomes are displayed. A strong average cannot hide a missing/unknown gate or transferable-only mandatory requirement. Weights and 60/80 shortlist-evidence bands are explicitly product heuristics; they are not CIPD/OPM or employer scoring thresholds. Probability is always unavailable: without employer outcomes and the applicant pool there is no calibrated acceptance rate. Unknown evidence requires confirmation; it is not inferred rejection.

The editor stores the assessed CV/vacancy snapshot. Later edits, accepted rewrites, undo/restore or changed vacancies flag the result as outdated and block readiness until refreshed. Older saved analyses require refresh. Demo refresh refuses edited synthetic documents rather than presenting predefined results as new AI analysis.

## Full-page editing and vacancy retrieval

The studio opens full-page by default from Job Preparation to avoid nested, height-limited scrolling. Users can exit full screen or close the editor. Confirmation and error messages are positioned at the top of the editor viewport. Public vacancy retrieval reads Schema.org `JobPosting` JSON-LD when available and fills the vacancy text and structured fields (position, employer, location, work arrangement, employment type, experience, salary and dates); the user reviews these fields before analysis. Pages without structured data still provide readable vacancy text where possible.
