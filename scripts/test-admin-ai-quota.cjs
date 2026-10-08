const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('path').join(__dirname,'../src/lib/betaAiQuota.ts'),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
let role=null,error=null,calls=0,filters=[];
const client={from(table){assert.equal(table,'app_user_roles');return {select(){return this},eq(key,value){filters.push([key,value]);return this},limit(){return this},async maybeSingle(){return {data:role,error}}}},async rpc(name,args){calls++;assert.equal(name,'consume_beta_ai_quota');assert.equal(args.p_limit,10);return {data:[{allowed:false,used:10,quota_limit:10}],error:null}}};
const moduleObject={exports:{}};
vm.runInNewContext(code,{exports:moduleObject.exports,require(name){assert.equal(name,'@supabase/supabase-js');return {createClient:()=>client}},process:{env:{NEXT_PUBLIC_SUPABASE_URL:'https://example.invalid',SUPABASE_SECRET_KEY:'test-only'}},Date,Error,Number});
(async()=>{
 const api=moduleObject.exports;
 role={role:'admin'};const admin=await api.consumeBetaAiQuota('verified-admin','project_review');assert(admin.allowed&&admin.exempt);assert.equal(calls,0);assert(filters.some(([k,v])=>k==='user_id'&&v==='verified-admin'));assert(filters.some(([k,v])=>k==='role'&&v==='admin'));
 role=null;const ordinary=await api.consumeBetaAiQuota('ordinary-user','project_review');assert.equal(ordinary.allowed,false);assert.equal(ordinary.limit,10);assert.equal(calls,1);assert.equal(await api.isBetaAiQuotaExempt('ordinary-user'),false);
 role={role:'admin'};error={code:'42501'};assert.equal(await api.isBetaAiQuotaExempt('unverified'),false);assert.equal((await api.consumeBetaAiQuota('unverified','project_review')).allowed,false);assert.equal(calls,2);
 console.log('Admin quota PASS: verified server role skips quota; ordinary users and role-query errors remain bounded.');
})().catch(e=>{console.error(e);process.exitCode=1});
