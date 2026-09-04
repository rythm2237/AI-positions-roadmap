"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { prepareApplication } from "./applicationActions";

const jobId = (form: FormData) => String(form.get("job_id") ?? "").trim();

export async function rejectJob(form: FormData) {
  const user = await requireUser("/job-agent");
  const id = jobId(form);
  if (!id) redirect("/job-agent?error=job");
  const supabase = await createClient();
  const now = new Date().toISOString();
  const job = await supabase.from("job_opportunities").select("role,company").eq("id", id).eq("user_id", user.id).maybeSingle<{ role: string; company: string }>();
  const result = await supabase.from("job_opportunities").update({ decision_status: "rejected", decision_at: now, snoozed_until: null, updated_at: now }).eq("id", id).eq("user_id", user.id);
  if (result.error) redirect("/job-agent?error=decision");
  await Promise.all([
    supabase.from("user_activity").insert({ user_id: user.id, action: "job_agent_job_rejected", metadata: { job_id: id } }),
    job.data ? supabase.rpc("record_job_agent_learning_signal", { p_signal_type: "rejected_role", p_signal_key: job.data.role, p_value: { role: job.data.role, company: job.data.company, lastJobId: id, inspectable: true }, p_confidence: 0.25 }) : Promise.resolve(),
  ]);
  revalidatePath("/job-agent");
  redirect("/job-agent?decision=rejected");
}

export async function snoozeJob(form: FormData) {
  const user = await requireUser("/job-agent");
  const id = jobId(form);
  const requestedDays = Number(form.get("snooze_days") ?? 1);
  const days = [1, 3, 7, 30].includes(requestedDays) ? requestedDays : 1;
  if (!id) redirect("/job-agent?error=job");
  const supabase = await createClient();
  const now = new Date();
  const until = new Date(now.getTime() + days * 86400000).toISOString();
  const result = await supabase.from("job_opportunities").update({ decision_status: "snoozed", decision_at: now.toISOString(), snoozed_until: until, updated_at: now.toISOString() }).eq("id", id).eq("user_id", user.id);
  if (result.error) redirect("/job-agent?error=decision");
  await supabase.from("user_activity").insert({ user_id: user.id, action: "job_agent_job_snoozed", metadata: { job_id: id, days, snoozed_until: until } });
  revalidatePath("/job-agent");
  redirect(`/job-agent?decision=snoozed&days=${days}`);
}

export async function approveJob(form: FormData) {
  const user = await requireUser("/job-agent");
  const id = jobId(form);
  if (!id) redirect("/job-agent?error=job");
  const supabase = await createClient();
  const now = new Date().toISOString();
  const result = await supabase.from("job_opportunities")
    .update({ decision_status: "approved", decision_at: now, snoozed_until: null, updated_at: now })
    .eq("id", id)
    .eq("user_id", user.id)
    .in("eligibility_status", ["eligible", "unverified"])
    .neq("status", "skipped")
    .neq("recommendation", "skip")
    .select("id")
    .maybeSingle();
  if (result.error) redirect("/job-agent?error=decision");
  if (!result.data) redirect(`/job-agent/jobs/${id}?error=not-eligible`);
  await Promise.all([
    supabase.from("user_activity").insert({ user_id: user.id, action: "job_agent_job_approved", metadata: { job_id: id, eligibility_gate: "hard-gate-v4" } }),
    supabase.from("job_approval_requests").insert({ user_id: user.id, job_id: id, action: "prepare_pack", status: "approved", scope: { jobId: id, permission: "prepare_truthful_application_pack_only" }, requested_at: now, decided_at: now, expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), consumed_at: now }),
  ]);
  revalidatePath("/job-agent");
  const next = new FormData();
  next.set("job_id", id);
  await prepareApplication(next);
}
