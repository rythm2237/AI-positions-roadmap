"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { generateApplicationPack } from "@/lib/job-agent/applicationPack";
import { assessApplicationReadiness } from "@/lib/job-agent/readiness";
import { loadUnifiedEvidence } from "@/lib/job-agent/unifiedEvidence";
import { safeExternalUrl } from "@/lib/job-agent/normalization";
import { canTransitionApplication } from "@/lib/job-agent/applicationState";
import type { CanonicalJobCandidate } from "@/lib/job-agent/contracts";
import type { ApplicationStatus, JobAgent, JobOpportunity } from "@/types/jobAgent";
import type { Profile, ResumeRecord } from "@/types/identity";

const asCandidate = (job: JobOpportunity): CanonicalJobCandidate => ({
  externalId: job.external_job_id ?? job.id, source: job.source, sourceQuery: job.source_query ?? "stored", company: job.company, title: job.role,
  normalizedTitle: job.normalized_title ?? job.role.toLowerCase(), location: job.location, country: job.country, sourceUrl: job.source_url ?? job.job_url,
  applicationUrl: job.application_url ?? job.job_url, description: job.job_description ?? "", descriptionComplete: job.verification_status === "verified" || job.verification_status === "partially_verified",
  workplaceModel: job.workplace_model ?? "unknown", employmentTypes: job.employment_types ?? [], seniority: job.seniority ?? null,
  salaryMin: job.salary_min, salaryMax: job.salary_max, currency: job.salary_currency, requiredLanguages: job.required_languages ?? [], requiredSkills: job.required_skills ?? [],
  preferredSkills: job.preferred_skills ?? [], educationRequirements: job.education_requirements ?? [], certificationRequirements: job.certification_requirements ?? [],
  visaSponsorship: job.visa_sponsorship ?? null, postedAt: job.posted_at ?? null, expiresAt: job.expires_at ?? null, canonicalKey: job.canonical_key ?? job.id,
  sourceQueries: job.source_query ? [job.source_query] : [], sources: [],
});

async function recordInbox(supabase: Awaited<ReturnType<typeof createClient>>, input: { userId: string; jobId: string; applicationId: string; category: string; title: string; body: string; priority: string; recommendedAction: string; deepLink: string; dedupeKey: string }) {
  const result = await supabase.from("job_agent_inbox").upsert({ user_id: input.userId, job_id: input.jobId, application_id: input.applicationId, category: input.category, title: input.title.slice(0, 160), body: input.body, priority: input.priority, recommended_action: input.recommendedAction, deep_link: input.deepLink, dedupe_key: input.dedupeKey }, { onConflict: "user_id,dedupe_key" }).select("id").single<{ id: string }>();
  if (result.error) console.error("Job Agent Inbox write failed", { userId: input.userId, code: result.error.code });
}

