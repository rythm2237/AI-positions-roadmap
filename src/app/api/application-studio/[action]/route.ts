import { generateText } from "ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { consumeBetaAiQuota } from "@/lib/betaAiQuota";
import { SYSTEM, SCHEMAS } from "@/lib/applicationStudio/prompts.mjs";
import { limitedText, sourceMap, validate, fetchPublic, ServiceError } from "@/lib/applicationStudio/validation.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

function json(value: unknown, status = 200) {
  return NextResponse.json(value, { status, headers: { "Cache-Control": "private, no-store" } });
}

export async function GET(_request: Request, { params }: { params: Promise<{ action: string }> }) {
  if ((await params).action !== "config") return json({ error: "Not found." }, 404);
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    return json({ user: !error && user && !user.is_anonymous ? { id: user.id } : null, configured: Boolean(process.env.VERCEL || process.env.AI_GATEWAY_API_KEY), authConfigured: true, signInUrl: "/login?next=%2Fapplication-studio" });
  } catch { return json({ user: null, configured: false, authConfigured: false, signInUrl: "/login?next=%2Fapplication-studio" }); }
}

export async function POST(request: Request, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  if (!["ai", "fetch"].includes(action)) return json({ error: "Not found." }, 404);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return json({ error: "Untrusted request origin." }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return json({ error: "JSON required." }, 400);
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user || user.is_anonymous) return json({ error: "Sign in to AI Career to use AI or retrieve public pages." }, 401);
    let body: { action?: string; url?: string; sessionUserId?: string; context?: Record<string, unknown> };
    try { body = JSON.parse(await limitedText(request)); }
    catch (error) { if (error instanceof ServiceError) throw error; return json({ error: "Invalid JSON." }, 400); }
    if (!body || typeof body !== "object") return json({ error: "Invalid request." }, 400);
    if (body.sessionUserId !== user.id) return json({ error: "Your account changed. Reload the editor before continuing." }, 409);
    const aiAction = body.action as keyof typeof SCHEMAS;
    const context = body.context;
    if (action === "ai") {
      if (!Object.hasOwn(SCHEMAS, aiAction) || !context || Array.isArray(context)) return json({ error: "Invalid AI action." }, 400);
      for (const key of ["candidate", "linkedin", "vacancy"]) {
        if (typeof (context[key] || "") !== "string" || String(context[key] || "").length > 100_000) return json({ error: "Invalid or oversized source text." }, 400);
      }
      if (!String(context.candidate || "").trim() || !String(context.vacancy || "").trim()) return json({ error: "Confirm your CV and add the vacancy first." }, 400);
      if (!Array.isArray(context.cv) || context.cv.length > 100) return json({ error: "Invalid CV sections." }, 400);
    } else if (typeof body.url !== "string" || body.url.length > 2048) return json({ error: "Enter a public HTTPS URL." }, 400);

    // Reuse the existing durable beta review allowance. No new account, key or quota table is required.
    const quota = await consumeBetaAiQuota(user.id, "project_review");
    if (!quota.allowed) return json({ error: `Daily beta AI review allowance reached (${quota.limit}). Try again tomorrow UTC.`, quota }, 429);
    if (action === "fetch") return json(await fetchPublic(body.url!));
    const sources = sourceMap(String(context!.candidate), String(context!.linkedin || ""));
    const prompt: Record<string, unknown> = { ...context, sources };
    delete prompt.candidate; delete prompt.linkedin;
    const result = await generateText({
      model: process.env.APPLICATION_STUDIO_MODEL || process.env.JOB_AGENT_MODEL || "openai/gpt-5.4-mini",
      system: `${SYSTEM}\nCourse completion and profile fields may be self-reported. Preserve that provenance. Never promote completed learning to employment, expertise, or verified certification.\n${SCHEMAS[aiAction]}`,
      prompt: JSON.stringify(prompt),
      maxOutputTokens: 6500,
      abortSignal: AbortSignal.timeout(100_000),
    });
    if (result.finishReason === "length") return json({ error: "AI output was incomplete. Your draft is preserved; try a shorter input." }, 502);
    let parsed: unknown;
    try { parsed = JSON.parse(result.text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")); }
    catch { return json({ error: "AI returned invalid JSON. Your draft is preserved." }, 502); }
    return json(validate(aiAction, parsed, context!, sources));
  } catch (error) {
    if (error instanceof ServiceError) return json({ error: error.message }, error.status);
    // No candidate text, storage URLs or provider credentials are logged.
    return json({ error: "The site AI service is temporarily unavailable. Your draft is preserved. You can still test the demo, edit locally and export PDFs." }, 503);
  }
}
