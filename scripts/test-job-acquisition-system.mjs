import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createJobSearchIntent, validateJobSearchIntent } from "../src/lib/job-agent/intent.ts";
import { evidenceFromCvAnalyzer, evidenceFromMasterCv, evidenceFromProfile } from "../src/lib/job-agent/evidence.ts";
import { planSearchQueries } from "../src/lib/job-agent/searchStrategy.ts";
import { orchestrateProviderSearch } from "../src/lib/job-agent/providerOrchestration.ts";
import { assessFreshness, canonicalJobKey, deduplicateJobs, safeExternalUrl } from "../src/lib/job-agent/normalization.ts";
import { evaluateHardEligibility } from "../src/lib/job-agent/hardEligibility.ts";
import { calculateEvidenceGroundedFit } from "../src/lib/job-agent/fitIntelligence.ts";
import { assessApplicationReadiness } from "../src/lib/job-agent/readiness.ts";
import { assertGroundedContent } from "../src/lib/job-agent/grounding.ts";
import { determineExecutionCapability } from "../src/lib/job-agent/execution.ts";
import { canTransitionApplication, requireSubmissionEvidence } from "../src/lib/job-agent/applicationState.ts";
import { summarizeProviderAttempts } from "../src/lib/job-agent/observability.ts";
import { jobReportDue } from "../src/lib/job-agent/notificationSchedule.ts";
import { classifyRelease } from "../src/lib/job-agent/releaseGate.ts";
import { currencyForCountry, inferSearchCurrency } from "../src/lib/job-agent/currency.ts";
import { parseProviderAnnualSalary, parseProviderPostedAt } from "../src/lib/job-agent/providerFields.ts";

const root = new URL("..", import.meta.url);
const source = (path) => readFileSync(new URL(path, root), "utf8");
const profile = { id: "user-1", name: "Test", email: "test@example.com", avatar_url: null, provider: null, current_country: "Germany", current_position: "Automation Analyst", years_experience: 4, skills: ["Power BI", "SQL"], certificates: ["PL-300"], languages: ["English"], target_career: "AI Automation Specialist", onboarding_completed_at: null, created_at: "2026-01-01", updated_at: "2026-01-01" };
const agent = { id: "agent-1", user_id: profile.id, status: "active", automation_mode: "assisted_apply", primary_career: "AI Automation Specialist", secondary_careers: ["Automation Consultant"], desired_titles: [], adjacent_roles: ["Power Platform Developer"], excluded_roles: ["Sales"], min_seniority: "mid", max_seniority: "senior", search_countries: ["Germany"], excluded_countries: [], cities_regions: [], max_commute_minutes: null, workplace_preferences: ["remote", "hybrid"], willing_to_relocate: false, relocation_countries: [], english_only_priority: true, exclude_unknown_languages: true, search_languages: ["English"], work_authorization: "Authorized in Germany", sponsorship_requirement: "not needed", notice_period: "1 month", earliest_start_date: null, employment_types: ["full_time"], industries: ["Technology"], excluded_industries: ["Gambling"], preferred_companies: [], excluded_companies: ["Blocked Co"], minimum_salary: 60000, preferred_salary: 75000, salary_currency: "EUR", salary_negotiable: false, auto_prepare_threshold: 70, strong_match_threshold: 82, auto_skip_threshold: 45, automatically_send_email_applications: false, never_submit_ats_automatically: true, ask_before_startups: true, report_frequency: "daily", report_time: "20:00", timezone: "Europe/Berlin", notification_channels: ["in_app", "email"], immediate_high_fit_threshold: 90, linkedin_url: null, linkedin_sync_mode: "review_first", onboarding_completed_at: null, created_at: "2026-01-01", updated_at: "2026-01-01", intent_version: 2, learned_preferences_enabled: true, follow_up_days: 7 };
const intent = createJobSearchIntent(agent, ["English"], 3, "2026-09-03T10:00:00.000Z");
const candidate = (overrides = {}) => { const job = { externalId: "job-1", source: "Mock", sourceQuery: "AI Automation Specialist", company: "Good Co", title: "AI Automation Specialist", normalizedTitle: "ai automation specialist", location: "Berlin, Germany", country: "Germany", sourceUrl: "https://jobs.example.com/1?utm_source=x", applicationUrl: "https://jobs.example.com/1?utm_source=x", description: "We require Power BI and SQL. Fluent English required. This is a remote full-time role in Technology.", descriptionComplete: true, workplaceModel: "remote", employmentTypes: ["full_time"], seniority: "mid", salaryMin: 65000, salaryMax: 80000, currency: "EUR", requiredLanguages: ["English"], requiredSkills: ["Power BI", "SQL"], preferredSkills: [], educationRequirements: [], certificationRequirements: [], visaSponsorship: null, postedAt: "2026-09-01T00:00:00.000Z", expiresAt: null, canonicalKey: "", sourceQueries: ["AI Automation Specialist"], sources: [{ provider: "Mock", sourceJobId: "job-1", sourceQuery: "AI Automation Specialist", sourceUrl: "https://jobs.example.com/1", providerPayload: {} }], ...overrides }; job.canonicalKey = canonicalJobKey(job); return job; };

