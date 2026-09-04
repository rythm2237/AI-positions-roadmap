export type JobAgentMode = "discovery_only" | "prepare_applications" | "assisted_apply" | "maximum_automation";
export type JobAgentStatus = "active" | "paused";
export type JobDecisionStatus = "pending" | "approved" | "rejected" | "snoozed";
export type JobEligibilityStatus = "eligible" | "blocked" | "unverified";
export type JobWorkplaceModel = "remote" | "hybrid" | "on_site" | "unknown";
export type JobVerificationStatus = "verified" | "partially_verified" | "unverified" | "failed";
export type JobFreshnessStatus = "fresh" | "stale" | "expired" | "unknown";
export type FitConfidence = "high" | "medium" | "low";
export type JobClassification = "strong_match" | "good_match" | "worth_reviewing" | "stretch" | "blocked" | "expired";
export type ApplicationExecutionCapability = "auto_submit_supported" | "assisted_supported" | "manual_only" | "blocked";
export type ProviderAttemptStatus = "success" | "no_results" | "provider_error" | "rate_limit" | "unsupported_country" | "auth_failure" | "invalid_query";

export type JobOpportunityStatus =
  | "discovered" | "recommended" | "reviewing" | "preparing" | "ready_for_review" | "ready_for_submit"
  | "manual_action_required" | "submitted" | "applied" | "recruiter_response" | "interview" | "assessment" | "offer"
  | "rejected" | "withdrawn" | "expired" | "skipped";
export type ApplicationStatus =
  | "discovered" | "reviewing" | "preparing" | "ready_for_review" | "ready_for_submit" | "manual_action_required"
  | "submitted" | "ats_pack_manual_finalization" | "applied" | "recruiter_response" | "interview" | "assessment" | "offer"
  | "rejected" | "withdrawn" | "expired" | "skipped";

export interface SalaryExpectation {
  minimum: number | null;
  preferred: number | null;
  currency: string;
  negotiable: boolean;
}

export interface JobSearchHardConstraints {
  excludedRoles: string[];
  minimumSeniority: string | null;
  maximumSeniority: string | null;
  excludedIndustries: string[];
  excludedCompanies: string[];
  countries: string[];
  citiesRegions: string[];
  maximumCommuteMinutes: number | null;
  workplaceModels: JobWorkplaceModel[];
  workAuthorization: string | null;
  sponsorshipRequirement: string | null;
  languages: string[];
  englishOnly: boolean;
  employmentTypes: string[];
  salary: SalaryExpectation;
  earliestStartDate: string | null;
}

export interface JobSearchSoftPreferences {
  secondaryRoles: string[];
  marketTitleVariants: string[];
  adjacentRoles: string[];
  targetIndustries: string[];
  preferredCompanies: string[];
  preferredCountries: string[];
  preferredCitiesRegions: string[];
  workplaceModels: JobWorkplaceModel[];
  relocationPreference: "not_willing" | "open" | "preferred";
  relocationCountries: string[];
  noticePeriod: string | null;
}

export interface NormalizedJobSearchIntent {
  primaryTargetRole: string;
  hard: JobSearchHardConstraints;
  soft: JobSearchSoftPreferences;
  version: number;
  confirmedAt: string;
  fingerprint: string;
}

export type EvidenceSourceType = "profile" | "master_cv" | "cv_analyzer" | "experience" | "education" | "certification" | "language" | "project" | "portfolio" | "roadmap" | "assessment";
export type EvidenceType = "user_claim" | "skill_mention" | "work_implementation" | "project_implementation" | "quantified_achievement" | "education" | "certification" | "language" | "assessment_result" | "portfolio_artifact" | "role_history";

export interface CareerEvidenceItem {
  id?: string;
  label: string;
  value: string;
  sourceType: EvidenceSourceType;
  sourceId: string | null;
  evidenceType: EvidenceType;
  confidence: number;
  durationMonths: number | null;
  provenance: Record<string, unknown>;
  fingerprint: string;
}

export interface ProviderAttempt {
  provider: string;
  query: string;
  country: string;
  location: string | null;
  status: ProviderAttemptStatus;
  recordsReceived: number;
  requestCount: number;
  latencyMs: number;
  rateLimitState?: Record<string, unknown>;
  errorCode?: string;
  errorMessage?: string;
}

