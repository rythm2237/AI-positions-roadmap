import { NextResponse, type NextRequest } from "next/server";
import {
  accessTokenNeedsRefresh,
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  sessionCookieOptions,
} from "@/lib/admin/adminSession";
import { PUBLIC_BETA } from "@/config/publicBeta";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const protectedAccountRoute = pathname === "/dashboard" || pathname.startsWith("/profile") || pathname.startsWith("/onboarding");
  const isPublicIntelligenceRoute =
    pathname.startsWith("/career-intelligence") ||
    pathname.startsWith("/api/career-intelligence") ||
    /^\/careers\/[^/]+\/intelligence(?:\/|$)/.test(pathname);
  const isLegacyBetaRoute =
    pathname === "/career-dashboard" ||
    pathname.startsWith("/roadmap/") ||
    pathname.startsWith("/roadmaps/") ||
    pathname.startsWith("/careers/ai-data-engineer");

  if ((!PUBLIC_BETA.publicCareerIntelligence && isPublicIntelligenceRoute) || isLegacyBetaRoute) {
    return new NextResponse(null, { status: 404 });
  }

  if (protectedAccountRoute) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !publishableKey) return NextResponse.redirect(new URL("/login?error=configuration", request.url));
    let accountResponse = NextResponse.next({ request });
    const supabase = createServerClient(url, publishableKey, { cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (items) => {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        accountResponse = NextResponse.next({ request });
        items.forEach(({ name, value, options }) => accountResponse.cookies.set(name, value, options));
      },
    } });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(login);
    }
    return accountResponse;
  }

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

export const config = {
  matcher: [
    "/admin/:path*",
    "/career-intelligence/:path*",
    "/api/career-intelligence/:path*",
    "/careers/:path*/intelligence/:path*",
    "/career-dashboard",
    "/roadmap/:path*",
    "/roadmaps/:path*",
    "/careers/ai-data-engineer/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/onboarding/:path*",
  ],
};
