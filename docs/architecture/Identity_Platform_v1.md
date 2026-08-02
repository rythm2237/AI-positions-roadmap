# Identity Platform v1

User identity uses Supabase Auth with Google and GitHub OAuth through the PKCE callback at `/auth/callback`. Browser and server clients share the publishable configuration `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Account authorization always validates the user with Supabase on the server; browser session state is not an authorization boundary.

The account routes `/dashboard`, `/profile`, and `/onboarding` are protected and refreshed by `src/proxy.ts`. Admin Studio retains its existing independent cookie and `app_user_roles` authorization flow. Identity RLS policies use the existing `public.is_app_admin()` function so administrators retain operational access without introducing a second role model.

Apply `supabase/migrations/202608020002_identity_platform_v1.sql` before enabling the account routes in production. The migration provisions normalized profile, preference, resume, saved-career, subscription, notification, and activity tables. Its auth trigger creates a profile, preference row, and Free subscription in the same transaction as a new auth user.

Resume objects are private, limited to PDF, DOC, and DOCX files up to 10 MB, and stored beneath the authenticated user ID. Avatar objects are public images with owner-only writes and a 5 MB limit. Database rows and storage objects use independent ownership policies plus the existing admin authorization function.

Production verification requires completing both OAuth flows, restarting a browser to verify session persistence, testing first-login onboarding, and exercising cross-user database and storage access with two non-admin accounts. Verify admin reads separately with an existing `app_user_roles.role = 'admin'` account.
