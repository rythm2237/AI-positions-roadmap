import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationRecord, JobAgent, JobAgentDashboardStats, JobOpportunity } from "@/types/jobAgent";
import type { Profile, ResumeRecord, SavedCareer } from "@/types/identity";

export async function getJobAgentWorkspace(user: User) {
  const supabase = await createClient();
  const [profile, preferences, resumes, savedCareers, agent, jobs, applications] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single<Profile>(),
    supabase.from("user_preferences").select("job_search_region,job_search_country").eq("user_id", user.id).maybeSingle(),
    supabase.from("resumes").select("id,title,target_career,version,file_type,storage_path,uploaded_at").order("uploaded_at", { ascending: false }).returns<ResumeRecord[]>(),
    supabase.from("saved_careers").select("id,career_slug,created_at").order("created_at", { ascending: false }).returns<SavedCareer[]>(),
    supabase.from("job_agents").select("*").eq("user_id", user.id).maybeSingle<JobAgent>(),
    supabase.from("job_opportunities").select("id,user_id,agent_id,external_job_id,source,company,role,location,job_url,fit_score,recommendation,strengths,gaps,founder_positioning,status,skip_reason,decision_status,decision_at,snoozed_until,last_surfaced_at,surfaced_count,salary_min,salary_max,salary_currency,submission_method,submission_receipt,discovered_at,updated_at").eq("user_id", user.id).neq("status", "skipped").neq("recommendation", "skip").order("discovered_at", { ascending: false }).limit(100).returns<JobOpportunity[]>(),
    supabase.from("applications").select("id,job_id,status,agent_mode,applied_at,recruiter_contact,last_response_at,next_action,continuation_url,notes,created_at,job_opportunities(company,role,location,job_url,fit_score,source,founder_positioning,decision_status,snoozed_until)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50).returns<ApplicationRecord[]>(),
  ]);
  if (profile.error) throw profile.error;
  if (agent.error) throw agent.error;
  const now = Date.now();
  const allJobs = jobs.data ?? [];
  const jobRows = allJobs.filter((job) => job.decision_status !== "rejected" && job.decision_status !== "approved" && (job.decision_status !== "snoozed" || !job.snoozed_until || Date.parse(job.snoozed_until) <= now));
  const applicationRows = applications.data ?? [];
  const stats: JobAgentDashboardStats = {
    jobsFound: jobRows.length,
    strongMatches: jobRows.filter((job) => (job.fit_score ?? 0) >= (agent.data?.strong_match_threshold ?? 85)).length,
    applicationsSent: applicationRows.filter((application) => application.status === "applied").length,
    readyForSubmit: applicationRows.filter((application) => application.status === "ready_for_submit").length,
    recruiterReplies: applicationRows.filter((application) => ["recruiter_response", "interview", "assessment", "offer"].includes(application.status)).length,
    interviews: applicationRows.filter((application) => application.status === "interview").length,
  };
  return { profile: profile.data, preferences: preferences.data, resumes: resumes.data ?? [], savedCareers: savedCareers.data ?? [], agent: agent.data, jobs: jobRows, applications: applicationRows, stats };
}
