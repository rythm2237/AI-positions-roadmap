// Explicit, single-use handoff from Quick CV; never hydrate another account.
function applyQuickHandoff(){
 if(!account||!new URLSearchParams(location.search).has('quickHandoff'))return;
 const key='career-quick-handoff:'+account.id;
 try{
  const raw=sessionStorage.getItem(key);if(!raw)return;const x=JSON.parse(raw);
  if(x.userId!==account.id||!Number.isFinite(x.createdAt)||Date.now()-x.createdAt>15*60*1000||x.createdAt>Date.now()+60000)throw Error('Quick CV transfer expired. Return to Quick CV and try again.');
  const sections=value=>Array.isArray(value)&&value.length>0&&value.length<=100&&value.every(s=>s&&typeof s.id==='string'&&typeof s.title==='string'&&typeof s.text==='string'&&s.text.length<=100000);
  if(typeof x.candidate!=='string'||x.candidate.length>100000||typeof x.vacancy!=='string'||x.vacancy.length>100000||!sections(x.sections)||!sections(x.sourceSections))throw Error('Invalid Quick CV transfer.');
  sessionStorage.removeItem(key);
  const a=freshJob();a.job=x.job||{};a.cv=clone(x.sections);a.vacancy=x.vacancy;a.url=typeof x.url==='string'?x.url:'';a.language=x.language||'en';a.requestedLanguage=a.language;a.template='Professional';a.design=window.CareerDocs.designFor(a.template,x.design);a.portrait=window.CareerDocs.photoData(x.portrait);a.designApplied=true;a.contentReviewed=true;a.cvGenerationVersion=2;a.profileText=x.candidate;a.cover=x.cover?.text?{text:x.cover.text,paragraphs:x.cover.paragraphs||[],approved:false}:null;a.quickAnswers=Array.isArray(x.answers)?x.answers.slice(0,5):[];a.confirmationAnswers=Object.fromEntries(a.quickAnswers.filter(q=>!q.skipped).map(q=>[q.id,{question:q.question,answer:q.answer}]));a.versions=[{id:uid(),name:'Original',at:new Date().toISOString(),cv:clone(x.sourceSections),approved:[]},{id:uid(),name:'Quick CV draft',at:new Date().toISOString(),cv:clone(x.sections),approved:[]}];
  S.demo=false;S.applications.push(a);S.active=a.id;S.candidateProfile={text:x.candidate,original:x.candidate,confirmedText:x.candidate,confirmedLinkedin:'',sections:clone(x.sourceSections),linkedinText:'',linkedinUrl:''};S.stage=6;S.consent=false;entryMode='targeted';save();render();toast('Quick CV imported with your answers, layout and photo. Review or continue editing.');
 }catch(error){toast(error.message||'Quick CV transfer failed. Your existing applications are unchanged.',true);}
}
