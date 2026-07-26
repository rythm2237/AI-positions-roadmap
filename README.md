# Verified Three-Mode Learning Resource Update

This update introduces three verified learning modes:

1. **Read** — written documentation, tutorials, and learning paths
2. **Watch** — verified video, video series, webinar, or YouTube playlist destinations
3. **Practice** — interactive courses, guided modules, exercise tracks, labs, or CTFs

## Files to replace

- `content/references/reference-catalog.json`
- `src/types/reference.ts`
- `src/lib/references/referenceResolver.ts`
- `src/components/career/resources/ReferenceLearningChooser.tsx`
- `src/components/career/learning/LearningWorkspace.tsx`
- `src/components/career/CareerWorkspace.tsx`
- `scripts/validate-references.mjs`

## Key correction

The n8n N8N101 Academy course is now classified as **Practice**, not Video.

The verified n8n Watch destination is the official **Introduction to Automation** YouTube playlist recommended by the n8n Help Center.

## Validator protection

The validator now rejects:

- `learn.n8n.io/courses/...` as a video destination
- UiPath Academy learning plans as video destinations
- Microsoft Learn training paths/modules as video destinations
- video options without verified content-type metadata
- third-party videos without an explicit curation reason

## Run

```powershell
node scripts/validate-references.mjs
npm run typecheck
npm run build
```

Restart the development server after replacing the files.
