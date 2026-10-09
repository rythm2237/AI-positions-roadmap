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
  if(sections){if(!Array.isArray(sections)||sections.length>100||sections.some(s=>!s||typeof s.title!=='string'||typeof s.text!=='string'||s.text.split('\n').filter(x=>x.trim()).some(line=>!clean(text).includes(clean(line.replace(/^\s*[•●▪*-]\s*/,''))))))throw Error('Structured facts do not match the original source.');}
  const next = structuredClone(kb), sourceId = stableId(type, text);
  if (next.sources.some(s => s.id === sourceId)) return next;
  next.sources.push({ id: sourceId, type, label: clean(label).slice(0,150), importedAt: at });
  // Preserve uncertain associations rather than guessing companies or dates.
  for (const section of sections?.length ? sections : parseProfile(text)) {
    const kind = sectionKind(section.title), parsed = ['experience','projects'].includes(kind) ? records(section) : section.text.split(/\n\s*\n/).map(text=>({heading:[],items:text.split('\n')}));
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
export function confirmFact(kb, { text, entityId, kind = 'other', label = '', field = 'context', status }, at = new Date().toISOString()) {
  if (typeof text !== 'string' || !text.trim() || text.length > 4000 || !allowedKinds.includes(kind)) throw Error('Enter a professional fact of up to 4,000 characters.');
  const next = structuredClone(kb);
  let entity = next.entities.find(e => e.id === entityId);
  if (!entity) { entity = { id: stableId(kind, label || text), kind, label: clean(label || text).slice(0,150), fields: {}, claimIds: [] }; next.entities.push(entity); }
  const original = text.trim(), sourceId = stableId('interview', original), id = stableId('claim', entity.id+'|'+original);
  if (!next.sources.some(s=>s.id===sourceId)) next.sources.push({id:sourceId,type:'interview',importedAt:at});
  if (!next.claims.some(c=>c.id===id)) next.claims.push({ id, sourceId, sourceType:'interview', location:field, original, meaning:original, entityId:entity.id, verification:'candidate-confirmed', confirmed:true, updatedAt:at });
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
