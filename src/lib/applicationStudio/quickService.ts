import {z} from 'zod';
import {prepareQuickCV,recoverQuickCV} from './quickCVRecovery.mjs';
import {SCHEMAS,SYSTEM} from './prompts.mjs';
import {QUICK_POLICY,QUICK_QUESTIONS_POLICY,quickQuestionsSchema,quickQuestions,quickKnowledge,quickStrategy,quickReport,preserveQuickSections} from './quickFlow.mjs';
import {generateStudioObject} from './structuredGeneration.mjs';
import {studioOutputSchema} from './outputSchemas.mjs';
import {sourceMap,validateAnalysisWithRepair,vacancySourceMap} from './validation.mjs';
import {submittedCV} from './recruiter.mjs';
import {knowledgeSources} from './knowledge.mjs';
import {generationEvidenceRecords,generateGroundedCV} from './cvGeneration.mjs';
import {GENERATION_SCHEMA,GROUNDING_REVIEW_SCHEMA} from './intelligence.mjs';
import {generateGroundedLetter,LETTER_REVIEW_SCHEMA} from './letterGeneration.mjs';
import {studioModelFallback} from './gatewayErrors';
type Settings={system:string;prompt:string;maxOutputTokens:number;abortSignal:AbortSignal};
const checks=z.object({languageValid:z.boolean(),checks:z.array(z.object({id:z.string(),status:z.enum(['supported','unsupported','ambiguous']),reason:z.string()}))});
export async function runQuickOperation(action:string,context:any,settings:Settings,model:string,onInferenceComplete:()=>void){
 const kb=quickKnowledge(context),sources=knowledgeSources(kb);
 const call=async(system:string,input:unknown,schema:import('zod').ZodType)=> (await generateStudioObject({settings:{...settings,system,prompt:JSON.stringify(input)},model,schema,fallbackModel:studioModelFallback,retryInvalid:false,onInferenceComplete})).output as any;
 if(action==='quick-review'){
  const originalSources=sourceMap(submittedCV(context));
  const input={language:context.language,uiLanguage:context.uiLanguage||'en',sources:originalSources,vacancy:context.vacancy,vacancySources:vacancySourceMap(context.vacancy)};
  const system=SYSTEM+'\n'+QUICK_POLICY+'\n'+SCHEMAS.analysis+' Assess only the CURRENT ORIGINAL CV. Do not award points for later answers, saved profiles or potential rewrites. Keep requirement labels concise; no long narrative report. Do not ask confirmationQuestions here; the next step selects at most five.';
  const initial=await call(system,input,studioOutputSchema('analysis'));
  const analysis:any=await validateAnalysisWithRepair(initial,context,originalSources,async repair=>call(system,{...input,analysisRepair:repair},studioOutputSchema('analysis')));
  const questionPlan=await call(QUICK_QUESTIONS_POLICY,{uiLanguage:context.uiLanguage||'en',vacancy:context.vacancy,candidateSources:sources,entities:kb.entities.map((e:any)=>({id:e.id,kind:e.kind,label:e.label})),requirements:analysis.matrix,includeCover:context.includeCover===true},quickQuestionsSchema);
  return {report:quickReport(analysis),job:analysis.job,...quickQuestions(questionPlan,kb)};
 }
 if(action==='quick-generate'){
  const strategy=quickStrategy(kb,context);
  const review=async(input:unknown)=>call(GROUNDING_REVIEW_SCHEMA+' Also return languageValid:boolean. Verify ALL exported prose in documentSections, when provided, against targetLanguage; original proper names, dates, official titles and qualifications may remain unchanged. Review every statement even if one is unsupported. Do not treat an application heading or source-reported proficiency as a qualification beyond its stated level.',input,checks);
  let draft;
  try{draft=await generateGroundedCV({knowledge:kb,strategy,current:context.cv,rejected:[],language:context.language,prepareDraft:value=>prepareQuickCV(value,kb),finalizeSections:sections=>preserveQuickSections(sections,context.cv),reviewDocument:true,generate:async(repair:unknown)=>call(QUICK_POLICY+'\n'+GENERATION_SCHEMA+' QUICK MODE: retain the original section order and groupings. Focus on concise, supported content (usually 450–650 words, shorter for early career); preserve every employment heading/date and credential. Avoid an extensive generic skills list. No new questions: use answered facts, omit unsupported claims. Add an application headline for the actual target level, never an unearned professional title.',{language:context.language,wordBudget:context.compact?400:600,vacancy:context.vacancy,sources,generationEvidenceRecords:generationEvidenceRecords(kb),strategy,current:context.cv,clarifications:context.quickAnswers||[],...(repair?{cvEvidenceRepair:repair}:{})},studioOutputSchema('generate')),
   review});}catch(error){draft=await recoverQuickCV({error,knowledge:kb,strategy,current:context.cv,language:context.language,review});}
  return {sections:draft.sections,warnings:draft.warnings||[]};
 }
 if(action==='quick-cover'){
  const value=await generateGroundedLetter({sources,context,generate:async(repair:unknown)=>call(QUICK_POLICY+'\n'+SCHEMAS.cover+' QUICK MODE: one page, approximately 220–320 words. Address this exact employer and vacancy using supplied advert context only. For Ausbildung emphasize real reasons for the educational path and learning readiness. Do not invent enthusiasm, childhood stories or relocation intent. If motivation is not provided, use neutral application intent. No additional questions: omit unestablished claims. Use source-backed sender name and a professional greeting/closing.',{language:context.language,sources,vacancy:context.vacancy,job:context.job,clarifications:context.quickAnswers||[],...(repair?{letterEvidenceRepair:repair}:{})},studioOutputSchema('cover')),
  review:async(input:unknown)=>call(LETTER_REVIEW_SCHEMA,input,checks)});
  if(!value.paragraphs?.length)throw Error('The cover letter could not be grounded in your confirmed facts.');
  return {paragraphs:value.paragraphs,text:value.paragraphs.map((p:any)=>p.text).join('\n\n')};
 }
 throw Error('Unsupported Quick CV operation.');
}
