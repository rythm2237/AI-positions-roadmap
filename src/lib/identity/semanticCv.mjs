// Domain model shared by the AI extraction endpoint, profile UI and persistence.
// These are logical records (one address, one role, one credential), not PDF lines.
export const semanticKinds=['header','summary','experience','skills','education','certifications','development','projects','languages','additional','portfolio','preferences','other'];
export const semanticFields=['organisation','role','dates','location','issuer','level'];
export function normalizedSource(value){return String(value||'').normalize('NFKC').replace(/[\u2022\u25CF\u25AA]/g,' ').replace(/\s+/g,' ').trim().toLocaleLowerCase();}
export function containedQuote(source,quote){
 const s=normalizedSource(source),q=normalizedSource(quote);
 return q.length>=2 && s.includes(q);
}
export function semanticDuplicateKey(record){
 return [record.kind,normalizedSource(record.label),normalizedSource(record.text)].join('|');
}
export function semanticReview(text,records){
 if(typeof text!=='string'||text.trim().length<5||text.length>100000)throw Error('No readable document text found.');
 if(!Array.isArray(records)||records.length>100)throw Error('Too many extracted records.');
 const seen=new Set(),accepted=[],rejected=[];
 for(const [index,r] of records.entries()){
   if(!r||!semanticKinds.includes(r.kind)||typeof r.label!=='string'||!r.label.trim()||r.label.length>150||
      typeof r.text!=='string'||!r.text.trim()||r.text.length>2000||
      typeof r.sourceQuote!=='string'||r.sourceQuote.length>2500) {rejected.push({index,reason:'invalid fields'});continue;}
   if(!containedQuote(text,r.sourceQuote)){rejected.push({index,reason:'no matching source excerpt'});continue;}
   // A CV excerpt cannot prove any newly introduced numeric measurement or date.
   // Edited records require separate, explicit user confirmation.
   const originalNumbers=[...(r.sourceQuote.match(/\d+(?:[.,]\d+)?%?/g)||[])];
   const outputNumbers=[...(r.text.match(/\d+(?:[.,]\d+)?%?/g)||[])];
   const inventedNumber=outputNumbers.some(x=>!originalNumbers.includes(x));
   if(inventedNumber&&!r.edited){rejected.push({index,reason:'unsupported number'});continue;}
   const key=semanticDuplicateKey(r);
   if(seen.has(key))continue;
   seen.add(key);
   const details={};
   const comparable=v=>normalizedSource(v).replace(/[,;:–—-]/g,' ').replace(/\s+/g,' ').trim();
   const exactEvidence=comparable(r.sourceQuote);
   for(const field of semanticFields){
     const v=r.details?.[field];
     // Structured metadata must itself be explicitly supported by the excerpt.
     if(typeof v==='string'&&v.trim()&&v.length<=180&&exactEvidence.includes(comparable(v)))details[field]=v.trim();
   }
   accepted.push({kind:r.kind,label:r.label.trim(),text:r.text.trim(),sourceQuote:r.sourceQuote,details,edited:r.edited===true});
 }
 return {records:accepted,rejected};
}
export function groupSemanticRecords(records){
 const groups={};for(const k of semanticKinds)groups[k]=[];
 for(const item of records||[])if(groups[item.kind])groups[item.kind].push(item);
 return groups;
}
