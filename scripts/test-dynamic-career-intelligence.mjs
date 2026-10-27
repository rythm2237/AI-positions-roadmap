import assert from "node:assert/strict";
import fs from "node:fs";
import { canonicalizeCareerCandidates, exactCareerMatches, normalizeCareerTitle, relatedCareerCandidates } from "../src/lib/ai/careerDiscovery.ts";
import { resolveExistingResources } from "../src/lib/ai/careerResourceResolution.ts";
import { isDirectLearningDestination } from "../src/lib/references/referenceDestinationPolicy.ts";
import { aiAutomationSpecialistCareer } from "../src/data/careers/ai-automation-specialist.ts";
import { aiProductManagerCareer } from "../src/data/careers/ai-product-manager.ts";
import { validateCareerWorkspaceData } from "../src/lib/careerContentValidation.ts";

const migration = fs.readFileSync("supabase/migrations/202610260001_dynamic_career_generation.sql", "utf8");
const registryMigration = fs.readFileSync("supabase/migrations/202608140001_learning_resource_registry.sql", "utf8");
const route = fs.readFileSync("src/app/api/career-discovery/route.ts", "utf8");
const statusRoute = fs.readFileSync("src/app/api/career-discovery/requests/[requestId]/route.ts", "utf8");
const worker = fs.readFileSync("src/lib/ai/careerGenerationWorker.ts", "utf8");
const privatePage = fs.readFileSync("src/app/career-discovery/[requestId]/page.tsx", "utf8");
const searchComponent = fs.readFileSync("src/components/search/CareerDiscoverySearch.tsx", "utf8");
const publishedPage = fs.readFileSync("src/app/careers/[slug]/page.tsx", "utf8");
const userProgressMigration = fs.readFileSync("supabase/migrations/202608240001_career_user_state_sync.sql", "utf8");