export async function prepareApplication(form: FormData) {
  const user = await requireUser("/job-agent");
  const jobId = String(form.get("job_id") ?? "").trim();
  if (!jobId) redirect("/job-agent?error=job");
  const supabase = await createClient();
  const [agentResult, profileResult, resumeResult, jobResult] = await Promise.all([
    supabase.from("job_agents").select("*").eq("user_id", user.id).single<JobAgent>(),
    supabase.from("profiles").select("*").eq("id", user.id).single<Profile>(),
    supabase.from("resumes").select("id,title,target_career,version,file_type,storage_path,uploaded_at").eq("user_id", user.id).order("uploaded_at", { ascending: false }).limit(1).maybeSingle<ResumeRecord>(),
    supabase.from("job_opportunities").select("*").eq("user_id", user.id).eq("id", jobId).single<JobOpportunity>(),
  ]);
  if (agentResult.error || profileResult.error || jobResult.error) redirect("/job-agent?error=job");
  const agent = agentResult.data;
  const job = jobResult.data;
  const resume = resumeResult.data;
  if (agent.automation_mode === "discovery_only") redirect("/job-agent?error=mode");
  if (job.eligibility_status === "blocked" || job.freshness_status === "expired") redirect(`/job-agent/jobs/${jobId}?error=not-eligible`);

  const unified = await loadUnifiedEvidence(supabase, user.id, profileResult.data);
  const readiness = assessApplicationReadiness({ job: asCandidate(job), eligibility: job.eligibility_status, hasMasterCv: Boolean(resume), evidence: unified.evidence });
  await supabase.from("job_application_readiness").upsert({ user_id: user.id, job_id: jobId, status: readiness.status, checklist: readiness.checks, missing_inputs: readiness.missingInputs, assessed_at: new Date().toISOString() }, { onConflict: "user_id,job_id" });
  if (!resume) redirect("/job-agent?error=master-cv");

  const existing = await supabase.from("applications").select("id,status").eq("user_id", user.id).eq("job_id", jobId).maybeSingle<{ id: string; status: string }>();
  let applicationId = existing.data?.id;
  const fromStatus = existing.data?.status ?? null;
  if (fromStatus && !["preparing", "ready_for_review"].includes(fromStatus)) redirect(`/job-agent/applications/${applicationId}?error=invalid-transition`);
  if (!applicationId) {
    const created = await supabase.from("applications").insert({ user_id: user.id, agent_id: agent.id, job_id: jobId, status: "preparing", agent_mode: agent.automation_mode, execution_capability: job.execution_capability ?? "manual_only" }).select("id").single<{ id: string }>();
    if (created.error) redirect("/job-agent?error=application-create");
    applicationId = created.data.id;
  } else {
    const reset = await supabase.from("applications").update({ status: "preparing", execution_capability: job.execution_capability ?? "manual_only", next_action: null, updated_at: new Date().toISOString() }).eq("id", applicationId).eq("user_id", user.id);
    if (reset.error) redirect("/job-agent?error=application-create");
  }
  await Promise.all([
    supabase.from("job_opportunities").update({ status: "preparing", updated_at: new Date().toISOString() }).eq("id", jobId).eq("user_id", user.id).in("eligibility_status", ["eligible", "unverified"]),
    supabase.from("application_status_events").insert({ user_id: user.id, application_id: applicationId, from_status: fromStatus, to_status: "preparing", reason_code: "USER_APPROVED_PREPARATION", evidence: { jobId } }),
  ]);

  try {
    const { pack, facts } = await generateApplicationPack({ profile: profileResult.data, resume, job });
    const version = Date.now().toString();
    const assetRows = [
      { asset_type: "cv", structured_content: { applicationSummary: pack.applicationSummary, professionalSummary: pack.professionalSummary, selectedSkills: pack.selectedSkills, keyAchievements: pack.keyAchievements, highlights: pack.cvHighlights } },
      { asset_type: "portfolio", structured_content: { cases: pack.portfolioCases, founderPositioning: pack.founderPositioning } },
      { asset_type: "cover_note", structured_content: { paragraphs: pack.coverNote, recruiterMessage: pack.recruiterMessage } },
      { asset_type: "job_snapshot", structured_content: { company: job.company, role: job.role, location: job.location, applicationUrl: job.application_url ?? job.job_url, sourceUrl: job.source_url ?? job.job_url, description: job.job_description ?? null } },
      { asset_type: "fit_analysis", structured_content: { score: job.fit_score, confidence: job.fit_confidence, explanation: job.fit_explanation, recommendation: job.recommendation, strengths: job.strengths, gaps: job.gaps, eligibilityStatus: job.eligibility_status, eligibilityReasons: job.eligibility_reasons, canonicalFactIds: facts.map((fact) => fact.id) } },
      { asset_type: "screening_answers", structured_content: { answers: pack.screeningAnswers, missingUserDecisions: pack.missingUserDecisions } },
    ].map((asset) => ({ user_id: user.id, application_id: applicationId, asset_type: asset.asset_type, version, structured_content: asset.structured_content, source_resume_id: resume.id }));
    const assets = await supabase.from("application_assets").insert(assetRows);
    if (assets.error) throw assets.error;
    const nextAction = job.eligibility_status === "unverified" ? "Verify the unresolved hard requirements, then review every generated statement." : pack.missingUserDecisions.length ? `Review ${pack.missingUserDecisions.length} unresolved decision(s) and every generated statement.` : "Review every generated statement before approving this pack.";
    await Promise.all([
      supabase.from("applications").update({ status: "ready_for_review", next_action: nextAction, updated_at: new Date().toISOString() }).eq("id", applicationId).eq("user_id", user.id),
      supabase.from("job_opportunities").update({ founder_positioning: `${pack.founderPositioning.decision}: ${pack.founderPositioning.explanation}`, status: "ready_for_review", updated_at: new Date().toISOString() }).eq("id", jobId).eq("user_id", user.id).in("eligibility_status", ["eligible", "unverified"]),
      supabase.from("application_events").insert({ user_id: user.id, application_id: applicationId, event_type: "application_pack_generated", metadata: { source_resume_id: resume.id, version, missing_decisions: pack.missingUserDecisions.length, eligibility_gate: "hard-gate-v4", evidence_count: facts.length } }),
      supabase.from("application_status_events").insert({ user_id: user.id, application_id: applicationId, from_status: "preparing", to_status: "ready_for_review", reason_code: "GROUNDED_PACK_GENERATED", evidence: { version, sourceResumeId: resume.id } }),
      recordInbox(supabase, { userId: user.id, jobId, applicationId, category: "application_ready", title: `Application pack ready for ${job.company}`, body: "A provenance-checked application pack is ready for human review.", priority: "high", recommendedAction: "Review every statement and resolve missing answers before approving the pack.", deepLink: `/job-agent/applications/${applicationId}`, dedupeKey: `application-ready:${applicationId}:${version}` }),
    ]);
  } catch (error) {
    const code = error instanceof Error ? error.message.slice(0, 160) : "APPLICATION_PACK_FAILED";
    console.error("prepareApplication failed", { userId: user.id, jobId, code });
    const restoredStatus = job.recommendation === "review" ? "discovered" : "recommended";
    const action = code.includes("MASTER_CV_DOC") ? "Upload your Master CV as PDF or DOCX." : code.includes("MASTER_CV_EMPTY") ? "Your Master CV could not be read. Upload a text-based PDF or DOCX and retry." : "Application pack generation failed. Retry after reviewing the Master CV and profile.";
    await Promise.all([
      supabase.from("applications").update({ status: "preparing", next_action: action, notes: code, updated_at: new Date().toISOString() }).eq("id", applicationId).eq("user_id", user.id),
      supabase.from("job_opportunities").update({ status: restoredStatus, updated_at: new Date().toISOString() }).eq("id", jobId).eq("user_id", user.id),
      recordInbox(supabase, { userId: user.id, jobId, applicationId, category: "agent_error", title: `Application pack failed for ${job.company}`, body: code, priority: "high", recommendedAction: action, deepLink: `/job-agent/applications/${applicationId}`, dedupeKey: `pack-error:${applicationId}:${Date.now()}` }),
    ]);
    redirect(`/job-agent?error=pack&application=${applicationId}`);
  }

  revalidatePath("/job-agent");
  revalidatePath(`/job-agent/applications/${applicationId}`);
  redirect(`/job-agent/applications/${applicationId}?generated=1`);
}

