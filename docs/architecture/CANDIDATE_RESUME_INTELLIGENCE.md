# Candidate-centric Application Studio

Candidate knowledge is the source of professional claims. A generated CV is a selected presentation of that knowledge, not the knowledge itself. Existing parsing, preview editing, design, translation, letter and PDF engines remain in use.

## Data and ownership

`knowledge.mjs` creates stable content-derived source, entity and claim IDs. CV and LinkedIn imports preserve original statements. Employment and projects use the existing record grouping engine. Ambiguous fields stay unspecified; the candidate can confirm structured company, title, dates, responsibilities, tools, outcomes, project status and other professional facts. Imported claims are candidate-reported; explicit answers are candidate-confirmed, never independently verified. Retracted claims are excluded from model sources. Protected characteristics are never inferred.

Completed platform learning is read through the shared authenticated learning service and synchronized into knowledge without an extra AI operation. It remains self-reported learning, never employment or verified certification. The candidate's consent to save professional facts covers this reuse; the strategy decides job relevance.

Private persistence reuses `career_user_state` with its existing user-owned RLS policies:

| Namespace | State key | Purpose |
|---|---|---|
| `candidate-knowledge` | `starting_profile` | Comprehensive claims and provenance |
| `cv-document-{application-id}` | `applications` | Explicitly saved CV, translations, letters and version history |
| `application-studio` | `applications` | Existing design defaults, unchanged |

No migration is required. Reads filter authenticated user IDs and use private/no-store responses. Writes validate `getUser`, reject anonymous sessions, require same origin, consent and the current account ID. Revision and `updated_at` comparisons prevent concurrent writes from overwriting one another. Canonical knowledge is held outside the workspace's optional device cache. No CV or claim contents are logged. Save application is an explicit user action; it is not background autosave.

## Intelligence and review

Existing `analysis` now uses the entire saved knowledge base when available. Requirements still need exact vacancy references. `strategy` selects entity treatment, page-one emphasis, a professional narrative, explicit employer objectives versus interpretations and up to five high-impact clarification questions. Agent feedback can propose new facts only as exact excerpts for candidate confirmation.

`generate` requires an approved strategy at the current knowledge revision. Every statement must cite valid candidate claims and keep employment associations. Server guards reject unsupported numeric values, named specialist tools and prototype-to-production promotions. A separate model pass checks factual entailment against cited evidence and rejects unsupported, ambiguous or incomplete reviews before returning a draft. Both inference passes share the bounded request timeout and one review operation; no additional quota reservation is made. Original employment anchors and chronology are retained. Education, credentials and contact details are recovered when necessary. Repeated sections are merged; statements and proposals have stable IDs. All rewritten content still requires candidate review: provenance checks and model reviews cannot conclusively establish the semantic truth of arbitrary generated prose.

The UI reviews complete section operations against their current text. Accepted and manual sections are protected during subsequent generation. Rejected sections stay blocked until the candidate explicitly requests an alternative. The original CV is not silently replaced, and changing design does not generate content. Full generation permits extra pages instead of deleting the end of the document.

Fit and evidence strength use knowledge, not rewritten prose. Mandatory/preferred/nice-to-have weights are 4/2/1; direct/partial/transferable match factors are 1/.625/.375. Evidence strength factors are verified 1, candidate-confirmed .75, candidate-reported .5. No evidence earns zero. CV evidence visibility, ATS structure heuristic and eligibility remain separate. These assessments are internal, not employer scores or hiring probabilities.

Translations are independently editable language versions of the same application. Fact changes mark saved translations for review rather than changing their text. Existing translation validation, script-specific fonts, RTL/LTR layout and PDF embedding remain authoritative.

## Verification and limits

`test-candidate-intelligence.mjs` tests canonical imports, employment/project separation, confirmation, role strategy selection, full CV operations, rejected/repeated generation, credentials, unsupported claims and separate scores. `test-candidate-intelligence-flow.cjs` exercises the actual UI with simulated AI and persistence: strategy approval, review, manual editing, design independence, agent confirmation and account isolation. Existing Application Studio flow, reconstruction, translation, PDF import, language/font and section-preservation tests cover regressions.

Live signed-in persistence, model-generated strategies, all requested translation directions, and letter generation/export must additionally be validated against the deployed preview. Simulated responses prove state handling and guards, not translation quality or live provider behavior. Do not merge on code presence alone.
