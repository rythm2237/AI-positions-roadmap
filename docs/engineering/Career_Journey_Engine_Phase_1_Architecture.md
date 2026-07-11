# Career Journey Engine — Phase 1 Architecture

## Boundaries

The Journey Engine is a presentation and navigation system. It consumes canonical career journey data and resolved station state; it does not calculate progress, persist notes, score tests, or own portfolio/readiness rules.

## Component architecture for Phase 2+

```text
CareerWorkspace (scene owner and integrations)
└── CareerJourneyEngine (error boundary, data validation, mode orchestration)
    ├── JourneyViewport (fixed viewport and transform application)
    │   └── JourneyMap (data-driven, presentational map)
    │       ├── JourneyPath
    │       ├── JourneyEnvironment
    │       └── JourneyStation
    ├── JourneyOverview / JourneyGuidedMode
    ├── JourneyControls / JourneyTitleOverlay
    ├── JourneyStationModal / JourneyMobileSheet
    └── JourneyFallback (linear accessible/static representation)
```

Hooks remain controller adapters: `useJourneyViewport`, `useJourneyNavigation`, and `useReducedJourneyMotion`. Rendering components receive values and callbacks and contain no career-specific rules.

## Viewport Controller responsibilities

- Own `hero | overview | journey` mode, focused station ID, transform, and movement state.
- Calculate clamped overview and station transforms from logical map coordinates and viewport dimensions.
- Center stations, move through canonical next/previous references, and return to overview.
- Handle resize/mobile coordinates, safe areas, and reduced motion while preserving navigation.
- Reject unknown station IDs and invalid transforms. It must not own unlock/progress business rules or station detail state.

## Integration contracts

- **Progress:** `careerWorkspaceProgress` remains the current state owner. A future adapter resolves `JourneyStationState`; the Engine only renders it.
- **Notes:** open the shared notes flow with `noteContext`; closing it preserves controller state and transform.
- **Quizzes:** the existing assessment flow receives `JourneyTest`, scores/retries externally, and reports results to progress. Tests gate via progress rules, not renderer logic.
- **Resources:** station resources are displayed by shared resource UI; completion writes through progress.
- **Portfolio:** missions/projects link to the existing project and portfolio sections with station context.
- **Career Readiness:** readiness is calculated by the shared progress service and supplied as display data.
- **Landing routing:** career nodes route by canonical `slug` to `/careers/[slug]`; Career Hero remains the initial scene.

## Existing reusable systems and migration notes

- `CareerWorkspace` already owns scenes, navigation, modal workflows, and responsive shell behavior.
- `careerWorkspaceProgress` owns local fallback persistence, aggregate progress, stage progress, and gating.
- Existing note and assessment workflows are currently embedded in `CareerWorkspace` and should be extracted into shared modules before reuse across careers.
- Existing resources, projects, readiness data, and roadmap content in `src/data/careers/ai-engineer.ts` remain the content source.
- `ai-engineer-journey.ts` is a non-visual adapter to the canonical contract. The current UI intentionally continues using `journeyStages` in Phase 1.

## Hardcoded logic to remove during migration

- `CareerWorkspace` imports `aiEngineerCareer` directly and module-level helpers close over it.
- Unlocking assumes array order and the immediately previous station test.
- The renderer derives one curved route from station array order instead of consuming connections.
- Stage anchor offsets, visual marker choices, world size defaults, scales, timing, and labels are embedded in UI/controller code.
- Notes, exam sessions, resource aggregation, and validation are component-local.
- Old journey stages use `x/y`, string lessons, and UI-specific landmark/terrain fields instead of the canonical contract.

## Phase 2 sequence

1. Add static fixed `JourneyViewport` and fallback boundary around validated canonical data.
2. Render theme background, explicit connections, environment, and station symbols as presentational components.
3. Resolve station states through a progress adapter and add keyboard/linear accessible order.
4. Add overview transform only; retain current Hero-first scene and current details workflows.
5. Verify desktop and specified mobile viewport sizes before any journey motion work.

## Known conflicts and missing information

- The repository has no `docs/ai/AI_Core_Rules.md`; the mandatory reference cannot currently be applied.
- The Engineering Bible describes future domain/service folders that this repository has not yet adopted. Phase 1 uses existing `src/types`, `src/lib`, and `src/data` locations.
- The canonical backend IDs/schema, shared Notes service, shared Quiz service, and database progress service do not yet exist. Current local storage remains the documented fallback.
- Existing phase quizzes contain fewer than five questions, but the migration adapter uses the journey station tests, which meet the Phase 1 minimum.
