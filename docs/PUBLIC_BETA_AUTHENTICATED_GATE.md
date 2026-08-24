# Public Beta Authenticated Gate

This gate validates the authenticated data boundary without modifying a real customer's account.

## Required test identity

Use a dedicated Supabase Auth test account. Do not use an admin account or a real customer account.

Environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `E2E_TEST_EMAIL`
- `E2E_TEST_PASSWORD`
- optional `E2E_TEST_CAREER_SLUG` (defaults to `ai-automation-specialist`)

Run:

```bash
node scripts/test-public-beta-authenticated-state.mjs
```

## What it proves

The script signs in through the normal public Supabase client and checks:

1. test-account authentication works;
2. the account can upsert its own `career_user_state` row;
3. it can read back the exact marker it wrote;
4. RLS does not expose state for another user id;
5. RLS rejects a write for another user id;
6. the test row is deleted and cleanup is verified;
7. the session is signed out.

The script is intentionally non-destructive outside the dedicated test row and performs cleanup before exiting.

## What it does not prove

This is a data-layer gate, not a full browser interaction test. Before broad promotion, manually validate one complete authenticated UI journey on Production:

`Sign in → Baseline Diagnostic → Roadmap/Learning → Project submission/review → Portfolio proof → Job Match → Mock Interview → Application Tracker → sign out/in → second device`.

Cross-device state should appear after authentication; browser localStorage remains an offline/cache fallback.
