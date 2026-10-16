import {stableId} from '../applicationStudio/knowledge.mjs';
import {isSensitiveCareerClaim} from './careerPrivacy.mjs';

export const REPAIR_KINDS=['header','experience','skills','education','certifications','development','projects','languages','summary','portfolio','additional','other'];
const normal=value=>String(value||'').normalize('NFKC').replace(/\s+/g,' ').trim().toLowerCase();
export function repairCandidates(kb,kind,limit=40){
 if(!REPAIR_KINDS.includes(kind))throw Error('Choose one professional section.');
 const entities=new Map(kb.entities.map(e=>[e.id,e]));
 const skipped={sensitive:0,manual:0};
 const candidates=[];
 for(const claim of kb.claims){
  if(!claim.confirmed||claim.retracted||kb.declined.includes(claim.id))continue;
  const entity=entities.get(claim.entityId);
  if(!entity||entity.kind!==kind)continue;
  if(isSensitiveCareerClaim(claim,entity)){skipped.sensitive++;continue;}
  if(claim.verification==='candidate-confirmed'){skipped.manual++;continue;}
  if(!String(claim.original||'').trim())continue;
  candidates.push({id:claim.id,kind:entity.kind,label:String(entity.label||'').slice(0,150),text:String(claim.original||'').slice(0,1800),sourceType:claim.sourceType||'cv'});
 }
 return {kind,candidates:candidates.slice(0,limit),remaining:Math.max(0,candidates.length-limit),skipped};
}
const num=value=>String(value||'').match(/\d+(?:[.,]\d+)?%?/g)||[];
export function validateRepairProposals(kb,kind,proposals,allowedIds){
 if(!REPAIR_KINDS.includes(kind)||!Array.isArray(proposals)||proposals.length>40)throw Error('Invalid review proposals.');
 const allowed=new Set(allowedIds);
 const original=new Map(kb.claims.map(c=>[c.id,c]));
 const entities=new Map(kb.entities.map(e=>[e.id,e]));
 const used=new Set(),items=[];
 for(const proposal of proposals){
  if(!proposal||typeof proposal.label!=='string'||!proposal.label.trim()||proposal.label.length>150||
    typeof proposal.text!=='string'||!proposal.text.trim()||proposal.text.length>2000||
    !REPAIR_KINDS.includes(proposal.kind)||!Array.isArray(proposal.sourceClaimIds)||
    !proposal.sourceClaimIds.length||proposal.sourceClaimIds.length>35)throw Error('Invalid profile record.');
  const ids=[...new Set(proposal.sourceClaimIds)];
  if(ids.length!==proposal.sourceClaimIds.length)throw Error('Duplicate evidence references.');
  const sources=ids.map(id=>{
    const claim=original.get(id),entity=claim&&entities.get(claim.entityId);
    if(!allowed.has(id)||!claim||!entity||!claim.confirmed||claim.retracted||kb.declined.includes(id)||
      entity.kind!==kind||claim.verification==='candidate-confirmed'||isSensitiveCareerClaim(claim,entity))throw Error('Source evidence changed. Reload this section.');
    if(used.has(id))throw Error('One source cannot be overwritten by two proposals.');
    return claim;
  });
  const allSourceText=sources.map(c=>c.original).join(' ');
  // Reject invented numbers even if a model produces plausible-looking dates.
  const originalNumbers=new Set(num(allSourceText));
  if(num(proposal.text).some(n=>!originalNumbers.has(n)))throw Error('A proposal contains unsupported dates or numeric claims.');
  // Check substantial source support for AI output, but allow joining fragments,
  // punctuation, whitespace and user-confirmed edits with review.
  const tokens=normal(proposal.text).match(/[\p{L}\p{N}+#.]{3,}/gu)||[];
  const combined=new Set(normal(allSourceText).match(/[\p{L}\p{N}+#.]{3,}/gu)||[]);
  const supported=tokens.length?tokens.filter(t=>combined.has(t)).length/tokens.length:1;
  if(supported<0.68 && !proposal.edited)throw Error('A proposed record is not grounded in the original CV.');
  ids.forEach(id=>used.add(id));
  items.push({kind:proposal.kind,label:proposal.label.trim(),text:proposal.text.trim(),sourceClaimIds:ids,edited:proposal.edited===true});
 }
 return items;
}
export function applyRepair(kb,kind,proposals,allowedIds){
 const safe=validateRepairProposals(kb,kind,proposals,allowedIds);
 if(!safe.length)throw Error('Select at least one reviewed record.');
 const next=structuredClone(kb),now=new Date().toISOString();
 const retirable=new Set(safe.flatMap(i=>i.sourceClaimIds));
 const candidates=next.claims.filter(c=>!c.retracted&&c.confirmed&&!next.declined.includes(c.id)&&!retirable.has(c.id));
 const existing=new Set(candidates.map(c=>{
  const entity=next.entities.find(e=>e.id===c.entityId);
  return (entity?.kind||'other')+'|'+normal(c.original);
 }));
 for(const r of safe){
  const value=r.kind+'|'+normal(r.text);
  if(!existing.has(value)){
    const entityId=stableId('repaired-'+r.kind,r.label);
    let entity=next.entities.find(e=>e.id===entityId);
    if(!entity){entity={id:entityId,kind:r.kind,label:r.label,fields:{},claimIds:[],metadata:{},repaired:true};next.entities.push(entity);}
    const id=stableId('claim',entityId+'|'+r.text);
    const source=next.claims.find(c=>c.id===r.sourceClaimIds[0]);
    if(!next.claims.some(c=>c.id===id))next.claims.push({
      id,sourceId:source?.sourceId||null,sourceType:source?.sourceType||'cv',original:r.text,meaning:r.text,
      entityId,location:'reconstructed:'+kind,verification:r.edited?'candidate-confirmed':'candidate-reported',
      sourceClaimIds:r.sourceClaimIds,confirmed:true,retracted:false,updatedAt:now,
    });
    if(!entity.claimIds.includes(id))entity.claimIds.push(id);
    existing.add(value);
  }
 }
 for(const claim of next.claims){
  if(retirable.has(claim.id)){claim.retracted=true;if(!next.declined.includes(claim.id))next.declined.push(claim.id);}
 }
 next.revision++;
 if(next.claims.length>6000||JSON.stringify(next).length>1500000)throw Error('The profile exceeds its safe storage limit.');
 return next;
}
