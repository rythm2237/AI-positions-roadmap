export interface AdminUser { id: string; email: string | null }
export type AdminAuthorization = { status: "admin"; user: AdminUser; accessToken: string } | { status: "unauthenticated" } | { status: "forbidden"; user: AdminUser };

export function evaluateAdminAuthorization(accessToken: string | undefined, user: AdminUser | null, roles: string[]): AdminAuthorization {
  if (!accessToken || !user) return { status: "unauthenticated" };
  return roles.includes("admin") ? { status: "admin", user, accessToken } : { status: "forbidden", user };
}

export function safeAdminReturnUrl(value: string | null | undefined) {
  return value?.startsWith("/admin") && !value.startsWith("//") ? value : "/admin";
}
