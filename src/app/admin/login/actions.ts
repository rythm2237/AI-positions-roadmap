"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_ACCESS_COOKIE, authorizeAdminWithToken, safeAdminReturnUrl, signInAdmin } from "@/lib/admin/adminAuth";

export interface LoginState { error?: string }
export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const returnTo = safeAdminReturnUrl(String(formData.get("returnTo") ?? "/admin"));
  if (!email || !password) return { error: "Enter your email and password." };
  const accessToken = await signInAdmin(email, password).catch(() => null);
  if (!accessToken) return { error: "Sign-in failed. Check your credentials." };
  const authorization = await authorizeAdminWithToken(accessToken).catch(() => ({ status: "unauthenticated" as const }));
  if (authorization.status !== "admin") return { error: authorization.status === "forbidden" ? "Your account does not have Admin Studio access." : "Sign-in could not be verified." };
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_ACCESS_COOKIE, accessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 3600 });
  redirect(returnTo);
}

export async function logoutAction() { const cookieStore = await cookies(); cookieStore.delete(ADMIN_ACCESS_COOKIE); redirect("/admin/login"); }
