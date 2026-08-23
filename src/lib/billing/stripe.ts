import { createHmac, timingSafeEqual } from "node:crypto";

const STRIPE_API = "https://api.stripe.com/v1";

export function stripeSecretKey(): string {
  const value = process.env.STRIPE_SECRET_KEY?.trim();
  if (!value) throw new Error("STRIPE_SECRET_KEY is not configured.");
  return value;
}

export function stripePriceId(): string {
  const value = process.env.STRIPE_ROLE_PATH_PRO_PRICE_ID?.trim();
  if (!value) throw new Error("STRIPE_ROLE_PATH_PRO_PRICE_ID is not configured.");
  return value;
}

export async function stripePost<T>(path: string, params: URLSearchParams): Promise<T> {
  const response = await fetch(`${STRIPE_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecretKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
    cache: "no-store",
  });
  const body = await response.json();
  if (!response.ok) {
    const message = body?.error?.message ?? `Stripe request failed with ${response.status}.`;
    throw new Error(message);
  }
  return body as T;
}

export async function stripeGet<T>(path: string): Promise<T> {
  const response = await fetch(`${STRIPE_API}${path}`, {
    headers: { Authorization: `Bearer ${stripeSecretKey()}` },
    cache: "no-store",
  });
  const body = await response.json();
  if (!response.ok) {
    const message = body?.error?.message ?? `Stripe request failed with ${response.status}.`;
    throw new Error(message);
  }
  return body as T;
}

function safeHexEqual(a: string, b: string): boolean {
  try {
    const left = Buffer.from(a, "hex");
    const right = Buffer.from(b, "hex");
    return left.length === right.length && timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

export function verifyStripeWebhook(payload: string, signatureHeader: string | null): void {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
  if (!signatureHeader) throw new Error("Missing Stripe-Signature header.");

  const parts = signatureHeader.split(",").map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
  const signatures = parts.filter((part) => part.startsWith("v1=")).map((part) => part.slice(3));
  if (!timestamp || !signatures.length) throw new Error("Invalid Stripe signature header.");

  const unix = Number(timestamp);
  if (!Number.isFinite(unix) || Math.abs(Date.now() / 1000 - unix) > 300) {
    throw new Error("Stripe webhook timestamp is outside the allowed tolerance.");
  }

  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`, "utf8").digest("hex");
  if (!signatures.some((signature) => safeHexEqual(signature, expected))) {
    throw new Error("Stripe webhook signature verification failed.");
  }
}

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.airolepath.com").replace(/\/$/, "");
}
