import {isMetaContent} from './contentEngine.mjs';
import {createHash} from 'node:crypto';
import https from 'node:https';import dns from 'node:dns/promises';import net from 'node:net';
import { CATEGORIES, LEVEL_POINTS, recruiterAssessment } from './recruiter.mjs';
export class ServiceError extends Error{constructor(message,status=400){super(message);this.status=status}}
export function sourceMap(cv,linkedin=''){const out={};for(const [p,text] of [['CV',cv],['LI',linkedin]])text.split('\n').forEach((line,i)=>{if(line.trim())out[p+(i+1)]=line.trim()});return out}
export function vacancySourceMap(text){const out={};String(text).split(/\n+|(?<=[.!?])\s+/).filter(part=>part.trim()).forEach((part,i)=>{out['VAC'+(i+1)]=part.trim()});return out}
const refs=(ids,source)=>Array.isArray(ids)?[...new Set(ids.filter(id=>typeof id==='string'&&Object.hasOwn(source,id)))]:[];
const numbers=s=>new Set(s.match(/\b\d+(?:[.,]\d+)?%?\b/g)||[]);
export function validate(action,result,context,sources){
 if(!result||typeof result!=='object'||Array.isArray(result))throw new ServiceError('AI returned an invalid object.');
 if(action==='analysis'){
  if(!Array.isArray(result.matrix)||!result.matrix.length||result.matrix.length>100||!result.job||typeof result.job!=='object')throw new ServiceError('AI returned an invalid analysis.');
  result.qualityWarnings=[];
  for(const r of result.matrix){if(!r||!r.requirement||!CATEGORIES.includes(r.category)||!Object.hasOwn(LEVEL_POINTS,r.level)||!['Mandatory','Preferred','Nice to Have'].includes(r.priority))throw new ServiceError('AI returned an invalid requirement row.');r.evidenceIds=refs(r.evidenceIds,sources);r.evidence=r.evidenceIds.map(id=>sources[id]);if(['Strong Match','Partial Match','Transferable Skill'].includes(r.level)&&!r.evidenceIds.length){r.evidenceReferenceInvalid=true;r.level='Unknown';r.explanation='The AI cited no valid CV source for this positive match. This row was downgraded to Unknown; refresh analysis before relying on it.';result.qualityWarnings.push('Evidence citation could not be resolved for: '+r.requirement)}}
  const seen=new Set();result.matrix=result.matrix.filter(r=>{const key=String(r.requirement).toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');if(seen.has(key))return false;seen.add(key);return true;});
  const vacancySources=vacancySourceMap(context.vacancy||'');
  const normalized=t=>String(t).replace(/\s+/g,' ').trim().toLowerCase();
  for(const r of result.matrix){
   if(r.vacancySourceId!==undefined&&(typeof r.vacancySourceId!=='string'||!Object.hasOwn(vacancySources,r.vacancySourceId)))throw new ServiceError('AI returned an invalid vacancy source reference.');
   const quote=r.vacancySourceId?vacancySources[r.vacancySourceId]:typeof r.vacancyQuote==='string'?r.vacancyQuote.trim():'';
   r.vacancyQuote=quote&&normalized(context.vacancy||'').includes(normalized(quote))?quote:'';
   if(!r.vacancyQuote)throw new ServiceError('A requirement could not be traced to the vacancy. Retry with the complete job advert.');
   r.screeningGate=r.screeningGate===true&&r.priority==='Mandatory'&&['eligibility','languages','education','seniority'].includes(r.category);
  }
  const review=recruiterAssessment(result.matrix);result.recruiter=review;result.score=review.score;result.categories=review.categories;result.scoreNote=review.scoreNote;
  if(!Array.isArray(result.gaps))result.gaps=[];for(const r of result.matrix)if(r.priority==='Mandatory'&&['Missing','Unknown'].includes(r.level)&&!result.gaps.some(g=>g.requirement===r.requirement&&g.type==='Critical Gap'))result.gaps.push({requirement:r.requirement,type:'Critical Gap',why:'Mandatory requirement lacks confirmed evidence.',questions:[]});
 }else if(action==='changes'){
  if(!Array.isArray(result.changes))throw new ServiceError('Invalid proposal list.');const valid=[],blocked=[];
  for(const c of result.changes){if(isMetaContent(c.proposed)){blocked.push('AI analysis commentary cannot be inserted into a CV.');continue;}const section=context.cv?.find(s=>s.id===c.sectionId);if(!section||typeof c.original!=='string'||!c.original||!section.text.includes(c.original)||typeof c.proposed!=='string'||!c.proposed.trim()){blocked.push('A stale or invalid proposal was blocked.');continue}if(context.selectedSection&&c.sectionId!==context.selectedSection)continue;const ids=refs(c.evidenceIds,sources);if(!ids.length){blocked.push('A proposal lacked candidate evidence.');continue}const evidence=ids.map(id=>sources[id]),supported=evidence.join(' '),known=numbers(c.original+' '+supported);const newNumbers=[...numbers(c.proposed)].filter(n=>!known.has(n));const risky=['SAP PP','MES','ERP','production order management','manufacturing production planning'].filter(term=>new RegExp('\\b'+term+'\\b','i').test(c.proposed)&&!new RegExp('\\b'+term+'\\b','i').test(supported));const officialLine=section.text.split('\n').some((line,i)=>line.trim()===c.original.trim()&&(/—|\s-\s|\s@\s/.test(line)||(i===0&&/experience|employment|berufserfahrung|expérience/i.test(section.title))));if(newNumbers.length||risky.length||(officialLine&&!c.proposed.includes(c.original))){blocked.push('Unsupported specialist claim, metric or official title change blocked.');continue}const id=createHash('sha256').update(c.sectionId+'\0'+c.original+'\0'+c.proposed).digest('hex');if(context.rejected?.includes(id))continue;valid.push({...c,id,evidenceIds:ids,evidence,safe:c.original===c.proposed,needsConfirmation:c.original!==c.proposed,status:'pending'})}
  result.changes=valid;result.blocked=blocked;
 }else if(action==='cover'||action==='motivation'){
  if(!Array.isArray(result.paragraphs)||result.paragraphs.some(p=>!p||typeof p.text!=='string'))throw new ServiceError('Invalid letter response.');result.paragraphs=result.paragraphs.map(p=>({...p,evidenceIds:refs(p.evidenceIds,sources),evidence:refs(p.evidenceIds,sources).map(id=>sources[id]),needsConfirmation:true}));result.reviewRequired=true;
 }else if(action==='interview'&&!Array.isArray(result.questions))throw new ServiceError('Invalid interview response.');return result;
}
function publicIP(ip){if(net.isIP(ip)===4){const a=ip.split('.').map(Number);return !(a[0]===0||a[0]===10||a[0]===127||a[0]>=224||(a[0]===169&&a[1]===254)||(a[0]===172&&a[1]>=16&&a[1]<=31)||(a[0]===192&&(a[1]===168||a[1]===0))||(a[0]===100&&a[1]>=64&&a[1]<=127)||(a[0]===198&&(a[1]===18||a[1]===19||a[1]===51))||(a[0]===203&&a[1]===0))}return false;}
function htmlText(value=''){
 return String(value).replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>/gi,' ')
  .replace(/<\/?(?:p|div|br|li|h[1-6]|section|tr)\b[^>]*>/gi,'\n').replace(/<[^>]*>/g,' ')
  .replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&#x([\da-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16)))
  .replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'")
  .split('\n').map(line=>line.replace(/\s+/g,' ').trim()).filter(Boolean).join('\n').trim();
}
function jobPostingFromJsonLd(html){
 const walk=(value,out=[],depth=0)=>{if(depth>20||value==null)return out;if(Array.isArray(value)){for(const item of value)walk(item,out,depth+1)}else if(typeof value==='object'){const type=value['@type'];if((Array.isArray(type)?type:[type]).some(item=>{const normalized=String(item||'').toLowerCase();return normalized==='jobposting'||normalized.endsWith('/jobposting')||normalized.endsWith('#jobposting')}))out.push(value);for(const item of Object.values(value))if(item&&typeof item==='object')walk(item,out,depth+1)}return out};
 for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
  if(!/\btype\s*=\s*["']application\/ld\+json["']/i.test(match[1]))continue;
  try{const parsed=JSON.parse(match[2].replace(/^\uFEFF/,''));const postings=walk(parsed);if(postings.length)return postings[0]}catch{}
 }
 return null;
}
function jsonText(value){return typeof value==='string'?htmlText(value):typeof value==='number'?String(value):''}
function fieldText(value){if(Array.isArray(value))return value.map(fieldText).filter(Boolean).join(', ');if(value&&typeof value==='object')return jsonText(value.description||value.name||value.value||value.category||'');return jsonText(value)}
function locationText(value){const locations=Array.isArray(value)?value:value?[value]:[];return locations.map(place=>{const a=place?.address||place||{},country=typeof a.addressCountry==='object'?a.addressCountry.name:a.addressCountry;return[a.streetAddress,a.addressLocality,a.addressRegion,a.postalCode,country,place?.name].map(jsonText).filter(Boolean).join(', ')}).filter(Boolean).join(' · ')}
function salaryText(value){if(!value||typeof value!=='object')return jsonText(value);const unit=value.value&&typeof value.value==='object'?value.value:value;const amount=[unit.minValue,unit.maxValue,unit.value].filter(v=>v!=null).map(jsonText).join('–');return[amount,value.currency||value.value?.currency,unit.unitText].filter(Boolean).join(' ')}
export function extractJobPosting(html){
 const posting=jobPostingFromJsonLd(html);if(!posting)return{description:'',job:{}};
 const organization=posting.hiringOrganization?.name||posting.hiringOrganization?.legalName||'';
 const locations=locationText(posting.jobLocation)||locationText(posting.applicantLocationRequirements);
 const workplace=String(posting.jobLocationType||'').toUpperCase()==='TELECOMMUTE'?'Remote':jsonText(posting.jobLocationType);
 const experience=fieldText(posting.experienceRequirements?.description||posting.experienceRequirements?.monthsOfExperience||posting.experienceRequirements);
 return{description:htmlText(posting.description||''),job:{title:jsonText(posting.title),company:jsonText(organization),location:locations,employmentType:fieldText(posting.employmentType),workplaceType:workplace,experienceLevel:experience,salary:salaryText(posting.baseSalary),datePosted:jsonText(posting.datePosted),validThrough:jsonText(posting.validThrough),category:fieldText(posting.occupationalCategory),industry:fieldText(posting.industry),skills:fieldText(posting.skills),educationRequirements:fieldText(posting.educationRequirements),qualifications:fieldText(posting.qualifications),responsibilities:fieldText(posting.responsibilities),workHours:fieldText(posting.workHours),applicationMethod:posting.directApply===true?'Direct applications accepted':posting.directApply===false?'External application process':''}};
}
export async function fetchPublic(url,lookup=dns.lookup){
 for(let n=0;n<5;n++){
  let target;try{target=new URL(url)}catch{throw new ServiceError('Enter a valid public HTTPS URL.')}
  if(target.protocol!=='https:'||target.username||target.password||(target.port&&target.port!=='443')||/(^|\.)linkedin\.com$/i.test(target.hostname))throw new ServiceError('Use a public HTTPS URL. LinkedIn pages cannot be fetched; paste profile text or upload your export.');
  const addresses=await lookup(target.hostname,{all:true,family:4});if(!addresses.length||addresses.some(x=>!publicIP(x.address)))throw new ServiceError('Private, reserved and local addresses are blocked.');const ip=addresses[0].address;
  const response=await new Promise((resolve,reject)=>{const req=https.get(target,{headers:{'User-Agent':'CareerAtelier/2.0',Accept:'text/html,text/plain'},lookup:(host,options,cb)=>{if(options?.all)cb(null,[{address:ip,family:4}]);else cb(null,ip,4)},timeout:20000},res=>{if([301,302,303,307,308].includes(res.statusCode)){res.resume();resolve({redirect:res.headers.location});return}if(res.statusCode!==200){res.resume();reject(new ServiceError('Public page unavailable. Paste its text instead.'));return}let bytes=0,chunks=[];res.on('data',b=>{bytes+=b.length;if(bytes>2*1024*1024){req.destroy();reject(new ServiceError('Public page exceeds 2 MB.'))}else chunks.push(b)});res.on('end',()=>resolve({type:res.headers['content-type'],data:Buffer.concat(chunks).toString('utf8')}));res.on('error',reject)});req.on('timeout',()=>req.destroy(new ServiceError('Public page timed out.')));req.on('error',reject)});
  if(response.redirect){url=new URL(response.redirect,target).href;continue}if(!/text\/(html|plain)/i.test(response.type||''))throw new ServiceError('Upload this document or paste its text.');
  const html=/html/i.test(response.type||''),structured=html?extractJobPosting(response.data):{description:'',job:{}},pageText=html?htmlText(response.data):htmlText(response.data);
  let text=structured.description.length>=80?structured.description:pageText;
  if(text.length<80)throw new ServiceError('Page contains too little readable text. Paste the vacancy.');
  if(structured.description.length>=80){const facts=Object.entries({Position:structured.job.title,Company:structured.job.company,Location:structured.job.location,'Employment type':structured.job.employmentType,'Work arrangement':structured.job.workplaceType,'Experience level':structured.job.experienceLevel,Salary:structured.job.salary,'Date posted':structured.job.datePosted,'Apply by':structured.job.validThrough,Category:structured.job.category,Industry:structured.job.industry,Skills:structured.job.skills,'Education requirements':structured.job.educationRequirements,Qualifications:structured.job.qualifications,Responsibilities:structured.job.responsibilities,'Working hours':structured.job.workHours,'Application method':structured.job.applicationMethod}).filter(([,value])=>value);text=[...facts.map(([label,value])=>`${label}: ${value}`),'Vacancy description:',text].join('\n')}
  return{text:text.slice(0,100000),url:target.href,retrievedAt:new Date().toISOString(),job:structured.job};
 }
 throw new ServiceError('Too many redirects.');
}
export async function limitedText(request){const limit=2*1024*1024;if(Number(request.headers.get('content-length'))>limit)throw new ServiceError('Request too large.',413);if(!request.body)return '';const reader=request.body.getReader(),decoder=new TextDecoder();let text='',bytes=0;try{for(;;){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>limit){await reader.cancel();throw new ServiceError('Request too large.',413)}text+=decoder.decode(value,{stream:true})}return text+decoder.decode()}finally{reader.releaseLock()}}
