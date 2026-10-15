import type { SupabaseClient } from "@supabase/supabase-js";
import { safeInternalRedirect } from "./redirects";

export type PasswordMode = "login" | "signup" | "forgot" | "reset";
export interface AuthFormState { error?: string; message?: string; destination?: string }
type AuthClient = Pick<SupabaseClient, "auth" | "from">;

export async function accountDestination(client: AuthClient, userId: string, next: string) {
  const { data } = await client.from("profiles").select("onboarding_completed_at").eq("id", userId).single();
  return data?.onboarding_completed_at ? safeInternalRedirect(next) : "/onboarding";
}

// Never return provider diagnostics, passwords or account-existence information to forms.
export async function runPasswordFlow(client: AuthClient, mode: PasswordMode, form: FormData, origin: string): Promise<AuthFormState> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const next = safeInternalRedirect(String(form.get("next") ?? ""));
  if (mode !== "reset" && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)) return { error: "Enter a valid email address." };
  if (mode !== "forgot" && (!password || password.length > 128)) return { error: "Enter a password of up to 128 characters." };
  if ((mode === "signup" || mode === "reset") && password.length < 8) return { error: "Use at least 8 characters for your password." };
  if ((mode === "signup" || mode === "reset") && password !== String(form.get("confirmPassword") ?? "")) return { error: "The passwords do not match." };

  if (mode === "login") {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error || !data.user || !data.session) return { error: "Sign-in failed. Check your email and password, and confirm your email before signing in." };
    return { destination: await accountDestination(client, data.user.id, next) };
  }
  if (mode === "signup") {
    const { data, error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` } });
    if (error) return { error: error.status === 429 ? "Too many requests. Please wait before trying again." : "Sign-up could not be completed. Check the password requirements or try signing in or resetting your password if you already have an account." };
    if (data.session && data.user) return { destination: await accountDestination(client, data.user.id, next) };
    return { message: "If this address can be registered, a confirmation email will arrive shortly. Open it to finish signing up. Already registered? Sign in or reset your password. Open the link in this browser." };
  }
  if (mode === "forgot") {
    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/callback?next=%2Freset-password` });
    if (error && error.code !== "user_not_found") return { error: error.status === 429 ? "Too many requests. Please wait before requesting another email." : "The reset email could not be requested right now. Please try again later." };
    return { message: "If an account exists for this email, you will receive a password reset link. Open the latest email link to choose your new password. You can open it on another device or in your mail app. Check your spam folder too." };
  }
  const { data: { user }, error: sessionError } = await client.auth.getUser();
  if (sessionError || !user) return { error: "Your reset session has expired. Request a new password reset link." };
  const { error } = await client.auth.updateUser({ password });
  if (error) return { error: "Your password could not be updated. Use a different password or request a new reset link." };
  await client.auth.signOut({ scope: "local" });
  return { destination: "/login?message=password-updated" };
}
