# AI Role Path — Public Beta End-to-End Validation

## Release objective
Validate the real production journey before broad public promotion. Paid checkout must remain disabled during Free Public Beta, while the future Stripe billing foundation stays intact.

## Automated / unauthenticated release gates
- [x] Landing route exists and is deployable.
- [x] Career Universe route exists and 23 active careers are validated at build time.
- [x] Representative career workspace route exists.
- [x] Login route exists.
- [x] CV Analyzer route exists.
- [x] Baseline diagnostic, guided projects, portfolio, job launch, mock interview and application tracker modules are present.
- [x] Free Public Beta messaging is present.
- [x] Paid checkout has an environment kill switch and returns unavailable while beta billing is disabled.
- [x] Project Review requires an authenticated user.
- [x] Interview Review requires an authenticated user.
- [x] Project Review and Interview Review consume server-side daily quota before AI generation.
- [x] Supabase quota RPC is executable only by service_role.

## New-user production journey — manual authenticated validation
Use a clean browser profile or a dedicated test account.

1. [ ] Open landing page on desktop.
2. [ ] Open landing page on mobile viewport.
3. [ ] Sign up with email or Google.
4. [ ] Confirm first authenticated destination is intentional and does not force an unrelated setup flow.
5. [ ] Open Career Universe and select a career.
6. [ ] Complete Starting Profile.
7. [ ] Complete Baseline Skill Diagnostic.
8. [ ] Confirm adaptive start recommendation appears and no formal assessment is auto-passed.
9. [ ] Open recommended roadmap stage and learning resources.
10. [ ] Complete/formally pass an assessment where available.
11. [ ] Open Guided Projects and submit evidence.
12. [ ] Confirm AI Project Review works and unsupported claims are not promoted as evidence.
13. [ ] Confirm a failed project review does not count as completed proof.
14. [ ] Confirm a passing review updates project evidence/readiness.
15. [ ] Open Portfolio and verify only qualifying evidence appears.
16. [ ] Open recruiter proof link and verify no identity/employment certification claim is made.
17. [ ] Run Job Match/JD Gap analysis using a real test JD.
18. [ ] Confirm missing skills are not represented as experience.
19. [ ] Generate application assets and verify CV/LinkedIn/cover-letter content uses evidence only.
20. [ ] Run a Mock Interview answer through AI scoring.
21. [ ] Confirm interview scoring distinguishes AI review from fallback review.
22. [ ] Add a matched role to Application Tracker.
23. [ ] Move it through Planned → Applied → Screening/Interview and set follow-up date.
24. [ ] Confirm funnel metrics and Next Action update.
25. [ ] Confirm weekly progress/retention panel reflects actual user activity rather than invented market claims.

## Free Public Beta / cost-control validation
- [ ] No purchase CTA or card requirement is shown to a normal beta user.
- [ ] Direct POST to billing checkout is unavailable while the billing switch is off.
- [ ] Existing Pro entitlement, if present on a legacy/test account, does not break the beta journey.
- [ ] Anonymous Project Review request returns authentication-required.
- [ ] Anonymous Interview Review request returns authentication-required.
- [ ] Project Review daily limit is enforced per authenticated user.
- [ ] Interview Review daily limit is enforced per authenticated user.
- [ ] Quota exhaustion returns a clear user-facing message rather than invoking the model.
- [ ] Quota resets on the next UTC date.

## Returning-user / persistence validation
- [ ] Log out and log back in on the same browser; confirm expected progress remains.
- [ ] Sign in on a second browser/device and record which progress is missing.
- [ ] Treat any critical localStorage-only state as a migration candidate for account-backed Supabase persistence.

### Known persistence audit targets
These workflows have historically used browser localStorage and require explicit cross-device verification:
- Starting Profile / activation state
- Baseline diagnostic result
- Project submissions/reviews
- Portfolio-derived proof payload
- Saved Job Matches
- Interview submissions/reviews
- Application Tracker
- Retention snapshots

No cross-device persistence should be claimed until each critical state has been verified or moved to account-backed storage.

## Mobile / UX validation
- [ ] Landing hero fully visible without inaccessible top content.
- [ ] Career workspace usable at common phone widths.
- [ ] No horizontal overflow in roadmap, diagnostic, project, job or interview views.
- [ ] Dialogs/overlays can always be dismissed.
- [ ] Explain/Help controls do not block primary actions.
- [ ] Cookie controls do not obscure primary navigation/actions.
- [ ] Keyboard focus is visible on desktop.

## Trust / support validation
- [ ] Contact page loads.
- [ ] Support page loads.
- [ ] Privacy, Terms, Cookies and Refunds pages load.
- [ ] Public support/privacy/legal/billing addresses match the approved AI Role Path domain setup.
- [ ] AI transparency language distinguishes AI/fallback scoring and avoids hiring guarantees.

## Production release decision
Classify Public Beta as `READY FOR PROMOTION` only when:
1. Production deployment is READY.
2. Automated release gate passes.
3. Public smoke test passes.
4. Critical authenticated journey has no blocker.
5. AI quota enforcement is verified.
6. No critical production runtime errors are present.
7. Cross-device limitations are documented clearly or fixed before they are marketed as synchronized account features.
