import type { User } from "@supabase/supabase-js";

export type RolePathPlan = "free" | "pro";

export const FREE_OUTCOMES = [
  "Career discovery and career intelligence",
  "Starting profile and baseline skill diagnostic",
  "Skill-gap summary and readiness preview",
  "Roadmap preview and next-best-action guidance",
] as const;

export const PRO_OUTCOMES = [
  "Full guided roadmap execution",
  "AI-reviewed project evidence and proof-of-skill portfolio",
  "Job matching, JD gap analysis and application assets",
  "Scored mock interviews and interview readiness",
  "Application tracking, follow-up and progress loops",
] as const;

export const ACTIVATION_STEPS = [
  { id: "diagnostic", label: "Complete your baseline skill diagnostic" },
  { id: "target", label: "Confirm your target role and weekly capacity" },
  { id: "roadmap", label: "Open your recommended starting stage" },
  { id: "project", label: "Choose your first proof-of-skill project" },
] as const;

export function resolveRolePathPlan(user: User | null | undefined): RolePathPlan {
  const raw = String(user?.app_metadata?.role_path_plan ?? "").toLowerCase();
  return raw === "pro" || raw === "paid" ? "pro" : "free";
}

export function activationStorageKey(userId: string, careerSlug: string): string {
  return `career_activation__${userId}__${careerSlug}`;
}