export interface JobAgent {
  id: string; user_id: string; status: JobAgentStatus; automation_mode: JobAgentMode;
  primary_career: string | null; secondary_careers: string[]; desired_titles: string[]; adjacent_roles: string[]; excluded_roles: string[];
  min_seniority: string | null; max_seniority: string | null; search_countries: string[]; excluded_countries: string[]; cities_regions: string[];
  max_commute_minutes: number | null; workplace_preferences: string[]; willing_to_relocate: boolean | null; relocation_countries: string[];
  english_only_priority: boolean; exclude_unknown_languages: boolean; search_languages?: string[]; work_authorization: string | null; sponsorship_requirement: string | null;
  notice_period: string | null; earliest_start_date: string | null; employment_types: string[]; industries: string[]; excluded_industries?: string[]; preferred_companies: string[]; excluded_companies: string[];
  minimum_salary: number | null; preferred_salary: number | null; salary_currency: string | null; salary_negotiable: boolean | null;
  auto_prepare_threshold: number; strong_match_threshold: number; auto_skip_threshold: number; automatically_send_email_applications: boolean;
  never_submit_ats_automatically: boolean; ask_before_startups: boolean; report_frequency: "daily" | "weekly" | "none"; report_time: string | null;
  timezone: string; notification_channels: string[]; immediate_high_fit_threshold: number; linkedin_url: string | null;
  linkedin_sync_mode: "use_automatically" | "review_first" | "ignore"; onboarding_completed_at: string | null; created_at: string; updated_at: string;
  intent_version?: number; learned_preferences_enabled?: boolean; follow_up_days?: number;
}

export interface EligibilityReason {
  code: string;
  outcome: "pass" | "block" | "unknown";
  field: string;
  message: string;
  evidence: string | null;
}

export interface FitExplanation {
  dimensions: Record<string, number>;
  strongestEvidence: Array<{ evidenceId?: string; label: string; source: EvidenceSourceType; contribution: number }>;
  missingEvidence: string[];
  transferableEvidence: Array<{ evidenceId?: string; label: string; source: EvidenceSourceType }>;
  whyRankedHere: string[];
  scoringVersion: string;
}

export interface JobOpportunity {
  id: string; user_id: string; agent_id: string; external_job_id: string | null; source: string; company: string; role: string;
  location: string | null; country: string | null; job_url: string; job_description?: string | null; required_languages?: string[]; fit_score: number | null; recommendation: string | null; strengths: string[]; gaps: string[];
  founder_positioning: string | null; status: JobOpportunityStatus; skip_reason: string | null; decision_status: JobDecisionStatus; decision_at: string | null;
  snoozed_until: string | null; last_surfaced_at: string | null; surfaced_count: number; salary_min: number | null; salary_max: number | null; salary_currency: string | null;
  eligibility_status: JobEligibilityStatus; eligibility_reasons: string[]; eligibility_checked_at: string | null; eligibility_version: string;
  submission_method: string | null; submission_receipt: string | null; discovered_at: string; updated_at: string;
  canonical_key?: string | null; normalized_title?: string | null; source_query?: string | null; workplace_model?: JobWorkplaceModel;
  employment_types?: string[]; seniority?: string | null; required_skills?: string[]; preferred_skills?: string[];
  education_requirements?: string[]; certification_requirements?: string[]; visa_sponsorship?: string | null;
  posted_at?: string | null; expires_at?: string | null; application_url?: string | null; source_url?: string | null;
  verification_status?: JobVerificationStatus; verification_provenance?: Record<string, unknown>; verified_at?: string | null;
  freshness_status?: JobFreshnessStatus; stale_reason?: string | null; eligibility_detail?: { reasons?: EligibilityReason[] };
  fit_confidence?: FitConfidence | null; fit_explanation?: FitExplanation | Record<string, unknown>;
  decision_classification?: JobClassification | null; execution_capability?: ApplicationExecutionCapability; current_intent_version?: number | null;
}

export interface ApplicationRecord {
  id: string; job_id: string; status: ApplicationStatus; agent_mode: JobAgentMode; applied_at: string | null; recruiter_contact: string | null;
  last_response_at: string | null; next_action: string | null; continuation_url: string | null; notes: string | null; created_at: string;
  execution_capability?: ApplicationExecutionCapability; submission_receipt?: string | null; submission_evidence?: Record<string, unknown>;
  submitted_at?: string | null; follow_up_due_at?: string | null;
  job_opportunities?: Pick<JobOpportunity, "company" | "role" | "location" | "country" | "job_url" | "fit_score" | "source" | "founder_positioning" | "decision_status" | "snoozed_until" | "eligibility_status" | "fit_confidence" | "execution_capability" | "application_url"> | null;
}

export interface ApplicationReadinessChecklist {
  status: "ready" | "needs_user_input" | "blocked";
  checks: Array<{ key: string; status: "ready" | "missing" | "unknown" | "not_required"; reason: string; action?: string }>;
  missingInputs: string[];
}

export interface JobAgentInboxItem {
  id: string; job_id: string | null; application_id: string | null;
  category: "new_strong_match" | "new_review_job" | "application_ready" | "manual_action_required" | "application_submitted" | "recruiter_reply" | "interview_request" | "follow_up_due" | "application_closed" | "agent_error";
  title: string; body: string; priority: "low" | "normal" | "high" | "urgent"; recommended_action: string | null;
  deep_link: string | null; status: "open" | "done" | "dismissed"; read_at: string | null; created_at: string;
}

export type JobAgentDashboardStats = { jobsFound: number; strongMatches: number; applicationsSent: number; readyForSubmit: number; recruiterReplies: number; interviews: number; };
