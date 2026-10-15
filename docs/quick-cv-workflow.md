# Quick CV inside Application Studio

## Entry

`/application-studio` offers Quick CV and Advanced Builder. Deep links retain existing `mode=general` and `mode=targeted`; `mode=quick` opens the new flow, `mode=advanced` opens the existing editor.

## User journey

1. Upload PDF/DOCX or paste the original CV; enter a public vacancy URL or paste its full text. Cover letter is optional. Explicit text-processing consent is required.
2. Reuse the existing source-only structure operation. Show a compact original-CV evidence score, criterion scores, up to three strengths and three gaps.
3. Ask 0–5 short questions. Prefer multiple-choice options with self-contained factual values; always allow custom text and skipping. Saved answers remain editable and are not asked again during generation.
4. Generate and independently review the CV using existing claim/record validators. Rebuild an approximate original layout and photo locally; export a selectable-text, max-two-page PDF. The optional cover letter is separately evidence-reviewed and downloaded. A failed letter never discards a successful CV.
5. Explicit Advanced handoff transfers source, generated content, answers, language, style and photo into a new application. It is account-bound, single-use and expires after 15 minutes. Existing applications remain. Reusable account knowledge requires the existing advanced consent, with a separate confirmation for Quick answers before saving them.

## Shared implementation

- `quickFlow.mjs`: question cap, temporary knowledge, deterministic retained-evidence strategy, original-only report and source section alignment.
- `quickService.ts`: shared `generateStudioObject`, analysis validation, `generateGroundedCV`, `generateGroundedLetter`, auth/session/quota and Gateway error handling through the existing API route.
- `sourceAppearance.js`: local source palette/columns/font hints and candidate-image recovery. Multiple images require user selection. Missing portrait recovery offers photo upload; it is never advertised as exact PDF editing.
- `designFor.sourceColumns`: optional detected sidebar/main placement; absent for existing designs, preserving their behavior.

No new provider credentials, authentication system or database schema. Source files and portrait bytes are not sent to the AI endpoint. The model receives extracted text and up to five explicit self-reported answers. Full candidate knowledge from other applications is not used to boost the initial score.

## Boundaries

The uploaded file is rebuilt using supported layouts; original spacing, fonts and page furniture are approximate. Scanned PDFs need pasted text/OCR. Photo recovery handles separate PDF images and embedded DOCX images; full-page scanned photographs are not guessed. If all retained records cannot fit within two readable pages, export is blocked with Advanced continuation instead of truncating source content. A single compact content retry is allowed without extra questions.

Browser generation tests use simulated AI responses and do not prove live model quality. Production AI verification requires a signed-in end-to-end request through the configured Gateway.

## Evidence failure recovery

A bounded automatic rewrite receives the exact rejected draft and the complete statement review, so opaque statement IDs can be resolved to actual wording. Every corrected statement still passes record, metric and independent semantic checks. User-facing failures distinguish language, review coverage, references, output structure and unsupported wording. Server diagnostics contain only the category, operation and request ID, never CV text or review explanations.

Advanced handoff is available before generation and after a failed evidence check. It preserves original sections, answers, vacancy, layout and portrait in the existing account-bound transfer. Source-only transfers open Candidate and are explicitly not marked as a reviewed generated CV.

## Partial CV recovery

Quick mode restores contact and qualification sections from original source records instead of validating discarded AI rewrites of them. It omits whole generated items with invalid evidence ownership, invented numbers/tools or excessive summary/skill lists; it never trims a false statement into an assertion. All retained AI wording still undergoes independent semantic review. After the bounded rewrite fails, a complete, unique review with a valid target language can identify unsupported statements for removal. The recovered draft is rebuilt with original records and reviewed again, including the actual full export language. Missing/duplicate reviews, invalid language and provider failures remain blocking. Recovery is disclosed in the result; this can produce a conservative source-preserving draft if none of the new wording is supportable.
