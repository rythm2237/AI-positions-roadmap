# Job Agent organic-source hardening

E2E follow-up after the aggregator mismatch regression.

Organic Google results are discovery evidence only unless the employer identity is directly verified. Job boards and search/listing surfaces must never be persisted as the employer merely because Google reports the board as the result source.

Expected behavior:
- structured Google Jobs records may use structured `company_name`
- Adzuna records may use provider company metadata
- organic Google fallback must persist `Employer not verified` unless a later verification layer proves the employer
- known job boards / aggregators are excluded from organic canonical vacancy creation
- listing-style pages are excluded
- unverified organic fallback must never be treated as auto-application-ready
