import {sectionKind} from './contentEngine.mjs';
import {knowledgeSources,stableId} from './knowledge.mjs';
import {groundingIssues,validateGeneratedCV,groundingReviewInput,validateGroundingReview} from './intelligence.mjs';
import {CVEvidenceError} from './cvGeneration.mjs';
import {preserveQuickSections} from './quickFlow.mjs';

// Protected facts are restored by validateGeneratedCV from the source. Do not
// generate or validate discarded AI versions of contacts and qualifications.
// Invalid new wording is omitted as a whole; we never rewrite it into a fact.
export function prepareQuickCV(value,kb){
 if(!Array.isArray(value?.sections))return value;
 const out=structuredClone(value),sources=knowledgeSources(kb);let removed=0;
 out.sections=out.sections.flatMap(section=>{
  const kind=sectionKind(section.title);
  if(['header','education','certifications'].includes(kind))return [];
  if(!Array.isArray(section.items))return [section];
  let words=0,skills=0;
  const items=section.items.filter(item=>{
   const entity=kb.entities.find(e=>e.id===item.entityId),refs=item.evidenceIds;
   let keep=typeof item.text==='string'&&item.text.trim()&&entity&&Array.isArray(refs)&&refs.length&&refs.every(id=>Object.hasOwn(sources,id))&&(['summary','skills'].includes(kind)||refs.every(id=>entity.claimIds.includes(id)));
   if(keep)keep=!groundingIssues(item.text,refs.map(id=>sources[id])).length;
   if(keep&&kind==='summary'){const count=item.text.trim().split(/\s+/).length;keep=words+count<=130;if(keep)words+=count;}
   if(keep&&kind==='skills'){const count=item.text.split(/\n|;/).filter(s=>s.trim()).length;keep=skills+count<=15;if(keep)skills+=count;}
   if(!keep)removed++;
   return !!keep;
  });
  return items.length?[{...section,items}]:[];
 });
 // A source-only CV is valid too: the validator restores all protected records
 // and employment. Keep an empty canonical section so it can do that work.
 if(!out.sections.length)out.sections=[{title:'Header',items:[]}];
 out.warnings=[...(Array.isArray(out.warnings)?out.warnings:[]),...(removed?['Unverifiable or excessive generated wording was omitted. Original employment records and qualifications were retained.']:[])];
 return out;
}

// Last-resort Quick recovery after the bounded rewrite. Only exact, complete
// review results can select safe statements. Missing checks never mean approval.
export async function recoverQuickCV({error,knowledge,strategy,current,language,review}){
 if(!(error instanceof CVEvidenceError))throw error;
 const {rejectedDraft,reviewedStatements,groundingFeedback}=error.details||{};
 if(!Array.isArray(reviewedStatements)||!reviewedStatements.length||!Array.isArray(groundingFeedback?.checks))throw error;
 // Validate coverage and language independently from the support decisions.
 try{validateGroundingReview({...groundingFeedback,checks:groundingFeedback.checks.map(c=>({...c,status:['supported','unsupported','ambiguous'].includes(c.status)?'supported':c.status}))},{statements:reviewedStatements,targetLanguage:language});}catch{throw error;}
 const blocked=new Set(groundingFeedback.checks.filter(c=>c.status!=='supported').map(c=>c.id));
 if(!blocked.size||!Array.isArray(rejectedDraft?.sections))throw error;
 const value=structuredClone(rejectedDraft);
 for(const section of value.sections)section.items=section.items.filter(item=>!blocked.has(stableId('statement',item.entityId+'|'+item.text)));
 let draft;
 try{draft=validateGeneratedCV(value,knowledge,strategy,current);draft.sections=preserveQuickSections(draft.sections,current);}catch(failure){throw new CVEvidenceError(failure.message,{stage:'recovery-validation'});}
 // Check the actual exported prose as well as every remaining AI statement:
 // restoring originals must not silently change the requested document language.
 const input={...groundingReviewInput(draft,knowledge),targetLanguage:language,documentSections:draft.sections.map(s=>({title:s.displayTitle||s.title,text:s.text}))};
 const checked=await review(input);
 try{validateGroundingReview(checked,input);}catch(failure){throw new CVEvidenceError(failure.message,{stage:'recovery-review'});}
 draft.warnings.push('Some AI wording could not be verified and was omitted. Supported wording was kept; original records were restored where needed. Review the final CV before applying.');
 return draft;
}
