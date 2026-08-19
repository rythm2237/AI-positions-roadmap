"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { JobAgent, JobAgentMode } from "@/types/jobAgent";

const modes = new Set<JobAgentMode>(["discovery_only", "prepare_applications", "assisted_apply"]);
const frequencies = new Set(["daily", "weekly", "none"]);
const linkedinModes = new Set(["use_automatically", "review_first", "ignore"]);
const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim() || null;
const list = (form: FormData, key: string) => String(form.get(key) ?? "").split(",").map((value) => value.trim()).filter(Boolean).slice(0, 100);
const checked = (form: FormData, key: string) => form.get(key) === "on";
const number = (form: FormData, key: string, min: number, max: number) => {
  const raw = text(form, key);
  if (raw === null) return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= min && value <= max ? value : null;
};
const countryAliases: Record<string, string> = { frence: "France", france: "France", germany: "Germany", deutschland: "Germany", netherlands: "Netherlands", holland: "Netherlands", switzerland: "Switzerland", schweiz: "Switzerland", suisse: "Switzerland", "united kingdom": "United Kingdom", uk: "United Kingdom" };
const normalizeCountries = (values: string[]) => values.map((value) => countryAliases[value.trim().toLowerCase()] ?? value.trim()).filter(Boolean);
const normalized = (values: string[] | undefined | null) => [...(values ?? [])].map((value) => value.trim().toLowerCase()).sort();
const criteriaSnapshot = (value: Partial<JobAgent> | Record<string, unknown> | null | undefined, languages: string[]) => JSON.stringify({
  primary_career: value?.primary_career ?? null,
  secondary_careers: normalized(value?.secondary_careers as string[] | undefined),
  desired_titles: normalized(value?.desired_titles as string[] | undefined),
  adjacent_roles: normalized(value?.adjacent_roles as string[] | undefined),
  excluded_roles: normalized(value?.excluded_roles as string[] | undefined),
  search_countries: normalized(value?.search_countries as string[] | undefined),
  excluded_countries: normalized(value?.excluded_countries as string[] | undefined),
  cities_regions: normalized(value?.cities_regions as string[] | undefined),
  workplace_preferences: normalized(value?.workplace_preferences as string[] | undefined),
  excluded_companies: normalized(value?.excluded_companies as string[] | undefined),
  minimum_salary: value?.minimum_salary ?? null,
  preferred_salary: value?.preferred_salary ?? null,
  english_only_priority: value?.english_only_priority ?? false,
  exclude_unknown_languages: value?.exclude_unknown_languages ?? true,
  auto_prepare_threshold: value?.auto_prepare_threshold ?? 75,
  strong_match_threshold: value?.strong_match_threshold ?? 85,
  auto_skip_threshold: value?.auto_skip_threshold ?? 60,
  languages: normalized(languages),
});

