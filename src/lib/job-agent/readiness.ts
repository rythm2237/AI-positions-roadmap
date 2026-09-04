import type { ApplicationReadinessChecklist, CareerEvidenceItem, JobEligibilityStatus } from "../../types/jobAgent.ts";
import type { CanonicalJobCandidate } from "./contracts.ts";
import { safeExternalUrl } from "./normalization.ts";

export function assessApplicationReadiness(input: { job: CanonicalJobCandidate; eligibility: JobEligibilityStatus; hasMasterCv: boolean; evidence: CareerEvidenceItem[] }): ApplicationReadinessChecklist {
  const { job, eligibility, hasMasterCv, evidence } = input;
  const checks: ApplicationReadinessChecklist["checks"] = [
    { key: "master_cv", status: hasMasterCv ? "ready" : "missing", reason: hasMasterCv ? "A Master CV is available." : "A Master CV is required to create a truthful tailored CV.", action: hasMasterCv ? undefined : "Upload a PDF or DOCX Master CV." },
    { key: "profile_evidence", status: evidence.length >= 3 ? "ready" : "missing", reason: evidence.length >= 3 ? `${evidence.length} provenance-linked evidence items are available.` : "Profile evidence is too sparse for safe tailoring.", action: evidence.length >= 3 ? undefined : "Complete your profile or save CV Analyzer evidence." },
    { key: "eligibility", status: eligibility === "blocked" ? "missing" : eligibility === "unverified" ? "unknown" : "ready", reason: eligibility === "blocked" ? "A confirmed hard constraint blocks this application." : eligibility === "unverified" ? "One or more hard requirements need human verification." : "No hard blocker was found." },
    { key: "application_url", status: safeExternalUrl(job.applicationUrl) ? "ready" : "missing", reason: safeExternalUrl(job.applicationUrl) ? "A validated HTTPS application URL is available." : "No safe application URL is available." },
    { key: "screening_questions", status: "unknown", reason: "Screening questions are visible only after the external application is opened.", action: "Open the external application and add any questions to the review checklist." },
    { key: "visa_answer", status: job.visaSponsorship ? "unknown" : "not_required", reason: job.visaSponsorship ? "The vacancy mentions visa or sponsorship; confirm the exact answer." : "No visa question is known from the vacancy." },
    { key: "salary_answer", status: job.salaryMin === null && job.salaryMax === null ? "unknown" : "not_required", reason: job.salaryMin === null && job.salaryMax === null ? "Salary expectations may require user input." : "A vacancy salary range is present." },
  ];
  const missingInputs = checks.filter((check) => check.status === "missing" || check.status === "unknown").map((check) => check.key);
  const status = eligibility === "blocked" || !safeExternalUrl(job.applicationUrl) ? "blocked" : missingInputs.length ? "needs_user_input" : "ready";
  return { status, checks, missingInputs };
}
