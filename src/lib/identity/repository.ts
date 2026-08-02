import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Profile, ResumeRecord, SavedCareer, UserActivity } from "@/types/identity";

export async function getIdentityWorkspace(user: User) {
  const supabase = await createClient();
  const [profile, preferences, resumes, savedCareers, subscription, activity] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single<Profile>(),
    supabase.from("user_preferences").select("job_search_region,job_search_country").eq("user_id", user.id).maybeSingle(),
    supabase.from("resumes").select("id,title,target_career,version,file_type,storage_path,uploaded_at").order("uploaded_at", { ascending: false }).returns<ResumeRecord[]>(),
    supabase.from("saved_careers").select("id,career_slug,created_at").order("created_at", { ascending: false }).returns<SavedCareer[]>(),
    supabase.from("subscriptions").select("plan,status").eq("user_id", user.id).maybeSingle(),
    supabase.from("user_activity").select("id,action,metadata,created_at").order("created_at", { ascending: false }).limit(8).returns<UserActivity[]>(),
  ]);
  if (profile.error) throw profile.error;
  return { profile: profile.data, preferences: preferences.data, resumes: resumes.data ?? [], savedCareers: savedCareers.data ?? [], subscription: subscription.data, activity: activity.data ?? [] };
}

export function profileCompletion(profile: Profile) {
  const checks = [profile.name, profile.avatar_url, profile.current_country, profile.current_position,
    profile.years_experience !== null, profile.skills.length, profile.certificates.length, profile.languages.length, profile.target_career];
  return Math.round(checks.filter(Boolean).length / checks.length * 100);
}

export function careerReadiness(profile: Profile, hasResume: boolean, hasJobPreferences: boolean) {
  const checks = [Boolean(profile.name && profile.current_position), hasResume, Boolean(profile.target_career),
    profile.skills.length > 0, profile.certificates.length > 0, hasJobPreferences];
  return Math.round(checks.filter(Boolean).length / checks.length * 100);
}
