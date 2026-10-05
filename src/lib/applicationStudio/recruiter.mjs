// Candidate-facing practice rubric, not a calibrated hiring model.
export const LEVEL_POINTS={'Strong Match':4,'Partial Match':2.5,'Transferable Skill':1.5,Missing:0,Unknown:0};
export const PRIORITY_WEIGHTS={Mandatory:4,Preferred:2,'Nice to Have':1};
export const CATEGORIES=['experience','technical','responsibilities','education','industry','tools','languages','softSkills','eligibility','seniority'];
export function submittedCV(context){return (context.cv||[]).map(s=>[s.title,s.text].filter(Boolean).join('\n')).join('\n\n');}
export function recruiterAssessment(matrix){
 const sum=rows=>rows.reduce((n,r)=>n+PRIORITY_WEIGHTS[r.priority],0);
 const score=rows=>rows.length?Math.round(rows.reduce((n,r)=>n+LEVEL_POINTS[r.level]/4*PRIORITY_WEIGHTS[r.priority],0)/sum(rows)*100):0;
 const total=sum(matrix),mandatory=matrix.filter(r=>r.priority==='Mandatory');
 const gates=mandatory.filter(r=>r.screeningGate&&r.vacancyQuote).map(r=>({requirement:r.requirement,vacancyQuote:r.vacancyQuote,status:r.level==='Strong Match'?'Evidence present':r.level==='Missing'?'Evidence not met':'Needs verification',evidence:r.evidence||[]}));
 const weak=mandatory.filter(r=>['Missing','Unknown','Transferable Skill'].includes(r.level));
 const overall=score(matrix),blocked=gates.some(g=>g.status==='Evidence not met'),unverified=gates.some(g=>g.status==='Needs verification');
 const decision=blocked?'High screening risk':unverified?'Eligibility needs verification':weak.length?'Mandatory evidence gaps':overall>=80?'Strong shortlist evidence':overall>=60?'Borderline shortlist evidence':'Limited shortlist evidence';
 return {version:'structured-resume-review-v1',score:overall,categories:CATEGORIES.filter(c=>matrix.some(r=>r.category===c)).map(category=>{const rows=matrix.filter(r=>r.category===category);return{category,weight:Math.round(sum(rows)/total*10000)/100,score:score(rows)}}),gates,decision,mandatoryCoverage:mandatory.length?Math.round(mandatory.filter(r=>r.level==='Strong Match').length/mandatory.length*100):null,unknownCount:matrix.filter(r=>r.level==='Unknown').length,evidenceCoverage:Math.round(matrix.filter(r=>r.evidenceIds?.length).length/matrix.length*100),probability:null,scoreNote:'Structured CV evidence score, not acceptance probability. 0–4 anchors: direct 4; partial 2.5; transferable 1.5; missing/unknown 0. Vacancy priority weights: mandatory 4, preferred 2, optional 1. These are product heuristics, not employer weights. Explicit screening gates are reviewed separately.',limitations:['No employer-specific rubric, applicant pool or hiring outcomes are available.','CV evidence is self-reported, not independently verified. Missing CV evidence is not proof that you lack the skill.','A recruiter may request tests, interviews, references or additional evidence. No offer or interview is predicted.']};
}
