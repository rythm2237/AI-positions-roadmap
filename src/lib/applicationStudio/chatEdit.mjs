import {validate} from './validation.mjs';
import {groundingIssues,validateGroundingReview} from './intelligence.mjs';
import {sectionKind,records} from './contentEngine.mjs';
import {fontsForLanguage} from './languages.mjs';
import {designFor,FONTS} from './design.mjs';
import {isStudioOutputError} from './structuredGeneration.mjs';
export const CHAT_EDIT_SCHEMA='Edit the CURRENT CV according to feedback, or answer the question without editing. Return {changes:[{sectionId,original,proposed,reason,evidenceIds}],designChanges:[{field,value}],confirmationQuestions:[],reply:""}. original is an exact UNIQUE substring of the current section. Never change identity, employment headings/dates, qualifications or credentials. Preserve all important sections. Do not invent facts, tools, metrics or language levels. For new unsupported facts ask confirmationQuestions instead of inserting them. Evidence IDs must exist in sources. Summary may be shortened as a full paragraph; retain employment/project headings. Every nonempty proposed text must be factually established by cited evidence. Explain questions and gaps using the supplied analysis; explanation requests have empty changes. Design changes use only supplied font IDs and design fields: accent,headerColor,sideColor,headingColor,font,headerFont,headingFont,sideFont,size,headerSize,headingSize,sideSize,margin,headerAlign,layout,header,heading,photoPlacement. Values are strings; readable body/sidebar size 10–12, margin 36–56, name 18–36, headings 11–18. Retain requested language and current design unless explicitly asked to change it. Keep the CV concise for two pages. Clearly distinguish edits applied by the app from questions needing answers. No instructions or scoring commentary inside the CV.';
export class ChatEditError extends Error{}
function check(value,context,sources){
 let reviewed;try{reviewed=validate('changes',value,context,sources);}catch(e){throw new ChatEditError(e.message);}
 if(reviewed.blocked?.length)throw new ChatEditError(reviewed.blocked.join('. '));
 const spans=new Map(),sections=structuredClone(context.cv);
 for(const c of reviewed.changes){
  const s=context.cv.find(s=>s.id===c.sectionId),kind=sectionKind(s.title),start=s.text.indexOf(c.original),end=start+c.original.length;
  if(['header','education','certifications'].includes(kind))throw new ChatEditError('Identity and qualifications are protected; ask for confirmation before changing them.');
  if(start!==s.text.lastIndexOf(c.original))throw new ChatEditError('The original substring is not unique.');
  const owned=spans.get(s.id)||[];if(owned.some(p=>start<p.end&&end>p.start))throw new ChatEditError('Proposed replacements overlap.');owned.push({start,end,c});spans.set(s.id,owned);
  const issues=groundingIssues(c.proposed,c.evidence);if(issues.length)throw new ChatEditError(issues.join('. '));
 }
 for(const [id,list] of spans){const s=sections.find(s=>s.id===id);for(const p of list.sort((a,b)=>b.start-a.start))s.text=s.text.slice(0,p.start)+p.c.proposed+s.text.slice(p.end);const original=context.cv.find(s=>s.id===id);if(!s.text.trim()||[...(original.headingLines||[]),...(['experience','projects'].includes(sectionKind(original.title))?records(original).flatMap(r=>r.heading):[])].some(h=>!s.text.includes(h)))throw new ChatEditError('Preserve every official record heading and date.');}
 const patch={},colors=['accent','headerColor','sideColor','headingColor'],fonts=['font','headerFont','headingFont','sideFont'],ranges={size:[10,12],sideSize:[10,12],headerSize:[18,36],headingSize:[11,18],margin:[36,56]},enums={photoPlacement:['header','sidebar'],headerAlign:['left','center','right'],layout:['single','sidebar-left','sidebar-right'],header:['plain','centered','banner','rail'],heading:['rule','plain','uppercase','band','timeline']};
 for(const p of value.designChanges||[]){if(!p||typeof p.value!=='string')throw new ChatEditError('Invalid design edit.');if(colors.includes(p.field)&&/^#[\da-f]{6}$/i.test(p.value))patch[p.field]=p.value;else if(fonts.includes(p.field)&&fontsForLanguage(FONTS,context.language).some(f=>f.id===p.value))patch[p.field]=p.value;else if(Object.hasOwn(ranges,p.field)&&Number.isFinite(Number(p.value))&&Number(p.value)>=ranges[p.field][0]&&Number(p.value)<=ranges[p.field][1])patch[p.field]=Number(p.value);else if(Object.hasOwn(enums,p.field)&&enums[p.field].includes(p.value))patch[p.field]=p.value;else throw new ChatEditError('Use only available design options and readable sizes.');}
 return {...reviewed,design:Object.keys(patch).length?designFor(context.template,{...context.design,...patch,language:context.language}):null};
}
export async function generateChatEdit({generate,review,context,sources}){
 let repair=null;
 for(let attempt=0;attempt<2;attempt++)try{
  const value=await generate(repair),result=check(value,context,sources),input={targetLanguage:context.language||'en',statements:result.changes.map((c,i)=>({id:'edit-'+i,text:c.proposed,evidence:c.evidence}))};
  if(input.statements.length){const checked=await review(input);try{validateGroundingReview(checked,input);}catch(e){throw new ChatEditError(e.message);}}
  return result;
 }catch(error){if(!(error instanceof ChatEditError)&&!isStudioOutputError(error))throw error;if(attempt===1)throw error;repair={instruction:'Correct every reported issue. Do not add unsupported facts or alter protected records. Return a complete edit response or ask confirmationQuestions.',issue:error.message};}
}
