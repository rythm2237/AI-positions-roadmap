import { createServiceClient } from "@/lib/supabase/admin";
import { GUEST_COOKIE, GUEST_COOKIE_OPTIONS, generateDeviceCredential, generateGuestSessionCredential, hashGuestCode, serializeGuestCookie } from "@/lib/ai-workspace/guestCredentials";
import { WorkspaceError } from "@/lib/ai-workspace/contracts";
import { apiError, assertSameOrigin, enforceWorkspaceRateLimit, noStoreJson, readJson } from "@/lib/ai-workspace/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    assertSameOrigin(request);
    const body = await readJson<{ code?: unknown }>(request, 2048);
    if (typeof body.code !== "string") throw new WorkspaceError("INVALID_INVITATION", 403);
    const codeHash = hashGuestCode(body.code);
    const service = createServiceClient();
    await enforceWorkspaceRateLimit(service, `guest:activate:${codeHash.slice(0, 20)}`, 8);
    const device = generateDeviceCredential();
    const session = generateGuestSessionCredential();
    const { data, error } = await service.rpc("aiw_activate_guest_session", {
      p_code_hash: codeHash,
      p_device_hash: device.hash,
      p_session_hash: session.hash,
    });
    if (error || !data || typeof data !== "object") throw new WorkspaceError("INVALID_INVITATION", 403);
    const value = data as { ownerId?: unknown; projectId?: unknown; conversationId?: unknown };
    if (typeof value.ownerId !== "string" || typeof value.projectId !== "string" || typeof value.conversationId !== "string") {
      throw new WorkspaceError("GUEST_ACTIVATION_FAILED", 503);
    }
    const response = noStoreJson({
      access: "guest",
      projectId: value.projectId,
      conversationId: value.conversationId,
      requestId,
    }, { status: 201 });
    response.cookies.set(GUEST_COOKIE, serializeGuestCookie(device.credential, session.credential), {
      ...GUEST_COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60,
    });
    return response;
  } catch (error) {
    return apiError(error, requestId);
  }
}