export async function approveApplicationPack(form: FormData) {
  const user = await requireUser("/job-agent");
  const applicationId = String(form.get("application_id") ?? "").trim();
  const supabase = await createClient();
  const application = await supabase.from("applications").select("id,job_id,status,job_opportunities(eligibility_status,freshness_status,application_url,job_url)").eq("id", applicationId).eq("user_id", user.id).maybeSingle();
  const rawJob = application.data?.job_opportunities; const job = Array.isArray(rawJob) ? rawJob[0] : rawJob;
  if (!application.data || !job || application.data.status !== "ready_for_review" || job.eligibility_status === "blocked" || job.freshness_status === "expired") redirect(`/job-agent/applications/${applicationId}?error=not-ready`);
  const assets = await supabase.from("application_assets").select("id", { count: "exact", head: true }).eq("application_id", applicationId).eq("user_id", user.id);
  if (!assets.count) redirect(`/job-agent/applications/${applicationId}?error=no-pack`);
  const targetUrl = safeExternalUrl(job.application_url ?? job.job_url);
  if (!targetUrl) redirect(`/job-agent/applications/${applicationId}?error=unsafe-url`);
  const now = new Date().toISOString();
  await Promise.all([
    supabase.from("applications").update({ status: "ready_for_submit", next_action: "Open the exact application link, complete the external form, then return and confirm submission with evidence.", continuation_url: targetUrl, updated_at: now }).eq("id", applicationId).eq("user_id", user.id),
    supabase.from("job_opportunities").update({ status: "ready_for_submit", updated_at: now }).eq("id", application.data.job_id).eq("user_id", user.id),
    supabase.from("application_status_events").insert({ user_id: user.id, application_id: applicationId, from_status: "ready_for_review", to_status: "ready_for_submit", reason_code: "USER_APPROVED_PACK", evidence: { targetUrl } }),
  ]);
  revalidatePath(`/job-agent/applications/${applicationId}`);
  redirect(`/job-agent/applications/${applicationId}?approved=1`);
}