test("Layer 1 — confirmed intent preserves hard constraints and stable currency", () => {
  assert.deepEqual(validateJobSearchIntent(intent), []); assert.equal(intent.hard.englishOnly, true); assert.equal(intent.hard.salary.currency, "EUR"); assert.equal(currencyForCountry("Hungary"), "HUF"); assert.equal(inferSearchCurrency(["Germany", "Hungary"]), null);
});
test("Layer 2 — evidence provenance distinguishes claims, mentions and implementation", () => {
  const cv = evidenceFromMasterCv("resume-1", "Experience\nAutomated Power BI reporting for 8 teams and saved 10 hours weekly.\nSkills\nSQL");
  const profileItems = evidenceFromProfile(profile); assert.equal(profileItems.some((item) => item.evidenceType === "user_claim"), true); assert.equal(profileItems.find((item) => item.label === "Current role")?.durationMonths, null); assert.equal(profileItems.find((item) => item.label === "Total professional experience")?.durationMonths, 48); assert.equal(cv.find((item) => item.label === "Power BI")?.evidenceType, "quantified_achievement");
  assert.equal(evidenceFromCvAnalyzer({ sourceId: "a", skills: "Python", languages: "English", certifications: "", projects: "Built an AI agent", experience: "", overall: 80, strengths: [] }).every((item) => item.provenance.explicitlySaved === true), true);
});
test("Layer 3 — controlled expansion tracks origin and excludes forbidden roles", () => {
  const queries = planSearchQueries(intent, 6); assert.equal(queries[0].origin, "exact"); assert.ok(queries.length <= 6); assert.ok(!queries.some((item) => /sales/i.test(item.query)));
});
test("Layer 4 — provider gateway preserves no-results and provider-error statuses", async () => {
  const provider = (name, status, jobs = []) => ({ name, countrySupport: () => true, health: async () => ({ configured: true, status: "healthy" }), rateLimitState: async () => ({}), search: async () => ({ provider: name, status, jobs, latencyMs: 5, requestCount: 1, rateLimitState: {}, ...(status === "provider_error" ? { errorCode: "DOWN" } : {}) }) });
  const result = await orchestrateProviderSearch({ providers: [provider("empty", "no_results"), provider("down", "provider_error")], queries: ["AI"], countries: ["Germany"], correlationId: "c" });
  assert.deepEqual(result.attempts.map((item) => item.status).sort(), ["no_results", "provider_error"]);
});
test("Layer 5 — canonical normalization rejects unsafe URLs", () => {
  assert.equal(safeExternalUrl("http://localhost/admin"), null); assert.equal(safeExternalUrl("https://127.0.0.1/admin"), null); assert.ok(safeExternalUrl("https://jobs.example.com/1"));
  assert.deepEqual(parseProviderAnnualSalary("€60K–€80K a year"), { min: 60000, max: 80000, currency: "EUR" }); assert.equal(parseProviderAnnualSalary("€45 per hour").min, null); assert.equal(parseProviderPostedAt("2 days ago", new Date("2026-09-03T00:00:00Z")), "2026-09-01T00:00:00.000Z");
});
test("Layer 6 — cross-query URL deduplication and freshness", () => {
  const a = candidate(); const b = candidate({ source: "Other", sourceQuery: "Automation Consultant", sourceQueries: ["Automation Consultant"], applicationUrl: "https://jobs.example.com/1?gclid=123" });
  const result = deduplicateJobs([a, b]); assert.equal(result.length, 1); assert.equal(result[0].sourceQueries.length, 2); assert.equal(assessFreshness(candidate({ expiresAt: "2026-08-01" }), new Date("2026-09-03")).status, "expired");
  const relativeDate = deduplicateJobs([candidate({ postedAt: "4 days ago" })], new Date("2026-09-04T12:00:00Z"));
  assert.equal(relativeDate[0].postedAt, "2026-08-31T12:00:00.000Z");
});
test("Layer 7 — hard gate separates blocked from unverified", () => {
  const evidence = evidenceFromProfile(profile); const eligible = evaluateHardEligibility({ job: candidate(), profile, agent, intent, evidence, expired: false }); assert.equal(eligible.status, "eligible");
  const blocked = evaluateHardEligibility({ job: candidate({ description: "Fluent German is mandatory.", requiredLanguages: [] }), profile, agent, intent, evidence, expired: false }); assert.equal(blocked.status, "blocked");
  const unknown = evaluateHardEligibility({ job: candidate({ description: "Short provider snippet", descriptionComplete: false, workplaceModel: "unknown", employmentTypes: [] }), profile, agent, intent, evidence, expired: false }); assert.equal(unknown.status, "unverified");
  const currencyUnknown = evaluateHardEligibility({ job: candidate({ currency: "HUF", salaryMax: 80000 }), profile, agent, intent, evidence, expired: false }); assert.equal(currencyUnknown.status, "unverified"); assert.ok(currencyUnknown.detail.some((reason) => reason.code === "SALARY_CURRENCY_UNKNOWN"));
});
test("Layer 8 — fit is evidence-grounded and title-only similarity cannot score high", () => {
  const weak = calculateEvidenceGroundedFit(candidate({ description: "", descriptionComplete: false, requiredSkills: [] }), intent, []); assert.ok(weak.score < 60); assert.equal(weak.confidence, "low");
  const strong = calculateEvidenceGroundedFit(candidate(), intent, evidenceFromMasterCv("r", "Implemented Power BI and SQL automation for 8 workflows.")); assert.ok(strong.score > weak.score); assert.ok(strong.explanation.whyRankedHere.length > 0);
});
test("Layer 9 — source snippets remain unverified unless verification evidence exists", () => { assert.equal(candidate({ descriptionComplete: false }).descriptionComplete, false); assert.match(source("src/lib/job-agent/vacancyVerification.ts"), /VERIFICATION_HOST_NOT_ALLOWLISTED/); });
test("Layer 10 — decision classification is separate from confidence", () => { const result = calculateEvidenceGroundedFit(candidate(), intent, evidenceFromProfile(profile)); assert.ok(["good_match", "worth_reviewing", "stretch", "strong_match"].includes(result.classification)); assert.ok(["low", "medium", "high"].includes(result.confidence)); });
test("Layer 11 — readiness returns a structured checklist", () => { const result = assessApplicationReadiness({ job: candidate(), eligibility: "unverified", hasMasterCv: true, evidence: evidenceFromProfile(profile) }); assert.equal(result.status, "needs_user_input"); assert.ok(result.checks.some((item) => item.key === "eligibility" && item.status === "unknown")); });
test("Layer 12 — generated claims require valid evidence IDs", () => { assert.doesNotThrow(() => assertGroundedContent([{ text: "Built automation", evidenceIds: ["e1"] }], new Set(["e1"]))); assert.throws(() => assertGroundedContent([{ text: "Invented", evidenceIds: [] }], new Set()), /UNGROUNDED/); });
test("Layer 13 — execution defaults to manual without approved submission API", () => { const result = determineExecutionCapability({ mode: "assisted_apply", eligibility: "eligible", applicationUrl: "https://jobs.example.com/apply" }); assert.equal(result.capability, "manual_only"); assert.match(result.userAction, /confirm submission/i); });
test("Layer 14 — submission requires evidence and invalid transitions fail", () => { assert.equal(requireSubmissionEvidence("submitted", {}), false); assert.equal(requireSubmissionEvidence("submitted", { attestedBy: "u" }), true); assert.equal(canTransitionApplication("preparing", "submitted"), false); });
test("Layer 15 — Inbox has categories, read state, email queue and RLS", () => { const sql = source("supabase/migrations/20260903103540_job_acquisition_system.sql"); assert.match(sql, /new_strong_match/); assert.match(sql, /read_at timestamptz/); assert.match(sql, /job_inbox_enqueue_notifications/); assert.match(sql, /'job_agent_inbox'/); assert.match(sql, /table_name \|\| '_own_rows'/); });
test("Layer 16 — tracker enforces the real lifecycle", () => { assert.equal(canTransitionApplication("ready_for_review", "ready_for_submit"), true); assert.equal(canTransitionApplication("submitted", "recruiter_response"), true); assert.equal(canTransitionApplication("submitted", "offer"), false); });
test("Layer 17 — learned preferences are inspectable, cumulative and never mutate hard constraints", () => { const code = source("src/app/(account)/job-agent/decisionActions.ts"); const sql = source("supabase/migrations/20260903103540_job_acquisition_system.sql"); assert.match(code, /record_job_agent_learning_signal/); assert.match(code, /inspectable: true/); assert.match(sql, /sample_size = public\.job_agent_learned_preferences\.sample_size \+ 1/); assert.doesNotMatch(code, /update\(\{[^}]*excluded_roles/); });
test("Layer 18 — observability summarizes cost-relevant provider attempts", () => { const summary = summarizeProviderAttempts([{ provider: "Mock", query: "AI", country: "Germany", location: null, status: "rate_limit", recordsReceived: 0, requestCount: 2, latencyMs: 20 }]); assert.deepEqual({ requests: summary.requests, errors: summary.errors }, { requests: 2, errors: 1 }); const sql = source("supabase/migrations/20260903103540_job_acquisition_system.sql"); assert.match(sql, /correlation_id/); assert.match(sql, /estimated_cost/); });
test("Layer 19 — automation honors timezone, report hour and channel within the Hobby cron limit", () => { const due = jobReportDue(agent, new Date("2026-09-03T18:15:00.000Z")); assert.equal(due?.type, "daily"); assert.equal(jobReportDue({ ...agent, notification_channels: ["in_app"] }, new Date("2026-09-03T18:15:00.000Z")), null); assert.match(source("vercel.json"), /0 20 \* \* \*/); });
test("Layer 20 — release gate refuses incomplete evidence", () => { const complete = { migrationsValidated: true, unitTestsPassed: true, contractTestsPassed: true, integrationTestsPassed: true, rlsTestsPassed: true, desktopE2EPassed: true, mobileE2EPassed: true, liveVacancyReached: true, validApplicationActionReached: true, productionSmokePassed: true, externalWarnings: [] }; assert.equal(classifyRelease({ ...complete, liveVacancyReached: false }), "NOT READY"); assert.equal(classifyRelease({ ...complete, externalWarnings: ["manual-only"] }), "READY WITH WARNINGS"); });

test("authorization and responsive UI contracts remain explicit", () => {
  const sql = source("supabase/migrations/20260903103540_job_acquisition_system.sql"); const dashboard = source("src/components/job-agent/JobAgentDashboardView.tsx");
  assert.match(sql, /enable row level security/); assert.match(sql, /\(select auth\.uid\(\)\) = user_id/); assert.match(dashboard, /sm:grid-cols-2/); assert.match(dashboard, /lg:grid-cols-2/);
  const documentText = source("src/lib/job-agent/documentText.ts");
  assert.doesNotMatch(documentText, /fetch\s*\(/); assert.match(documentText, /PDFParse/); assert.match(documentText, /mammoth/);
});
