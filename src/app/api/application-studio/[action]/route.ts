import {STRUCTURE_SCHEMA,structureSources,validateStructure,recoverStructure} from '@/lib/applicationStudio/structure.mjs';
import {studioOutputSchema} from '@/lib/applicationStudio/outputSchemas.mjs';
import {generateStudioObject,isStudioOutputError} from '@/lib/applicationStudio/structuredGeneration.mjs';
import {TRANSLATION_SCHEMA,translationContext,validateTranslation,protectTranslation,restoreTranslation,translateUnits} from '@/lib/applicationStudio/translation.mjs';
import { classifyStudioGatewayError, studioModelFallback } from "@/lib/applicationStudio/gatewayErrors";
import { submittedCV } from "@/lib/applicationStudio/recruiter.mjs";
import { generateText, Output } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { BetaAiQuotaError, checkBetaAiQuotaConfiguration, isBetaAiQuotaExempt, consumeBetaAiQuota, refundRejectedBetaAiQuota } from "@/lib/betaAiQuota";
import { SYSTEM, SCHEMAS } from "@/lib/applicationStudio/prompts.mjs";
import { limitedText, sourceMap, vacancySourceMap, validate, fetchPublic, ServiceError } from "@/lib/applicationStudio/validation.mjs";
import {planCV,validateRewrites,validateCV} from '@/lib/applicationStudio/contentEngine.mjs';
import {getKnowledge} from '@/lib/applicationStudio/knowledgeStore';
import {knowledgeSources} from '@/lib/applicationStudio/knowledge.mjs';
import {STRATEGY_SCHEMA,GENERATION_SCHEMA,GROUNDING_REVIEW_SCHEMA,groundingReviewInput,validateGroundingReview,validateStrategy,validateGeneratedCV,assessmentDimensions,groundingIssues} from '@/lib/applicationStudio/intelligence.mjs';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

function json(value: unknown, status = 200) {
  return NextResponse.json(value, { status, headers: { "Cache-Control": "private, no-store" } });
}
async function reviewEvidence(input:Record<string,unknown>&{statements:unknown[]},model:string,abortSignal:AbortSignal){
  if(!input.statements.length)return;
  const settings={model,system:GROUNDING_REVIEW_SCHEMA+' Also return languageValid:boolean. Set it true only if actual narrative prose is in targetLanguage. Original company names, official job titles, dates, contacts, qualifications and technical product names may remain unchanged; do not treat them as prose.',prompt:JSON.stringify(input),maxOutputTokens:6500,abortSignal,output:Output.object({schema:z.object({languageValid:z.boolean(),checks:z.array(z.object({id:z.string(),status:z.enum(['supported','unsupported','ambiguous']),reason:z.string()}))})})};
  let result;try{result=await generateText(settings);}catch(error){const fallback=studioModelFallback(error,model);if(!fallback)throw error;result=await generateText({...settings,model:fallback});}
  try{validateGroundingReview(result.output,input);}catch(error){throw new ServiceError((error as Error).message,502);}
}

export async function GET(_request: Request, { params }: { params: Promise<{ action: string }> }) {
  if ((await params).action !== "config") return json({ error: "Not found." }, 404);
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    return json({ user: !error && user && !user.is_anonymous ? { id: user.id } : null, configured: Boolean(process.env.VERCEL || process.env.AI_GATEWAY_API_KEY), quotaService: await checkBetaAiQuotaConfiguration(), aiUsage:{exempt:!error&&user&&!user.is_anonymous?await isBetaAiQuotaExempt(user.id):false}, authConfigured: true, signInUrl: "/login?next=%2Fapplication-studio" });
  } catch { return json({ user: null, configured: false, authConfigured: false, signInUrl: "/login?next=%2Fapplication-studio" }); }
}

