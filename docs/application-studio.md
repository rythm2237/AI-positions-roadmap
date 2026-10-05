# Application Studio

The shared Job Preparation workspace opens the application editor after learning and portfolio work. Resume/profile/job-search roadmap stations also link to this workspace. `/application-studio` is a direct browser test entry point; no Python installation is needed.

The editor preserves the original CV, keeps separate vacancy drafts, proposes reviewable changes, generates distinct letters, supports version history, and exports local PDFs and an application ZIP. The synthetic NEURA demonstration works without AI requests. It is not a verified vacancy or a real candidate history.

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