assert.match(registryMigration, /unique\s*\(\s*canonical_url\s*,\s*mode\s*\)/i, "canonical URL/mode identity prevents duplicate resources");
assert.match(registryMigration, /career_learning_resources[\s\S]*resource_id uuid not null references public\.learning_resources/i, "career mappings point to the existing shared registry");
assert.match(migration, /pg_advisory_xact_lock/i, "equivalent queued titles are serialized");
assert.match(migration, /for update skip locked/i, "concurrent workers claim different queue rows safely");
assert.match(migration, /attempts between 0 and 3/i, "generation retries have a bounded maximum");
assert.match(migration, /approved\)\s*values?[\s\S]*false|approved\s*=\s*false/i, "AI generation never approves resources for publication");
assert.match(migration, /career_generation_usage[\s\S]*generations/i, "the monthly generation allowance is persisted transactionally");
assert.match(migration, /revoke all on public\.career_generation_jobs, public\.career_generation_requests, public\.career_generation_usage from public, anon, authenticated/i, "private generation tables are not directly user-readable");
assert.match(migration, /canonicalCareerReused/i, "a concurrent exact alias result can reuse one canonical career");
assert.doesNotMatch(migration, /cv_payload|resume_payload|assessment_payload|profile_payload/i, "shared generation records have no private career-profile payload columns");
assert.match(route, /resolveRolePathPlan\(user\)/, "generation entitlement is enforced server-side");
assert.match(route, /DYNAMIC_CAREER_ENGINE_ENABLED|dynamicCareerEngineEnabled/, "the feature is behind a server-side flag");
assert.match(statusRoute, /getOwnedGenerationRequest\(requestId, user\.id\)/, "status reads are scoped to the requesting user");
assert.match(privatePage, /CareerWorkspace career=\{workspace\}/, "private generated previews use the shared career UI");
assert.match(privatePage, /navigationBasePath=\{`\/career-discovery\//, "preview navigation stays inside the private request path");
assert.match(searchComponent, /sm:flex-row/, "career search adapts between narrow and wide viewports");
assert.match(searchComponent, /response\.status === 401[\s\S]*setAuthRequired\(true\)/, "unauthenticated new-career requests show a dedicated sign-in state");
assert.match(searchComponent, /signup\?next=/, "new-career sign-in state provides a direct account creation path");
assert.match(publishedPage, /<CareerWorkspace career=\{career\}/, "existing published careers continue using the same workspace component");
assert.match(userProgressMigration, /career_user_state/, "existing user progress remains a separate persisted context");
assert.match(worker, /inputTokens[\s\S]*outputTokens[\s\S]*estimatedCostUsd/, "token use and optional configured cost estimates are recorded");

assert.equal(normalizeCareerTitle("  Power-Platform AUTOMATION Specialist "), "power platform automation specialist");

const candidates = canonicalizeCareerCandidates([
  { slug: "data-analyst", title: "Data Analyst", aliases: ["Business Data Analyst"], href: "/careers/data-analyst", source: "published" },
  { slug: "ai-product-manager", title: "AI Product Manager", aliases: [], href: "/careers/ai-product-manager", source: "built-in" },
]);
assert.equal(exactCareerMatches("Business Data Analyst", candidates)[0]?.slug, "data-analyst", "explicit aliases resolve to their canonical career");
assert.equal(exactCareerMatches("AI Product Analyst", candidates).length, 0, "related roles do not become exact aliases");
assert.equal(relatedCareerCandidates("AI Product Analyst", candidates)[0]?.candidate.slug, "ai-product-manager", "nearby occupations request confirmation instead of merging");

function workspace(slug, title) {
  return {
    slug,
    title,
    globalResources: [],
    journeyStages: [{ id: `${slug}-stage-1`, order: 1, title: "Python foundation", resources: [] }],
    resourceRequirements: [{
      id: `${slug}-python-reading`,
      careerSlug: slug,
      milestoneId: `${slug}-stage-1`,
      topic: "Python programming foundations",
      requiredModes: ["reading"],
      requiredLearningOutcomes: ["Explain Python syntax and write basic functions"],
      skillLevel: "Beginner",
      allowedContentTypes: ["documentation"],
      officialPreferred: true,
      freePreferred: true,
      estimatedDuration: { minMinutes: 30, maxMinutes: 90 },
      resourceIds: [],
    }],
    generationMetadata: { model: "test", generatedAt: "2026-10-26T00:00:00.000Z", blueprintStatus: "generated", resourceStatus: "pending" },
  };
}

const sharedResource = {
  id: "python-tutorial-v1",
  canonical_url: "https://docs.python.org/3/tutorial/",
  mode: "reading",
  title: "The Python Tutorial",
  provider: "Python Software Foundation",
  content_type: "documentation",
  cost: "Free",
  is_official: true,
  direct_destination_verified: true,
  status: "active",
  verified_at: "2026-10-01T00:00:00.000Z",
  next_review_at: "2026-12-01T00:00:00.000Z",
  source_metadata: { whyUseful: "Learn Python syntax and functions", language: "en", certificateAvailability: "No certificate offered" },
};
const first = resolveExistingResources(workspace("python-career-one", "Career One"), [sharedResource], Date.parse("2026-10-26T00:00:00.000Z"));
const second = resolveExistingResources(workspace("python-career-two", "Career Two"), [sharedResource], Date.parse("2026-10-26T00:00:00.000Z"));
assert.deepEqual(first.assignments.map((item) => item.resourceId), ["python-tutorial-v1"]);
assert.deepEqual(second.assignments.map((item) => item.resourceId), ["python-tutorial-v1"], "separate careers resolve to the same canonical resource ID");
assert.equal(first.workspace.globalResources.length, 1, "a catalog identity appears once per career workspace");

const updatedSharedResource = { ...sharedResource, title: "Updated Python Tutorial", canonical_url: "https://docs.python.org/3/tutorial/index.html" };
const firstUpdated = resolveExistingResources(workspace("python-career-one", "Career One"), [updatedSharedResource], Date.parse("2026-10-26T00:00:00.000Z"));
const secondUpdated = resolveExistingResources(workspace("python-career-two", "Career Two"), [updatedSharedResource], Date.parse("2026-10-26T00:00:00.000Z"));
for (const resolved of [firstUpdated, secondUpdated]) {
  assert.equal(resolved.workspace.globalResources[0]?.title, "Updated Python Tutorial");
  assert.equal(resolved.workspace.globalResources[0]?.url, "https://docs.python.org/3/tutorial/index.html", "the shared registry's current fields flow to every career resolution");
}

const stale = { ...sharedResource, status: "needs_review", verified_at: null };
const staleResolution = resolveExistingResources(workspace("python-career-three", "Career Three"), [stale], Date.parse("2026-10-26T00:00:00.000Z"));
assert.equal(staleResolution.assignments.length, 0, "unverified resources are not reused");
assert.equal(isDirectLearningDestination({ mode: "reading", contentType: "documentation", url: "javascript:alert(1)" }), false, "invalid URLs fail the destination validator");

assert.equal(validateCareerWorkspaceData(aiAutomationSpecialistCareer, aiAutomationSpecialistCareer.slug).valid, true, "an existing representative career remains valid");
assert.equal(validateCareerWorkspaceData(aiProductManagerCareer, aiProductManagerCareer.slug).valid, true, "a second existing career remains valid");

console.log("Dynamic career intelligence checks passed: title normalization, aliases, distinct-role confirmation, shared resource IDs, update resolution, stale-resource exclusion, URL validation, and existing career contracts.");
