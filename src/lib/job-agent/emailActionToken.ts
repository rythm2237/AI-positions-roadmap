import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

export type JobEmailAction = "save" | "unsave" | "not_relevant";

export type JobEmailActionPayload = {
  v: 1;
  userId: string;
  jobId: string;
  action: JobEmailAction;
  exp: number;
};

function signingSecret() {
  const secret = process.env.JOB_ACTION_SECRET ?? process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_KEY;
  if (!secret) throw new Error("JOB_ACTION_SECRET_NOT_CONFIGURED");
  return secret;
}

function signBody(body: string) {
  return createHmac("sha256", signingSecret()).update(body).digest("base64url");
}

export function createJobEmailActionToken(input: {
  userId: string;
  jobId: string;
  action: JobEmailAction;
  expiresInSeconds?: number;
}) {
  const payload: JobEmailActionPayload = {
    v: 1,
    userId: input.userId,
    jobId: input.jobId,
    action: input.action,
    exp: Math.floor(Date.now() / 1000) + (input.expiresInSeconds ?? 30 * 24 * 60 * 60),
  };
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${body}.${signBody(body)}`;
}

export function verifyJobEmailActionToken(token: string): JobEmailActionPayload | null {
  const [body, signature, extra] = token.split(".");
  if (!body || !signature || extra) return null;

  const expected = signBody(body);
  const providedBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expected);
  if (providedBytes.length !== expectedBytes.length || !timingSafeEqual(providedBytes, expectedBytes)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Partial<JobEmailActionPayload>;
    if (
      payload.v !== 1 ||
      typeof payload.userId !== "string" ||
      typeof payload.jobId !== "string" ||
      !["save", "unsave", "not_relevant"].includes(String(payload.action)) ||
      typeof payload.exp !== "number" ||
      payload.exp < Math.floor(Date.now() / 1000)
    ) return null;
    return payload as JobEmailActionPayload;
  } catch {
    return null;
  }
}
