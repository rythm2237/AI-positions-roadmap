# AI Role Path — Commercial Launch Checklist

## Scope
Production hardening after completion of the Zero-to-Hired product phases. The goal is to make the product observable, commercially safe, recoverable, and ready for paid users without inventing pricing, subscriptions, outcomes, or market claims.

## Completed in Phase 12
- Commercial funnel analytics event contract added to the existing analytics layer.
- Baseline diagnostic start/completion instrumentation.
- Upgrade prompt impression instrumentation after personalized value is demonstrated.
- Checkout-start instrumentation only when a real checkout URL exists.
- Pro entitlement detection instrumentation from Supabase app metadata.
- Activation-step and activation-completion instrumentation.
- Weekly progress report instrumentation.
- Prebuild validation protects the funnel event contract.

## Launch blockers — must be resolved before first paid transaction
- Final Free vs Pro pricing decision.
- Real checkout/payment provider configuration.
- Verified payment success → `app_metadata.role_path_plan = pro` entitlement path.
- Cancellation/refund/subscription lifecycle handling.
- Production billing/support contact verification.
- Production AI Gateway credentials and smoke test for project/interview reviewers.

## Production hardening — next
- Move important Zero-to-Hired evidence from browser-only localStorage to account-backed Supabase persistence with RLS.
- Keep localStorage as a resilient client cache, not the sole source of truth.
- Add server-backed short IDs for recruiter proof links instead of long encoded URL payloads.
- Validate analytics consent behavior for all new funnel events.
- Run authenticated and unauthenticated smoke tests across the complete journey.
- Test all 23 active careers on desktop/mobile and critical RTL surfaces.
- Add error monitoring for checkout, AI review, auth, and persistence failures.

## Required funnel
1. Landing / Career Universe
2. Career selected
3. Baseline diagnostic started
4. Baseline diagnostic completed
5. Personalized gap/roadmap shown
6. Upgrade prompt viewed
7. Checkout started
8. Paid entitlement detected
9. Activation completed
10. Project evidence submitted/reviewed
11. Proof profile generated
12. Job match analyzed
13. Application tracked
14. Interview scored
15. Weekly progress viewed

## Integrity rules
- Do not publish a price until it is an approved commercial decision.
- Do not mark a user Pro from client state or checkout click alone.
- Do not claim purchase success without server-verified payment state.
- Do not fabricate testimonials, hiring rates, salary uplift, placement outcomes, or market demand.
- Paid entitlement must be server-controlled and auditable.
- Analytics must not include CV text, interview answers, project evidence text, email addresses, or other sensitive user content.
