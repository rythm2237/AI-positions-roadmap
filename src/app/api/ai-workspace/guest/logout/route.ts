import { cookies } from "next/headers";
import { GUEST_COOKIE, GUEST_COOKIE_OPTIONS, parseGuestCookie } from "@/lib/ai-workspace/guestCredentials";
import { createServiceClient } from "@/lib/supabase/admin";
import { apiError, assertSameOrigin, noStoreJson } from "@/lib/ai-workspace/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    assertSameOrigin(request);
    const cookieStore = await cookies();
    const raw = cookieStore.get(GUEST_COOKIE)?.value;
    if (raw) {
      try {
        const guest = parseGuestCookie(raw);
        const service = createServiceClient();
        await service.rpc("aiw_revoke_guest_session", {
          p_session_hash: guest.sessionHash,
          p_device_hash: guest.deviceHash,
        });
      } catch { /* Idempotent logout. */ }
    }
    const response = noStoreJson({ ok: true, requestId });
    response.cookies.set(GUEST_COOKIE, "", { ...GUEST_COOKIE_OPTIONS, maxAge: 0 });
    return response;
  } catch (error) {
    return apiError(error, requestId);
  }
}
