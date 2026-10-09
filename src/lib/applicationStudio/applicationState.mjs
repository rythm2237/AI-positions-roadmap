const fields=['id','mode','job','vacancy','url','cv','analysis','analysisVacancy','contentStrategy','intelligenceDraft','protectedIntelligence','languageVersions','rejectedSectionIds','rejectedIntelligence','rejectedWording','cover','motivation','language','requestedLanguage','cvGenerationVersion','cvPagePolicy','template','design','letterDesigns','versions','final','status','contentReviewed','profileText','skippedQuestions','knowledgeConsent'];
export function sanitizeApplication(input){
 if(!input||typeof input!=='object'||!/^[a-z0-9-]{1,80}$/.test(input.id)||!Array.isArray(input.cv)||input.cv.length>100||input.cv.some(s=>!s||typeof s.id!=='string'||typeof s.title!=='string'||typeof s.text!=='string')||input.cv.reduce((n,s)=>n+s.text.length,0)>100000)throw Error('Invalid application document.');
 const result=Object.fromEntries(fields.filter(k=>input[k]!==undefined).map(k=>[k,structuredClone(input[k])]));
 if(Array.isArray(result.versions))result.versions=result.versions.slice(-10);
 if(JSON.stringify(result).length>1500000)throw Error('Application is too large to save. Download an editable backup instead.');
 return result;
}
