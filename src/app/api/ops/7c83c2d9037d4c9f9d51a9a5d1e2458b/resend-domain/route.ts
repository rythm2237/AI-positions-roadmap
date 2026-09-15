import { NextResponse } from "next/server";

export async function GET() {
  if (process.env.VERCEL_ENV !== "production") return NextResponse.json({ error: "Production only" }, { status: 404 });
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "RESEND_NOT_CONFIGURED" }, { status: 503 });
  const headers = { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };
  const list = await fetch("https://api.resend.com/domains", { headers, cache: "no-store" });
  const listPayload = await list.json().catch(() => ({})) as { data?: Array<{ id: string; name: string; status?: string; records?: unknown[] }> };
  const existing = listPayload.data?.find((item) => item.name === "airolepath.com");
  if (existing) return NextResponse.json({ existing: true, domain: existing });
  const created = await fetch("https://api.resend.com/domains", {
    method: "POST",
    headers,
    body: JSON.stringify({ name: "airolepath.com" }),
  });
  const payload = await created.json().catch(() => ({}));
  return NextResponse.json({ existing: false, status: created.status, domain: payload }, { status: created.ok ? 200 : 502 });
}
