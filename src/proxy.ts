import { NextResponse, type NextRequest } from "next/server";
import {
  accessTokenNeedsRefresh,
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  sessionCookieOptions,
} from "@/lib/admin/adminSession";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();

  const accessToken = request.cookies.get(ADMIN_ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(ADMIN_REFRESH_COOKIE)?.value;
  if (!accessTokenNeedsRefresh(accessToken) || !refreshToken) return NextResponse.next();

  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_KEY;
  if (!url || !secretKey) return NextResponse.next();

  const authResponse = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { apikey: secretKey, "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
  }).catch(() => null);
  const response = NextResponse.next();
  if (!authResponse?.ok) {
    response.cookies.delete(ADMIN_ACCESS_COOKIE);
    response.cookies.delete(ADMIN_REFRESH_COOKIE);
    return response;
  }

  const session = (await authResponse.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
  if (!session.access_token || !session.refresh_token) {
    response.cookies.delete(ADMIN_ACCESS_COOKIE);
    response.cookies.delete(ADMIN_REFRESH_COOKIE);
    return response;
  }

  const secure = process.env.NODE_ENV === "production";
  response.cookies.set(
    ADMIN_ACCESS_COOKIE,
    session.access_token,
    sessionCookieOptions(secure, session.expires_in ?? 3600),
  );
  response.cookies.set(ADMIN_REFRESH_COOKIE, session.refresh_token, sessionCookieOptions(secure));
  return response;
}

export const config = { matcher: ["/admin/:path*"] };
