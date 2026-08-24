"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { JobSearchRegion } from "@/types/identity";

const regions = new Set<JobSearchRegion>(["country", "european_union", "remote", "worldwide"]);
const journeyModes = new Set(["learn_and_build", "ready_to_apply"] as const);
const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim() || null;
const list = (form: FormData, key: string) => String(form.get(key) ?? "").split(",").map((value) => value.trim()).filter(Boolean).slice(0, 50);

export async function logout() { const user = await requireUser(); const supabase = await createClient(); await supabase.from("user_activity").insert({ user_id: user.id, action: "logout" }); await supabase.auth.signOut(); redirect("/"); }

export async function completeOnboarding(form?: FormData) {
  const user = await requireUser("/onboarding"); const supabase = await createClient(); const metadata = user.user_metadata ?? {}; const completedAt = new Date().toISOString();
  const requested = form ? text(form, "journey_mode") : null;
  const journeyMode = requested && journeyModes.has(requested as "learn_and_build" | "ready_to_apply") ? requested : "learn_and_build";
  const { error } = await supabase.from("profiles").upsert({ id: user.id, email: user.email ?? `${user.id}@users.invalid`, name: metadata.full_name ?? metadata.name ?? metadata.user_name ?? null, avatar_url: metadata.avatar_url ?? metadata.picture ?? null, provider: user.app_metadata?.provider ?? null, onboarding_completed_at: completedAt }, { onConflict: "id" });
  if (error) redirect(`/onboarding?error=save&code=${encodeURIComponent(error.code ?? "unknown")}`);
  const { error: preferenceError } = await supabase.from("user_preferences").upsert({ user_id: user.id, journey_mode: journeyMode }, { onConflict: "user_id" });
  if (preferenceError) redirect(`/onboarding?error=save&code=${encodeURIComponent(preferenceError.code ?? "unknown")}`);
  await supabase.from("user_activity").insert({ user_id: user.id, action: "onboarding_completed", metadata: { journey_mode: journeyMode } });
  revalidatePath("/dashboard"); revalidatePath("/profile");
  redirect(journeyMode === "ready_to_apply" ? "/job-search-mode?welcome=1" : "/#career-universe");
}

export async function setJourneyMode(form: FormData) {
  const user = await requireUser("/dashboard"); const supabase = await createClient(); const requested = text(form, "journey_mode");
  if (!requested || !journeyModes.has(requested as "learn_and_build" | "ready_to_apply")) redirect("/dashboard?error=journey-mode");
  const result = await supabase.from("user_preferences").upsert({ user_id: user.id, journey_mode: requested }, { onConflict: "user_id" });
  if (result.error) redirect("/dashboard?error=journey-mode");
  await supabase.from("user_activity").insert({ user_id: user.id, action: "journey_mode_changed", metadata: { journey_mode: requested } });
  revalidatePath("/dashboard"); redirect(requested === "ready_to_apply" ? "/job-search-mode" : "/#career-universe");
}

export async function saveProfile(form: FormData) {
  const user = await requireUser("/profile"); const supabase = await createClient(); const rawYears = text(form, "years_experience"); const years = rawYears === null ? null : Number(rawYears);
  if (years !== null && (!Number.isFinite(years) || years < 0 || years > 80)) redirect("/profile?error=experience");
  const rawRegion = text(form, "job_search_region"); const region = rawRegion && regions.has(rawRegion as JobSearchRegion) ? rawRegion as JobSearchRegion : null; const country = text(form, "job_search_country");
  if (region === "country" && !country) redirect("/profile?error=country");
  const profileResult = await supabase.from("profiles").update({ name: text(form, "name"), current_country: text(form, "current_country"), current_position: text(form, "current_position"), years_experience: years, skills: list(form, "skills"), certificates: list(form, "certificates"), languages: list(form, "languages"), target_career: text(form, "target_career") }).eq("id", user.id);
  if (profileResult.error) redirect("/profile?error=save");
  const preferenceResult = await supabase.from("user_preferences").update({ job_search_region: region, job_search_country: region === "country" ? country : null }).eq("user_id", user.id);
  if (preferenceResult.error) redirect("/profile?error=save");
  await supabase.from("user_activity").insert({ user_id: user.id, action: "profile_updated" }); revalidatePath("/dashboard"); revalidatePath("/profile"); redirect("/profile?saved=1");
}
