import assert from 'node:assert/strict';
import {structureSources,validateStructure} from '../src/lib/applicationStudio/structure.mjs';
import {parseProfile,planCV} from '../src/lib/applicationStudio/contentEngine.mjs';
import {translationContext,protectTranslation,restoreTranslation,validateTranslation} from '../src/lib/applicationStudio/translation.mjs';
const source='Taylor Example\ntaylor@example.invalid\nWarehouse Co.\nOperations Planner\nMay 2025 - Present\nI use operational data to\nimprove warehouse flow.\nCertifications\nThe International certificate for\nBusiness competence/ Level A\nCompTIA Network+';
const lines=structureSources(source);
const result=validateStructure({sections:[{title:'Header',items:[{sourceIds:['L0'],text:'Taylor Example'},{sourceIds:['L1'],text:'taylor@example.invalid'}]},{title:'Experience',items:[{sourceIds:['L2','L3'],text:'Warehouse Co. Operations Planner'},{sourceIds:['L4'],text:'May 2025 - Present'},{sourceIds:['L5','L6'],text:'• I use operational data to improve warehouse flow.'}]},{title:'Certifications',items:[{sourceIds:['L8','L9'],text:'• The International certificate for Business competence/ Level A'},{sourceIds:['L10'],text:'• CompTIA Network+'}]}]},lines);
assert.equal(result.sections[1].text.split('\n').length,3);
assert.equal(result.sections[2].text.split('\n').length,2);
assert.throws(()=>validateStructure({sections:[{title:'Header',items:[{sourceIds:['L0'],text:'Taylor Example, senior architect'}]}]},lines),/unsupported/);
const parsed=parseProfile('Taylor\nExperience\nWarehouse Co.\nOperations Planner\nMay 2025 - Present\n• I use operational data to\nimprove warehouse flow.\nCertifications\nThe International certificate for\nBusiness competence/ Level A\nCompTIA Network+');
const plan=planCV({sections:parsed,template:'Harbor'});
const experience=plan.sections.find(s=>s.title==='Experience').text;
assert.match(experience,/Warehouse Co.\nOperations Planner\nMay 2025/);
assert.match(experience,/• I use operational data to improve warehouse flow\./);
assert(!experience.includes('• improve warehouse'));
assert.equal(plan.sections.find(s=>s.title==='Certifications').text.split('\n').length,2);
const cv=[{id:'h',title:'Header',text:'Taylor\nwww.linkedin.com/in/taylor\n+36 12345678\ntaylor@example.invalid'},{id:'s',title:'Professional Summary',text:'Prepared operational reports in 2025 and improved inventory planning.'}];
for(const language of ['fa','hu']){
 const masked=protectTranslation(translationContext({cv,language}));
 const s=masked.input.sections;
 const translated={targetLanguage:language,sections:s.map(x=>({id:x.id,displayTitle:x.title==='Header'?'':language==='fa'?'خلاصه حرفه‌ای':'Szakmai összefoglaló',text:x.id==='h'?x.text:(language==='fa'?'تهیه گزارش‌های عملیاتی در ':'Operatív jelentések készítése ')+x.text.match(/__CVFACT_\d+__/)[0]+(language==='fa'?' و بهبود برنامه‌ریزی موجودی.':' és készlettervezés javítása.')}))};
 const restored=restoreTranslation(translated,masked),checked=validateTranslation(restored,cv,language);
 assert(checked.sections[1].text.includes('2025'));assert.equal(checked.sections[0].text,cv[0].text);
 const bad=structuredClone(translated);bad.sections[1].text=bad.sections[1].text.replace(/__CVFACT_\d+__/,'2026');assert.throws(()=>restoreTranslation(bad,masked),/protected/);
}
assert.throws(()=>validateTranslation({targetLanguage:'hu',sections:cv.map(x=>({...x,displayTitle:x.title}))},cv,'hu'),/untranslated/);
console.log('Reconstruction PASS: wrapped role sentences, company/title/date grouping, separate certificates, grounded source IDs, Persian/Hungarian protected facts and untranslated-output rejection.');
