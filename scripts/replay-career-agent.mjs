import {readFileSync,writeFileSync} from 'node:fs';
import {evaluateCareerEligibility} from '../src/lib/job-agent/careerIntelligence.ts';
const {reference,jobs}=JSON.parse(readFileSync(process.argv[2],'utf8'));
const intent={primaryTargetRole:reference.primary_career,soft:{secondaryRoles:reference.secondary_careers,marketTitleVariants:reference.desired_titles,adjacentRoles:reference.adjacent_roles}};
const replay=jobs.map(j=>{
 const result=evaluateCareerEligibility({title:j.role,description:j.job_description??'',descriptionComplete:j.verification_status==='verified',seniority:j.seniority},intent,reference.evidence??[]);
 return {role:j.role,previousScore:j.fit_score,previousEligibility:j.eligibility_status,verification:j.verification_status,newCareerEligibility:result.status,reasons:result.reasons.map(r=>r.code)};
});
const counts={rows:replay.length,previousEligible:replay.filter(j=>j.previousEligibility==='eligible').length,careerBlocked:replay.filter(j=>j.newCareerEligibility==='blocked').length,careerReview:replay.filter(j=>j.newCareerEligibility==='unverified').length,careerEligible:replay.filter(j=>j.newCareerEligibility==='eligible').length,primaryDigestPassingHistoricalRows:0};
// All historical rows are on the old gate version: re-verification/re-evaluation is required, without rewriting saved decisions.
const output={counts,scope:'Read-only replay of current stored Oct 11–13 rows. Not original email snapshots, not human-labelled accuracy metrics. No network re-verification.',results:replay};
writeFileSync(process.argv[3],JSON.stringify(output,null,2));console.log(JSON.stringify(counts));
