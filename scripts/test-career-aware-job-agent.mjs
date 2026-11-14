import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyJob,evaluateCareerEligibility,inferCareerTracks,parseCareerTracks } from '../src/lib/job-agent/careerIntelligence.ts';
import { recommendationEligible } from '../src/lib/job-agent/recommendationPolicy.ts';
import { isGenericVacancyPage } from '../src/lib/job-agent/vacancyIdentity.ts';
import { deduplicateJobs,assessFreshness } from '../src/lib/job-agent/normalization.ts';
import { enrichRequirements } from '../src/lib/job-agent/requirements.ts';
import { extractRequiredLanguages } from '../src/lib/job-agent/eligibility.ts';
const track=(domain,years,maximumSeniority='associate')=>({id:domain,name:domain,domain,directYears:years,maximumSeniority,maximumRequiredYears:null,targetTitles:[],transition:domain==='ai_automation',flexibility:'standard',mandatorySkills:[],preferredSkills:[],industries:[],qualifications:[],professionalEvidence:[],projectEvidence:[],confirmed:true});
const intent={primaryTargetRole:'AI Automation Specialist',soft:{secondaryRoles:['Operations Planner'],marketTitleVariants:[],adjacentRoles:[]},careerTracks:[track('ai_automation',0),track('operations',4,'specialist')]};
const job=(title,description='',extra={})=>({title,description,seniority:null,descriptionComplete:true,requiredLanguages:[],requiredSkills:[],preferredSkills:[],educationRequirements:[],certificationRequirements:[],workplaceModel:'remote',visaSponsorship:null,...extra});
const check=(title,description='',extra={})=>evaluateCareerEligibility(job(title,description,extra),intent,[]);
test('1 Junior AI versus senior architecture',()=>assert.equal(check('Senior AI Architect','7 years of experience in AI architecture required.').status,'blocked'));
test('2 Experienced operations remains eligible',()=>assert.equal(check('Operations Specialist','4 years of warehouse experience required.').status,'eligible'));
test('3 Junior automation transition',()=>assert.equal(check('Junior Automation Specialist').status,'eligible'));
test('4 Projects never become formal employment years',()=>{
 const e=[{evidenceType:'project_implementation',label:'AI',value:'Built AI automation',durationMonths:60,provenance:{}}];
 const inferred=inferCareerTracks({...intent,careerTracks:[]},e);assert.equal(inferred.find(t=>t.domain==='ai_automation').directYears,0);
 assert.equal(evaluateCareerEligibility(job('AI Engineer','5 years of AI experience required.'),{...intent,careerTracks:[]},e).status,'blocked');
});
test('5 Description identifies seniority absent from title',()=>assert.equal(classifyJob(job('AI Engineer','Minimum 7 years of AI experience required.')).seniority,'senior'));
test('6 Mandatory five years blocks',()=>assert.equal(check('Junior Automation Specialist','5 years of automation experience required.').status,'blocked'));
test('7 Preferred five years does not block',()=>assert.equal(check('Junior Automation Specialist','5 years of automation experience preferred.').status,'eligible'));
test('8 People management requires evidence',()=>assert.notEqual(check('AI Specialist','You must manage a team of engineers.').status,'eligible'));
test('9 Manager individual contributor is not people management',()=>{const c=classifyJob(job('Project Manager','Individual contributor. Coordinate schedules.'));assert.equal(c.peopleManagement,false);assert.notEqual(c.seniority,'manager');});
test('10 Missing experience is not automatic rejection',()=>assert.equal(check('Junior AI Specialist').status,'eligible'));
test('11 Generic pages rejected even with embedded JobPosting',()=>{assert.equal(isGenericVacancyPage('https://employer.example/jobs/search?q=AI','AI Specialist'),true);assert.equal(isGenericVacancyPage('https://employer.example/jobs/123','AI Specialist'),false);});
test('12 Cross-source duplicate same vacancy',()=>{
 const a={...job('Junior AI Specialist','A'.repeat(140)),company:'Example',country:'Germany',location:'Berlin',applicationUrl:'https://one.example/job/123',sourceUrl:'https://one.example/job/123',sourceQueries:[],sourceQuery:'AI',sources:[],postedAt:null,expiresAt:null};
 assert.equal(deduplicateJobs([a,{...a,applicationUrl:'https://two.example/jobs/456',sourceUrl:'https://two.example/jobs/456'}]).length,1);
});
test('13 Expired vacancy fails freshness',()=>assert.equal(assessFreshness({postedAt:null,expiresAt:'2020-01-01'}).status,'expired'));
test('14 Mandatory language versus preferred',()=>{assert.deepEqual(extractRequiredLanguages('Fluent German required.'),['German']);assert.deepEqual(extractRequiredLanguages('Fluent German preferred.'),[]);});
test('15 Cross-domain operations automation opportunity',()=>assert.equal(check('Warehouse Automation Specialist','4 years of warehouse experience required.').status,'eligible'));
test('16 Total experience never used as AI domain years',()=>{
 const tracks=inferCareerTracks({...intent,careerTracks:[]},[{evidenceType:'role_history',value:'10 years',durationMonths:120,provenance:{scope:'total_experience'}}]);assert.equal(tracks.find(t=>t.domain==='ai_automation').directYears,0);
});
test('17 Unknown duration requests confirmation',()=>assert.equal(evaluateCareerEligibility(job('Operations Specialist','3 years of logistics experience required.'),{...intent,careerTracks:[track('operations',null,'specialist')]},[]).status,'unverified'));
test('18 Explicit senior qualification supports exception',()=>assert.equal(evaluateCareerEligibility(job('Senior AI Engineer','7 years of AI experience required.'),{...intent,careerTracks:[track('ai_automation',8,'senior')]},[]).status,'eligible'));
test('19 Preferred skills in required section stay preferred',()=>{const j=enrichRequirements(job('AI Specialist','Requirements:\nPython preferred.'),[]);assert.ok(!j.requiredSkills.includes('Python'));assert.ok(j.preferredSkills.includes('Python'));});
const notification={eligibility_status:'eligible',verification_status:'verified',eligibility_version:'career-gate-v1',decision_classification:'good_match',fit_score:74,status:'recommended',recommendation:'prepare',decision_status:'pending'};
test('20 Digest independent gates',()=>{assert.equal(recommendationEligible(notification,{}),true);for(const patch of [{verification_status:'unverified'},{eligibility_status:'blocked'},{eligibility_version:'hard-gate-v4'},{fit_score:40},{decision_status:'rejected'}])assert.equal(recommendationEligible({...notification,...patch},{}),false);});
test('21 Stretch requires explicit opt in and eligibility',()=>{const j={...notification,decision_classification:'stretch'};assert.equal(recommendationEligible(j,{}),false);assert.equal(recommendationEligible(j,{include_stretch:true}),true);assert.equal(recommendationEligible({...j,eligibility_status:'blocked'},{include_stretch:true}),false);});
test('22 Reject malformed preferences',()=>assert.throws(()=>parseCareerTracks([{...track('ai_automation',0),directYears:NaN}])));
test('23 Generic Specialist title cannot override senior source evidence',()=>assert.equal(check('AI Automation Specialist','',{seniority:'senior'}).status,'blocked'));
test('24 Description-derived level is persisted by enrichment',()=>assert.equal(enrichRequirements(job('AI Engineer','7 years of AI experience required.'),[]).seniority,'senior'));

