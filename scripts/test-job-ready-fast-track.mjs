import fs from "node:fs";

const onboarding = fs.readFileSync("src/app/(account)/onboarding/page.tsx", "utf8");
const actions = fs.readFileSync("src/app/(account)/actions.ts", "utf8");
const fastTrack = fs.readFileSync("src/app/(account)/job-search-mode/page.tsx", "utf8");
const accountLayout = fs.readFileSync("src/app/(account)/layout.tsx", "utf8");
const guidedTour = fs.readFileSync("src/components/onboarding/FirstVisitGuidedTour.tsx", "utf8");
const migration = fs.readFileSync("supabase/migrations/20260824120300_user_journey_mode.sql", "utf8");

for (const token of ["Learn & Build", "Ready to Apply", "learn_and_build", "ready_to_apply"]) if (!onboarding.includes(token)) throw new Error(`Onboarding path missing: ${token}`);
for (const token of ["journey_mode", "/job-search-mode?welcome=1", "/#career-universe", "journey_mode_changed"]) if (!actions.includes(token)) throw new Error(`Journey routing missing: ${token}`);
for (const token of ["Job-ready fast track", "CV Analyzer", "Job matching", "Application execution", "Interview preparation", "Switch to Learn & Build", "resolveTargetCareerRoute", "CAREER_CATALOG", "interviewHref"]) if (!fastTrack.includes(token)) throw new Error(`Fast Track workspace missing: ${token}`);
for (const token of ["fast-track-header", "fast-track-readiness", "fast-track-cv", "fast-track-job-matching", "fast-track-application", "fast-track-interview", "fast-track-learning"]) if (!fastTrack.includes(`data-tour=\"${token}\"`) && !fastTrack.includes(`tourId=\"${token}\"`)) throw new Error(`Fast Track tour target missing: ${token}`);
for (const token of ["/job-search-mode", "sm:hidden", "Fast Track"]) if (!accountLayout.includes(token)) throw new Error(`Mobile Fast Track navigation missing: ${token}`);
if (accountLayout.includes('href="/job-search-mode" className="hidden')) throw new Error("Fast Track must not disappear from mobile account navigation.");
for (const token of ["journey_mode", "learn_and_build", "ready_to_apply"]) if (!migration.includes(token)) throw new Error(`Journey-mode migration missing: ${token}`);

for (const token of ["LANDING_TOUR", "READY_TO_APPLY_TOUR", 'id: "landing-v3"', 'id: "ready-to-apply-v1"', 'pathname === "/job-search-mode"', "getPageTour(pathname)", "activePathRef"]) if (!guidedTour.includes(token)) throw new Error(`Page-scoped guided tour contract missing: ${token}`);
for (const token of ["fast-track-header", "fast-track-readiness", "fast-track-cv", "fast-track-job-matching", "fast-track-application", "fast-track-interview", "fast-track-learning"]) if (!guidedTour.includes(`[data-tour=\\\"${token}\\\"]`) && !guidedTour.includes(`[data-tour=\"${token}\"]`) && !guidedTour.includes(`data-tour=\\\"${token}\\\"`)) throw new Error(`Ready-to-Apply guided tour step missing: ${token}`);
if (guidedTour.includes("useRouter")) throw new Error("Guided tour must not own router navigation; tours are page-scoped.");
if (guidedTour.includes("router.push")) throw new Error("Guided tour must never navigate users between pages.");
if (guidedTour.includes("route:")) throw new Error("Tour steps must not contain cross-page route instructions.");
if (!guidedTour.includes("pathname !== activePathRef.current")) throw new Error("An active tour must close when the user independently changes page.");
if (!guidedTour.includes("ai-rolepath-page-tour:")) throw new Error("Each page tour must persist completion independently.");

console.log("Job-ready Fast Track validated: onboarding routing remains intact, Ready to Apply has its own page-scoped tour, tour targets exist, and guided tours cannot redirect users between pages.");
