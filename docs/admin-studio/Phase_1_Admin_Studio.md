# Career OS Admin Studio — Phase 1 operations

Admin Studio now supports database-managed Career profiles, versioned workspace content, validation, protected preview, and explicit public publishing. Built-in Career data remains a safe fallback until a validated database version is published.

## Apply the migration

Review and apply `supabase/migrations/202607170001_admin_studio_foundation.sql` in the Supabase SQL Editor before opening Admin Studio. The migration creates `app_user_roles`, `careers`, `admin_audit_log`, admin-read RLS policies, and atomic Career mutation functions. It grants authenticated users no direct insert, update, or delete permission on these tables. Role changes remain an intentional SQL-only administrative operation.

## Bootstrap the first Admin

1. Create the person as a normal Supabase Auth user using the Supabase Dashboard. Do not add a public Admin registration route.
2. In the SQL Editor, replace the placeholder and run:

```sql
insert into public.app_user_roles (user_id, role, created_by)
select id, 'admin', id
from auth.users
where email = '<ADMIN_EMAIL>'
on conflict (user_id, role) do nothing;
```

3. Confirm without exposing session data:

```sql
select u.id, u.email, r.role, r.created_at
from public.app_user_roles r
join auth.users u on u.id = r.user_id
where u.email = '<ADMIN_EMAIL>' and r.role = 'admin';
```

4. Sign in at `/admin/login`. The server authenticates against Supabase Auth, stores the short-lived access token in an HttpOnly, SameSite cookie, verifies the user on every protected request, and then checks the database role. Client code never receives the Supabase privileged key and cannot mutate roles.

To revoke access intentionally:

```sql
delete from public.app_user_roles
where user_id = (select id from auth.users where email = '<ADMIN_EMAIL>')
  and role = 'admin';
```

Existing sessions stop authorizing on their next role check. Disable or delete the Auth user separately only if account access itself must also be revoked.

## Mutation and audit behavior

Create, update, archive, and restore actions call authenticated database functions. Each function checks `auth.uid()` against `app_user_roles`, performs the Career mutation, and inserts a safe field-name-only audit entry in the same transaction. If audit insertion fails, the Career mutation rolls back. There is no permanent-delete action.

Duplicate slugs, invalid ISO countries, malformed taxonomy, unauthorized requests, missing records, and repeated archive/restore operations return safe UI errors without database details. Slugs are immutable after creation during Phase 1.

## Content and publishing

Open a Career and choose **Content Studio**. The JSON document follows the shared `CareerWorkspaceData` contract used by Roadmap, Learning, Projects, Portfolio, Jobs, and Interview sections. Saving always creates a new content version and automatically returns an already-published Career to draft. Publishing is blocked until server validation passes. Preview remains Admin-only. Public rendering reads only `published` rows through RLS and falls back to built-in content for the two original Careers.

Apply `supabase/migrations/202608010001_career_content_publishing.sql` after the foundation migration and configure `SUPABASE_ANON_KEY` in Vercel.

## Current limitations

- Admin sessions use a one-hour access-token cookie and require sign-in again after expiry; refresh-token rotation is a future authentication enhancement.
- Roles are granted and revoked only through intentional Supabase administrative SQL.
- The content editor uses the canonical JSON contract; a future visual block editor can sit above the same schema without changing public rendering.
- Future Admin modules are visible as disabled “Coming next” navigation items only.
