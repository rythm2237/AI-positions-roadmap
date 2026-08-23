# Zero-to-Hired Phase 4 — Job Launch

This phase connects verified readiness and project evidence to real vacancies.

## Product flow

1. User pastes a real job title and full job description.
2. AI Role Path identifies career-specific skill terms explicitly present in the vacancy.
3. Those requirements are compared with skills backed by qualified project evidence.
4. The selected career's evidence-based Job Readiness score is applied as a hard launch signal.
5. The result is classified as Apply, Conditional, or Build Gap First.
6. Analyses are stored locally so the user can compare opportunities without inventing or scraping vacancies.

## Integrity rules

- No employer requirement is inferred if it is not present in the pasted vacancy.
- No vacancy, salary, hiring probability, or employer outcome is invented.
- A high JD match cannot override missing core evidence required by the career readiness gate.
- Match scoring is decision support and never a guarantee of shortlist, interview, offer, or hiring.
