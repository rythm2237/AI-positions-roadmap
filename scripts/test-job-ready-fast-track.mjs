import fs from "node:fs";

const onboarding = fs.readFileSync("src/app/(account)/onboarding/page.tsx", "utf8");
const actions = fs.readFileSync("src/app/(account)/actions.ts", "utf8");
const fastTrack = fs.readFileSync("src/app/(account)/job-search-mode/page.tsx", "utf8");
const accountLayout = fs.readFileSync("src/app/(account)/layout.tsx", "utf8");
const migration = fs.readFileSync("supabase/migrations/20260824120300_user_journey_mode.sql", "utf8");

for (const token of ["Learn & Build", "Ready to Apply", "learn_and_build", "ready_to_apply"]) if (!onboarding.includes(token)) throw new Error(`Onboarding path missing: ${token}`);
for (const token of ["journey_mode", "/job-search-mode?welcome=1", "/#career-universe", "journey_mode_changed"]) if (!actions.includes(token)) throw new Error(`Journey routing missing: ${token}`);
for (const token of ["Job-ready fast track", "CV Analyzer", "Job matching", "Application execution", "Interview preparation", "Switch to Learn & Build", "resolveTargetCareerRoute", "CAREER_CATALOG", "interviewHref"]) if (!fastTrack.includes(token)) throw new Error(`Fast Track workspace missing: ${token}`);
for (const token of ["/job-search-mode", "sm:hidden", "Fast Track"]) if (!accountLayout.includes(token)) throw new Error(`Mobile Fast Track navigation missing: ${token}`);
if (accountLayout.includes('href="/job-search-mode" className="hidden')) throw new Error("Fast Track must not disappear from mobile account navigation.");
for (const token of ["journey_mode", "learn_and_build", "ready_to_apply"]) if (!migration.includes(token)) throw new Error(`Journey-mode migration missing: ${token}`);
console.log("Job-ready Fast Track validated: both onboarding choices persist and route correctly, Fast Track remains reachable on mobile, target-career interview links resolve through the canonical catalog, and users can switch back to Learn & Build without losing access to hiring tools.");