export async function saveJobAgent(form: FormData) {
  const user = await requireUser("/job-agent");
  const supabase = await createClient();
  const [existingAgentResult, existingProfileResult] = await Promise.all([
    supabase.from("job_agents").select("*").eq("user_id", user.id).maybeSingle<JobAgent>(),
    supabase.from("profiles").select("languages").eq("id", user.id).single<{ languages: string[] }>(),
  ]);
  const rawMode = text(form, "automation_mode") as JobAgentMode | null;
  const automationMode = rawMode && modes.has(rawMode) ? rawMode : "assisted_apply";
  const rawFrequency = text(form, "report_frequency");
  const reportFrequency = rawFrequency && frequencies.has(rawFrequency) ? rawFrequency : "daily";
  const rawLinkedinMode = text(form, "linkedin_sync_mode");
  const linkedinSyncMode = rawLinkedinMode && linkedinModes.has(rawLinkedinMode) ? rawLinkedinMode : "review_first";
  const autoPrepare = number(form, "auto_prepare_threshold", 0, 100) ?? 75;
  const strongMatch = number(form, "strong_match_threshold", 0, 100) ?? 85;
  const autoSkip = number(form, "auto_skip_threshold", 0, 100) ?? 60;
  if (!(autoSkip <= autoPrepare && autoPrepare <= strongMatch)) redirect("/job-agent?error=thresholds");

  const minimumSalary = number(form, "minimum_salary", 0, 1000000000);
  const preferredSalary = number(form, "preferred_salary", 0, 1000000000);
  if (minimumSalary !== null && preferredSalary !== null && preferredSalary < minimumSalary) redirect("/job-agent?error=salary");

  const timezone = text(form, "timezone") ?? "UTC";
  const profileLanguages = list(form, "profile_languages");
  const effectiveLanguages = profileLanguages.length ? profileLanguages : (existingProfileResult.data?.languages ?? []);
  const notificationChannels = form.getAll("notification_channels").map(String).filter((channel) => ["in_app", "email", "push"].includes(channel));
  const workplacePreferences = form.getAll("workplace_preferences").map(String).filter((value) => ["remote", "hybrid", "on_site"].includes(value));
  const employmentTypes = form.getAll("employment_types").map(String).filter((value) => ["full_time", "part_time", "contract", "freelance", "internship", "permanent"].includes(value));

  const payload = {
    user_id: user.id,
    status: "active",
    automation_mode: automationMode,
    primary_career: text(form, "primary_career"),
    secondary_careers: list(form, "secondary_careers"),
    desired_titles: list(form, "desired_titles"),
    adjacent_roles: list(form, "adjacent_roles"),
    excluded_roles: list(form, "excluded_roles"),
    min_seniority: text(form, "min_seniority"),
    max_seniority: text(form, "max_seniority"),
    search_countries: normalizeCountries(list(form, "search_countries")),
    excluded_countries: normalizeCountries(list(form, "excluded_countries")),
    cities_regions: list(form, "cities_regions"),
    max_commute_minutes: number(form, "max_commute_minutes", 0, 360),
    workplace_preferences: workplacePreferences,
    willing_to_relocate: form.has("willing_to_relocate") ? checked(form, "willing_to_relocate") : null,
    relocation_countries: normalizeCountries(list(form, "relocation_countries")),
    english_only_priority: checked(form, "english_only_priority"),
    exclude_unknown_languages: checked(form, "exclude_unknown_languages"),
    work_authorization: text(form, "work_authorization"),
    sponsorship_requirement: text(form, "sponsorship_requirement"),
    notice_period: text(form, "notice_period"),
    earliest_start_date: text(form, "earliest_start_date"),
    employment_types: employmentTypes,
    industries: list(form, "industries"),
    preferred_companies: list(form, "preferred_companies"),
    excluded_companies: list(form, "excluded_companies"),
    minimum_salary: minimumSalary,
    preferred_salary: preferredSalary,
    salary_currency: text(form, "salary_currency"),
    salary_negotiable: form.has("salary_negotiable") ? checked(form, "salary_negotiable") : null,
    auto_prepare_threshold: autoPrepare,
    strong_match_threshold: strongMatch,
    auto_skip_threshold: autoSkip,
    automatically_send_email_applications: checked(form, "automatically_send_email_applications"),
    never_submit_ats_automatically: checked(form, "never_submit_ats_automatically"),
    ask_before_startups: checked(form, "ask_before_startups"),
    report_frequency: reportFrequency,
    report_time: text(form, "report_time"),
    timezone,
    notification_channels: notificationChannels.length ? notificationChannels : ["in_app"],
    immediate_high_fit_threshold: number(form, "immediate_high_fit_threshold", 0, 100) ?? 90,
    linkedin_url: text(form, "linkedin_url"),
    linkedin_sync_mode: linkedinSyncMode,
    onboarding_completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const criteriaChanged = !existingAgentResult.data || criteriaSnapshot(existingAgentResult.data, existingProfileResult.data?.languages ?? []) !== criteriaSnapshot(payload, effectiveLanguages);

  const result = await supabase.from("job_agents").upsert(payload, { onConflict: "user_id" });
  if (result.error) {
    console.error("saveJobAgent failed", { code: result.error.code, message: result.error.message, userId: user.id });
    redirect("/job-agent?error=save");
  }

  if (profileLanguages.length) await supabase.from("profiles").update({ languages: profileLanguages }).eq("id", user.id);

  if (criteriaChanged) {
    const reason = "Job Agent search criteria changed. Run a new search to re-evaluate this vacancy.";
    await Promise.all([
      supabase.from("job_opportunities").update({ status: "skipped", recommendation: "skip", skip_reason: reason, updated_at: new Date().toISOString() }).eq("user_id", user.id),
      supabase.from("applications").update({ next_action: "Search criteria changed. Re-check this vacancy against the current Job Agent settings before continuing.", updated_at: new Date().toISOString() }).eq("user_id", user.id).in("status", ["preparing", "ready_for_review", "ready_for_submit", "ats_pack_manual_finalization"]),
    ]);
  }

  await supabase.from("user_activity").insert({ user_id: user.id, action: "job_agent_configured", metadata: { mode: automationMode, criteria_changed: criteriaChanged } });
  revalidatePath("/job-agent");
  redirect(`/job-agent?saved=1${criteriaChanged ? "&criteria_changed=1" : ""}`);
}

export async function setJobAgentStatus(form: FormData) {
  const user = await requireUser("/job-agent");
  const supabase = await createClient();
  const status = text(form, "status") === "paused" ? "paused" : "active";
  const result = await supabase.from("job_agents").update({ status, updated_at: new Date().toISOString() }).eq("user_id", user.id);
  if (result.error) redirect("/job-agent?error=status");
  await supabase.from("user_activity").insert({ user_id: user.id, action: status === "paused" ? "job_agent_paused" : "job_agent_resumed" });
  revalidatePath("/job-agent");
  redirect(`/job-agent?status=${status}`);
}
