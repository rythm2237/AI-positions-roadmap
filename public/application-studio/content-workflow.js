'use strict';
function cvLengthPanel(){
 const a=app(),pages=window.CareerDocs?.approximatePages?.(a.cv,a.template,a.design,a.portrait)||1;
 const plan=a.cvPlan,pending=a.pendingCVPlan;
 return `<div class="card content-budget"><div class="pillrow"><strong>Application CV · ${pages<=2?'Compact / optimal':'Too long'} · about ${pages} estimated page${pages>1?'s':''}</strong><span class="badge">${plan?'Selective CV v2':'Original / edited CV'}</span></div><p class="tiny muted">Keep your complete profile. Create a focused CV for this application, then review what is included. Exact pages are checked with the PDF renderer.</p><div class="actions"><button id="optimiseCV" class="primary">Create concise CV · 1–2 pages</button><button id="rewriteCV" ${!account||S.demo?'disabled':''}>AI concise rewrite</button><button id="measureCV">Check exact page count</button></div><p class="tiny">PDF exports are limited to two pages. Your complete source profile is preserved.</p>${a.measuredPages?'<p class="tiny">Last PDF check: '+a.measuredPages+' page(s). Check again after edits or design changes.</p>':''}${pending?`<div class="note"><strong>Concise draft ready · ${pending.measuredPages||pending.estimatedPages} page(s)</strong><p>Your current CV stays unchanged until you apply this draft. ${pending.evidence.filter(e=>!e.included).length} source items are left out; your master profile is preserved.</p><div class="actions"><button id="applyCVPlan" class="primary">Review & use this draft</button><button id="discardCVPlan">Keep current CV</button></div><details><summary>Preview proposed content</summary><pre class="content-plan-preview">${esc(pending.sections.map(s=>s.title+'\n'+s.text).join('\n\n'))}</pre></details><details><summary>Items left out & reasons</summary>${pending.evidence.filter(e=>!e.included).map(e=>'<p class="tiny"><strong>'+esc(e.reason)+'</strong><br>'+esc(e.text)+'</p>').join('')}</details>${pending.warnings.map(w=>'<p class="tiny warning">'+esc(w)+'</p>').join('')}</div>`:''}${plan?`<details><summary>Restore excluded source items</summary><p class="tiny">Restoring an item may increase CV length. Analysis comments cannot be restored into the CV.</p>${plan.evidence.filter(e=>!e.included&&!/Analysis/.test(e.reason)).map(e=>`<div class="change tiny"><p>${esc(e.roleHeading||e.sectionTitle)} · ${esc(e.text)}</p><button data-restore-evidence="${esc(e.id)}">Restore this item</button></div>`).join('')||'<p class="tiny">No excluded items.</p>'}</details>`:''}</div>`;
}
function contentInput(){const a=app();return {sections:clone(a.cv),vacancy:isGeneral()?'':a.vacancy,targetRole:isGeneral()?'':a.job.title||'',template:a.template,design:a.design,portrait:a.portrait,language:a.language};}
async function prepareConciseCV(useAI=false){
 const a=app(),tools=await documentTools(),input=contentInput();
 let plan=await tools.optimiseCV(input);
 if(useAI){
  if(!S.consent){if(!confirm('Send the selected CV evidence and target job to the configured AI provider for a concise rewrite? This uses one AI review allowance.'))throw Error('AI rewrite canceled.');S.consent=true;}
  const response=await api('ai',{action:'optimise',context:{...context(),template:a.template,design:a.design,portrait:!!a.portrait}});
  plan=response.plan;
  const measured=await tools.measureCV({kind:'cv',...input,sections:plan.sections});
  if(measured>2)throw Error('AI draft exceeds two pages. Use the local concise draft or adjust the content. Current CV unchanged.');
  plan.measuredPages=measured;
 }
 plan.inputSignature=JSON.stringify(input);a.pendingCVPlan=plan;save();
}
function bindContentWorkflow(){
 const on=(id,fn)=>{if($(id))$(id).onclick=fn;};
 on('rebuildCV',()=>run('CV understanding',async()=>{await reconstructCandidate(true);await syncCompletedLearning();await prepareConciseCV(false);}));
 on('optimiseCV',()=>run('CV content selection',()=>prepareConciseCV(false)));
 on('rewriteCV',()=>run('Concise AI rewrite',()=>prepareConciseCV(true)));
 on('measureCV',()=>run('CV page check',async()=>{app().measuredPages=await(await documentTools()).measureCV(doc('cv'));}));
 on('applyCVPlan',()=>{
  const a=app(),plan=a.pendingCVPlan;
  if(!plan)return;
  if(plan.inputSignature!==JSON.stringify(contentInput()))return toast('CV or design changed. Create a fresh concise draft before applying.',true);
  version('Before content selection');snapshot();a.cv=clone(plan.sections);a.cvPlan={...clone(plan),approved:true};a.pendingCVPlan=null;a.cvGenerationVersion=2;a.cvPagePolicy=a.cvPagePolicy||'standard';a.measuredPages=plan.measuredPages;a.contentReviewed=true;version('Concise application CV v2');render();
 });
 on('discardCVPlan',()=>{app().pendingCVPlan=null;render();});

 document.querySelectorAll('[data-restore-evidence]').forEach(b=>b.onclick=()=>{const a=app(),e=a.cvPlan.evidence.find(x=>x.id===b.dataset.restoreEvidence);if(!e||e.included)return;snapshot();let section=a.cv.find(s=>s.title===e.sectionTitle);if(!section){section={id:uid(),title:e.sectionTitle,text:''};a.cv.push(section);}section.text+=(section.text?'\n':'')+(e.roleHeading?e.roleHeading+'\n':'')+e.text;e.included=true;e.reason='Restored by user';a.measuredPages=null;version('Restored source item');render();});
 document.querySelectorAll('[data-hide-section]').forEach(b=>b.onclick=()=>{const a=app(),s=a.cv.find(x=>x.id===b.dataset.hideSection);if(!s)return;snapshot();a.hiddenSections=a.hiddenSections||[];a.hiddenSections.push(clone(s));a.cv=a.cv.filter(x=>x.id!==s.id);render();});
 document.querySelectorAll('[data-show-section]').forEach(b=>b.onclick=()=>{const a=app(),s=a.hiddenSections?.find(x=>x.id===b.dataset.showSection);if(!s)return;snapshot();a.cv.push(clone(s));a.hiddenSections=a.hiddenSections.filter(x=>x.id!==s.id);render();});
}

async function validateExportCV(){await cleanCVFurniture();checkOutputLanguage();const a=app(),tools=await documentTools();const sourceCheck=tools.validateCV(a.cv,{maxSummary:a.cvGenerationVersion===2?100:Infinity});if(!sourceCheck.valid)throw Error(sourceCheck.issues.join('. '));const pages=await tools.measureCV(doc('cv'));if(pages>2)throw Error('CV exceeds two pages. Create and review a concise draft for this template before exporting. Your current CV is unchanged.');}

async function cleanCVFurniture(){const a=app(),tools=await documentTools();if(!tools.normalizeSection)return;const cleaned=a.cv.map(s=>({...s,text:tools.normalizeSection(s).text}));if(JSON.stringify(cleaned)!==JSON.stringify(a.cv)){version('Before extraction cleanup');snapshot();a.cv=cleaned;a.pendingCVPlan=null;a.measuredPages=null;save();}}

async function reviewTwoPageFit(){
 const a=app();a.design=selectedDesign();a.measuredPages=await(await documentTools()).measureCV(doc('cv'));
 if(a.measuredPages<=2)return true;
 await prepareConciseCV(false);render();toast('Review and apply the proposed two-page draft, then continue to CV preview.');return false;
}
