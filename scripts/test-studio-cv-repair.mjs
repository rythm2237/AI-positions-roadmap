import assert from 'node:assert/strict';
import {emptyKnowledge,importKnowledge} from '../src/lib/applicationStudio/knowledge.mjs';
import {validateStrategy,validateGeneratedCV,groundingIssues} from '../src/lib/applicationStudio/intelligence.mjs';
import {generationEvidenceRecords,generateGroundedCV,CVEvidenceError,cvEvidenceFailureCode} from '../src/lib/applicationStudio/cvGeneration.mjs';
import {StudioOutputError} from '../src/lib/applicationStudio/structuredGeneration.mjs';
const knowledge=importKnowledge(emptyKnowledge(),{text:'Taylor Morgan\nExperience\nOperations Planner — Company One\n2022 - Present\n• Planned inventory and reduced processing errors by 15 %.\n\nService Coordinator — Company Two\n2019 - 2022\n• Documented service issues.\nEducation\nBachelor of Business — University — 2019\nSkills\nInventory planning; Reporting'});
const strategy=validateStrategy({narrative:'Relevant operational planning evidence',priorities:generationEvidenceRecords(knowledge).map(e=>({...e,treatment:'retain',pageOne:false,reason:'Retain source evidence'}))},knowledge);strategy.approved=true;
const entities=knowledge.entities.filter(e=>e.kind==='experience');assert.equal(entities.length,2);
const value={sections:knowledge.entities.map(e=>({title:{header:'Header',experience:'Experience',education:'Education',skills:'Skills'}[e.kind],items:e.claimIds.map(id=>{const c=knowledge.claims.find(c=>c.id===id);return {text:c.original,evidenceIds:[id],entityId:e.id,kind:c.anchor?'heading':'body'};})})),warnings:[]};
const first=value.sections.find(s=>s.title==='Experience'),body=first.items.find(i=>i.kind==='body');
const mixed=structuredClone(value);mixed.sections.find(s=>s.title==='Experience').items.find(i=>i.kind==='body').evidenceIds.push(entities[1].claimIds.at(-1));
assert.throws(()=>validateGeneratedCV(mixed,knowledge,strategy),/mixes professional records/);
const numeric=structuredClone(value);numeric.sections.find(s=>s.title==='Experience').items.find(i=>i.kind==='body').text='Reduced errors by 99% over 8 years.';
assert.throws(()=>validateGeneratedCV(numeric,knowledge,strategy),/Unsupported date or metric/);
assert.equal(groundingIssues('Reduced processing errors by 15%.',['Reduced processing errors by 15 %.']).length,0,'Percentage spacing is presentation only');
assert.equal(groundingIssues('۱۵٪',['Reduced errors by 15 %.']).length,0,'Persian percentage glyphs preserve the metric');
assert(groundingIssues('Reduced errors by 15%.',['Processed 15 orders.']).length,'A count cannot support a percentage');
const synthesis=structuredClone(value);synthesis.sections.find(s=>s.title==='Skills').items.push({text:'Inventory planning and documented service issues.',entityId:entities[0].id,evidenceIds:[body.evidenceIds[0],entities[1].claimIds.at(-1)],kind:'body'});
assert(validateGeneratedCV(synthesis,knowledge,strategy).sections.find(s=>s.title==='Skills').text.includes('documented service'));
const omitted=structuredClone(strategy);omitted.priorities.find(p=>p.entityId===entities[1].id).treatment='omit';assert.throws(()=>validateGeneratedCV(synthesis,knowledge,omitted),/omitted/);
const before=JSON.stringify(knowledge),current=[{id:'manual',title:'Summary',text:'My saved manual wording.'}],currentBefore=JSON.stringify(current);
const review=async input=>({languageValid:true,checks:input.statements.map(s=>({id:s.id,status:'supported'}))});
for(const invalid of [mixed,numeric]){
 let calls=0,feedback;
 const draft=await generateGroundedCV({knowledge,strategy,current,language:'en',review,generate:async repair=>{calls++;feedback=repair;return calls===1?invalid:value;}});
 assert.equal(calls,2);assert(feedback.issue);assert.deepEqual(feedback.rejectedDraft,invalid,'Repair receives the exact rejected draft, not just an opaque error');assert(feedback.instruction.includes('EVERY statement'));assert(draft.warnings.some(w=>w.includes('automatically rewritten')));
 assert(draft.sections.some(s=>s.title==='Education'));assert(draft.sections.find(s=>s.title==='Experience').text.includes('Company Two'));
 assert(!draft.sections.map(s=>s.text).join(' ').includes('99%'));assert(draft.operations.every(o=>o.status==='pending'));
}
let calls=0,reviews=0;
let semanticRepair;
await generateGroundedCV({knowledge,strategy,language:'en',generate:async repair=>{calls++;semanticRepair=repair;return value;},review:async input=>{reviews++;return {languageValid:true,checks:input.statements.map((s,i)=>({id:s.id,status:reviews===1&&i===0?'unsupported':'supported'}))};}});assert.equal(calls,2);assert.equal(reviews,2,'Semantic validation also triggers a complete repair/review');assert(semanticRepair.reviewedStatements.length);assert.equal(semanticRepair.groundingFeedback.checks[0].status,'unsupported');assert(semanticRepair.reviewedStatements.some(s=>s.id===semanticRepair.groundingFeedback.checks[0].id));assert.deepEqual(semanticRepair.rejectedDraft,value);
assert.equal(cvEvidenceFailureCode(new CVEvidenceError('The evidence review was incomplete.')),'review-coverage');assert.equal(cvEvidenceFailureCode(new CVEvidenceError('The generated prose did not match the requested CV language.')),'language');
calls=0;await assert.rejects(generateGroundedCV({knowledge,strategy,review,generate:async()=>{calls++;return numeric;}}),CVEvidenceError);assert.equal(calls,2);
calls=0;await generateGroundedCV({knowledge,strategy,review,generate:async()=>{calls++;if(calls===1)throw new StudioOutputError();return value;}});assert.equal(calls,2);
for(const statusCode of [401,402,429]){const failure=Object.assign(new Error('Provider failure'),{statusCode});calls=0;await assert.rejects(generateGroundedCV({knowledge,strategy,review,generate:async()=>{calls++;throw failure;}}),e=>e===failure);assert.equal(calls,1);}
const provider=new Error('Reviewer access denied');calls=0;await assert.rejects(generateGroundedCV({knowledge,strategy,generate:async()=>{calls++;return value;},review:async()=>{throw provider;}}),e=>e===provider);assert.equal(calls,1);
assert.equal(JSON.stringify(knowledge),before);assert.equal(JSON.stringify(current),currentBefore);
console.log('PASS: screenshot record/metric errors repaired once; skills synthesis, percentage spacing, omitted evidence, semantic/schema checks, source/manual preservation and provider error separation. Model responses are simulated.');
