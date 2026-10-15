import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeInternalRedirect } from "@/lib/auth/redirects";
import { accountDestination } from "@/lib/auth/password";

// Supports Supabase token-hash email templates, including links opened on another device.
export async function GET(request: NextRequest) {
  const token_hash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  if (!token_hash || (type !== "email" && type !== "signup" && type !== "recovery")) return NextResponse.redirect(new URL("/login?error=callback", request.url));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({ token_hash, type });
  if (error || !data.user) return NextResponse.redirect(new URL(type === "recovery" ? "/forgot-password?error=expired" : "/login?error=callback", request.url));
  const destination = type === "recovery" ? "/reset-password" : await accountDestination(supabase, data.user.id, safeInternalRedirect(request.nextUrl.searchParams.get("next")));
  return NextResponse.redirect(new URL(destination, request.url));
}
