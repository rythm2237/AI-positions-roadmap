# Application CV content intelligence v2

## Observed root causes

At main `7054dcc`, Studio imported full sections into every application. Tailoring produced small replacements without section budgets. Design rendered every section, while `designedPack` retained the entire source career history and replaced only its summary. The PDF engine paginated all that content without a standard-CV limit. Generic AI evidence IDs established provenance but did not by themselves prove a rewritten claim.

## Shared pipeline

`contentEngine.mjs`: source sections → classified requirements → candidate facts/role blocks → transparent lexical/phrase relevance ranking → sentence-safe compression → near-duplicate filtering → section budgets → template capacity → reversible application plan. It never writes to the master profile. Unknown formatting is retained in the review ledger, not interpreted as a new qualification.

The model is a deterministic ranking aid, **not a semantic recruiter or hiring probability**. Requirement categories and synonym matching are approximate. Unclear roles are flagged for review. Broad, unusual or multilingual source formatting may require manual corrections. No RTL PDF shaping is introduced.

`fitCV` measures the same PDF renderer used for export and progressively removes low-priority details for up to six bounded plans. It does not reduce font size. If two pages cannot be safely achieved, generation fails with the source unchanged. Plan-based standard exports fail closed above two pages after template/font/manual edits. An explicit Extended policy with a recorded reason permits academic/research/executive documents.

## AI writing and safeguards

The new optional `optimise` action performs a writing pass **after deterministic planning**. Only selected experience facts and classified requirements are sent; other applications, chat, full LinkedIn and full CV are not in that prompt. One existing AI review allowance is consumed, with the existing authentication, account binding, origin checks and model fallback/refund policies. General CV mode accepts an empty vacancy.

Rewrites require one included evidence ID, no new numeric claims, a short bullet, no analytical commentary, and conservative lexical support. Unverifiable paraphrases are discarded, retaining source wording. This intentionally rejects some legitimate rewrites. Existing `changes` proposals also reject meta commentary. No automated validator can establish that a user's own source claims are true; user review remains required.

## Review, versioning and persistence

Studio's existing workspace/localStorage/backup model stores `cvGenerationVersion:2`, the complete source-section snapshot, included/excluded evidence and reasons, requirements, target vacancy, selected template/design, generation date and reviewed state. Concise drafts require explicit application; original/current versions are saved before replacement. Manual editing, hide/restore sections, restoring source items and saved-version reopening remain supported. Account design defaults continue to use the existing owner-scoped table; no database schema change.

The Job Agent uses the same measured selection pipeline. The canonical stored resume stays untouched; the application asset contains the selective document and plan. Existing document assets remain renderable with their older schema. No email is sent during tests.

## Rendering

Source section order determines text drawing order even in sidebar templates. Role headers use stronger hierarchy. Short bullets move as a unit when possible. PDFs retain selectable text and full HTTPS/mailto annotations while showing shorter contact URLs. Generated page numbers are actual integers; incomplete imported page labels/meta commentary are rejected or excluded. HTML export/print validates plan-based page policy before delivery. The HTML preview is continuous A4-width content; exact PDF pagination is measured separately and is not pixel-identical to the browser preview.

## Validation

`test:cv-content`: ten synthetic profiles × fourteen templates; broad-career source reproduces four pages; measured selected views fit one or two. Cases include junior, experienced, career changer, many projects, general/JD modes, photo, long LinkedIn-like import and forbidden comments. Tests cover relevance, source preservation, summary/skills budgets, old-role compression, provenance, near duplicates, invalid AI outputs, unsupported metrics and PDF links/page counts.

Existing Studio DOM tests additionally exercise concise-draft review, source preservation, version backup/reopen and section hide/restore. Existing document and mocked Job Agent tests cover all template/photo pagination and independent letter designs. Actual rendered pages and extracted text must be inspected before release; a successful component render alone is insufficient.

Signed-in cross-device state and live AI-provider responses require a valid account session for end-to-end verification. Mocked provider/email tests do not establish real account persistence or email delivery.

### Local verification results

- 140 actual PDF renders passed (10 profiles × 14 templates); the four-page baseline became one or two pages with source intact.
- Studio DOM flow, mocked Job Agent three-document delivery, TypeScript and direct Next production build passed.
- All 28 saved broad/photo PDFs passed PyMuPDF extraction/boundary/contact-link/photo checks; contact sheets of all 21 broad pages were visually inspected, then section spacing was reduced to avoid sparse continuation pages.
- Existing `npm run lint` fails because the inherited `next lint` command was removed in Next 16. The inherited local prebuild patch also cannot be repeated on its already-patched Career component. These are not reported as successful checks; a clean Git-based deployment build is required.
- Real provider response, signed-in cross-device reopen and real email delivery remain unverified.
