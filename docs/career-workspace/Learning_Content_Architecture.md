# Learning Content Architecture

## Ownership

- `CareerWorkspaceData.journeyStages` owns the live Career Journey rendered by both Roadmap and Learning. Stable stage IDs are also the progress, note, assessment, and resume IDs. Learning never owns a second phase or step list.
- `content/references/reference-catalog.json` owns resource metadata, lifecycle state, segments, and URLs. UI code uses `referenceResolver.ts`, never the raw catalog.
- `src/content/assessments/assessmentBank.ts` owns the original question templates and assessment metadata. Career data selects assessments; UI only presents and scores them.
- `careerWorkspaceProgress.ts` owns the shared Roadmap/Learning progress model. The current repository has no authentication/database client, so its SSR-safe local persistence remains the explicit development fallback. Replace that adapter with an authenticated repository service when the platform database is introduced; keep the progress shape and stable IDs.

## Roadmap-to-Learning mapping

The Journey Engine and Learning Workspace receive the same ordered `journeyStages` array. A rename, reorder, addition, or removal therefore appears in both presentations automatically. Completion of `stage.test.id` verifies that stage everywhere and gates the next stage. Notes use the stage ID as context. Resume Learning stores `lastActiveStageId` and falls back to the first unlocked incomplete stage.

## References and exact segments

Add a resource once to the catalog with a permanent ID. Map that ID to a Journey step. Segments may use an anchor, video timestamp, or direct lesson URL. Questions store `referenceId` and optional `segmentId`; remediation resolves the final URL at runtime. Missing, deprecated, broken, and needs-review records produce deliberate UI states.

To update a URL, retain the ID. To replace the educational identity, add a new record and set `replacedBy` on the old record. Never silently repurpose an ID.

Run `npm run validate:references` after catalog or career-content changes. The validator checks required fields, IDs, URLs, dates, intervals, segments, replacements, cycles, career references, and overdue reviews. A monthly automated link-health report is recommended; human quality/relevance review is required quarterly and immediately for broken/replaced resources. Link checks must report state and must not automatically choose replacement content.

## Assessments

Section Checks contain five scored questions and default to an 80% pass score. Attempts, answers, best score, timestamps, and verification live in the shared progress record. Incorrect answers expose optional exact-resource review and an original in-app explanation. Phase assessment actions unlock after their required Journey step is verified. The final visible label is “Career OS Role Validation” and explicitly makes no official-certification claim.

To add Learning support for another Career, provide stable Journey stage IDs, objectives (`lessons` in the current schema), Registry resource IDs, a 3–5 question Section Check aligned to the required level, and optional phase assessments. Missing metadata renders an intentional preparation/review state; it must never borrow AI Engineer content.

## Migration and rollback

This change extends the existing persisted object additively with `lastActiveStageId`, `resourceViewedAt`, and `assessmentAttempts`. The loader merges defaults, so existing browser data remains valid. Rollback can ignore the new fields without deleting user data. Before adopting authenticated persistence, migrate the single `career_workspace_progress__{slug}` record per user/career transactionally and retain stable IDs.
