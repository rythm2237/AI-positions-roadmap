# Career Intelligence Architecture

## Safety and current availability

Career Intelligence never substitutes generated numbers for market evidence. The current repository has no authenticated database, secure file storage, ingestion scheduler, chart library, or market-data credentials. Consequently, labor-market, salary, skill, CV, and forecast adapters render `not-configured` or `insufficient-data` states. Official mobility links are reference metadata only; no occupation eligibility mapping is asserted.

CV file processing remains disabled until authenticated user isolation, encrypted temporary storage, file safety scanning, privacy-reviewed AI processing, retention/deletion jobs, and audit controls exist. CV content must never enter logs or analytics and must not be used for model training. The configured policy permits PDF/DOCX up to 5 MB and excludes protected characteristics from professional-quality scoring.

## Layers

`CareerIntelligenceWorkspace` → `CareerIntelligenceService` → normalized snapshots → `IntelligenceSourceAdapter` → permitted APIs, licensed feeds, official datasets, or user-provided job descriptions.

The UI never calls an external data provider. Source metadata and URLs live in `content/intelligence/source-registry.json` and are accessed through `sourceResolver.ts`. Career/title mappings live in `occupation-taxonomy.json`. Every normalized metric carries source IDs, coverage, observation period, calculation time, methodology, reliability, warnings, and sample size when supplied.

## Title normalization and deduplication

Title matching is exact after case/punctuation normalization against canonical, alternative, and seniority titles. Explicit excluded titles win; substring matching is intentionally avoided to prevent overly broad classification. Original source titles remain unchanged.

Posting deduplication prefers source/external ID. Without an external ID it fingerprints normalized company, title, location, and posting date and marks confidence as moderate. Merged records retain all source references. A future semantic-description similarity stage must preserve the original descriptions and processing version. Deleted/reposted postings require provider history and must not be inferred from the browser.

Work-model classification supports Remote, Hybrid, Onsite, and Not specified. Absence of remote/hybrid language is Not specified, never Onsite. Both total-posting and explicit-work-model denominators belong in normalized snapshots.

## Calculation rules

- Growth comparisons require equivalent date windows and materially comparable source/geographic coverage. Otherwise return insufficient data with a coverage warning.
- Demand labels require documented provider-specific thresholds and minimum samples. No thresholds are active without data.
- Salary base, bonus, equity, total compensation, and contract rate remain separate. Values retain country, seniority, currency, period, gross/net definition, observation period, and source sample. Conversion requires a conversion date and permitted exchange-rate source.
- Forecasts require dated historical snapshots, stable source coverage, processing versions, method/model identity, scenario ranges, and uncertainty. Official and internally modeled forecasts must be labeled separately.

## Mobility methodology

Each jurisdiction is independent; “Europe” is never treated as one immigration system. Occupation-code mappings store system, code, mapped title, source, confidence, and human-review status. An accessibility label may be calculated only from transparent sourced components and is never a visa-approval probability. Legal claims require official authority, jurisdiction, effective date, verification date, and next review date. Unknown or ambiguous rules stay Unknown/Needs verification.

## Adding data

1. Confirm API/feed terms and license; unauthorized scraping is prohibited.
2. Add the source to the Registry with coverage, authentication, refresh, license, reliability, and review dates.
3. Implement an adapter returning normalized models—never provider objects.
4. Store dated immutable snapshots with ingestion/source/processing versions and quality warnings.
5. Add source validation and fixture-only tests. Fixtures must be visibly limited to tests or an explicitly labeled demo environment.
6. Map Career titles conservatively and require human review for occupation codes.

Recommended refresh: jobs daily, demand weekly, salaries quarterly, currency daily when used, official occupation data on publication, and immigration monthly. Run `npm run validate:intelligence` after Registry or taxonomy changes.

## Environment and operations

Adzuna is the first approved adapter boundary; its variables are listed below and remain server-only. Future providers should use narrowly named server-only variables; secrets must never reach client bundles. Ingestion must run server-side/background, paginate provider data, deduplicate requests, avoid raw global datasets in browser responses, and preserve historical snapshots.

## Current Adzuna integration

The first live adapter uses the permitted Adzuna Jobs API search endpoint. Credentials remain server-only:

- `ADZUNA_APP_ID`
- `ADZUNA_APP_KEY`

Relevant accordion sections request the internal `/api/career-intelligence/adzuna` endpoint only after expansion. Responses are cached for one hour, attributed to “The Adzuna API,” and labeled direct-title evidence with returned sample size and retrieval time. The account/country response determines practical availability; unsupported or failed calls become concise public unavailable states. Search, histogram, history, regional, and top-company capabilities are documented by Adzuna, but only search is enabled until each endpoint is verified against account access and output semantics. The API’s default terms and rate limits must be reviewed before production commercialization or increased usage.

## Accordion and URL state

Career Intelligence renders ten ordered accordion headers initially. No detail provider request occurs until a section is expanded. The sole open section is derived from `?section=...`; opening, closing, browser Back/Forward, refresh, and deep links therefore share one state system. Expanded modules are client-side dynamic imports, requests are abortable, and reduced-motion users do not receive smooth scrolling.

## Verified snapshot import

`snapshotImport.ts` accepts JSON manifests and parses CSV record bodies. Every dataset requires source URL, license note, ISO country coverage, observation dates, import/verification dates, owner, processing version, count, warnings, raw/aggregate classification, and registered source ID. Salary and work-model records receive category-specific validation. The repository CLI is intentionally developer-only:

`npm run import:intelligence -- path/to/snapshot.json`

CSV records must be wrapped by a provenance JSON manifest before persistence. Imported data must display “Verified snapshot,” never “Live.” Snapshots are immutable inputs; corrected data receives a new dataset/version.

## Private Local CV Analysis

PDF (`pdfjs-dist`) and DOCX (`mammoth`) parsing dependencies load only when the CV accordion is used. Parsing and deterministic Journey-objective matching run in the browser. The original file and extracted text are never sent to an API, logged, persisted, or placed in analytics. Only in-memory results exist; Clear or refresh removes them. Recommendations deep-link to existing Roadmap/Learning stage IDs. This is explicitly local keyword/evidence analysis, not AI analysis and not a hiring guarantee.
