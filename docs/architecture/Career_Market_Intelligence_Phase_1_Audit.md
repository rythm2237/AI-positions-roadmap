# Career Market Intelligence — Phase 1 audit and implementation map

Status: completed locally on `feature/admin-intelligence-studio` on 2026-07-20. No Production or `main` change.

## Current ownership and coupling

- `/careers/ai-engineer/intelligence` renders the roadmap-owned `CareerWorkspace` and supplies `CareerWorkspaceData` to every intelligence section.
- `CareerIntelligenceWorkspace` mixes reusable snapshot comparison with roadmap-only learning links and local CV alignment.
- The public Snapshot API and repository identify data by `career_slug`; database uniqueness and publication superseding use `(career_slug,country_code,snapshot_type)`.
- The refresh engine resolves a Career title registry and imports the Adzuna adapter directly. Countries are an Adzuna capability registry, not an official-statistics support registry.
- Main navigation has no intelligence product entry. The old route has AI Engineer-specific metadata and is currently canonical by implication.

## Data and publication invariants

- Public reads explicitly filter `status=published` and never call Adzuna.
- Candidate creation stores `draft`, validates, then moves to `validating`; it does not replace public data.
- Admin publication locks and revalidates a Candidate, supersedes the current published row, publishes atomically, and records review audit metadata.
- Rejection preserves both the Candidate and current published row.
- All historical Adzuna snapshots, rejected Candidates, superseded versions, refresh metrics, and review audit rows must remain immutable evidence.

## Risks discovered

- `career_slug` conflates statistical occupation identity with an optional learning product.
- Existing official-source registry entries describe provenance but do not constitute capability-specific commercial/licence approval.
- `active` in that registry must not authorize Production retrieval. All future official sources remain blocked until the Source Approval Gate is implemented and reviewed.
- Adzuna cron paths remain active configuration paths. Retirement must follow a working official vertical slice, not precede it.
- Existing UI wording and payloads are Adzuna/job-listing shaped and cannot be relabelled as official occupation benchmarks.

## Phase implementation map

### Phase 2 — occupation foundation

- `supabase/migrations/202607200001_occupation_intelligence_foundation.sql`: occupation families, country mappings, roadmap links, explicit legacy snapshot links, audit records, RLS and Admin RPCs.
- `src/lib/intelligence/occupationDomain.ts`: domain types and validation independent of roadmaps/providers.
- `src/lib/admin/occupationRepository.ts`: authenticated Admin reads and RPC mutations.
- `src/app/admin/(studio)/occupations/**` and `src/components/admin/OccupationControls.tsx`: occupation and mapping management.
- `src/components/admin/AdminNavigation.tsx`: enable Occupations without enabling later modules.

### Phase 3 — standalone product shell

- `src/app/career-intelligence/page.tsx`: product landing and searchable family selector.
- `src/app/career-intelligence/occupations/[occupationFamilySlug]/page.tsx`: canonical occupation route.
- `src/components/career-intelligence/**`: reusable published-only statistical UI, independent of `CareerWorkspaceData`.
- `src/app/careers/ai-engineer/intelligence/page.tsx`: permanent compatibility redirect preserving safe country parameters.
- `src/components/landing/Header.tsx` and landing sections: desktop/mobile navigation and CTA.

### Phase 4 onward

- Add capability-specific source approvals, endpoint allowlists, licence/cost review and audit before any official network access.
- Add normalized source observations and separate derived aggregates.
- Introduce source-independent release-aware adapters and refresh modes.
- Implement and approve the US official-source vertical slice before other countries or Adzuna retirement.

## Operational impact

Phase 2 is additive and performs no provider request. Legacy snapshots are linked explicitly rather than rewritten. Unknown source rights remain blocked. Cost is database metadata only; source-scale cost remains unknown until dataset-specific Phase 4 reviews.
