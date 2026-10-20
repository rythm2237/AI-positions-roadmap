import assert from 'node:assert/strict';
import test from 'node:test';
import {build} from 'esbuild';
import {writeFileSync} from 'node:fs';
const result=await build({stdin:{contents:'export { sendDueDailyJobDigests } from "./src/lib/job-agent/dailyDigestReporting.ts"; export { verifyJobEmailActionToken } from "./src/lib/job-agent/emailActionToken.ts";',resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm',plugins:[{name:'server-only-test',setup(b){b.onResolve({filter:/^server-only$/},()=>({path:'empty',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'',loader:'js'}));}}]});
const {sendDueDailyJobDigests,verifyJobEmailActionToken}=await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
process.env.SUPABASE_URL='https://database.test';process.env.SUPABASE_SECRET_KEY='test-not-a-real-key';process.env.RESEND_API_KEY='test-not-a-real-key';process.env.JOB_ACTION_SECRET='synthetic-key-only-for-tests';
const good={id:'job-1',user_id:'user-1',role:'Junior Automation Specialist',company:'Example',location:'Berlin',country:'Germany',fit_score:84,status:'recommended',recommendation:'prepare',eligibility_status:'eligible',verification_status:'verified',eligibility_version:'career-gate-v1',decision_classification:'good_match',decision_status:'pending',job_url:'https://employer.test/jobs/1',discovered_at:'2026-10-14T10:00:00Z',fit_explanation:{career:{track:'AI automation',seniority:'junior',requiredYears:0,transition:true}},strengths:['Power Platform project evidence'],gaps:[]};
const agent={id:'agent-1',user_id:'user-1',status:'active',report_frequency:'daily',notification_channels:['email'],timezone:'Europe/Budapest',strong_match_threshold:95,minimum_match_score:68,include_stretch:false};
async function simulate(jobs) {
 const sent=[],ledger=[];const realFetch=globalThis.fetch;
 globalThis.fetch=async (url,init={})=>{
  url=String(url);
  if(url==='https://api.resend.com/emails'){sent.push(JSON.parse(init.body));return Response.json({id:'test-delivery'});}
  if(!url.startsWith('https://database.test/rest/v1/')) throw new Error(`Unexpected network: ${url}`);
  const path=url.split('/rest/v1/')[1];
  if(path.startsWith('job_agents?'))return Response.json([agent]);
  if(path.startsWith('profiles?'))return Response.json([{id:'user-1',email:'synthetic@example.test',name:'Test'}]);
  if(path.startsWith('job_opportunities?'))return Response.json(jobs);
  if(path.startsWith('job_search_runs?'))return Response.json([{provider_records:187,deduplicated_count:80,unverified_count:27,blocked_count:53,provider_summary:{attemptsByStatus:{provider_error:5}}}]);
  if(path.startsWith('job_saved_jobs?'))return Response.json([]);
  if(path==='job_agent_reports'&&init.method==='POST'){ledger.push(JSON.parse(init.body));return Response.json([{id:'report-1'}]);}
  if(path.startsWith('job_agent_reports?')&&init.method==='PATCH'){ledger.push(JSON.parse(init.body));return Response.json([]);}
  if(path.startsWith('job_agent_reports?'))return Response.json([]);
  throw new Error(`Unexpected path ${path}`);
 };
 try {const outcome=await sendDueDailyJobDigests(new Date('2026-10-14T15:00:00Z'));return {outcome,sent,ledger};}finally{globalThis.fetch=realFetch;}
}
test('Daily orchestration excludes senior, pending and legacy jobs, preserves signed actions and groups transition roles',async()=>{
 const run=await simulate([good,{...good,id:'job-2',role:'Senior AI Architect',eligibility_status:'blocked'}, {...good,id:'job-3',role:'Pending AI vacancy',verification_status:'unverified'}, {...good,id:'job-4',role:'Legacy scoring vacancy',eligibility_version:'hard-gate-v4'}]);
 assert.equal(run.outcome.sent,1);assert.equal(run.sent.length,1);
 const html=run.sent[0].html;
 if(process.env.JOB_DIGEST_PREVIEW_PATH) writeFileSync(process.env.JOB_DIGEST_PREVIEW_PATH,html.replace('<body ', '<body ').replace('<div style="width:100%;', '<p style="padding:12px;text-align:center">Synthetic preview — action links use a test signature.</p><div style="width:100%;'));
 assert.match(html,/Career Transition Opportunities/);assert.match(html,/Junior Automation Specialist/);assert.doesNotMatch(html,/Senior AI Architect|Pending AI vacancy|Legacy scoring vacancy/);
 const tokens=[...html.matchAll(/\/job-action\/([A-Za-z0-9_.-]+)/g)].map(m=>verifyJobEmailActionToken(m[1]));assert.ok(tokens.some(t=>t?.action==='save'));assert.ok(tokens.some(t=>t?.action==='not_relevant'));assert.ok(tokens.every(t=>t.userId==='user-1'&&t.jobId==='job-1'));
 assert.equal(run.ledger[0].summary.recommended,1);
 assert.equal(run.ledger[0].summary.strongMatches,0);
 assert.match(html,/>0<\/strong><span[^>]*>High match<\/span>/);
});
test('No-match digest is truthful and does not pad results',async()=>{
 const run=await simulate([{...good,eligibility_status:'blocked'}]);assert.match(run.sent[0].subject,/No suitable/);assert.match(run.sent[0].html,/No new vacancies passed all verification and career checks/);assert.match(run.sent[0].html,/27 candidate\(s\) still need review/);assert.match(run.sent[0].html,/187 provider records received/);assert.equal(run.ledger[0].summary.unverified,27);assert.doesNotMatch(run.sent[0].html,/Junior Automation Specialist/);
});
