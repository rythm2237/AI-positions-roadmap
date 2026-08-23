import fs from "node:fs";
import "./patch-guided-project-reviewer.mjs";
import "./patch-portfolio-proof.mjs";
import "./patch-job-launch-workspace.mjs";
import "./patch-application-assets-workspace.mjs";
import "./patch-mock-interview-workspace.mjs";
import "./patch-application-tracker.mjs";
import "./patch-adaptive-diagnostic.mjs";
import "./patch-purchase-activation.mjs";
import "./patch-retention-progress.mjs";

const catalog = fs.readFileSync("src/data/careerCatalog.ts", "utf8");
const active = [
  "ai-engineer", "ai-product-manager", "ai-automation-specialist", "intelligent-automation-engineer", "microsoft-copilot-consultant", "ai-integration-specialist", "ai-workflow-architect", "ai-solutions-consultant", "ai-transformation-consultant", "business-ai-consultant", "enterprise-ai-consultant", "ai-adoption-consultant", "data-analyst", "bi-developer", "data-engineer", "data-scientist", "ai-knowledge-engineer", "cloud-engineer", "devops-engineer", "cybersecurity-analyst", "generative-engine-optimization-specialist", "ai-marketing-specialist", "ai-content-strategist",
];
for (const slug of active) if (!catalog.includes(`"${slug}"`) || !catalog.includes(`"/careers/${slug}`)) throw new Error(`${slug} should be available in Career Universe.`);
const availableCount = (catalog.match(/"available",\s*"\/careers\//g) ?? []).length;
if (availableCount !== active.length) throw new Error(`Expected ${active.length} available Careers, found ${availableCount}.`);

const files = [
  "src/components/career/CareerWorkspace.tsx",
  "src/components/career/CareerReadinessPanel.tsx",
  "src/components/career/PurchaseActivationPanel.tsx",
  "src/components/career/RetentionProgressPanel.tsx",
  "src/lib/productAccess.ts",
  "src/lib/retentionProgress.ts",
  "src/components/career/projects/GuidedProjectsWorkspace.tsx",
  "src/app/api/project-review/route.ts",
  "src/lib/projectEvidence.ts",
  "src/components/career/portfolio/PortfolioProofWorkspace.tsx",
  "src/lib/portfolioProof.ts",
  "src/app/proof/[careerSlug]/page.tsx",
  "src/components/career/jobs/JobLaunchWorkspace.tsx",
  "src/lib/jobMatch.ts",
  "src/components/career/jobs/ApplicationAssetsWorkspace.tsx",
  "src/lib/applicationAssets.ts",
  "src/components/career/interview/MockInterviewWorkspace.tsx",
  "src/app/api/interview-review/route.ts",
  "src/lib/interviewEvidence.ts",
  "src/components/career/jobs/ApplicationTrackerWorkspace.tsx",
  "src/lib/applicationTracker.ts",
  "src/components/career/diagnostic/BaselineDiagnosticWorkspace.tsx",
  "src/lib/adaptiveDiagnostic.ts",
];
const sources = files.map((file) => fs.readFileSync(file, "utf8"));
for (const token of [
  "GuidedProjectsWorkspace career={career}", "Submit for AI review", "PROJECT_PASSING_SCORE = 70", "PortfolioProofWorkspace career={career}", "Copy recruiter proof link", "JobLaunchWorkspace career={career}", "Analyze job fit", "Build gap first", "ApplicationAssetsWorkspace career={career}", "Tailor evidence for", "ATS keywords", "Unsupported gaps — do not claim", "buildApplicationAssetPack", "MockInterviewWorkspace career={career}", "Role-specific mock interview", "Submit for scoring", "INTERVIEW_PASSING_SCORE = 70", "INTERVIEW_STRONG_SCORE = 85", 'model: process.env.INTERVIEW_REVIEW_MODEL || "openai/gpt-4.1"', "ApplicationTrackerWorkspace career={career}", "Manage the job-search pipeline", "Follow-up queue", "Interview rate", "nextTrackerAction", "career_applications__", "BaselineDiagnosticWorkspace career={career}", "Baseline skill diagnostic", "Build adaptive roadmap", "scoreBaselineDiagnostic", "career_baseline_diagnostic__", "Fast-track learning review", "PurchaseActivationPanel careerSlug={career.slug}", "Free vs Pro", "Pro activation", "NEXT_PUBLIC_ROLE_PATH_CHECKOUT_URL", "role_path_plan", "RetentionProgressPanel career={career} progress={progress}", "Weekly progress loop", "Readiness change", "buildWeeklyProgressReport", "career_retention_snapshots__", "Career Intelligence is the source of market signals",
]) {
  if (!sources.some((source) => source.includes(token))) throw new Error(`Zero-to-hired validation missing: ${token}`);
}
if (sources[0].includes('{section === "interview-brief" ? <InterviewModule /> : null}')) throw new Error("Legacy interview question-only module is still active.");
console.log("Career availability validated: 23 active Careers with adaptive placement, evidence workflows, job launch, interview/application loops, purchase activation, and explainable weekly retention progress.");
