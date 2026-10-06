// Guided document workflow. All state stays in the existing account-scoped workspace.
function migrateWorkflow(state){
 if(state.workflowVersion!==2){state.stage=[0,2,3,4,5,7,8,9,10][state.stage]??0;state.workflowVersion=2;}
 state.learning=Array.isArray(state.learning)?state.learning:[];
 state.stage=Math.max(0,Math.min(10,state.stage||0));return state;
}
function commitStage(){
 if($('candidateText')){const p=S.candidateProfile;p.text=$('candidateText').value;p.linkedinUrl=$('linkedinUrl').value.trim();p.linkedinText=$('linkedinText').value;}
 if($('learningTitle'))S.learningDraft={title:$('learningTitle').value,url:$('learningUrl').value,details:$('learningDetails').value,completed:$('learningComplete').checked};
 if($('companyText')){app().companyResearch={...app().companyResearch,text:$('companyText').value,url:$('companyUrl').value};app().motivationText=$('motivationText').value;}
 commitVacancy();
}
function confirmCandidate(){
 commitStage();const p=S.candidateProfile,text=p.text.trim();
 if(text.length<40)throw Error('Upload or paste a complete CV, then review its extracted text.');
 if(text.length>100000)throw Error('CV exceeds 100,000 characters.');
 if(p.linkedinUrl&&!/^https:\/\/(www\.)?linkedin\.com\/in\//i.test(p.linkedinUrl))throw Error('Use a LinkedIn profile URL beginning with https://www.linkedin.com/in/.');
 const a=app(),original=a.versions.findLast(v=>v.name==='Original');
 const unchanged=!a.cv.length||JSON.stringify(a.cv)===JSON.stringify(original?.cv);
 const sourceChanged=p.confirmedText!==text||p.confirmedLinkedin!==p.linkedinText||a.profileText&&a.profileText!==text;
 if(sourceChanged){
  if(a.cv.length&&!unchanged&&!confirm('This application has edits. Replace its current CV with the newly reviewed source? A copy of the current CV will be saved first. Cancel keeps your current application CV.'))throw Error('Current application CV kept. Review it in CV Design, or confirm the new source when ready.');
  const wasSample=S.demo;if(wasSample)leaveSampleForRealProfile();
  p.text=text;p.confirmedText=text;p.confirmedLinkedin=p.linkedinText;p.sections=sectionize(text);if(!p.original)p.original=text;
  if(a.cv.length)version('Before source update');a.cv=clone(p.sections);a.profileText=text;a.changes=[];a.approved=[];a.rejected=[];a.contentReviewed=false;
  a.versions.push({id:uid(),name:'Original',at:new Date().toISOString(),cv:clone(a.cv),approved:[]});S.applications.forEach(invalidate);
 }
 if(!a.cv.length){a.cv=clone(p.sections.length?p.sections:sectionize(text));p.sections=clone(a.cv);version('Original');}
 save();
}
function canVisit(stage){
 if(stage<0||stage>=navs.length)return false;
 if(stage>=2&&!app().cv.length){toast('Add your CV and press Next in Candidate first.',true);return false;}
 if(stage===3&&!app().analysis){toast('Add a vacancy and press Next to analyze it.',true);return false;}
 if(stage>=5&&stage<=8&&!app().contentReviewed){toast('Review your CV changes before choosing a design.',true);return false;}
 if(stage>=6&&stage<=8&&!app().designApplied){toast('Apply a CV design before opening its preview.',true);return false;}
 return true;
}
function stepFooter(){
 const last=S.stage===navs.length-1,next=navs[S.stage+1];return `<footer class="step-footer" aria-label="Step navigation"><button id="stepBack" ${S.stage===0?'disabled':''}>Back</button><div class="tiny muted">${last?'Download your documents here.':`Next: ${esc(next)}`}${[7,8].includes(S.stage)?' · Letters are optional.':''}</div>${last?'<button id="finishCV" data-stage="6">Return to CV preview</button>':`<button id="stepNext" class="primary">Next${S.stage===6?' · Cover Letter (optional)':''}</button>`}</footer>`;
}
async function nextStage(){
 commitStage();const a=app();
 if(S.stage===0)confirmCandidate();
 if(S.stage===1&&$('learningTitle')?.value.trim())throw Error('Save this learning item or clear its title before continuing.');
 if(S.stage===2){if(!a.vacancy.trim()&&a.url.trim()){const x=await api('fetch',{url:a.url});a.vacancy=x.text;a.url=x.url;if(x.job)a.job={...a.job,...x.job};}if(!a.vacancy.trim())throw Error('Paste the full vacancy or enter a public vacancy URL.');if(!a.analysis||assessmentStale())await analyze();else S.stage=3;render();window.scrollTo(0,0);return;}
 if(S.stage===3){if(assessmentStale())throw Error('Your CV or vacancy changed. Refresh analysis before requesting proposals.');if(!a.proposalsGenerated){await tailor();a.proposalsGenerated=true;}S.stage=4;render();window.scrollTo(0,0);return;}
 if(S.stage===4){if(a.changes.some(c=>c.status==='pending'))throw Error('Accept, edit or reject each pending proposal before design.');a.contentReviewed=true;}
 if(S.stage===5&&!a.designApplied)throw Error('Choose a template or reference, then click Apply design & preview.');
 S.stage=Math.min(S.stage+1,navs.length-1);render();window.scrollTo(0,0);
}
function learningView(){
 const items=S.learning||[],draft=S.learningDraft||{};return title('02 / LEARNING & EVIDENCE','Add what you have actually learned.','Optional: include completed learning and practical work. A profile or course link alone does not prove completion.')+`<div class="card"><h3>Microsoft learning profiles & course references</h3><label for="learningTitle">Course, service or project name</label><input id="learningTitle" placeholder="Microsoft Learn · Power Automate foundations" value="${esc(draft.title)}"><label for="learningUrl">Profile or course URL · optional</label><input id="learningUrl" type="url" placeholder="https://learn.microsoft.com/…" value="${esc(draft.url)}"><label for="learningDetails">What you completed or built · your own words</label><textarea id="learningDetails" placeholder="Describe completed modules or a real practical exercise. Avoid claiming work experience from a course.">${esc(draft.details)}</textarea><label class="check"><input id="learningComplete" type="checkbox" ${draft.completed?'checked':''}>I have completed this learning or practical work.</label><button id="saveLearning">Save learning item</button><p class="tiny muted">Links are saved as references. This editor does not sign in to Microsoft services or verify credentials. Your imported AI Career learning stays in the reviewed source text.</p></div>${items.map(item=>`<div class="card"><h3>${esc(item.title)}</h3><p>${esc(item.details)}</p><p class="tiny muted">${esc(item.url)}</p><span class="badge">${item.completed?'Completed · self-reported':'Planned · not a CV skill'}</span><div class="actions">${item.completed?`<button data-add-learning="${esc(item.id)}" ${item.addedTo?.includes(app().id)?'disabled':''}>${item.addedTo?.includes(app().id)?'Added as professional development':'Add completed learning to CV'}</button>`:''}<button data-remove-learning="${esc(item.id)}">Remove item</button></div></div>`).join('')}<div class="note">Planned learning stays outside the CV. Add an item only after completing it; describe it as learning or a project, rather than expertise or employment.</div>`;
}
function learningSuggestions(){
 const gaps=(app().analysis?.gaps||[]).filter(g=>g.learn||g.type==='Learnable Gap');return `<div class="card"><h3>Learning suggestions · before claiming a skill</h3><p>These suggestions are a learning plan. They are not added to your CV now.</p>${gaps.length?gaps.map(g=>`<div class="change"><strong>${esc(g.requirement)}</strong><p>${esc(g.learn||g.why)}</p><p class="tiny">${esc(g.depth||'Confirm the scope and practise it with a concrete exercise.')} · ${esc(g.priority||'Review priority')}</p><p class="tiny muted">After completion: return to Learning & evidence, record what you actually completed and choose whether to add it as professional development. A course cannot replace required professional experience.</p></div>`).join(''):'<p class="tiny muted">No specific short learning plan was returned. Use the gaps and confirmation questions in Match before adding any claims.</p>'}</div>`;
}
function scoreExplanation(x){
 const a=app(),points={'Strong Match':4,'Partial Match':2.5,'Transferable Skill':1.5,Missing:0,Unknown:0},weights={Mandatory:4,Preferred:2,'Nice to Have':1},rows=x.matrix||[],den=rows.reduce((n,r)=>n+weights[r.priority]*4,0),num=rows.reduce((n,r)=>n+weights[r.priority]*points[r.level],0);
 return `<div class="card"><h3>Why this score?</h3><p>${esc(x.score)} / 100 measures the evidence visible in this application CV. It is not your hiring probability or a measure of everything you can do.</p><p class="tiny">Weighted points: ${num} / ${den} → ${esc(x.score)} / 100. Unknown and missing evidence contribute zero; related experience earns transferable credit when supported.</p>${x.qualityWarnings?.length?`<div class="note warning">${x.qualityWarnings.map(esc).join('<br>')}</div>`:''}<p class="tiny">Analyzed CV: ${esc((a.cv||[]).length)} sections · ${esc((a.cv||[]).reduce((n,s)=>n+s.text.length,0))} text characters. LinkedIn URLs, planned learning and source-only facts not included in this CV do not earn points.</p><details><summary>Check the exact CV text used in this assessment</summary><pre class="source-audit">${esc(a.analysisSourceText||(a.analysisCV?JSON.parse(a.analysisCV):a.cv).map(s=>s.title+'\n'+s.text).join('\n\n'))}</pre></details><div class="actions"><button data-stage="0">Review imported CV</button></div><p class="tiny muted">Use the matrix below to see each zero: which requirement, what evidence was cited and why it was missing, unknown or transferable.</p></div>`;
}
function cvPreviewView(){const a=app();return title('07 / CV PREVIEW','Review your designed CV.','You can finish with a CV PDF here. Cover and motivation letters are optional.')+`<div class="card print-target"><div class="pillrow"><h3>${esc(a.template)} · CV preview</h3><span class="badge">${a.final?'Reviewed by you':'Draft · review all claims'}</span></div><div id="livePreview">${preview(a.cv)}</div></div><div class="card"><label class="check"><input id="finalCheckbox" type="checkbox" ${a.final?'checked':''}>I have reviewed this CV, its claims, dates and contact details.</label><div class="actions"><button data-pdf="cv" class="primary">Download CV PDF</button><button id="backup">Download editable backup</button><button data-stage="5">Change design or edit CV</button><button id="cvOnly">Finish with CV · export</button></div><p class="tiny muted">PDF export works without generating any letter. You can return to design and try another layout at any time.</p></div>`;}
function bindWorkflow(){
 if($('stepNext'))$('stepNext').onclick=()=>run('Next step',nextStage);
 if($('stepBack'))$('stepBack').onclick=()=>go(S.stage-1);
 if($('cvOnly'))$('cvOnly').onclick=()=>go(10);
 if($('saveLearning'))$('saveLearning').onclick=()=>{try{const title=$('learningTitle').value.trim(),details=$('learningDetails').value.trim(),url=$('learningUrl').value.trim();if(!title)throw Error('Enter a learning item name.');if(url&&new URL(url).protocol!=='https:')throw Error('Use an HTTPS reference URL.');if($('learningComplete').checked&&!details)throw Error('Describe what you actually completed.');S.learning.push({id:uid(),title,url,details,completed:$('learningComplete').checked,addedTo:[]});S.learningDraft={};render();}catch(e){toast(e.message,true)}};
 document.querySelectorAll('[data-add-learning]').forEach(b=>b.onclick=()=>{const item=S.learning.find(i=>i.id===b.dataset.addLearning);if(!item?.completed||item.addedTo?.includes(app().id))return;snapshot();const text=`${item.title} — completed learning (self-reported; not verified certification or employment).\n${item.details}${item.url?'\nReference: '+item.url:''}`;app().cv.push({id:uid(),title:'Professional Development',text});S.candidateProfile.text+='\n\nProfessional Development\n'+text;S.candidateProfile.sections=sectionize(S.candidateProfile.text);S.candidateProfile.confirmedText=S.candidateProfile.text;item.addedTo=[...(item.addedTo||[]),app().id];app().profileText=S.candidateProfile.text;invalidate(app());version('Completed learning added');render();});
 document.querySelectorAll('[data-remove-learning]').forEach(b=>b.onclick=()=>{const item=S.learning.find(i=>i.id===b.dataset.removeLearning);if(item?.addedTo?.length){toast('This item is already in the CV. Remove its CV section in the editor if needed.',true);return;}S.learning=S.learning.filter(i=>i.id!==b.dataset.removeLearning);render();});
 const text=$('candidateText');if(text)text.oninput=()=>{S.candidateProfile.text=text.value;save();};
 if($('linkedinUrl'))$('linkedinUrl').oninput=e=>{S.candidateProfile.linkedinUrl=e.target.value;save();};
 if($('linkedinText'))$('linkedinText').oninput=e=>{S.candidateProfile.linkedinText=e.target.value;save();};
}
