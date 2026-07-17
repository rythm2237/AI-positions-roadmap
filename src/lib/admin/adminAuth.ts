import "server-only";
import { cookies } from "next/headers";
import { supabaseServerConfig, supabaseUserFetch } from "@/lib/admin/supabaseServer";
import { evaluateAdminAuthorization, safeAdminReturnUrl, type AdminAuthorization } from "@/lib/admin/adminAuthorization";
import { ADMIN_ACCESS_COOKIE } from "@/lib/admin/adminSession";

export { safeAdminReturnUrl } from "@/lib/admin/adminAuthorization";

export async function signInAdmin(email: string, password: string) {
  const { url, secretKey } = supabaseServerConfig();
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: secretKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  if (!response.ok) return null;
  const body = await response.json() as { access_token?: string; refresh_token?: string; expires_in?: number };
  return body.access_token && body.refresh_token ? { accessToken: body.access_token, refreshToken: body.refresh_token, expiresIn: body.expires_in ?? 3600 } : null;
}

export async function authorizeAdminWithToken(accessToken: string | undefined): Promise<AdminAuthorization> {
  if (!accessToken) return { status: "unauthenticated" };
  const userResponse = await supabaseUserFetch("/auth/v1/user", accessToken);
  if (!userResponse.ok) return { status: "unauthenticated" };
  const userBody = await userResponse.json() as { id?: string; email?: string | null };
  if (!userBody.id) return { status: "unauthenticated" };
  const user = { id: userBody.id, email: userBody.email ?? null };
  const roleResponse = await supabaseUserFetch(`/rest/v1/app_user_roles?user_id=eq.${encodeURIComponent(user.id)}&role=eq.admin&select=role&limit=1`, accessToken);
  if (!roleResponse.ok) return { status: "forbidden", user };
  const roles = await roleResponse.json() as Array<{ role: string }>;
  return evaluateAdminAuthorization(accessToken, user, roles.map((role) => role.role));
}

export async function requireAdmin(): Promise<AdminAuthorization> {
  const cookieStore = await cookies();
  return authorizeAdminWithToken(cookieStore.get(ADMIN_ACCESS_COOKIE)?.value);
}
