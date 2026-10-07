import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDesignDefaults, putDesignDefaults, sanitizeDefaults } from "@/lib/applicationStudio/defaults";
export const dynamic = "force-dynamic";
export async function GET() {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user || user.is_anonymous) return NextResponse.json({ error: "Sign in to load saved designs." }, { status: 401 });
  try { return NextResponse.json({ defaults: await getDesignDefaults(user.id) }, { headers: { "Cache-Control": "private, no-store" } }); }
  catch { return NextResponse.json({ error: "Saved designs are unavailable." }, { status: 503 }); }
}
export async function PUT(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user || user.is_anonymous) return NextResponse.json({ error: "Sign in to save designs." }, { status: 401 });
  if (Number(request.headers.get("content-length")) > 1000000) return NextResponse.json({ error: "Photo is too large." }, { status: 413 });
  try {
    const raw = await request.text();
    if (raw.length > 1000000) return NextResponse.json({ error: "Photo is too large." }, { status: 413 });
    const input = JSON.parse(raw);
    if (input.sessionUserId !== user.id) return NextResponse.json({ error: "Your account changed. Reload this page." }, { status: 409 });
    const defaults = sanitizeDefaults(input);
    await putDesignDefaults(user.id, defaults);
    return NextResponse.json({ defaults }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save designs." }, { status: 400 }); }
}
