"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authorizeAdminWithToken, safeAdminReturnUrl, signInAdmin } from "@/lib/admin/adminAuth";
import { ADMIN_ACCESS_COOKIE, ADMIN_REFRESH_COOKIE, sessionCookieOptions } from "@/lib/admin/adminSession";

export interface LoginState { error?: string }
export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const returnTo = safeAdminReturnUrl(String(formData.get("returnTo") ?? "/admin"));
  if (!email || !password) return { error: "Enter your email and password." };
  const session = await signInAdmin(email, password).catch(() => null);
  if (!session) return { error: "Sign-in failed. Check your credentials." };
  const authorization = await authorizeAdminWithToken(session.accessToken).catch(() => ({ status: "unauthenticated" as const }));
  if (authorization.status !== "admin") return { error: authorization.status === "forbidden" ? "Your account does not have Admin Studio access." : "Sign-in could not be verified." };
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_ACCESS_COOKIE, session.accessToken, sessionCookieOptions(process.env.NODE_ENV === "production", session.expiresIn));
  cookieStore.set(ADMIN_REFRESH_COOKIE, session.refreshToken, sessionCookieOptions(process.env.NODE_ENV === "production"));
  redirect(returnTo);
}

export async function logoutAction() { const cookieStore = await cookies(); cookieStore.delete(ADMIN_ACCESS_COOKIE); cookieStore.delete(ADMIN_REFRESH_COOKIE); redirect("/admin/login"); }
