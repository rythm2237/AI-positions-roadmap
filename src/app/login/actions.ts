"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { safeInternalRedirect } from "@/lib/auth/redirects";
import { seoConfig } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";

export async function signInWithOAuth(provider: "google" | "github", returnTo: string) {
  const supabase = await createClient();
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  if (!origin) redirect("/login?error=origin");

  const next = safeInternalRedirect(returnTo);
  const isProduction = process.env.VERCEL_ENV
    ? process.env.VERCEL_ENV === "production"
    : process.env.NODE_ENV === "production";
  const callbackOrigin = isProduction ? seoConfig.siteUrl : origin;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${callbackOrigin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data.url) redirect("/login?error=oauth");
  redirect(data.url);
}

export async function signInWithPreviewCredentials(formData: FormData, returnTo: string) {
  if (
    process.env.VERCEL_ENV !== "preview" ||
    process.env.JOB_DISCOVERY_E2E_LOGIN_ENABLED !== "true"
  ) {
    redirect("/login?error=preview_credentials_disabled");
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) redirect("/login?error=preview_credentials");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) redirect("/login?error=preview_credentials");

  await supabase.from("user_activity").insert({ user_id: data.user.id, action: "login" });
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed_at")
    .eq("id", data.user.id)
    .single();

  redirect(profile?.onboarding_completed_at ? safeInternalRedirect(returnTo) : "/onboarding");
}
