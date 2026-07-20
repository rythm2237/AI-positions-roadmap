# Official source adapter contract

Adapters are server-only translators around pre-registered official sources. An adapter can plan bounded requests, retrieve one documented release, and normalize it into atomic observations. It cannot write snapshots, candidates, publications, approvals, mappings, or audit records.

The orchestration boundary checks a capability-specific, current production approval and an exact HTTPS origin allowlist before retrieval. Dry runs stop after planning and consume zero provider calls. Candidate generation persists releases and normalized observations through injected database operations. Publication never contacts a provider and delegates to the Admin-only atomic publication RPC.

Required adapter output includes source release identity/date, reference period, retrieval time, country, capability, mapping version, query-definition version, request estimate, source evidence, source-versus-derived provenance, confidence, and quality flags. Secrets stay server-side and errors use stable safe codes.

Adapters are registered in code; runtime input may select a registered adapter but may not import a module or supply a fetch URL. Retries must be bounded and idempotent. Candidate generation never auto-publishes.
