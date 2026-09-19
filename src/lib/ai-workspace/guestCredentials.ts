import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { WorkspaceError } from "./contracts.ts";

export const GUEST_COOKIE = "__Host-ai-career-guest";
export const GUEST_COOKIE_OPTIONS = { httpOnly: true, secure: true, sameSite: "strict" as const, path: "/" };

/** 192 bits of entropy. Only the one-time response contains plaintext. */
export function generateGuestCode() {
  const code = `CAREER-${randomBytes(24).toString("hex").toUpperCase()}`;
  return { code, hash: hashGuestCode(code) };
}

export function hashGuestCode(code: string) {
  const normalized = code.trim().toUpperCase();
  if (!/^CAREER-[A-F0-9]{48}$/.test(normalized)) throw new WorkspaceError("INVALID_INVITATION", 403);
  return createHash("sha256").update(`ai-career:invitation:v1:${normalized}`).digest("hex");
}

export function generateDeviceCredential() {
  const credential = randomBytes(32).toString("base64url");
  return { credential, hash: hashDeviceCredential(credential) };
}

export function hashDeviceCredential(credential: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(credential)) throw new WorkspaceError("INVALID_GUEST_SESSION", 401);
  return createHash("sha256").update(`ai-career:device:v1:${credential}`).digest("hex");
}

export function matchesDeviceCredential(credential: string, storedHash: string) {
  if (!/^[a-f0-9]{64}$/.test(storedHash)) return false;
  try {
    return timingSafeEqual(Buffer.from(hashDeviceCredential(credential), "hex"), Buffer.from(storedHash, "hex"));
  } catch { return false; }
}

export function validateGuestSession(input: {
  accountStatus: string; invitationStatus: string; deviceRevoked: boolean;
  accountExpiresAt: string | null; deviceExpiresAt: string; now?: number;
}) {
  const now = input.now ?? Date.now();
  const deviceExpiry = Date.parse(input.deviceExpiresAt);
  const accountExpiry = input.accountExpiresAt === null ? Infinity : Date.parse(input.accountExpiresAt);
  if (input.accountStatus !== "active" || input.invitationStatus !== "active" || input.deviceRevoked
    || !Number.isFinite(deviceExpiry) || deviceExpiry <= now || Number.isNaN(accountExpiry) || accountExpiry <= now) {
    throw new WorkspaceError("GUEST_ACCESS_EXPIRED_OR_REVOKED", 403);
  }
}
