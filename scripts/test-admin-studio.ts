import assert from "node:assert/strict";
import fs from "node:fs";
import { evaluateAdminAuthorization, safeAdminReturnUrl } from "../src/lib/admin/adminAuthorization.ts";
import { normalizeCareerSlug, validateCareerInput } from "../src/lib/admin/careerValidation.ts";

const user = { id: "11111111-1111-4111-8111-111111111111", email: "admin@example.invalid" };
assert.equal(evaluateAdminAuthorization(undefined, null, []).status, "unauthenticated");
assert.equal(evaluateAdminAuthorization("session", user, ["user"]).status, "forbidden");
assert.equal(evaluateAdminAuthorization("session", user, ["admin"]).status, "admin");
assert.equal(safeAdminReturnUrl("/admin/careers"), "/admin/careers");
assert.equal(safeAdminReturnUrl("//malicious.example"), "/admin");
assert.equal(safeAdminReturnUrl("/careers/ai-engineer"), "/admin");

assert.equal(normalizeCareerSlug("  AI & Data Engineer  "), "ai-data-engineer");
const valid = validateCareerInput({ slug:"ai-platform-engineer", title:"AI Platform Engineer", shortTitle:"AI Platform", summary:"Draft summary", primaryTitle:"AI Platform Engineer", aliases:["ML Platform Engineer","ML Platform Engineer"], defaultCountryCodes:["gb","us"] });
assert.equal(valid.success, true);
assert.deepEqual(valid.value.aliases, ["ML Platform Engineer"]);
assert.equal(validateCareerInput({ ...valid.value, slug:"INVALID slug!", shortTitle:valid.value.shortTitle, primaryTitle:valid.value.primaryTitle, defaultCountryCodes:valid.value.defaultCountryCodes }).success, true); // normalized safely
assert.equal(validateCareerInput({ ...valid.value, title:"", shortTitle:valid.value.shortTitle, primaryTitle:valid.value.primaryTitle, defaultCountryCodes:valid.value.defaultCountryCodes }).success, false);
assert.equal(validateCareerInput({ ...valid.value, shortTitle:valid.value.shortTitle, primaryTitle:valid.value.primaryTitle, defaultCountryCodes:["xx"] }).success, false);

const migration=fs.readFileSync("supabase/migrations/202607170001_admin_studio_foundation.sql","utf8");
const actions=fs.readFileSync("src/app/admin/(studio)/careers/actions.ts","utf8");
const layout=fs.readFileSync("src/app/admin/(studio)/layout.tsx","utf8");
const publicCareer=fs.readFileSync("src/app/careers/ai-engineer/page.tsx","utf8");
assert.match(migration,/references auth\.users/);
assert.match(migration,/primary key \(user_id, role\)/);
assert.match(migration,/slug text not null unique/);
assert.match(migration,/status text not null default 'draft'/);
assert.match(migration,/enable row level security/g);
assert.match(migration,/revoke insert, update, delete.*authenticated/);
assert.match(migration,/admin_create_career/);
assert.match(migration,/admin_update_career/);
assert.match(migration,/admin_set_career_archived/);
for(const action of ["career.created","career.updated","career.archived","career.restored"])assert.match(migration,new RegExp(action.replace(".","\\.")));
assert.match(migration,/if not public\.is_app_admin\(\)/g);
assert.match(actions,/requireAdmin/);
assert.match(actions,/ADMIN_REQUIRED/);
assert.doesNotMatch(actions,/deleteCareer|method:\s*["']DELETE/);
assert.match(layout,/admin\/login\?returnTo=\/admin/);
assert.match(layout,/AccessDenied/);
assert.match(publicCareer,/CareerWorkspace/);

console.log("Admin authorization, Career validation, protected mutations, audit, archive/restore, and public regression checks passed.");
