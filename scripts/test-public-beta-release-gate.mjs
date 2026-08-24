import fs from "node:fs";

const requiredFiles = [
  "src/app/page.tsx",
  "src/app/(account)/dashboard/page.tsx",
  "src/components/career/CareerReadinessPanel.tsx",
  "src/components/career/CareerCloudSyncBridge.tsx",
  "src/components/career/diagnostic/BaselineDiagnosticWorkspace.tsx",
  "src/components/career/projects/GuidedProjectsWorkspace.tsx",
  "src/components/career/portfolio/PortfolioProofWorkspace.tsx",
  "src/components/career/jobs/JobLaunchWorkspace.tsx",
  "src/components/career/interview/MockInterviewWorkspace.tsx",
  "src/components/career/jobs/ApplicationTrackerWorkspace.tsx",
  "src/components/career/PurchaseActivationPanel.tsx",
  "src/app/api/project-review/route.ts",
  "src/app/api/interview-review/route.ts",
  "src/app/api/billing/checkout/route.ts",
  "src/lib/betaAiQuota.ts",
  "src/lib/productAccess.ts",
  "scripts/test-public-beta-authenticated-state.mjs",
  "docs/PUBLIC_BETA_AUTHENTICATED_GATE.md",
  "supabase/migrations/20260824100346_beta_ai_usage_limits.sql",
  "supabase/migrations/202608240001_career_user_state_sync.sql",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Public Beta release gate missing required file: ${file}`);
}

const read = (file) => fs.readFileSync(file, "utf8");
const purchase = read("src/components/career/PurchaseActivationPanel.tsx");
const checkout = read("src/app/api/billing/checkout/route.ts");
const projectReview = read("src/app/api/project-review/route.ts");
const interviewReview = read("src/app/api/interview-review/route.ts");
const quota = read("src/lib/betaAiQuota.ts");
const quotaMigration = read("supabase/migrations/20260824100346_beta_ai_usage_limits.sql");
const cloudMigration = read("supabase/migrations/202608240001_career_user_state_sync.sql");
const authGate = read("scripts/test-public-beta-authenticated-state.mjs");

const contracts = [
  [purchase, "Free Public Beta"],
  [purchase, "No card is required"],
  [purchase, "NEXT_PUBLIC_ROLE_PATH_BILLING_ENABLED"],
  [checkout, "NEXT_PUBLIC_ROLE_PATH_BILLING_ENABLED"],
  [checkout, "AI Role Path is currently in Free Public Beta"],
  [checkout, "Paid checkout is not active"],
  [projectReview, "supabase.auth.getUser()"],
  [projectReview, 'consumeBetaAiQuota(authData.user.id, "project_review")'],
  [interviewReview, "supabase.auth.getUser()"],
  [interviewReview, 'consumeBetaAiQuota(authData.user.id, "interview_review")'],
  [quota, "BETA_PROJECT_REVIEW_DAILY_LIMIT"],
  [quota, "BETA_INTERVIEW_REVIEW_DAILY_LIMIT"],
  [quota, "consume_beta_ai_quota"],
  [quotaMigration, "revoke all on function public.consume_beta_ai_quota(uuid, text, integer) from public, anon, authenticated"],
  [quotaMigration, "grant execute on function public.consume_beta_ai_quota(uuid, text, integer) to service_role"],
  [cloudMigration, 'create table if not exists public.career_user_state'],
  [cloudMigration, 'career_user_state_select_own'],
  [cloudMigration, 'revoke all on table public.career_user_state from anon'],
  [authGate, 'E2E_TEST_EMAIL'],
  [authGate, 'signInWithPassword'],
  [authGate, 'RLS failure: signed-in test account could write state for another user id.'],
  [authGate, 'Test-state cleanup failed'],
];

for (const [source, token] of contracts) {
  if (!source.includes(token)) throw new Error(`Public Beta release contract missing: ${token}`);
}

for (const route of [
  "src/app/careers/page.tsx",
  "src/app/careers/[slug]/page.tsx",
  "src/app/proof/[careerSlug]/page.tsx",
  "src/app/login/page.tsx",
]) {
  if (!fs.existsSync(route)) throw new Error(`Public Beta user journey route missing: ${route}`);
}

console.log("Public Beta release gate passed: acquisition, auth entry, career journey, cloud state contract, authenticated test harness, diagnostic, project evidence, portfolio, job launch, interview, application tracking, billing kill switch, and authenticated AI quotas are present.");
