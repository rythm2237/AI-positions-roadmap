import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { ensureRegisteredWorkspaceOwner } from "./supabaseStore";
import { GUEST_COOKIE, parseGuestCookie } from "./guestCredentials";
import { WorkspaceError } from "./contracts";

export interface WorkspacePrincipal {
  userId: string | null;
  ownerId: string;
  service: SupabaseClient;
  kind: "registered" | "guest";
  deviceHash: string | null;
  sessionHash: string | null;
}

/** Historical name kept for route compatibility; now accepts either a registered account or a valid guest session. */
export async function requireRegisteredWorkspacePrincipal(): Promise<WorkspacePrincipal> {
  const service = createServiceClient();
  const auth = await createClient();
  const { data } = await auth.auth.getUser();
  if (data.user) {
    const ownerId = await ensureRegisteredWorkspaceOwner(data.user.id, service);
    return { userId: data.user.id, ownerId, service, kind: "registered", deviceHash: null, sessionHash: null };
  }

  const cookieStore = await cookies();
  let guest: ReturnType<typeof parseGuestCookie>;
  try {
    guest = parseGuestCookie(cookieStore.get(GUEST_COOKIE)?.value);
  } catch {
    throw new WorkspaceError("UNAUTHENTICATED", 401);
  }
  const { data: ownerId, error } = await service.rpc("aiw_validate_guest_session", {
    p_session_hash: guest.sessionHash,
    p_device_hash: guest.deviceHash,
  });
  if (error || typeof ownerId !== "string") throw new WorkspaceError("UNAUTHENTICATED", 401);
  return { userId: null, ownerId, service, kind: "guest", deviceHash: guest.deviceHash, sessionHash: guest.sessionHash };
}

export async function requireWorkspacePrincipal(): Promise<WorkspacePrincipal> {
  return requireRegisteredWorkspacePrincipal();
}

export function assertSameOrigin(request: Request): void {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  const site = request.headers.get("sec-fetch-site");
  if (!origin || origin !== requestUrl.origin || (site && site !== "same-origin" && site !== "none")) {
    throw new WorkspaceError("CSRF_REJECTED", 403);
  }
}

export async function readJson<T>(request: Request, maxBytes = 32768): Promise<T> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declared) && declared > maxBytes) throw new WorkspaceError("REQUEST_TOO_LARGE", 413);
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) throw new WorkspaceError("REQUEST_TOO_LARGE", 413);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new WorkspaceError("INVALID_JSON", 400);
  }
}

export async function enforceWorkspaceRateLimit(service: SupabaseClient, key: string, limit: number): Promise<void> {
  const { data, error } = await service.rpc("aiw_rate", { p_key: key, p_limit: limit });
  if (error) throw new WorkspaceError("RATE_LIMIT_UNAVAILABLE", 503);
  if (data !== true) throw new WorkspaceError("RATE_LIMITED", 429);
}

export function apiError(error: unknown, requestId?: string): NextResponse {
  const known = error instanceof WorkspaceError;
  const code = known ? error.code : "INTERNAL_ERROR";
  const status = known ? error.status : 500;
  if (!known) console.error("AI Workspace API error", error);
  return NextResponse.json({ error: code, requestId }, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export function noStoreJson(body: unknown, init?: ResponseInit): NextResponse {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
