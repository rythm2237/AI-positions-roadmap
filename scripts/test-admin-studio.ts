import assert from "node:assert/strict";
import fs from "node:fs";
import { evaluateAdminAuthorization, safeAdminReturnUrl } from "../src/lib/admin/adminAuthorization.ts";
import { evaluateContentQualityGate } from "../src/lib/admin/contentQualityGate.ts";
import { normalizeCareerSlug, validateCareerInput } from "../src/lib/admin/careerValidation.ts";
import { validateCareerWorkspaceData } from "../src/lib/careerContentValidation.ts";
import type { ManagedCareer } from "../src/types/adminStudio.ts";

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
const contentMigration=fs.readFileSync("supabase/migrations/202608010001_career_content_publishing.sql","utf8");
const dynamicCareer=fs.readFileSync("src/app/careers/[slug]/page.tsx","utf8");
const contentEditor=fs.readFileSync("src/components/admin/CareerContentEditor.tsx","utf8");
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
assert.match(actions,/evaluateContentQualityGate/);
assert.doesNotMatch(actions,/deleteCareer|method:\s*["']DELETE/);
assert.match(layout,/admin\/login\?returnTo=\/admin/);
assert.match(layout,/AccessDenied/);
assert.match(publicCareer,/CareerWorkspace/);
const workspaceFixture={slug:"ai-test",title:"AI Test",titleAliases:[{title:"Artificial Intelligence Test Specialist"}],category:"AI",shortDescription:"Test career",difficulty:"Beginner",estimatedLearningTime:"1 month",lastUpdated:"2026-08-01",visual:{nodeLabel:"Test",sceneTitle:"Test",sceneDescription:"Test",imageAlt:"Test"},overview:{title:"Overview",body:"Body",responsibilities:[],industries:[]},journeyMap:{theme:"treasure-map",overviewTitle:"Journey",overviewDescription:"Description"},journeyStages:[{id:"start",title:"Start",resources:[{}],topicAssessments:[{questions:Array.from({length:5},()=>({})),questionsPerAttempt:5,passingScore:60}],phaseExam:{questions:Array.from({length:20},()=>({})),questionsPerAttempt:20,passingScore:70}}],roadmap:[{}],projects:[],globalResources:[],mapSections:[],progressRules:{readinessThreshold:80},finalChallenge:{title:"Challenge"},jobBoard:{title:"Jobs"},interviewPrep:{title:"Interview"}};
assert.equal(validateCareerWorkspaceData(workspaceFixture,"ai-test").valid,true);
assert.equal(validateCareerWorkspaceData({...workspaceFixture,slug:"wrong"},"ai-test").valid,false);
assert.equal(validateCareerWorkspaceData({...workspaceFixture,journeyStages:[]},"ai-test").valid,false);

const longCopy="This deliberately long career-specific explanation describes automation discovery, process qualification, exception handling, governance controls, implementation tradeoffs, operational monitoring, and measurable business outcomes for a professional learning path.";
const otherCareer={id:"22222222-2222-4222-8222-222222222222",title:"Other Career",workspace_data:{overview:{body:longCopy}}} as ManagedCareer;
assert.equal(evaluateContentQualityGate({workspaceData:{overview:{body:longCopy}},currentCareerId:"11111111-1111-4111-8111-111111111111",careers:[otherCareer]}).passed,false);
assert.equal(evaluateContentQualityGate({workspaceData:{globalResources:[{url:"https://www.youtube.com/watch?v=test"}]},currentCareerId:"11111111-1111-4111-8111-111111111111",careers:[]}).findings[0]?.code,"direct_youtube");
assert.equal(evaluateContentQualityGate({workspaceData:{globalResources:[{url:"https://learn.microsoft.com/training/"}]},currentCareerId:"11111111-1111-4111-8111-111111111111",careers:[]}).passed,true);

assert.match(contentMigration,/workspace_data jsonb/);
assert.match(contentMigration,/careers_public_read_published/);
assert.match(contentMigration,/admin_save_career_content/);
assert.match(contentMigration,/admin_set_career_publication/);
assert.match(dynamicCareer,/getPublishedCareer/);
assert.match(dynamicCareer,/CareerWorkspace career=\{career\}/);
assert.match(contentEditor,/Validate & save/);

console.log("Admin authorization, content quality gate, full content validation, preview/publishing, protected mutations, audit, and public rendering checks passed.");
