import assert from 'node:assert/strict';
import {MockLanguageModelV3} from 'ai/test';
import {generateStudioObject,StudioOutputError} from '../src/lib/applicationStudio/structuredGeneration.mjs';
import {studioOutputSchema} from '../src/lib/applicationStudio/outputSchemas.mjs';
import {recoverStructure,structureSources} from '../src/lib/applicationStudio/structure.mjs';
import {importKnowledge,emptyKnowledge} from '../src/lib/applicationStudio/knowledge.mjs';

const fixtures={
 structure:{sections:[{title:'Header',items:[{sourceIds:['L0'],kind:'body'}]}],warnings:[]},
 strategy:{narrative:'Use real planning experience.',employerObjectives:[],priorities:[],sectionOrder:[],questions:[],newFacts:[],warnings:[]},
 generate:{sections:[],warnings:[]},
 analysis:{job:{company:'Example',title:'Planner',location:'Not stated',employmentType:'Not stated',seniority:'Not stated',salary:'Not stated',visa:'Not stated',languages:'Not stated',responsibilities:[],education:[],tools:[]},matrix:[],gaps:[],confirmationQuestions:[],companySummary:'Unknown'},
 changes:{changes:[],confirmationQuestions:[],reply:'No changes.'},
 cover:{paragraphs:[{text:'Dear Hiring Team,',evidenceIds:[]}],confirmationQuestions:[]},
 motivation:{paragraphs:[],confirmationQuestions:['What motivates you?']},
 interview:{questions:[{category:'Gap',question:'What planning tools did you use?',framework:'Describe actual work.',evidenceIds:[]}],readiness:'Review actual evidence.'},
 optimise:{rewrites:[]},
};
const response=(text,reason='stop')=>({content:[{type:'text',text}],finishReason:{unified:reason,raw:reason},usage:{inputTokens:{total:10},outputTokens:{total:10}},warnings:[]});
const settings={system:'Return the requested candidate document.',prompt:'Synthetic data only.',maxOutputTokens:1000,abortSignal:AbortSignal.timeout(10000)};
for(const [action,fixture] of Object.entries(fixtures)){
 const model=new MockLanguageModelV3({doGenerate:response(JSON.stringify(fixture))});
 const result=await generateStudioObject({settings,model,schema:studioOutputSchema(action)});
 assert.deepEqual(result.output,fixture);
 assert.equal(model.doGenerateCalls[0].responseFormat.type,'json');
 assert(model.doGenerateCalls[0].responseFormat.schema,'Provider receives the actual output schema');
}
let charged=0;
const repaired=new MockLanguageModelV3({doGenerate:[response('Not JSON'),response(JSON.stringify(fixtures.cover))]});
await generateStudioObject({settings,model:repaired,schema:studioOutputSchema('cover'),onInferenceComplete:()=>charged++});
assert.equal(repaired.doGenerateCalls.length,2,'Malformed output receives one bounded repair');
assert(charged>0,'Completed invalid output is not treated as a pre-inference failure');
const invalid=new MockLanguageModelV3({doGenerate:response('{"sections":')}),source='Taylor Morgan\nExperience\nOperations Planner — Example Warehouse\nPlanned inventory.\nEducation\nBachelor of Business — 2019';
let recovered;
try{await generateStudioObject({settings,model:invalid,schema:studioOutputSchema('structure'),retryInvalid:false});}catch(error){assert(error instanceof StudioOutputError);recovered=recoverStructure(structureSources(source),'Source recovered after invalid AI output.');}
assert.equal(invalid.doGenerateCalls.length,1,'Structure failure recovers without extra inference');
const kb=importKnowledge(emptyKnowledge(),{text:source,sections:recovered.sections});
assert(kb.entities.some(e=>e.kind==='education'));
assert(kb.claims.some(c=>c.original.includes('Planned inventory')));
const alwaysInvalid=new MockLanguageModelV3({doGenerate:response('{}')});
await assert.rejects(generateStudioObject({settings,model:alwaysInvalid,schema:studioOutputSchema('strategy')}),StudioOutputError);
assert.equal(alwaysInvalid.doGenerateCalls.length,2,'Schema-invalid output cannot loop indefinitely');
let calls=0;const denied=Object.assign(new Error('Budget denied'),{name:'GatewayError',statusCode:402});
await assert.rejects(generateStudioObject({settings,model:'configured-model',schema:studioOutputSchema('cover')},async()=>{calls++;throw denied;}),error=>error===denied);
assert.equal(calls,1,'Budget/auth failures do not trigger output repair or policy bypass');
console.log('Structured SDK regression PASS: 9 action schemas reach provider, malformed JSON is bounded, source recovery preserves education, and budget failures stay separate. Uses mock model transport, not live inference.');
