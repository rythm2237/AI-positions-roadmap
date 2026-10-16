// Classification used for professional profile display and external reuse.
// Private source claims remain in the owner's backup/history until reviewed.
const financeLabel=/^(?:bank(?:\s+(?:name|account|details|number))?|banksz[aá]mlasz[aá]m|bank neve|sz[aá]mlasz[aá]m|iban|bic|swift|routing number|account number|adóazonosító|taj(?:\s+sz[aá]m)?|tax(?:\s+(?:number|id))?|ssn|social security|birth(?:\s+date)?|date of birth|passport|szem[eé]lyi|national id|شماره\s*حساب|شماره\s*کارت|شماره\s*ملی|اطلاعات\s*بانکی|نام\s*بانک)\b/i;
const financeStatement=/\b(?:bank\s*(?:account|number|details)|banksz[aá]mlasz[aá]m|bank\s+neve|sz[aá]mlasz[aá]m|iban|bic\/swift|passport\s*(?:no|number)|ad[oó]azonos[ií]t[oó]|taj\s*sz[aá]m|tax\s*id|social\s*security\s*number)\s*[:：]/i;
const moneyIdentifier=/\b[A-Z]{2}\d{2}(?:[\s-]?[A-Z0-9]){11,30}\b|\b\d{8}[- ]\d{8}(?:[- ]\d{8})?\b/;
export function isSensitiveCareerText(value,kind=''){
 const text=String(value||'').normalize('NFKC').trim();
 if(!text)return false;
 if(moneyIdentifier.test(text)||financeStatement.test(text))return true;
 if(kind==='header'){
   const first=text.split(/[:\n]/,1)[0].trim();
   if(financeLabel.test(first))return true;
 }
 return false;
}
export function isSensitiveCareerClaim(claim,entity){
 return isSensitiveCareerText(claim?.original||'',entity?.kind||'') ||
  isSensitiveCareerText(entity?.label||'',entity?.kind||'');
}
export function sensitiveClaimIds(knowledge){
 const entities=new Map((knowledge?.entities||[]).map(e=>[e.id,e]));
 return (knowledge?.claims||[]).filter(c=>c.confirmed&&!c.retracted&&
   !(knowledge.declined||[]).includes(c.id)&&isSensitiveCareerClaim(c,entities.get(c.entityId)))
   .map(c=>c.id);
}