import {planSearchQueries} from '../src/lib/job-agent/searchStrategy.ts';
test('25 Discovery reserves space for experienced operations alongside AI variants',()=>{const queries=planSearchQueries({primaryTargetRole:'AI Automation Specialist',hard:{excludedRoles:[]},soft:{secondaryRoles:['SEO Specialist'],marketTitleVariants:['Operations Planner'],adjacentRoles:[]}},6);assert.ok(queries.some(q=>q.query==='Operations Planner'));assert.ok(queries.some(q=>q.query==='SEO Specialist'));assert.equal(queries.length,6);});

import { calculateEvidenceGroundedFit } from '../src/lib/job-agent/fitIntelligence.ts';
const scoringIntent = {...intent, hard: {countries: ['Germany'], workplaceModels: ['remote'], salary: {minimum: null}}, soft: {...intent.soft, targetIndustries: []}};
test('26 Documented project values earn transferable credit without becoming employment years', () => {
 const candidateJob = job('Junior Automation Specialist', 'Build approval workflows using Power Automate.', {requiredSkills: ['Power Automate']});
 const project = {id: 'project-1', evidenceType: 'project_implementation', label: 'Project evidence 1', value: 'Built approval workflows using Power Automate', durationMonths: 60, sourceType: 'profile', confidence: .85, provenance: {}};
 const baseline = calculateEvidenceGroundedFit(candidateJob, scoringIntent, []);
 const matched = calculateEvidenceGroundedFit(candidateJob, scoringIntent, [project]);
 assert.equal(matched.explanation.scoringVersion, 'career-fit-v2');
 assert.ok(matched.explanation.dimensions.requiredSkills > baseline.explanation.dimensions.requiredSkills);
 assert.deepEqual(matched.explanation.transferableEvidence.map(item => item.evidenceId), ['project-1']);
 assert.equal(matched.explanation.dimensions.experienceDepth, 0);
 assert.equal(calculateEvidenceGroundedFit(job('Senior AI Engineer','7 years of AI experience required.'), scoringIntent, [project]).score, 0);
});
test('27 Established operations track keeps its relevant experience depth', () => {
 const result = calculateEvidenceGroundedFit(job('Operations Specialist', '4 years of warehouse experience required.'), scoringIntent, []);
 assert.equal(result.explanation.dimensions.experienceDepth, 8);
 assert.equal(result.explanation.career.status, 'eligible');
});

test('Production query budget reserves a specific operations automation search', () => {
  const queries = planSearchQueries({
    primaryTargetRole: 'AI Automation Specialist',
    hard: { excludedRoles: [] },
    soft: { secondaryRoles: ['SEO Specialist'], marketTitleVariants: ['Operation planner'], adjacentRoles: [] },
  }, 6);
  assert.equal(queries.length, 6);
  assert.ok(queries.some(({query}) => query === 'Replenishment Automation Specialist'));
  assert.ok(queries.some(({query}) => query === 'AI Automation Specialist'));
});

import { prioritizeJobCandidate } from "../src/lib/job-agent/candidateQueue.ts";
test("Operational planning and junior AI outrank misleading title matches", () => {
  const scope = { primaryTargetRole: "AI Automation Specialist", careerTracks: [
    { domain: "operations", targetTitles: ["Operations Planner"], maximumSeniority: "specialist" },
    { domain: "ai_automation", targetTitles: ["Junior AI Automation Specialist"], maximumSeniority: "associate" },
  ] };
  const rank = (title) => prioritizeJobCandidate({ title, source: "Direct:Example", descriptionComplete: true }, scope);
  assert.ok(rank("Warehouse Operations & Capacity Planner") > rank("Psychological Operations Planner"));
  assert.ok(rank("Junior AI Automation Specialist") > rank("AI Automation Architect"));
  assert.ok(rank("Junior AI Automation Specialist") > rank("Electrical Design & Automation System Specialist"));
});