export async function beginManualSubmission(form: FormData) {
  const user = await requireUser("/job-agent");
  const applicationId = String(form.get("application_id") ?? "").trim();
  const supabase = await createClient();
  const application = await supabase.from("applications").select("id,job_id,status,continuation_url,job_opportunities(company,role,application_url,job_url)").eq("id", applicationId).eq("user_id", user.id).maybeSingle();
  const rawJob = application.data?.job_opportunities; const job = Array.isArray(rawJob) ? rawJob[0] : rawJob;
  if (!application.data || !job || application.data.status !== "ready_for_submit") redirect(`/job-agent/applications/${applicationId}?error=not-ready`);
  const targetUrl = safeExternalUrl(application.data.continuation_url ?? job.application_url ?? job.job_url);
  if (!targetUrl) redirect(`/job-agent/applications/${applicationId}?error=unsafe-url`);
  const idempotencyKey = `manual-submit:${applicationId}`;
  await Promise.all([
    supabase.from("applications").update({ status: "manual_action_required", next_action: "Submit on the external site, then return here and confirm only after the provider accepts it.", updated_at: new Date().toISOString() }).eq("id", applicationId).eq("user_id", user.id),
    supabase.from("job_opportunities").update({ status: "manual_action_required", updated_at: new Date().toISOString() }).eq("id", application.data.job_id).eq("user_id", user.id),
    supabase.from("application_execution_attempts").upsert({ user_id: user.id, application_id: applicationId, mode: "assisted_apply", capability: "manual_only", status: "manual_action_required", idempotency_key: idempotencyKey, target_url: targetUrl }, { onConflict: "user_id,idempotency_key" }),
    supabase.from("application_status_events").insert({ user_id: user.id, application_id: applicationId, from_status: "ready_for_submit", to_status: "manual_action_required", reason_code: "EXTERNAL_MANUAL_ACTION_STARTED", evidence: { targetUrl } }),
    recordInbox(supabase, { userId: user.id, jobId: application.data.job_id, applicationId, category: "manual_action_required", title: `Manual submission required — ${job.company}`, body: "No approved automatic-submit API is configured for this vacancy.", priority: "high", recommendedAction: "Open the exact application URL, submit the reviewed pack, then confirm the result.", deepLink: `/job-agent/applications/${applicationId}`, dedupeKey: idempotencyKey }),
  ]);
  revalidatePath(`/job-agent/applications/${applicationId}`);
  redirect(`/job-agent/applications/${applicationId}?manual=1`);
}

