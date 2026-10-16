import { parseProfile, sectionKind, records } from './contentEngine.mjs';

// IDs depend on professional content, never array position or an application CV.
const clean = value => String(value || '').normalize('NFKC').replace(/\s+/g, ' ').trim();
export function stableId(scope, value) {
  let hash = 2166136261, second=5381;
  for (const c of clean(value).toLowerCase()) { hash ^= c.codePointAt(0); hash = Math.imul(hash, 16777619);second=Math.imul(second,33)^c.codePointAt(0); }
  return `${scope}-${(hash >>> 0).toString(36)}-${(second>>>0).toString(36)}`;
}
export const emptyKnowledge = () => ({ schemaVersion: 1, revision: 0, sources: [], entities: [], claims: [], declined: [] });
const allowedKinds = ['header','summary','experience','projects','education','certifications','skills','languages','development','additional','other'];
const sourceTypes = ['cv','linkedin','interview','portfolio','certification','project-document','approved-cv','application','platform-learning'];
export function knowledgeSources(kb) {
  return Object.fromEntries(kb.claims.filter(c => !c.retracted && c.confirmed && !kb.declined.includes(c.id)).map(c => [c.id, c.original]));
}
export function importKnowledge(kb, { text, type = 'cv', sections, label = '' }, at = new Date().toISOString()) {
  if (!sourceTypes.includes(type) || typeof text !== 'string' || !text.trim() || text.length > 100000) throw Error('Invalid candidate source.');
  if(sections&&(!Array.isArray(sections)||sections.length>100||sections.some(s=>!s||typeof s.title!=='string'||typeof s.text!=='string')))throw Error('Invalid structured source sections.');
  // Reconstruction joins wrapped fragments and removes each source bullet.
  // Compare both sides using that same presentation normalization. A stale or
  // edited preview must never become source evidence: recover from the original.
  const sourceText=clean(text.split('\n').map(line=>line.replace(/^\s*[•●▪*-]\s*/, '')).join('\n'));
  const structureRecovered=Boolean(sections?.some(s=>s.text.split('\n').filter(x=>x.trim()).some(line=>!sourceText.includes(clean(line.replace(/^\s*[•●▪*-]\s*/,''))))));
  if(structureRecovered)sections=undefined;
  const next = structuredClone(kb), sourceId = stableId(type, text);
  if (next.sources.some(s => s.id === sourceId)) return next;
  next.sources.push({ id: sourceId, type, label: clean(label).slice(0,150), importedAt: at, ...(structureRecovered?{structureRecovered:true}:{}) });
  // Preserve uncertain associations rather than guessing companies or dates.
  for (const section of sections?.length ? sections : parseProfile(text)) {
    const kind = sectionKind(section.title), parsed = ['experience','projects'].includes(kind) ? records(section) : (['skills','languages','certifications','development'].includes(kind) ? section.text.split(/\n|(?<=\S)\s*[;,]\s*(?=\S)/) : section.text.split(/\n\s*\n/)).map(text=>({heading:[],items:['skills','languages','certifications','development'].includes(kind)?[text]:text.split('\n')}));
    for (const record of parsed) {
      const block=[...record.heading,...record.items].join('\n');if(!block.trim())continue;
      const lines = block.split('\n').map(clean).filter(Boolean);
      const entityId = stableId(kind, ['experience','projects','education'].includes(kind) ? lines.slice(0,3).join('|') : kind);
      let entity = next.entities.find(e => e.id === entityId);
      if (!entity) { entity = { id: entityId, kind, label: lines[0], fields: {}, claimIds: [] }; next.entities.push(entity); }
      lines.forEach((line, i) => {
        const original = line.replace(/^[•●▪*-]\s*/, '').trim(), id = stableId('claim', entityId + '|' + original);
        if (!next.claims.some(c => c.id === id)) next.claims.push({ id, sourceId, sourceType: type, location: `${section.title}:${i+1}`, original, meaning: original, entityId, anchor:record.heading.includes(line)||kind==='header', verification: 'candidate-reported', confirmed: true, updatedAt: at });
        if (!entity.claimIds.includes(id)) entity.claimIds.push(id);
      });
      const anchored=next.claims.filter(c=>c.entityId===entityId&&c.anchor);
      const date=anchored.find(c=>/\b(?:19|20)\d{2}\b/.test(c.original));if(date)entity.fields.dates={text:date.original,evidenceIds:[date.id]};
      if(kind==='header'){entity.fields.identity={text:lines[0],evidenceIds:entity.claimIds.slice(0,1)};entity.fields.contact={text:lines.slice(1).join('\n'),evidenceIds:entity.claimIds.slice(1)};}
      else if(record.items.length&&kind==='experience')entity.fields.responsibilities={text:record.items.join('\n'),evidenceIds:entity.claimIds.filter(id=>!anchored.some(c=>c.id===id))};
    }
  }
  next.revision++;if(next.claims.length>6000||JSON.stringify(next).length>1500000)throw Error('Your professional profile is too large. Remove obsolete facts before adding more.');return next;
}
export function confirmFact(kb, { text, entityId, kind = 'other', label = '', field = 'context', status, question, vacancyKey = '' }, at = new Date().toISOString()) {
  if (typeof text !== 'string' || !text.trim() || text.length > 4000 || !allowedKinds.includes(kind)) throw Error('Enter a professional fact of up to 4,000 characters.');
  if(question!==undefined&&(typeof question!=='string'||!question.trim()||question.length>2000||typeof vacancyKey!=='string'||vacancyKey.length>200))throw Error('Invalid confirmation question.');
  const next = structuredClone(kb);
  let entity = next.entities.find(e => e.id === entityId);
  if (!entity) { entity = { id: stableId(kind, label || text), kind, label: clean(label || text).slice(0,150), fields: {}, claimIds: [] }; next.entities.push(entity); }
  const original = text.trim(), sourceId = stableId('interview', original), id = stableId('claim', entity.id+'|'+original);
  if (!next.sources.some(s=>s.id===sourceId)) next.sources.push({id:sourceId,type:'interview',importedAt:at});
  if (!next.claims.some(c=>c.id===id)) next.claims.push({ id, sourceId, sourceType:'interview', location:field, original, meaning:original, entityId:entity.id, verification:'candidate-confirmed', confirmed:true, updatedAt:at });
  if(question){const claim=next.claims.find(c=>c.id===id);const clarifications=claim.clarifications||[];if(!clarifications.some(c=>c.question===question.trim()&&c.vacancyKey===vacancyKey))claim.clarifications=[...clarifications,{question:question.trim(),vacancyKey}];}
  if (!entity.claimIds.includes(id)) entity.claimIds.push(id);
  const fields = ['company','title','dates','location','responsibilities','processes','tools','outcomes','skills','problem','role','architecture','workflows','links','context','mobility','workAuthorization'];
  if (fields.includes(field)) entity.fields[field] = { text:original, evidenceIds:[id] };
  if (entity.kind==='projects' && ['concept','prototype','mvp','tested','production','operational'].includes(status)) entity.fields.implementationStatus = {text:status,evidenceIds:[id]};
  next.declined = next.declined.filter(x=>x!==id);if(JSON.stringify({...next,revision:kb.revision})===JSON.stringify(kb))return next;next.revision++; return next;
}
export function retractFact(kb,id) {
  const next=structuredClone(kb),claim=next.claims.find(c=>c.id===id);
  if(!claim)throw Error('Candidate fact not found.');
  claim.retracted=true; if(!next.declined.includes(id))next.declined.push(id);next.revision++;return next;
}
export function assertKnowledge(kb) {
  if (!kb || kb.schemaVersion!==1 || !Number.isInteger(kb.revision) || !Array.isArray(kb.entities) || !Array.isArray(kb.claims) || !Array.isArray(kb.sources) || !Array.isArray(kb.declined) || kb.claims.length>6000) throw Error('Invalid candidate knowledge.');
  return kb;
}


