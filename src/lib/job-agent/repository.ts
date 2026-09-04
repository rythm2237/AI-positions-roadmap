import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationRecord, JobAgent, JobAgentDashboardStats, JobAgentInboxItem, JobOpportunity } from "@/types/jobAgent";
import type { Profile, ResumeRecord, SavedCareer } from "@/types/identity";

export async function getJobAgentWorkspace(user: User) {
  const supabase = await createClient();
  const [profile, preferences, resumes, savedCareers, agent, jobs, applications, inbox, latestSearch] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single<Profile>(),
    supabase.from("user_preferences").select("job_search_region,job_search_country").eq("user_id", user.id).maybeSingle(),
    supabase.from("resumes").select("id,title,target_career,version,file_type,storage_path,uploaded_at").eq("user_id", user.id).order("uploaded_at", { ascending: false }).returns<ResumeRecord[]>(),
    supabase.from("saved_careers").select("id,career_slug,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).returns<SavedCareer[]>(),
    supabase.from("job_agents").select("*").eq("user_id", user.id).maybeSingle<JobAgent>(),
    supabase.from("job_opportunities")
      .select("id,user_id,agent_id,external_job_id,source,company,role,normalized_title,source_query,location,country,job_url,job_description,required_languages,application_url,source_url,workplace_model,employment_types,seniority,required_skills,preferred_skills,education_requirements,certification_requirements,visa_sponsorship,posted_at,expires_at,verification_status,verification_provenance,verified_at,freshness_status,stale_reason,fit_score,fit_confidence,fit_explanation,decision_classification,execution_capability,recommendation,strengths,gaps,founder_positioning,status,skip_reason,decision_status,decision_at,snoozed_until,last_surfaced_at,surfaced_count,salary_min,salary_max,salary_currency,eligibility_status,eligibility_reasons,eligibility_detail,eligibility_checked_at,eligibility_version,current_intent_version,submission_method,submission_receipt,discovered_at,updated_at")
      .eq("user_id", user.id)
      .order("discovered_at", { ascending: false })
      .limit(100)
      .returns<JobOpportunity[]>(),
    supabase.from("applications").select("id,job_id,status,agent_mode,execution_capability,submission_receipt,submission_evidence,submitted_at,follow_up_due_at,applied_at,recruiter_contact,last_response_at,next_action,continuation_url,notes,created_at,job_opportunities(company,role,location,country,job_url,application_url,fit_score,fit_confidence,eligibility_status,execution_capability,source,founder_positioning,decision_status,snoozed_until)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50).returns<ApplicationRecord[]>(),
    supabase.from("job_agent_inbox").select("id,job_id,application_id,category,title,body,priority,recommended_action,deep_link,status,read_at,created_at").eq("user_id", user.id).eq("status", "open").order("created_at", { ascending: false }).limit(20).returns<JobAgentInboxItem[]>(),
    supabase.from("job_search_runs").select("correlation_id,status,provider_records,deduplicated_count,eligible_count,unverified_count,blocked_count,recommended_count,expired_count,provider_summary,latency_ms,estimated_cost,started_at,completed_at").eq("user_id", user.id).order("started_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (profile.error) throw profile.error;
  if (agent.error) throw agent.error;
  const now = Date.now();
  const applicationRows = applications.data ?? [];
  const applicationJobIds = new Set(applicationRows.map((application) => application.job_id));
  const allJobs = jobs.data ?? [];
  const currentVersion = agent.data?.intent_version ?? 0;
  const currentJobs = currentVersion ? allJobs.filter((job) => job.current_intent_version === currentVersion) : allJobs;
  const jobRows = currentJobs.filter((job) => !applicationJobIds.has(job.id) && job.decision_status !== "rejected" && job.decision_status !== "approved" && (job.decision_status !== "snoozed" || !job.snoozed_until || Date.parse(job.snoozed_until) <= now));
  const stats: JobAgentDashboardStats = {
    jobsFound: jobRows.length,
    strongMatches: jobRows.filter((job) => job.eligibility_status === "eligible" && (job.fit_score ?? 0) >= (agent.data?.strong_match_threshold ?? 85)).length,
    applicationsSent: applicationRows.filter((application) => application.status === "submitted" || application.status === "applied").length,
    readyForSubmit: applicationRows.filter((application) => application.status === "ready_for_submit").length,
    recruiterReplies: applicationRows.filter((application) => ["recruiter_response", "interview", "assessment", "offer"].includes(application.status)).length,
    interviews: applicationRows.filter((application) => application.status === "interview").length,
  };
  return { profile: profile.data, preferences: preferences.data, resumes: resumes.data ?? [], savedCareers: savedCareers.data ?? [], agent: agent.data, jobs: jobRows, applications: applicationRows, inbox: inbox.data ?? [], latestSearch: latestSearch.data, stats };
}
