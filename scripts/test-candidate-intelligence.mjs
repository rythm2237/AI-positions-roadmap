import assert from 'node:assert/strict';
import {emptyKnowledge,importKnowledge,confirmFact,retractFact,knowledgeSources} from '../src/lib/applicationStudio/knowledge.mjs';
import {validateStrategy,validateGeneratedCV,assessmentDimensions,groundingIssues,groundingReviewInput,validateGroundingReview} from '../src/lib/applicationStudio/intelligence.mjs';
import {sanitizeApplication} from '../src/lib/applicationStudio/applicationState.mjs';
import {structureSources,validateStructure} from '../src/lib/applicationStudio/structure.mjs';
const wrappedSource='Taylor Morgan\nExperience\nOperations Planner — Example Warehouse\n2022 - Present\n• Planned replenishment\n• and maintained stock records.\nEducation\nBachelor of Business — Example University — 2019';
const reconstructed=validateStructure({sections:[{title:'Header',items:[{sourceIds:['L0'],kind:'body'}]},{title:'Experience',items:[{sourceIds:['L2'],kind:'heading'},{sourceIds:['L3'],kind:'body'},{sourceIds:['L4','L5'],kind:'bullet'}]},{title:'Education',items:[{sourceIds:['L7'],kind:'body'}]}]},structureSources(wrappedSource));
const reconstructedKnowledge=importKnowledge(emptyKnowledge(),{text:wrappedSource,sections:reconstructed.sections});
assert(reconstructedKnowledge.claims.some(c=>c.original==='Planned replenishment and maintained stock records.'),'Server-reconstructed wrapped bullets remain valid source evidence');
assert(!reconstructedKnowledge.sources[0].structureRecovered,'Presentation-only bullet removal does not trigger recovery');
const staleSections=structuredClone(reconstructed.sections);staleSections[1].text+='\nDelivered 99% savings using SAP.';
const recoveredKnowledge=importKnowledge(emptyKnowledge(),{text:wrappedSource,sections:staleSections});
assert(recoveredKnowledge.sources[0].structureRecovered,'Stale or edited preview recovers from the original instead of blocking Next');
assert(!recoveredKnowledge.claims.some(c=>/99%|SAP/.test(c.original)),'Recovery never imports unsupported preview claims');
assert(recoveredKnowledge.entities.some(e=>e.kind==='education'),'Recovery retains original qualifications');
assert.deepEqual(importKnowledge(recoveredKnowledge,{text:wrappedSource,sections:staleSections}),recoveredKnowledge,'Recovery remains idempotent');
assert.throws(()=>importKnowledge(emptyKnowledge(),{text:wrappedSource,sections:[{title:'Experience',text:null}]}),/Invalid structured/);
const source=`Taylor Morgan
taylor@example.test
Professional Summary
Operations professional with inventory planning and automation projects.
Experience
Operations Planner — Example Warehouse
2022 - Present
• Planned replenishment and maintained accurate stock records.
• Prepared weekly spreadsheet reports.

Customer Support — Example Service
2019 - 2022
• Documented recurring service issues.
Projects
Inventory workflow prototype
• Built a prototype to reduce manual reporting using Power Automate.
Education
Bachelor of Business — Example University — 2019
Certifications
Excel reporting course — 2021
Skills
Inventory planning; Excel; Power Automate`;
let kb=importKnowledge(emptyKnowledge(),{text:source});const initial=structuredClone(kb);
assert.deepEqual(importKnowledge(kb,{text:source}),kb,'Repeat import is idempotent');
assert.equal(kb.entities.filter(e=>e.kind==='experience').length,2,'Employment records are separate');
assert.equal(kb.entities.filter(e=>e.kind==='projects').length,1);
assert(kb.claims.every(c=>c.sourceId&&c.id&&c.original&&c.verification==='candidate-reported'));
const employment=kb.entities.find(e=>e.kind==='experience');
kb=confirmFact(kb,{text:'Used IWS, Flytta and MHS for warehouse planning.',entityId:employment.id,field:'tools'});
const tools=kb.claims.find(c=>c.original.includes('IWS'));
assert.equal(tools.verification,'candidate-confirmed');assert(!Object.values(knowledgeSources(kb)).join(' ').includes('ERP'));
assert(initial.claims.length<kb.claims.length,'Saved facts grow without changing old documents');
function strategy(role,kind){return validateStrategy({narrative:role,priorities:kb.entities.map(e=>({entityId:e.id,evidenceIds:e.claimIds,treatment:e.kind===kind?'feature':'retain',pageOne:e.kind===kind,reason:e.kind===kind?'Relevant role evidence':'Retain professional history'})),questions:[],sectionOrder:['Professional Summary','Experience','Projects','Education','Certifications','Skills']},kb,role);}
const ai=strategy('AI Business Integrator','projects'),planner=strategy('Production Planner','experience');
assert.notDeepEqual(ai.priorities,planner.priorities,'Different jobs select meaningfully different evidence');
ai.approved=true;
const output={sections:kb.entities.map(e=>({title:{header:'Header',summary:'Professional Summary',experience:'Experience',projects:'Projects',education:'Education',certifications:'Certifications',skills:'Skills'}[e.kind],items:e.claimIds.map(id=>({text:kb.claims.find(c=>c.id===id).original,evidenceIds:[id],entityId:e.id,kind:kb.claims.find(c=>c.id===id).anchor?'heading':'body'}))})),warnings:[]};
const draft=validateGeneratedCV(output,kb,ai,[]);
const review=groundingReviewInput(draft,kb);assert(validateGroundingReview({checks:review.statements.map(s=>({id:s.id,status:'supported'}))},review));
assert.throws(()=>validateGroundingReview({checks:[]},review),/incomplete/);
assert.throws(()=>validateGroundingReview({checks:review.statements.map((s,i)=>({id:s.id,status:i?'supported':'unsupported'}))},review),/could not be established/);
const saved=sanitizeApplication({id:'test-application',cv:draft.sections,languageVersions:{en:{sections:draft.sections}},accessToken:'never-save',portrait:'never-save',versions:Array.from({length:20},()=>({cv:[]}))});
assert(!saved.accessToken&&!saved.portrait);assert.equal(saved.versions.length,10);assert(saved.languageVersions.en);
assert.throws(()=>sanitizeApplication({id:'../another-user',cv:[]}),/Invalid/);
assert(draft.sections.some(s=>s.title==='Education'));
assert(draft.sections.some(s=>s.title==='Certifications'));
assert(draft.operations.length>0);
assert.equal(validateGeneratedCV(output,kb,ai,draft.sections).operations.length,0,'Repeated generation proposes no duplicate sections');
assert.equal(validateGeneratedCV(output,kb,ai,[],draft.operations.map(o=>o.id)).operations.length,0,'Rejected wording stays rejected');
const duplicate=structuredClone(output);duplicate.sections[0].items.push(duplicate.sections[0].items[0]);
assert.equal(validateGeneratedCV(duplicate,kb,ai,[]).sections[0].text,draft.sections[0].text,'Duplicate statements removed');
assert(groundingIssues('Implemented SAP ERP MES and reduced costs by 45%.',[tools.original]).length>=4);
const invented=structuredClone(output);invented.sections[1].items[0].text='Delivered 99% savings using SAP ERP MES.';
assert.throws(()=>validateGeneratedCV(invented,kb,ai),/Unsupported/);
const unknown=structuredClone(output);unknown.sections[1].items[0].evidenceIds=['other-user-claim'];assert.throws(()=>validateGeneratedCV(unknown,kb,ai),/unknown/);
const missing={...output,sections:output.sections.filter(s=>s.title!=='Education'&&s.title!=='Certifications')};
const restored=validateGeneratedCV(missing,kb,ai);assert.equal(restored.sections.find(s=>s.title==='Education').text,'Bachelor of Business — Example University — 2019');
const matrix=[{priority:'Mandatory',level:'Strong Match',evidenceIds:[tools.id]},{priority:'Mandatory',level:'Unknown',evidenceIds:[],screeningGate:true}];
const before=assessmentDimensions({matrix},kb,[]),after=assessmentDimensions({matrix},kb,draft.sections);
assert.equal(before.professionalFit,after.professionalFit,'Wording never inflates professional fit');assert.equal(before.evidenceStrength,after.evidenceStrength);assert(after.presentation>before.presentation);assert.equal(after.eligibility,'Needs confirmation');
const removed=retractFact(kb,tools.id);assert(!Object.hasOwn(knowledgeSources(removed),tools.id));assert.throws(()=>validateGeneratedCV(output,removed,ai),/up-to-date/);
assert.throws(()=>validateStrategy({...ai,employerObjectives:[{text:'Fluent German',basis:'explicit',vacancyQuote:'Must speak German'}]},kb,'Warehouse planning'),/advertisement/);
console.log('Candidate intelligence: stable imports, separate records, confirmed tools, role strategies, full generation, preserved credentials, replay/rejection, provenance, no unsupported tools/metrics, and independent scores passed.');