export async function POST(request: Request, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  if (!["ai", "fetch"].includes(action)) return json({ error: "Not found." }, 404);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return json({ error: "Untrusted request origin." }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return json({ error: "JSON required." }, 400);
  const requestId = crypto.randomUUID();
  let operation = action;
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
    const aiAction = body.action as keyof typeof SCHEMAS | "optimise" | "translate" | "structure" | "strategy" | "generate";
    const context = body.context;
    operation = body.action || action;
    if (action === "ai") {
      if ((!Object.hasOwn(SCHEMAS, aiAction)&&!['translate','structure','strategy','generate'].includes(aiAction)) || !context || Array.isArray(context)) return json({ error: "Invalid AI action." }, 400);
      for (const key of ["candidate", "linkedin", "vacancy"]) {
        if (typeof (context[key] || "") !== "string" || String(context[key] || "").length > 100_000) return json({ error: "Invalid or oversized source text." }, 400);
      }
      if (!String(context.candidate || "").trim() || !['optimise','translate','structure','strategy','generate'].includes(aiAction) && !String(context.vacancy || "").trim()) return json({ error: "Confirm your CV and add the vacancy first." }, 400);
      if (!Array.isArray(context.cv) || !context.cv.length || context.cv.length > 100 || context.cv.some((s: unknown) => !s || typeof s !== "object" || typeof (s as Record<string, unknown>).text !== "string" || typeof (s as Record<string, unknown>).title !== "string") || submittedCV(context).length > 100_000) return json({ error: "Invalid CV sections." }, 400);
    } else if (typeof body.url !== "string" || body.url.length > 2048) return json({ error: "Enter a public HTTPS URL." }, 400);

    // Public page retrieval does not call AI and must not consume the user's AI review allowance.
    if (action === "fetch") return json(await fetchPublic(body.url!));

    const usesKnowledge=['analysis','strategy','generate','changes','cover','motivation','interview'].includes(aiAction);
    const savedKnowledge=usesKnowledge?(await getKnowledge(user.id)).knowledge:null;
    const candidateSources=savedKnowledge?.claims.length?knowledgeSources(savedKnowledge):null;
    if(['strategy','generate'].includes(aiAction)&&!candidateSources)return json({error:'Save your candidate knowledge before creating a content strategy.'},400);
    if(usesKnowledge&&context!.knowledgeRevision!==undefined&&savedKnowledge?.revision!==context!.knowledgeRevision)return json({error:'Candidate facts changed. Reload knowledge and refresh your strategy.'},409);
    let approvedStrategy=null;
    if(aiAction==='generate'){
      try{approvedStrategy=validateStrategy(context!.strategy,savedKnowledge!,String(context!.vacancy||''));if(!(context!.strategy as {approved?:boolean})?.approved)return json({error:'Approve the content strategy before writing.'},400);approvedStrategy.approved=true;}
      catch(error){return json({error:(error as Error).message},400);}
    }

    let translatedInput: ReturnType<typeof translationContext>|null=null;
    if(aiAction==='translate'){try{translatedInput=translationContext(context!);}catch(error){return json({error:(error as Error).message},400);}}
    const structuralSources=aiAction==='structure'?structureSources(String(context!.candidate)):null;
    const protectedTranslation=translatedInput?protectTranslation(translatedInput):null;
    // Reuse the existing durable review allowance to keep AI usage bounded.
    const quota = await consumeBetaAiQuota(user.id, "project_review");
    if (!quota.allowed) return json({ error: `Daily AI review limit reached (${quota.limit}). It resets at 00:00 UTC. Your draft is unchanged.`, quota }, 429);
    if (quota.usageDate) reservedQuota = {userId: user.id, usageDate: quota.usageDate};
    const sources = candidateSources || (aiAction === "analysis" ? sourceMap(submittedCV(context!)) : sourceMap(String(context!.candidate), String(context!.linkedin || "")));
    const prompt: Record<string, unknown> = { ...context, sources, ...(usesKnowledge?{candidateKnowledge:savedKnowledge}:{}), ...(['analysis','strategy'].includes(aiAction) ? {vacancySources: vacancySourceMap(String(context!.vacancy||''))} : {}) };
    if(approvedStrategy)prompt.strategy=approvedStrategy;
    delete prompt.candidate; delete prompt.linkedin;
    const contentPlan = aiAction === 'optimise' ? planCV({sections:context!.cv,vacancy:context!.vacancy,targetRole:(context!.job as {title?:string})?.title||'',template:context!.template,design:context!.design,portrait:context!.portrait}) : null;
    if(contentPlan){
      for(const key of Object.keys(prompt))delete prompt[key];
      Object.assign(prompt,{language:context!.language,targetRole:contentPlan.targetRole,requirements:contentPlan.requirements,selectedEvidence:contentPlan.evidence.filter(e=>e.included&&e.kind==='experience').map(e=>({id:e.id,text:e.output,roleHeading:e.roleHeading}))});
    }
    if(translatedInput){for(const key of Object.keys(prompt))delete prompt[key];Object.assign(prompt,protectedTranslation!.input);}
    if(structuralSources){for(const key of Object.keys(prompt))delete prompt[key];Object.assign(prompt,{sourceLines:structuralSources});}
    if (aiAction === "analysis") { delete prompt.previousApplications; delete prompt.chat; delete prompt.approved; delete prompt.analysis; }
    const model = process.env.APPLICATION_STUDIO_MODEL || "openai/gpt-4.1-mini";
    const settings = {
      system: `${SYSTEM}\nCourse completion and profile fields may be self-reported. Preserve that provenance. Never promote completed learning to employment, expertise, or verified certification.\n${aiAction==='structure'?STRUCTURE_SCHEMA:aiAction==='translate'?TRANSLATION_SCHEMA:aiAction==='strategy'?STRATEGY_SCHEMA:aiAction==='generate'?GENERATION_SCHEMA:(SCHEMAS as Record<string,string>)[aiAction]}\n${candidateSources&&aiAction==='analysis'?'Override document-only assessment: assess the ENTIRE saved candidate knowledge. Rewriting the CV cannot change professional fit. Cite candidate claim IDs from sources. Explicit requirements must cite vacancySources. Unknown eligibility stays unknown.':''}`,
      prompt: JSON.stringify(prompt),
      maxOutputTokens: ['translate','structure','generate'].includes(aiAction)?14000:6500,
      abortSignal: AbortSignal.any([request.signal,AbortSignal.timeout(100_000)]),
    };
    if(protectedTranslation&&translatedInput){
      let translated;try{translated=await translateUnits(protectedTranslation.input,async (batch: Record<string, unknown>)=>{
        const batchSettings={...settings,system:TRANSLATION_SCHEMA,prompt:JSON.stringify(batch),maxOutputTokens:6500,output:Output.object({schema:z.object({targetLanguage:z.literal(translatedInput!.targetLanguage),translations:z.array(z.object({id:z.string(),text:z.string()}))})})};
        let response;try{response=await generateText({...batchSettings,model});}catch(error){const fallback=studioModelFallback(error,model);if(!fallback)throw error;response=await generateText({...batchSettings,model:fallback});}
        if(response.finishReason==='length')throw new ServiceError('Translation output was incomplete. Shorten the application CV and retry.',502);
        return response.output;
      });}catch(error){if(error instanceof Error&&/^(Invalid translation response|Invalid translated unit|Translation missed)/.test(error.message)){console.warn("CV translation batch failed",{requestId,stage:"unit-coverage"});throw new ServiceError(error.message,502);}throw error;}
      try{return json(validateTranslation(restoreTranslation(translated,protectedTranslation),context!.cv,translatedInput.targetLanguage));}catch(error){const reason=(error as Error).message;console.warn('CV translation validation failed',{requestId,stage:reason.includes('numbers')?'protected-facts':reason.includes('writing system')?'script':reason.includes('untranslated')?'untranslated':'sections'});throw new ServiceError(reason,502);} 
    }
    let parsed: unknown;
    try {
      const result=await generateStudioObject({settings,model,schema:studioOutputSchema(aiAction),fallbackModel:studioModelFallback,retryInvalid:!structuralSources,onInferenceComplete:()=>{reservedQuota=undefined;}});
      parsed=result.output;
    }catch(error){
      if(!isStudioOutputError(error))throw error;
      // Structure detection is an enhancement, not a gate that loses the source
      // or blocks navigation. Never invent a replacement CV when output fails.
      if(structuralSources)return json(recoverStructure(structuralSources,'AI could not complete section grouping. Your full original CV was retained using source headings. Review titles, employers and qualifications before generating a new CV.'));
      return json({error:'AI could not complete this structured response. Your document is unchanged. Retry this step.',code:'AI_OUTPUT_INVALID',requestId},502);
    }
    if(aiAction==='strategy'){try{return json({strategy:validateStrategy(parsed,savedKnowledge!,String(context!.vacancy||''),String(context!.feedback||''))});}catch(error){return json({error:(error as Error).message},502);}}
    if(aiAction==='generate'){
      let draft;try{draft=validateGeneratedCV(parsed,savedKnowledge!,approvedStrategy,context!.cv as any[],context!.rejectedIntelligence as string[]||[]);}catch(error){throw new ServiceError((error as Error).message,502);}
      await reviewEvidence({...groundingReviewInput(draft,savedKnowledge!),targetLanguage:context!.language},model,settings.abortSignal);
      return json({draft});
    }
    if(structuralSources){try{return json(validateStructure(parsed,structuralSources));}catch{return json(recoverStructure(structuralSources,'AI section grouping could not be verified. Your full original CV was retained using source headings. Review the grouping before generating a new CV.'));}}
    if(translatedInput){try{return json(validateTranslation(restoreTranslation(parsed,protectedTranslation!),context!.cv,translatedInput.targetLanguage));}catch(error){return json({error:(error as Error).message},502);}}
    if(contentPlan){
      const rewrites=validateRewrites(parsed,contentPlan);
      for(const r of rewrites.accepted){const e=contentPlan.evidence.find(e=>e.id===r.evidenceId);const s=contentPlan.sections.find(s=>s.evidenceIds?.includes(r.evidenceId));if(e&&s){s.text=s.text.split('\n').map(line=>line==='• '+r.original?'• '+r.text:line).join('\n');e.output=r.text;}}
      const qc=validateCV(contentPlan.sections);if(!qc.valid)return json({error:'CV rewrite failed content validation. Your draft is unchanged.'},502);
      if(rewrites.rejected.length)contentPlan.warnings.push(`${rewrites.rejected.length} unverifiable AI rewrite(s) were discarded; source wording retained.`);
      return json({plan:contentPlan});
    }
    const checked=validate(aiAction, parsed, context!, sources) as {score?:number;matrix?:any[];dimensions?:unknown;paragraphs?:{text:string;evidenceIds:string[]}[]};
    if(aiAction==='analysis'&&savedKnowledge?.claims.length){
      for(const row of checked.matrix||[]){const named=String(row.requirement).match(/\b(?:SAP|ERP|MES)\b/gi)||[],supported=(row.evidenceIds||[]).map((id:string)=>sources[id]||'').join(' ');if(row.level==='Strong Match'&&named.some(term=>!new RegExp('\\b'+term+'\\b','i').test(supported))){row.level=row.evidenceIds?.length?'Transferable Skill':'Unknown';row.explanation='Related experience is reported, but the named specialist system is not established by the cited evidence. Confirm the actual system before claiming a direct match.';}}
      const dimensions=assessmentDimensions(checked,savedKnowledge,context!.cv as any[]);checked.dimensions=dimensions;checked.score=dimensions.professionalFit;
    }
    if(['cover','motivation'].includes(aiAction)&&candidateSources){for(const p of checked.paragraphs||[]){const assertsExperience=/\bI (?:have|worked|built|managed|developed|led|used|implemented|achieved)|\bmy (?:experience|background|projects?|skills|career|education)\b/i.test(p.text);if(assertsExperience&&!p.evidenceIds?.length||p.evidenceIds?.length&&groundingIssues(p.text,p.evidenceIds.map((id:string)=>sources[id])).length)return json({error:'An unsupported claim was found in the letter. Your document is unchanged; retry with confirmed evidence.'},502);}}
    if(['cover','motivation'].includes(aiAction)&&candidateSources)await reviewEvidence({targetLanguage:context!.language,statements:(checked.paragraphs||[]).filter(p=>p.evidenceIds?.length).map((p,i)=>({id:'paragraph-'+i,text:p.text,evidence:p.evidenceIds.map(id=>sources[id])}))},model,settings.abortSignal);
    return json(checked);
  } catch (error) {
    if (error instanceof ServiceError) return json({ error: error.message }, error.status);
    if (error instanceof BetaAiQuotaError) {
      console.error("Application Studio quota failed", {requestId,code:error.code});
      return json({error:`${error.message} Reference: ${requestId}.`,code:error.code,requestId},503);
    }
    const failure = classifyStudioGatewayError(error);
    let quotaRefunded = false;
    if (failure.refundQuota && reservedQuota) {
      try {
        await refundRejectedBetaAiQuota(reservedQuota.userId, "project_review", reservedQuota.usageDate, requestId);
        quotaRefunded = true;
      } catch { console.error("Application Studio quota refund failed", {requestId}); }
    }
    // Log only fixed classifications, never prompts, responses, URLs or credentials.
    console.error("Application Studio request failed", {requestId, action, operation, code:failure.code, errorName:failure.errorName, providerStatus:failure.providerStatus, quotaRefunded});
    return json({error: `${failure.message}${quotaRefunded ? " This rejected request did not consume your daily AI allowance." : ""} Reference: ${requestId}.`,code:failure.code,requestId},503);
  }
}