const metadataRules={
 skills:['category','level','yearsExperience','lastUsed','evidenceLink','relatedProjects'],
 experience:['employmentType','startDate','endDate','isCurrent','company','jobTitle','country'],
 education:['institution','degree','field','startDate','endDate','grade'],
 certifications:['issuer','issuedAt','expiresAt','credentialId','credentialUrl','status'],
 development:['provider','completedAt','status','hours'],
 projects:['projectType','status','projectUrl','repositoryUrl','startDate','endDate','role'],
 languages:['cefr','proficiency','certificate'],
 additional:['awardIssuer','awardedAt','url'],
 header:['city','country','phone','linkedin','website'],
 summary:['targetRole','industry'],
 other:['category','url']
};
const allowedLevels=['beginner','intermediate','advanced','expert','unknown'];
export function updateEntityMetadata(kb,{entityId,metadata}){
 const next=structuredClone(kb),entity=next.entities.find(e=>e.id===entityId);
 if(!entity)throw Error('Career record was not found.');
 if(!metadata||typeof metadata!=='object'||Array.isArray(metadata))throw Error('Invalid record details.');
 const allowed=metadataRules[entity.kind]||[];
 const normalized={};
 for(const [key,value] of Object.entries(metadata)){
  if(!allowed.includes(key))throw Error('Unsupported career record field.');
  if(value===null||value==='')continue;
  if(typeof value!=='string'&&typeof value!=='number'&&typeof value!=='boolean')throw Error('Invalid field value.');
  if(typeof value==='string'&&value.length>500)throw Error('Record detail is too long.');
  if(key==='level'&&!allowedLevels.includes(String(value).toLowerCase()))throw Error('Invalid skill level.');
  if(key==='yearsExperience'&&(!Number.isFinite(Number(value))||Number(value)<0||Number(value)>80))throw Error('Invalid experience duration.');
  normalized[key]=value;
 }
 entity.metadata={...entity.metadata,...normalized};
 for(const key of Object.keys(metadata))if(metadata[key]===null||metadata[key]==='')delete entity.metadata[key];
 if(JSON.stringify(entity.metadata)===JSON.stringify(kb.entities.find(e=>e.id===entityId).metadata||{}))return kb;
 next.revision++;return next;
}
export function moveKnowledgeFact(kb,{claimId,kind,label}){
 if(!allowedKinds.includes(kind)||typeof label!=='string'||!label.trim()||label.length>150)throw Error('Invalid destination section.');
 const next=structuredClone(kb),claim=next.claims.find(c=>c.id===claimId&&c.confirmed&&!c.retracted);
 if(!claim||next.declined.includes(claim.id))throw Error('Fact is no longer active.');
 const oldEntity=next.entities.find(e=>e.id===claim.entityId);
 if(!oldEntity)throw Error('Original record is missing.');
 const id=stableId(kind,label);
 if(id===oldEntity.id)return kb;
 let dest=next.entities.find(e=>e.id===id);
 if(!dest){dest={id,kind,label:clean(label),fields:{},claimIds:[]};next.entities.push(dest);}
 oldEntity.claimIds=oldEntity.claimIds.filter(x=>x!==claimId);
 claim.entityId=id;
 if(!dest.claimIds.includes(claim.id))dest.claimIds.push(claim.id);
 next.revision++;return next;
}
export function confirmFactBatch(kb,proposals){
 if(!Array.isArray(proposals)||proposals.length<1||proposals.length>25)throw Error('Confirm between 1 and 25 facts at once.');
 let next=kb;
 for(const p of proposals){
  if(!p||typeof p.text!=='string'||!p.text.trim())throw Error('Each fact must have text.');
  next=confirmFact(next,p);
 }
 return next;
}

export function questionKey(question){return clean(String(question)).toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();}
export function confirmedClarifications(kb,vacancy='',legacy={}){
 const active=(kb?.claims||[]).filter(c=>c.confirmed&&!c.retracted&&!(kb.declined||[]).includes(c.id)),vacancyKey=stableId('vacancy',vacancy),out=[];
 for(const c of active)for(const entry of c.clarifications||[])if(!entry.vacancyKey||entry.vacancyKey===vacancyKey)out.push({question:entry.question,answer:c.original,evidenceId:c.id,verification:c.verification});
 // Migrate earlier saved Q/A pairs only when the answer is really in this account's knowledge.
 for(const entry of Object.values(legacy||{})){if(!entry||typeof entry.question!=='string'||typeof entry.answer!=='string')continue;const c=active.find(c=>clean(c.original)===clean(entry.answer));if(c)out.push({question:entry.question,answer:c.original,evidenceId:c.id,verification:c.verification});}
 return [...new Map(out.map(x=>[questionKey(x.question),x])).values()];
}
export function unresolvedQuestions(questions,answers=[]){const answered=new Set(answers.map(a=>questionKey(a.question)));return (questions||[]).filter(q=>typeof q==='string'&&!answered.has(questionKey(q)));}
