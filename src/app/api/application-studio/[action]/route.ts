import {TRANSLATION_SCHEMA,translationContext,validateTranslation} from '@/lib/applicationStudio/translation.mjs';
import { classifyStudioGatewayError, studioModelFallback } from "@/lib/applicationStudio/gatewayErrors";
import { submittedCV } from "@/lib/applicationStudio/recruiter.mjs";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { consumeBetaAiQuota, refundRejectedBetaAiQuota } from "@/lib/betaAiQuota";
import { SYSTEM, SCHEMAS } from "@/lib/applicationStudio/prompts.mjs";
import { limitedText, sourceMap, vacancySourceMap, validate, fetchPublic, ServiceError } from "@/lib/applicationStudio/validation.mjs";
import {planCV,validateRewrites,validateCV} from '@/lib/applicationStudio/contentEngine.mjs';

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
  const requestId = crypto.randomUUID();
  let reservedQuota: {userId: string; usageDate: string} | undefined;
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user || user.is_anonymous) return json({ error: "Sign in to AI Career to use AI or retrieve public pages." }, 401);
    let body: { action?: string; url?: string; sessionUserId?: string; context?: Record<string, unknown> };
    try { body = JSON.parse(await limitedText(request)); }
    catch (error) { if (error instanceof ServiceError) throw error; return json({ error: "Invalid JSON." }, 400); }
    if (!body || typeof body !== "object") return json({ error: "Invalid request." }, 400);
    if (body.sessionUserId !== user.id) return json({ error: "Your account changed. Reload the editor before continuing." }, 409);
    const aiAction = body.action as keyof typeof SCHEMAS | "optimise" | "translate";
    const context = body.context;
    if (action === "ai") {
      if ((!Object.hasOwn(SCHEMAS, aiAction)&&aiAction!=='translate') || !context || Array.isArray(context)) return json({ error: "Invalid AI action." }, 400);
      for (const key of ["candidate", "linkedin", "vacancy"]) {
        if (typeof (context[key] || "") !== "string" || String(context[key] || "").length > 100_000) return json({ error: "Invalid or oversized source text." }, 400);
      }
      if (!String(context.candidate || "").trim() || !['optimise','translate'].includes(aiAction) && !String(context.vacancy || "").trim()) return json({ error: "Confirm your CV and add the vacancy first." }, 400);
      if (!Array.isArray(context.cv) || !context.cv.length || context.cv.length > 100 || context.cv.some((s: unknown) => !s || typeof s !== "object" || typeof (s as Record<string, unknown>).text !== "string" || typeof (s as Record<string, unknown>).title !== "string") || submittedCV(context).length > 100_000) return json({ error: "Invalid CV sections." }, 400);
    } else if (typeof body.url !== "string" || body.url.length > 2048) return json({ error: "Enter a public HTTPS URL." }, 400);

    // Public page retrieval does not call AI and must not consume the user's AI review allowance.
    if (action === "fetch") return json(await fetchPublic(body.url!));

    let translatedInput: ReturnType<typeof translationContext>|null=null;
    if(aiAction==='translate'){try{translatedInput=translationContext(context!);}catch(error){return json({error:(error as Error).message},400);}}
    // Reuse the existing durable review allowance to keep AI usage bounded.
    const quota = await consumeBetaAiQuota(user.id, "project_review");
    if (!quota.allowed) return json({ error: `Daily AI review limit reached (${quota.limit}). It resets at 00:00 UTC. Your draft is unchanged.`, quota }, 429);
    if (quota.usageDate) reservedQuota = {userId: user.id, usageDate: quota.usageDate};
    const sources = aiAction === "analysis" ? sourceMap(submittedCV(context!)) : sourceMap(String(context!.candidate), String(context!.linkedin || ""));
    const prompt: Record<string, unknown> = { ...context, sources, ...(aiAction === "analysis" ? {vacancySources: vacancySourceMap(String(context!.vacancy))} : {}) };
    delete prompt.candidate; delete prompt.linkedin;
    const contentPlan = aiAction === 'optimise' ? planCV({sections:context!.cv,vacancy:context!.vacancy,targetRole:(context!.job as {title?:string})?.title||'',template:context!.template,design:context!.design,portrait:context!.portrait}) : null;
    if(contentPlan){
      for(const key of Object.keys(prompt))delete prompt[key];
      Object.assign(prompt,{language:context!.language,targetRole:contentPlan.targetRole,requirements:contentPlan.requirements,selectedEvidence:contentPlan.evidence.filter(e=>e.included&&e.kind==='experience').map(e=>({id:e.id,text:e.output,roleHeading:e.roleHeading}))});
    }
    if(translatedInput){for(const key of Object.keys(prompt))delete prompt[key];Object.assign(prompt,translatedInput);}
    if (aiAction === "analysis") { delete prompt.previousApplications; delete prompt.chat; delete prompt.approved; delete prompt.analysis; }
    const model = process.env.APPLICATION_STUDIO_MODEL || "openai/gpt-4.1-mini";
    const settings = {
      system: `${SYSTEM}\nCourse completion and profile fields may be self-reported. Preserve that provenance. Never promote completed learning to employment, expertise, or verified certification.\n${aiAction==='translate'?TRANSLATION_SCHEMA:(SCHEMAS as Record<string,string>)[aiAction]}`,
      prompt: JSON.stringify(prompt),
      maxOutputTokens: aiAction==='translate'?14000:6500,
      abortSignal: AbortSignal.timeout(100_000),
    };
    let result;
    try { result = await generateText({...settings, model}); }
    catch (error) {
      const fallback = studioModelFallback(error, model);
      if (!fallback) throw error;
      console.warn("Application Studio model access fallback", {requestId, model, fallback});
      result = await generateText({...settings, model: fallback});
    }
    if (result.finishReason === "length") return json({ error: "AI output was incomplete. Your draft is preserved; try a shorter input." }, 502);
    let parsed: unknown;
    try { parsed = JSON.parse(result.text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")); }
    catch { return json({ error: "AI returned invalid JSON. Your draft is preserved." }, 502); }
    if(translatedInput){try{return json(validateTranslation(parsed,context!.cv,translatedInput.targetLanguage));}catch(error){return json({error:(error as Error).message},502);}}
    if(contentPlan){
      const rewrites=validateRewrites(parsed,contentPlan);
      for(const r of rewrites.accepted){const e=contentPlan.evidence.find(e=>e.id===r.evidenceId);const s=contentPlan.sections.find(s=>s.evidenceIds?.includes(r.evidenceId));if(e&&s){s.text=s.text.split('\n').map(line=>line==='• '+r.original?'• '+r.text:line).join('\n');e.output=r.text;}}
      const qc=validateCV(contentPlan.sections);if(!qc.valid)return json({error:'CV rewrite failed content validation. Your draft is unchanged.'},502);
      if(rewrites.rejected.length)contentPlan.warnings.push(`${rewrites.rejected.length} unverifiable AI rewrite(s) were discarded; source wording retained.`);
      return json({plan:contentPlan});
    }
    return json(validate(aiAction, parsed, context!, sources));
  } catch (error) {
    if (error instanceof ServiceError) return json({ error: error.message }, error.status);
    const failure = classifyStudioGatewayError(error);
    let quotaRefunded = false;
    if (failure.refundQuota && reservedQuota) {
      try {
        await refundRejectedBetaAiQuota(reservedQuota.userId, "project_review", reservedQuota.usageDate, requestId);
        quotaRefunded = true;
      } catch { console.error("Application Studio quota refund failed", {requestId}); }
    }
    // Log only fixed classifications, never prompts, responses, URLs or credentials.
    console.error("Application Studio request failed", {requestId, action, code:failure.code, errorName:failure.errorName, providerStatus:failure.providerStatus, quotaRefunded});
    return json({error: `${failure.message}${quotaRefunded ? " This rejected request did not consume your daily AI allowance." : ""} Reference: ${requestId}.`,code:failure.code,requestId},503);
  }
}
