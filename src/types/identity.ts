export type SubscriptionPlan = "free" | "pro" | "enterprise";
export type JobSearchRegion = "country" | "european_union" | "remote" | "worldwide";

export interface Profile {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  provider: string | null;
  current_country: string | null;
  current_position: string | null;
  years_experience: number | null;
  skills: string[];
  certificates: string[];
  languages: string[];
  target_career: string | null;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResumeRecord {
  id: string; title: string; target_career: string | null; version: number;
  file_type: "pdf" | "doc" | "docx"; storage_path: string; uploaded_at: string;
}
export interface SavedCareer { id: string; career_slug: string; created_at: string }
export interface UserActivity { id: string; action: string; metadata: Record<string, unknown>; created_at: string }
