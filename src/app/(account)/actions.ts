"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { JobSearchRegion } from "@/types/identity";

const regions = new Set<JobSearchRegion>(["country", "european_union", "remote", "worldwide"]);
const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim() || null;
const list = (form: FormData, key: string) => String(form.get(key) ?? "").split(",").map((value) => value.trim()).filter(Boolean).slice(0, 50);

export async function logout() {
  const user = await requireUser(); const supabase = await createClient();
  await supabase.from("user_activity").insert({ user_id: user.id, action: "logout" });
  await supabase.auth.signOut(); redirect("/");
}

export async function completeOnboarding() {
  const user = await requireUser("/onboarding");
  const supabase = await createClient();
  const metadata = user.user_metadata ?? {};
  const completedAt = new Date().toISOString();

  // Upsert instead of update so OAuth users created before the identity trigger
  // was deployed can still complete onboarding safely.
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email ?? `${user.id}@users.invalid`,
    name: metadata.full_name ?? metadata.name ?? metadata.user_name ?? null,
    avatar_url: metadata.avatar_url ?? metadata.picture ?? null,
    provider: user.app_metadata?.provider ?? null,
    onboarding_completed_at: completedAt,
  }, { onConflict: "id" });

  if (error) {
    console.error("completeOnboarding profile upsert failed", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      userId: user.id,
    });
    redirect(`/onboarding?error=save&code=${encodeURIComponent(error.code ?? "unknown")}`);
  }

  // Repair the dependent preference row for accounts created before provisioning.
  const { error: preferenceError } = await supabase.from("user_preferences").upsert(
    { user_id: user.id },
    { onConflict: "user_id", ignoreDuplicates: true },
  );
  if (preferenceError) {
    console.error("completeOnboarding preference repair failed", {
      code: preferenceError.code,
      message: preferenceError.message,
      userId: user.id,
    });
  }

  await supabase.from("user_activity").insert({ user_id: user.id, action: "onboarding_completed" });
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  redirect("/dashboard");
}

export async function saveProfile(form: FormData) {
  const user = await requireUser("/profile"); const supabase = await createClient();
  const rawYears = text(form, "years_experience");
  const years = rawYears === null ? null : Number(rawYears);
  if (years !== null && (!Number.isFinite(years) || years < 0 || years > 80)) redirect("/profile?error=experience");
  const rawRegion = text(form, "job_search_region");
  const region = rawRegion && regions.has(rawRegion as JobSearchRegion) ? rawRegion as JobSearchRegion : null;
  const country = text(form, "job_search_country");
  if (region === "country" && !country) redirect("/profile?error=country");
  const profileResult = await supabase.from("profiles").update({ name: text(form, "name"), current_country: text(form, "current_country"),
    current_position: text(form, "current_position"), years_experience: years, skills: list(form, "skills"),
    certificates: list(form, "certificates"), languages: list(form, "languages"), target_career: text(form, "target_career") }).eq("id", user.id);
  if (profileResult.error) redirect("/profile?error=save");
  const preferenceResult = await supabase.from("user_preferences").update({ job_search_region: region, job_search_country: region === "country" ? country : null }).eq("user_id", user.id);
  if (preferenceResult.error) redirect("/profile?error=save");
  await supabase.from("user_activity").insert({ user_id: user.id, action: "profile_updated" });
  revalidatePath("/dashboard"); revalidatePath("/profile"); redirect("/profile?saved=1");
}
