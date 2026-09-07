# Job Agent source quality fix

Organic Google/SerpApi fallback results are now treated conservatively.

Known aggregator/search-listing domains are rejected before canonical job creation so an aggregator brand cannot be presented as the employer. Listing-style result titles are also rejected. Structured Google Jobs results and direct employer/ATS-like pages remain eligible for normalization.

The affected E2E Production record was retained for audit history but marked skipped with a source-metadata-conflict reason; no Production record was deleted.
