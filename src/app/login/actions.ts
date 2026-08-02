"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeInternalRedirect } from "@/lib/auth/redirects";

export async function signInWithOAuth(provider: "google" | "github", returnTo: string) {
  const supabase = await createClient();
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  if (!origin) redirect("/login?error=origin");
  const next = safeInternalRedirect(returnTo);
  const { data, error } = await supabase.auth.signInWithOAuth({ provider, options: {
    redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
  } });
  if (error || !data.url) redirect("/login?error=oauth");
  redirect(data.url);
}
