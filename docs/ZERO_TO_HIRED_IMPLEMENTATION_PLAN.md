# AI Role Path — Zero-to-Hired Implementation Plan

## Objective
Turn the current career-guidance workspace into a measurable execution system that carries a user from career discovery to job readiness, applications, interviews, offer, and hiring.

## Delivery principles
- Reuse working foundations before adding new systems.
- Do not replace production-grade assessment gating, roadmap content, CV Analyzer, or career intelligence when they can be extended.
- Every phase must create an observable user outcome, not only a new screen.
- Job-readiness claims must be evidence-based and explainable.
- Build behind feature branches and validate before merge/deploy.

## Phase 1 — Personalization, assessment and job readiness
1. Capture starting profile: experience level, current background, weekly study capacity and target outcome.
2. Reuse existing topic/comprehensive assessments as validated evidence.
3. Produce an explainable readiness model across learning, validation, projects, portfolio/career launch and application readiness.
4. Show missing evidence and the next best action.
5. Estimate remaining effort using the career's stage effort metadata and the user's weekly capacity.
6. Add an application gate: Ready / Almost ready / Keep building evidence.
7. Persist profile locally without weakening existing auth or progress behavior.

## Phase 2 — Guided hands-on projects
1. Convert project cards into guided briefs.
2. Add requirements, constraints, deliverables and acceptance criteria.
3. Add submission flow (links/files/text depending on project type).
4. Add rubric scoring.
5. Add AI-assisted reviewer with evidence-backed feedback.
6. Require minimum project evidence before application-ready status.

## Phase 3 — Portfolio and proof of skill
1. Portfolio builder from completed projects.
2. Case-study generator with problem/action/result/evidence structure.
3. GitHub/profile links and repository review hooks.
4. Recruiter-shareable proof-of-skill profile.
5. Portfolio quality gate linked to readiness.

## Phase 4 — CV, LinkedIn and application assets
1. Connect CV Analyzer scores to the selected career.
2. ATS and job-description gap analysis.
3. Project-to-CV bullet generation.
4. LinkedIn headline/about/profile checklist tied to career evidence.
5. Cover-letter/application-content generation from verified user evidence only.

## Phase 5 — Job matching and apply gate
1. Personalized job feed.
2. Job-to-user match score.
3. Missing-skill/evidence analysis per job description.
4. Apply / Don't apply yet recommendation with reasons.
5. Location, remote, salary and work-authorization filters.
6. Suggested companies based on target role and profile.

## Phase 6 — Interview preparation
1. Role-specific interview bank.
2. Behavioral simulation.
3. Technical/case simulation.
4. Scoring and structured feedback.
5. Remediation plan linked back to roadmap skills and projects.

## Phase 7 — Application management
1. Application tracker.
2. Applied / Interview / Rejected / Offer pipeline.
3. Follow-up reminders.
4. Recruiter/networking/referral tracking.
5. Funnel analytics and rejection-pattern feedback.

## Phase 8 — Offer and hiring
1. Interview pipeline view.
2. Company/job-specific preparation.
3. Offer comparison.
4. Salary-negotiation assistant.
5. Contract/offer checklist.
6. Hired outcome and post-hire transition milestone.

## Phase 9 — Purchase and activation
1. Preserve free career discovery and initial assessment.
2. Show skill gap + roadmap preview before paywall.
3. Make Free vs Paid outcome differences explicit.
4. Add post-purchase activation checklist.
5. Add contextual upgrade triggers only after value is demonstrated.

## Phase 10 — Retention
1. Weekly progress report.
2. Next-best-action engine.
3. Reminders and milestone nudges.
4. Skill-improvement trend.
5. Career-specific market updates.
6. Explainable weekly change in job-readiness score.

## Phase 11 — Acquisition and trust
1. Sharpen landing-page outcome proposition.
2. Add real social proof only after verified outcomes exist.
3. Add measurable success metrics.
4. Add honest Before → After case studies.
5. Improve premium demo/preview.

## Current execution
Phase 1 is active on `feature/zero-to-hired-phase-1`.