export async function confirmManualSubmission(form: FormData) {
  const user = await requireUser("/job-agent");
  const applicationId = String(form.get("application_id") ?? "").trim();
  const confirmed = form.get("submission_confirmed") === "on";
  const receipt = String(form.get("submission_receipt") ?? "").trim().slice(0, 500) || null;
  if (!confirmed) redirect(`/job-agent/applications/${applicationId}?error=confirmation-required`);
  const supabase = await createClient();
  const application = await supabase.from("applications").select("id,job_id,status,continuation_url,job_opportunities(company,role)").eq("id", applicationId).eq("user_id", user.id).maybeSingle();
  const rawJob = application.data?.job_opportunities; const job = Array.isArray(rawJob) ? rawJob[0] : rawJob;
  if (!application.data || !job || !["manual_action_required", "ready_for_submit"].includes(application.data.status)) redirect(`/job-agent/applications/${applicationId}?error=not-ready`);
  const agent = await supabase.from("job_agents").select("follow_up_days").eq("user_id", user.id).single<{ follow_up_days: number }>();
  const now = new Date(); const followUp = new Date(now.getTime() + (agent.data?.follow_up_days ?? 7) * 86_400_000).toISOString();
  const evidence = { attestedBy: user.id, attestedAt: now.toISOString(), method: "explicit_user_confirmation", targetUrl: application.data.continuation_url };
  const update = await supabase.from("applications").update({ status: "submitted", submission_receipt: receipt, submission_evidence: evidence, submitted_at: now.toISOString(), applied_at: now.toISOString(), follow_up_due_at: followUp, next_action: `Follow up on ${new Date(followUp).toLocaleDateString("en-GB")}.`, updated_at: now.toISOString() }).eq("id", applicationId).eq("user_id", user.id).in("status", ["manual_action_required", "ready_for_submit"]).select("id").maybeSingle();
  if (update.error || !update.data) redirect(`/job-agent/applications/${applicationId}?error=submit-record`);
  await Promise.all([
    supabase.from("job_opportunities").update({ status: "submitted", submission_method: "manual_user_confirmed", submission_receipt: receipt, updated_at: now.toISOString() }).eq("id", application.data.job_id).eq("user_id", user.id),
    supabase.from("application_execution_attempts").update({ status: "succeeded", external_confirmation: evidence, completed_at: now.toISOString() }).eq("user_id", user.id).eq("application_id", applicationId).eq("idempotency_key", `manual-submit:${applicationId}`),
    supabase.from("application_status_events").insert({ user_id: user.id, application_id: applicationId, from_status: application.data.status, to_status: "submitted", reason_code: "USER_CONFIRMED_EXTERNAL_SUBMISSION", evidence: { ...evidence, receiptProvided: Boolean(receipt) } }),
    supabase.from("application_events").insert({ user_id: user.id, application_id: applicationId, event_type: "application_submitted_user_confirmed", metadata: { receipt_provided: Boolean(receipt), target_url: application.data.continuation_url } }),
    supabase.from("job_follow_ups").insert({ user_id: user.id, application_id: applicationId, due_at: followUp, suggested_action: "Review the application status and send a recruiter follow-up only after explicit approval." }),
    recordInbox(supabase, { userId: user.id, jobId: application.data.job_id, applicationId, category: "application_submitted", title: `Application submitted — ${job.company}`, body: "Submission was recorded from your explicit confirmation.", priority: "normal", recommendedAction: `Review status by ${new Date(followUp).toLocaleDateString("en-GB")}.`, deepLink: `/job-agent/applications/${applicationId}`, dedupeKey: `submitted:${applicationId}` }),
  ]);
  revalidatePath("/job-agent"); revalidatePath(`/job-agent/applications/${applicationId}`);
  redirect(`/job-agent/applications/${applicationId}?submitted=1`);
}

