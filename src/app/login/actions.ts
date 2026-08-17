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
