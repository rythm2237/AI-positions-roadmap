import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { GUEST_COOKIE, GUEST_COOKIE_OPTIONS, parseGuestCookie } from "@/lib/ai-workspace/guestCredentials";
import { WorkspaceError } from "@/lib/ai-workspace/contracts";
import { apiError, assertSameOrigin, noStoreJson } from "@/lib/ai-workspace/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    assertSameOrigin(request);
    const cookieStore = await cookies();
    const guest = parseGuestCookie(cookieStore.get(GUEST_COOKIE)?.value);
    const service = createServiceClient();
    const { data: ownerId, error: guestError } = await service.rpc("aiw_validate_guest_session", {
      p_session_hash: guest.sessionHash,
      p_device_hash: guest.deviceHash,
    });
    if (guestError || typeof ownerId !== "string") throw new WorkspaceError("UNAUTHENTICATED", 401);

    const auth = await createClient();
    const { data, error } = await auth.auth.getUser();
    if (error || !data.user) throw new WorkspaceError("REGISTERED_LOGIN_REQUIRED", 401);

    const { data: converted, error: convertError } = await service.rpc("aiw_convert_guest_to_registered", {
      p_owner: ownerId,
      p_user: data.user.id,
      p_session_hash: guest.sessionHash,
      p_device_hash: guest.deviceHash,
    });
    if (convertError || converted !== true) throw new WorkspaceError("GUEST_CONVERSION_FAILED", 409);
    const response = noStoreJson({ converted: true, ownerId, requestId });
    response.cookies.set(GUEST_COOKIE, "", { ...GUEST_COOKIE_OPTIONS, maxAge: 0 });
    return response;
  } catch (error) {
    return apiError(error, requestId);
  }
}
