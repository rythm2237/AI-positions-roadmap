export type JobAgentMode = "discovery_only" | "prepare_applications" | "assisted_apply" | "maximum_automation";
export type JobAgentStatus = "active" | "paused";
export type JobOpportunityStatus =
  | "discovered" | "recommended" | "preparing" | "ready_for_review" | "ready_for_submit"
  | "applied" | "recruiter_response" | "interview" | "assessment" | "offer"
  | "rejected" | "withdrawn" | "expired" | "skipped";
export type ApplicationStatus =
  | "preparing" | "ready_for_review" | "ready_for_submit" | "ats_pack_manual_finalization"
  | "applied" | "recruiter_response" | "interview" | "assessment" | "offer"
  | "rejected" | "withdrawn" | "expired" | "skipped";

export interface JobAgent {
  id: string;
  user_id: string;
  status: JobAgentStatus;
  automation_mode: JobAgentMode;
  primary_career: string | null;
  secondary_careers: string[];
  desired_titles: string[];
  adjacent_roles: string[];
  excluded_roles: string[];
  min_seniority: string | null;
  max_seniority: string | null;
  search_countries: string[];
  excluded_countries: string[];
  cities_regions: string[];
  max_commute_minutes: number | null;
  workplace_preferences: string[];
  willing_to_relocate: boolean | null;
  relocation_countries: string[];
  english_only_priority: boolean;
  exclude_unknown_languages: boolean;
  work_authorization: string | null;
  sponsorship_requirement: string | null;
  notice_period: string | null;
  earliest_start_date: string | null;
  employment_types: string[];
  industries: string[];
  preferred_companies: string[];
  excluded_companies: string[];
  minimum_salary: number | null;
  preferred_salary: number | null;
  salary_currency: string | null;
  salary_negotiable: boolean | null;
  auto_prepare_threshold: number;
  strong_match_threshold: number;
  auto_skip_threshold: number;
  automatically_send_email_applications: boolean;
  never_submit_ats_automatically: boolean;
  ask_before_startups: boolean;
  report_frequency: "daily" | "weekly" | "none";
  report_time: string | null;
  timezone: string;
  notification_channels: string[];
  immediate_high_fit_threshold: number;
  linkedin_url: string | null;
  linkedin_sync_mode: "use_automatically" | "review_first" | "ignore";
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobOpportunity {
  id: string;
  user_id: string;
  agent_id: string;
  external_job_id: string | null;
  source: string;
  company: string;
  role: string;
  location: string | null;
  job_url: string;
  fit_score: number | null;
  recommendation: string | null;
  strengths: string[];
  gaps: string[];
  founder_positioning: string | null;
  status: JobOpportunityStatus;
  skip_reason: string | null;
  discovered_at: string;
  updated_at: string;
}

export interface ApplicationRecord {
  id: string;
  job_id: string;
  status: ApplicationStatus;
  agent_mode: JobAgentMode;
  applied_at: string | null;
  recruiter_contact: string | null;
  last_response_at: string | null;
  next_action: string | null;
  continuation_url: string | null;
  notes: string | null;
  created_at: string;
  job_opportunities?: Pick<JobOpportunity, "company" | "role" | "location" | "job_url" | "fit_score" | "source" | "founder_positioning"> | null;
}

export type JobAgentDashboardStats = {
  jobsFound: number;
  strongMatches: number;
  applicationsSent: number;
  readyForSubmit: number;
  recruiterReplies: number;
  interviews: number;
};
