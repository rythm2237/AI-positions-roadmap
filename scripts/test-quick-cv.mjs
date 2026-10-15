import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {quickKnowledge,quickQuestions,quickReport,preserveQuickSections} from '../src/lib/applicationStudio/quickFlow.mjs';
import {knowledgeSources} from '../src/lib/applicationStudio/knowledge.mjs';
import {designFor,splitSections} from '../src/lib/applicationStudio/design.mjs';
import {structureSources} from '../src/lib/applicationStudio/structure.mjs';
const cv=[{id:'h',title:'Header',text:'Alex Morgan\nalex@example.test'},{id:'s',title:'Skills',text:'Python: beginner'},{id:'e',title:'Education',text:'Associate Degree in Architecture - 2023'}];
const context={candidate:cv.map(s=>s.title+'\n'+s.text).join('\n\n'),cv,vacancy:'IT apprenticeship; German communication is required.'};
const kb=quickKnowledge(context);
const questions=quickQuestions({jobLanguage:'de',questions:Array.from({length:8},(_,i)=>({id:'q'+i,question:'Question '+i,entityId:'invalid',kind:'skills',type:'choice',options:[{label:'Beginner',value:'My Python knowledge is at beginner level.'},{label:'None',value:'I have not used Python.'}]}))},kb);
assert.equal(questions.questions.length,5);assert.equal(questions.questions[0].entityId,'');
assert.throws(()=>quickKnowledge({...context,quickAnswers:Array.from({length:6},(_,i)=>({id:'q'+i,question:'Question',answer:'Value'}))}),/five/);
const answered=quickKnowledge({...context,quickAnswers:[{id:'q',question:'German level?',answer:'My German level is B1.',kind:'languages',entityId:'',skipped:false},{id:'q2',question:'SAP?',answer:'I use SAP.',skipped:true}]});
const facts=Object.values(knowledgeSources(answered)).join('\n');assert(facts.includes('My German level is B1.'));assert(!facts.includes('I use SAP.'));assert(!facts.includes('German level?'));
assert.throws(()=>quickKnowledge({...context,quickAnswers:[{id:'q',question:'Question',answer:'Fact',entityId:'another-user-record'}]}),/different CV record/);
const original=structuredClone(cv);const restored=preserveQuickSections([{id:'new',title:'Skills',text:'Python: basic practical familiarity'}],cv);assert.deepEqual(cv,original);assert.deepEqual(restored.map(s=>s.id),['h','s','e']);assert(restored.some(s=>s.text.includes('Associate Degree')));
const unknown=[{id:'i',title:'Interests',text:'Linux'},{id:'r',title:'References',text:'Available on request'}];assert.equal(preserveQuickSections([{id:'new',title:'Interests',text:'Linux systems'}],unknown)[1].text,'Available on request');
const duplicateSource=[{id:'h2',title:'Header',text:'Alex Example'},{id:'sum1',title:'Professional Summary',text:'Beginner IT applicant.'},{id:'sum2',title:'Kurzprofil',text:'Beginner IT applicant.'},{id:'sk1',title:'Skills',text:'Python: beginner'}];
const canonical=preserveQuickSections([
 {id:'generated-summary-en',title:'Professional Summary',displayTitle:'Kurzprofil',text:'Motivierte Bewerbung für eine IT-Ausbildung.'},
 {id:'generated-summary-de',title:'Kurzprofil',displayTitle:'Kurzprofil',text:'Motivierte Bewerbung für eine IT-Ausbildung.'},
 {id:'generated-skills',title:'Skills',displayTitle:'IT-Kenntnisse',text:'Python: Grundkenntnisse'}
],duplicateSource);
assert.equal(canonical.filter(s=>['summary'].includes((s.title==='Professional Summary'||s.title==='Kurzprofil')?'summary':'')).length,1);
assert.equal(canonical.filter(s=>s.displayTitle==='Kurzprofil').length,1);
assert.equal(canonical.find(s=>s.id==='sum1').text,'Motivierte Bewerbung für eine IT-Ausbildung.');
const blocks=structureSources('SKILLS\nPython: beginner\n\nEXPERIENCE\nExample GmbH\n2024');
assert.deepEqual(blocks.map(x=>x.block),[0,0,1,1,1]);
assert.deepEqual(blocks.map(x=>x.lineInBlock),[0,1,0,1,2]);
const d=designFor('Professional',{layout:'sidebar-left',sourceColumns:{skills:'side',education:'main',experience:'main'}});const g=splitSections(cv,d);assert.deepEqual(g.side.map(s=>s.id),['s']);assert(g.main.some(s=>s.id==='e'));
const matrix=[{requirement:'Python',priority:'Preferred',category:'tools',level:'Strong Match',evidenceIds:['CV1'],vacancyQuote:'Python',screeningGate:false},{requirement:'German',priority:'Mandatory',category:'languages',level:'Unknown',evidenceIds:[],vacancyQuote:'German',screeningGate:true}];const r=quickReport({matrix});assert.equal(r.score,33);assert.equal(r.gaps[0].status,'Unknown');assert.equal(r.strengths.length,1);assert(!('probability' in r));
const route=await fs.readFile('src/app/api/application-studio/[action]/route.ts','utf8');assert(route.indexOf('supabase.auth.getUser')<route.indexOf('runQuickOperation(aiAction'));assert(route.indexOf('consumeBetaAiQuota(user.id')<route.indexOf('runQuickOperation(aiAction'));
console.log('PASS: five-question cap, skipped/confirmed evidence isolation, account-record guards, original sections, layout placement, original-only score, shared auth/quota entry.');
