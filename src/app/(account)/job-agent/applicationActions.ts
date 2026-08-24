"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { generateApplicationPack } from "@/lib/job-agent/applicationPack";
import type { JobAgent, JobOpportunity } from "@/types/jobAgent";
import type { Profile, ResumeRecord } from "@/types/identity";

export async function prepareApplication(form: FormData) {
  const user = await requireUser("/job-agent");
  const jobId = String(form.get("job_id") ?? "").trim();
  if (!jobId) redirect("/job-agent?error=job");
  const supabase = await createClient();
  const [agentResult, profileResult, resumeResult, jobResult] = await Promise.all([
    supabase.from("job_agents").select("*").eq("user_id", user.id).single<JobAgent>(),
    supabase.from("profiles").select("*").eq("id", user.id).single<Profile>(),
    supabase.from("resumes").select("id,title,target_career,version,file_type,storage_path,uploaded_at").eq("user_id", user.id).order("uploaded_at", { ascending: false }).limit(1).maybeSingle<ResumeRecord>(),
    supabase.from("job_opportunities").select("*").eq("user_id", user.id).eq("id", jobId).single<JobOpportunity & { job_description?: string | null; required_languages?: string[] }>(),
  ]);
  if (agentResult.error || profileResult.error || jobResult.error) redirect("/job-agent?error=job");
  const resume = resumeResult.data;
  if (!resume) redirect("/job-agent?error=master-cv");
  const agent = agentResult.data;
  const job = jobResult.data;
  if (agent.automation_mode === "discovery_only") redirect("/job-agent?error=mode");
  if (job.eligibility_status !== "eligible" || job.recommendation === "skip" || job.status === "skipped") {
    redirect(`/job-agent/jobs/${jobId}?error=not-eligible`);
  }

  const existing = await supabase.from("applications").select("id,status").eq("user_id", user.id).eq("job_id", jobId).maybeSingle();
  let applicationId = existing.data?.id as string | undefined;
  if (!applicationId) {
    const created = await supabase.from("applications").insert({
      user_id: user.id, agent_id: agent.id, job_id: jobId, status: "preparing", agent_mode: agent.automation_mode,
    }).select("id").single();
    if (created.error) redirect("/job-agent?error=application-create");
    applicationId = created.data.id;
  } else {
    await supabase.from("applications").update({ status: "preparing", next_action: null, updated_at: new Date().toISOString() }).eq("id", applicationId).eq("user_id", user.id);
  }
  await supabase.from("job_opportunities").update({ status: "preparing", updated_at: new Date().toISOString() }).eq("id", jobId).eq("user_id", user.id).eq("eligibility_status", "eligible");

  try {
    const { pack, facts } = await generateApplicationPack({ profile: profileResult.data, resume, job });
    const version = Date.now().toString();
    const assetRows = [
      { asset_type: "cv", structured_content: { professionalSummary: pack.professionalSummary, selectedSkills: pack.selectedSkills, highlights: pack.cvHighlights } },
      { asset_type: "portfolio", structured_content: { cases: pack.portfolioCases, founderPositioning: pack.founderPositioning } },
      { asset_type: "cover_note", structured_content: { paragraphs: pack.coverNote } },
      { asset_type: "job_snapshot", structured_content: { company: job.company, role: job.role, location: job.location, url: job.job_url, description: job.job_description ?? null } },
      { asset_type: "fit_analysis", structured_content: { score: job.fit_score, recommendation: job.recommendation, strengths: job.strengths, gaps: job.gaps, eligibilityStatus: job.eligibility_status, eligibilityReasons: job.eligibility_reasons, canonicalFactIds: facts.map((fact) => fact.id) } },
      { asset_type: "screening_answers", structured_content: { answers: pack.screeningAnswers, missingUserDecisions: pack.missingUserDecisions } },
    ].map((asset) => ({
      user_id: user.id, application_id: applicationId, asset_type: asset.asset_type, version, structured_content: asset.structured_content, source_resume_id: resume.id,
    }));
    const assets = await supabase.from("application_assets").insert(assetRows);
    if (assets.error) throw assets.error;
    await Promise.all([
      supabase.from("applications").update({
        status: "ready_for_review", next_action: pack.missingUserDecisions.length ? `Review ${pack.missingUserDecisions.length} unresolved decision(s).` : "Review the tailored application pack before submission.", updated_at: new Date().toISOString(),
      }).eq("id", applicationId).eq("user_id", user.id),
      supabase.from("job_opportunities").update({ founder_positioning: `${pack.founderPositioning.decision}: ${pack.founderPositioning.explanation}`, status: "ready_for_review", updated_at: new Date().toISOString() }).eq("id", jobId).eq("user_id", user.id).eq("eligibility_status", "eligible"),
      supabase.from("application_events").insert({ user_id: user.id, application_id: applicationId, event_type: "application_pack_generated", metadata: { source_resume_id: resume.id, version, missing_decisions: pack.missingUserDecisions.length, eligibility_gate: "hard-gate-v1" } }),
    ]);
  } catch (error) {
    const code = error instanceof Error ? error.message.slice(0, 160) : "APPLICATION_PACK_FAILED";
    console.error("prepareApplication failed", { userId: user.id, jobId, code });
    const restoredStatus = job.recommendation === "review" ? "discovered" : job.recommendation === "skip" ? "skipped" : "recommended";
    const action = code.includes("MASTER_CV_DOC") ? "Upload your Master CV as PDF or DOCX."
      : code.includes("MASTER_CV_EMPTY") ? "Your Master CV could not be read. Upload a text-based PDF or DOCX and retry."
        : "Application pack generation failed. Retry after reviewing the Master CV and profile.";
    await Promise.all([
      supabase.from("applications").update({ status: "preparing", next_action: action, notes: code, updated_at: new Date().toISOString() }).eq("id", applicationId).eq("user_id", user.id),
      supabase.from("job_opportunities").update({ status: restoredStatus, updated_at: new Date().toISOString() }).eq("id", jobId).eq("user_id", user.id).eq("eligibility_status", "eligible"),
    ]);
    redirect(`/job-agent?error=pack&application=${applicationId}`);
  }

  revalidatePath("/job-agent");
  revalidatePath(`/job-agent/applications/${applicationId}`);
  redirect(`/job-agent/applications/${applicationId}?generated=1`);
}
