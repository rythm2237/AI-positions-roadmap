import assert from 'node:assert/strict';
import {quickKnowledge,quickStrategy,preserveQuickSections} from '../src/lib/applicationStudio/quickFlow.mjs';
import {prepareQuickCV,recoverQuickCV} from '../src/lib/applicationStudio/quickCVRecovery.mjs';
import {generateGroundedCV,CVEvidenceError} from '../src/lib/applicationStudio/cvGeneration.mjs';
import {knowledgeSources} from '../src/lib/applicationStudio/knowledge.mjs';
const cv=[{id:'h',title:'Header',text:'Alex Beispiel\nalex@example.test'},{id:'e',title:'Experience',text:'Assistenz — Beispiel GmbH\n2023 - 2025\n• Dokumentierte Arbeitsabläufe.'},{id:'s',title:'Skills',text:'Python: Grundkenntnisse\nDeutsch: B1'},{id:'ed',title:'Education',text:'Abschluss Architektur — 2022'}];
const context={candidate:cv.map(s=>s.title+'\n'+s.text).join('\n\n'),cv,vacancy:'Ausbildung Fachinformatik Systemintegration',quickAnswers:[{id:'q',question:'Motivation?',answer:'Ich möchte lernen, wie zuverlässige IT-Systeme funktionieren.',kind:'other',entityId:''}]};
const knowledge=quickKnowledge(context),strategy=quickStrategy(knowledge,context),sources=knowledgeSources(knowledge);
const skill=knowledge.entities.find(e=>e.kind==='skills'),experience=knowledge.entities.find(e=>e.kind==='experience');
const skillRef=skill.claimIds.find(id=>sources[id].includes('Python')),experienceRef=experience.claimIds.find(id=>sources[id].includes('Dokumentierte'));
const raw={sections:[{title:'Header',items:[{text:'Fake qualification 9999',entityId:'wrong',evidenceIds:['wrong'],kind:'body'}]},{title:'Summary',items:[{text:'Grundkenntnisse in Python.',entityId:skill.id,evidenceIds:[skillRef],kind:'body'},{text:'Experte für produktive Cloud-Infrastruktur.',entityId:skill.id,evidenceIds:[skillRef],kind:'body'}]},{title:'Experience',items:[{text:'Dokumentierte Arbeitsabläufe.',entityId:experience.id,evidenceIds:[experienceRef],kind:'bullet'},{text:'Spart 99% Kosten mit SAP.',entityId:experience.id,evidenceIds:[experienceRef],kind:'bullet'},{text:'Fremde Daten.',entityId:experience.id,evidenceIds:[skillRef],kind:'bullet'}]}],warnings:[]};
const before=JSON.stringify({knowledge,cv,raw});
const prepared=prepareQuickCV(raw,knowledge);
assert(!JSON.stringify(prepared).includes('9999'));assert(!JSON.stringify(prepared).includes('99%'));assert(!JSON.stringify(prepared).includes('Fremde Daten'));
const options={knowledge,strategy,current:cv,language:'de',prepareDraft:value=>prepareQuickCV(value,knowledge),finalizeSections:sections=>preserveQuickSections(sections,cv),reviewDocument:true};
const check=input=>({languageValid:true,checks:input.statements.map(s=>({id:s.id,status:s.text.includes('Experte')?'unsupported':'supported',reason:'Must be source-backed'}))});
let generated=0,reviewed=0,failure;
try{await generateGroundedCV({...options,generate:async()=>{generated++;return structuredClone(raw);},review:async input=>{reviewed++;assert(input.documentSections.length);return check(input);}});}catch(error){failure=error;}
assert(failure instanceof CVEvidenceError);assert.equal(generated,2);assert.equal(reviewed,2);
let finalReview;
const recovered=await recoverQuickCV({...options,error:failure,review:async input=>{finalReview=input;return check(input);}});
const text=recovered.sections.map(s=>s.text).join('\n');
assert(text.includes('Grundkenntnisse in Python.'));assert(!text.includes('Experte'));assert(!text.includes('SAP'));assert(text.includes('Beispiel GmbH'));assert(text.includes('2023 - 2025'));assert(text.includes('Abschluss Architektur'));assert(text.includes('alex@example.test'));assert.equal(recovered.sections[0].id,'h');assert(finalReview.documentSections.some(s=>s.text.includes('Abschluss Architektur')));assert(recovered.warnings.some(w=>w.includes('omitted')));
// A missing review row cannot authorize recovery, even if the rest look safe.
for(const mutate of [x=>x.checks.pop(),x=>x.checks.push(x.checks[0]),x=>{x.languageValid=false;},x=>{x.checks[0].status='invented';}]){
 const error=new CVEvidenceError(failure.issue,structuredClone(failure.details));mutate(error.details.groundingFeedback);let called=false;await assert.rejects(recoverQuickCV({...options,error,review:async()=>{called=true;return {};}}),e=>e===error);assert.equal(called,false);
}
// The actual final export, including restored source prose, must pass language
// and semantic checks. Provider failures remain provider failures.
await assert.rejects(recoverQuickCV({...options,error:failure,review:async input=>({...check(input),languageValid:false})}),CVEvidenceError);
await assert.rejects(recoverQuickCV({...options,error:failure,review:async input=>({...check(input),checks:[]})}),CVEvidenceError);
const provider=new Error('Provider quota');await assert.rejects(recoverQuickCV({...options,error:failure,review:async()=>{throw provider;}}),e=>e===provider);
// If every rewrite fails, restore truthful source records, disclose the fallback,
// and still check the complete exported language instead of claiming new facts.
const allBad=new CVEvidenceError(failure.issue,structuredClone(failure.details));allBad.details.groundingFeedback.checks.forEach(c=>c.status='unsupported');
const original=await recoverQuickCV({...options,error:allBad,review:async input=>({languageValid:true,checks:input.statements.map(s=>({id:s.id,status:'supported'}))})});assert(original.sections.some(s=>s.text.includes('Dokumentierte Arbeitsabläufe.')));assert(!original.sections.some(s=>s.text.includes('Experte')));
assert.equal(JSON.stringify({knowledge,cv,raw}),before);
console.log('PASS: protected originals, invalid references/metrics removed, bounded rewrite then verified partial recovery, original records retained, full-export language and complete semantic coverage enforced; source unchanged. Model responses simulated.');
