export const ADMIN_ACCESS_COOKIE = "career_os_admin_access";
export const ADMIN_REFRESH_COOKIE = "career_os_admin_refresh";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export function accessTokenNeedsRefresh(token: string | undefined, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (!token) return true;
  try {
    const encoded=(token.split(".")[1]??"").replace(/-/g,"+").replace(/_/g,"/");
    const payload = JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length/4)*4,"="))) as { exp?: number };
    return !payload.exp || payload.exp <= nowSeconds + 300;
  } catch { return true; }
}

export function sessionCookieOptions(production: boolean, maxAge = ADMIN_COOKIE_MAX_AGE) {
  return { httpOnly: true as const, secure: production, sameSite: "lax" as const, path: "/", maxAge };
}
