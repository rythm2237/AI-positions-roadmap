import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeInternalRedirect } from "@/lib/auth/redirects";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeInternalRedirect(request.nextUrl.searchParams.get("next"));
  if (!code) return NextResponse.redirect(new URL("/login?error=callback", request.url));
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=callback", request.url));
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login?error=session", request.url));
  await supabase.from("user_activity").insert({ user_id: user.id, action: "login" });
  const { data: profile } = await supabase.from("profiles").select("onboarding_completed_at").eq("id", user.id).single();
  return NextResponse.redirect(new URL(profile?.onboarding_completed_at ? next : "/onboarding", request.url));
}

