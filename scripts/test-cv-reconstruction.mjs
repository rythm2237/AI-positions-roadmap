import assert from 'node:assert/strict';
import {structureSources,validateStructure} from '../src/lib/applicationStudio/structure.mjs';
import {parseProfile,planCV} from '../src/lib/applicationStudio/contentEngine.mjs';
import {translationContext,protectTranslation,restoreTranslation,validateTranslation,translateUnits} from '../src/lib/applicationStudio/translation.mjs';
const source='Taylor Example\ntaylor@example.invalid\nWarehouse Co.\nOperations Planner\nMay 2025 - Present\nI use operational data to\nimprove warehouse flow.\nCertifications\nThe International certificate for\nBusiness competence/ Level A\nCompTIA Network+';
const lines=structureSources(source);
const result=validateStructure({sections:[{title:'Header',items:[{sourceIds:['L0'],text:'Taylor Example'},{sourceIds:['L1'],text:'taylor@example.invalid'}]},{title:'Experience',items:[{sourceIds:['L2','L3'],text:'Warehouse Co. Operations Planner'},{sourceIds:['L4'],text:'May 2025 - Present'},{sourceIds:['L5','L6'],text:'• I use operational data to improve warehouse flow.'}]},{title:'Certifications',items:[{sourceIds:['L8','L9'],text:'• The International certificate for Business competence/ Level A'},{sourceIds:['L10'],text:'• CompTIA Network+'}]}]},lines);
assert.equal(result.sections[1].text.split('\n').length,3);
assert.equal(result.sections[2].text.split('\n').length,2);
// Model prose is ignored: only validated source IDs can create CV facts.
const ignored=validateStructure({sections:[{title:'Header',items:[{sourceIds:['L0'],text:'Taylor Example, senior architect'}]}]},lines.slice(0,1));assert.equal(ignored.sections[0].text,'Taylor Example');
assert.throws(()=>validateStructure({sections:[{title:'Header',items:[{sourceIds:['FAKE'],kind:'heading'}]}]},lines),/unsupported/);

const parsed=parseProfile('Taylor\nExperience\nWarehouse Co.\nOperations Planner\nMay 2025 - Present\n• I use operational data to\nimprove warehouse flow.\nCertifications\nThe International certificate for\nBusiness competence/ Level A\nCompTIA Network+');
const plan=planCV({sections:parsed,template:'Harbor'});
const experience=plan.sections.find(s=>s.title==='Experience').text;
assert.match(experience,/Warehouse Co.\nOperations Planner\nMay 2025/);
assert.match(experience,/• I use operational data to improve warehouse flow\./);
assert(!experience.includes('• improve warehouse'));
assert.equal(plan.sections.find(s=>s.title==='Certifications').text.split('\n').length,2);
const cv=[{id:'h',title:'Header',text:'Taylor\nwww.linkedin.com/in/taylor\n+36 12345678\ntaylor@example.invalid'},{id:'s',title:'Professional Summary',text:'Prepared operational reports in 2025 and improved inventory planning.'}];
for(const language of ['fa','hu']){
 const protectedInput=protectTranslation(translationContext({cv,language}));
 const translated={targetLanguage:language,translations:protectedInput.input.units.map(u=>({id:u.id,text:u.context==='CV section heading'?(language==='fa'?'خلاصه حرفه‌ای':'Szakmai összefoglaló'):language==='fa'?'گزارش عملیاتی و برنامه‌ریزی موجودی':'Operatív jelentések és készlettervezés'}))};
 const restored=restoreTranslation(translated,protectedInput),checked=validateTranslation(restored,cv,language);
 assert(checked.sections[1].text.includes('2025'));assert.equal(checked.sections[0].text,cv[0].text);assert(!JSON.stringify(protectedInput.input).includes('__CVFACT_'));
 const bad=structuredClone(translated);bad.translations.pop();assert.throws(()=>restoreTranslation(bad,protectedInput),/missed/);
}
assert.throws(()=>validateTranslation({targetLanguage:'hu',sections:cv.map(x=>({...x,displayTitle:x.title}))},cv,'hu'),/untranslated/);
console.log('Reconstruction PASS: wrapped role sentences, company/title/date grouping, separate certificates, grounded source IDs, Persian/Hungarian protected facts and untranslated-output rejection.');

const large={targetLanguage:'fa',units:Array.from({length:125},(_,i)=>({id:'T'+i,text:'Prepared accurate inventory records and supported team handovers.',context:'Inventory experience'}))};
let calls=0,maxBatch=0;const attempts=new Map();
const repaired=await translateUnits(large,async input=>{calls++;maxBatch=Math.max(maxBatch,input.units.length);const key=input.units[0].id,n=attempts.get(key)||0;attempts.set(key,n+1);return {targetLanguage:'fa',translations:input.units.slice(n?0:1).map(u=>({id:u.id,text:'تهیه سوابق دقیق موجودی'}))};});
assert.equal(repaired.translations.length,125);assert(maxBatch<=20);assert(calls<=14);
await assert.rejects(translateUnits(large,async()=>({targetLanguage:'fa',translations:[]})),/after retry/);
await assert.rejects(translateUnits(large,async()=>({targetLanguage:'fa',translations:[{id:'UNKNOWN',text:'test'}]})),/Invalid translated unit/);
const {splitSections}=await import('../src/lib/applicationStudio/design.mjs');
const collapsed='Taylor Example Fulfilment Operational Flow Planner & Independent AI Product Builder Budapest, Hungary +36123456789 taylor@example.invalid www.linkedin.com/in/taylor';
const fixed=splitSections([{title:'Header',text:collapsed}]).header.text;
assert.equal(fixed.split('\n')[0],'Taylor Example');assert(fixed.includes('\ntaylor@example.invalid'));assert(fixed.includes('\n+36123456789'));
const preserved=validateStructure({sections:[{title:'Header',items:[{sourceIds:['L0','L1'],kind:'heading'}]}]},lines.slice(0,2));assert.equal(preserved.sections[0].text,'Taylor Example\ntaylor@example.invalid');
console.log('Large translation PASS: 125 units, bounded batches, missing-unit repair, strict incomplete/unknown rejection, and source-grounded header line preservation.');

const {detectLanguage}=await import('../src/lib/applicationStudio/languages.mjs');
assert.equal(detectLanguage('Prepared accurate operational reports and improved inventory planning by 30٪.'),'en');assert.equal(detectLanguage('تهیه گزارش‌های عملیاتی و برنامه‌ریزی موجودی'),'fa');
let badNumbers=0;const noAddedFacts=await translateUnits({targetLanguage:'fa',units:[{id:'T0',text:'Improved inventory flow',context:'in 2025'}]},async()=>({targetLanguage:'fa',translations:[{id:'T0',text:badNumbers++?'بهبود جریان موجودی':'بهبود جریان موجودی در 2025'}]}));assert.equal(noAddedFacts.translations[0].text,'بهبود جریان موجودی');assert.equal(badNumbers,2);
console.log('Language integrity PASS: English with Arabic punctuation stays English, Persian prose detection and context-fact retry.');
const partialCV=[{id:'s',title:'Professional Summary',text:'Prepared operational reports and improved inventory planning through accurate records and clear team handovers.'}];
assert.throws(()=>validateTranslation({targetLanguage:'fa',sections:[{id:'s',displayTitle:'خلاصه حرفه‌ای',text:partialCV[0].text+' — عالی'}]},partialCV,'fa'),/most CV prose/);