export async function updateApplicationStatus(form: FormData) {
  const user = await requireUser("/job-agent");
  const applicationId = String(form.get("application_id") ?? "").trim();
  const toStatus = String(form.get("status") ?? "").trim() as ApplicationStatus;
  const evidenceNote = String(form.get("evidence_note") ?? "").trim().slice(0, 1000);
  const allowedTargets = new Set<ApplicationStatus>(["recruiter_response", "interview", "assessment", "offer", "rejected", "withdrawn", "expired"]);
  if (!allowedTargets.has(toStatus) || !evidenceNote) redirect(`/job-agent/applications/${applicationId}?error=status-evidence-required`);
  const supabase = await createClient();
  const application = await supabase.from("applications").select("id,job_id,status,job_opportunities(company,role)").eq("id", applicationId).eq("user_id", user.id).maybeSingle<{ id: string; job_id: string; status: ApplicationStatus; job_opportunities: { company: string; role: string } | Array<{ company: string; role: string }> | null }>();
  const rawJob = application.data?.job_opportunities; const job = Array.isArray(rawJob) ? rawJob[0] : rawJob;
  if (!application.data || !job || !canTransitionApplication(application.data.status, toStatus)) redirect(`/job-agent/applications/${applicationId}?error=invalid-transition`);
  const now = new Date().toISOString();
  const update: Record<string, unknown> = { status: toStatus, next_action: toStatus === "recruiter_response" ? "Review the recruiter message and record the next agreed step." : toStatus === "interview" ? "Prepare for the confirmed interview." : toStatus === "offer" ? "Review the offer carefully before responding." : null, updated_at: now };
  if (["recruiter_response", "interview", "assessment", "offer"].includes(toStatus)) update.last_response_at = now;
  const result = await supabase.from("applications").update(update).eq("id", applicationId).eq("user_id", user.id).eq("status", application.data.status).select("id").maybeSingle();
  if (result.error || !result.data) redirect(`/job-agent/applications/${applicationId}?error=transition-conflict`);
  const category = toStatus === "recruiter_response" ? "recruiter_reply" : toStatus === "interview" ? "interview_request" : ["rejected", "withdrawn", "expired"].includes(toStatus) ? "application_closed" : null;
  await Promise.all([
    supabase.from("job_opportunities").update({ status: toStatus, updated_at: now }).eq("id", application.data.job_id).eq("user_id", user.id),
    supabase.from("application_status_events").insert({ user_id: user.id, application_id: applicationId, from_status: application.data.status, to_status: toStatus, reason_code: "USER_RECORDED_EXTERNAL_OUTCOME", evidence: { note: evidenceNote, attestedBy: user.id, attestedAt: now } }),
    supabase.from("application_events").insert({ user_id: user.id, application_id: applicationId, event_type: `status_${toStatus}`, metadata: { evidence_note: evidenceNote, user_confirmed: true } }),
    supabase.from("job_follow_ups").update({ status: "completed", completed_at: now }).eq("application_id", applicationId).eq("user_id", user.id).eq("status", "pending"),
    ["recruiter_response", "interview", "offer"].includes(toStatus) ? supabase.rpc("record_job_agent_learning_signal", { p_signal_type: "recruiter_response", p_signal_key: job.role, p_value: { role: job.role, company: job.company, outcome: toStatus, inspectable: true }, p_confidence: toStatus === "offer" ? 0.85 : toStatus === "interview" ? 0.65 : 0.45 }) : Promise.resolve(),
    category ? recordInbox(supabase, { userId: user.id, jobId: application.data.job_id, applicationId, category, title: `${toStatus.replaceAll("_", " ")} — ${job.company}`, body: evidenceNote, priority: toStatus === "interview" || toStatus === "offer" ? "high" : "normal", recommendedAction: String(update.next_action ?? "Review the recorded outcome."), deepLink: `/job-agent/applications/${applicationId}`, dedupeKey: `status:${applicationId}:${toStatus}:${Date.now()}` }) : Promise.resolve(),
  ]);
  revalidatePath("/job-agent"); revalidatePath(`/job-agent/applications/${applicationId}`);
  redirect(`/job-agent/applications/${applicationId}?status_updated=${toStatus}`);
}
