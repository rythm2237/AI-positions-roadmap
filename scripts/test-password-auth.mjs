import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';
const bundle = await build({ entryPoints: ['src/lib/auth/password.ts'], bundle: true, write: false, platform: 'node', format: 'esm' });
const { runPasswordFlow } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
function fixture(overrides = {}, onboarded = true) {
  const calls = [];
  const client = { auth: {}, from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { onboarding_completed_at: onboarded ? '2026-01-01' : null } }) }) }) }) };
  for (const method of ['signInWithPassword', 'signUp', 'resetPasswordForEmail', 'getUser', 'updateUser', 'signOut']) {
    client.auth[method] = async (...args) => { calls.push({ method, args }); return overrides[method] ?? { data: { user: { id: 'test-user' }, session: { access_token: 'synthetic' } }, error: null }; };
  }
  return { client, calls };
}
function form(changes = {}) { const data = new FormData(); for (const [k,v] of Object.entries({ email: ' test@example.test ', password: 'synthetic-password', confirmPassword: 'synthetic-password', next: '/job-agent', ...changes })) data.set(k,v); return data; }
const origin = 'https://www.airolepath.com';
test('email password login uses existing session and preserves requested destination', async () => {
 const {client,calls}=fixture(); assert.equal((await runPasswordFlow(client,'login',form(),origin)).destination,'/job-agent');
 assert.deepEqual(calls[0],{method:'signInWithPassword',args:[{email:'test@example.test',password:'synthetic-password'}]});
});
test('new user proceeds to onboarding; existing user does not', async () => {
 const {client}=fixture({},false); assert.equal((await runPasswordFlow(client,'login',form(),origin)).destination,'/onboarding');
});
test('invalid login never returns session, credentials, or provider diagnostics', async () => {
 const {client}=fixture({signInWithPassword:{data:{},error:{message:'private provider diagnostic'}}});
 const result=await runPasswordFlow(client,'login',form(),origin); assert.ok(result.error); assert.doesNotMatch(JSON.stringify(result),/private provider|synthetic-password/);
});
test('older passwords shorter than eight characters can still sign in', async () => {
 const {client,calls}=fixture(); await runPasswordFlow(client,'login',form({password:'oldpwd'}),origin); assert.equal(calls[0].method,'signInWithPassword');
});
test('confirmation-required signup reports email confirmation, with no fake authenticated state', async () => {
 const {client,calls}=fixture({signUp:{data:{user:{id:'new'},session:null},error:null}});
 const result=await runPasswordFlow(client,'signup',form(),origin); assert.ok(result.message); assert.equal(result.destination,undefined);
 assert.equal(calls[0].args[0].options.emailRedirectTo,`${origin}/auth/callback?next=%2Fjob-agent`);
});
test('autoconfirm signup uses real session and onboarding', async () => {
 const {client}=fixture({},false); assert.equal((await runPasswordFlow(client,'signup',form(),origin)).destination,'/onboarding');
});
test('duplicate obfuscated signup returns generic confirmation response', async () => {
 const {client}=fixture({signUp:{data:{user:{identities:[]},session:null},error:null}}); assert.match((await runPasswordFlow(client,'signup',form(),origin)).message,/If this address/);
});
for (const mode of ['signup','reset']) {
 test(`${mode} rejects weak or nonmatching passwords before any provider call`, async () => {
  const {client,calls}=fixture(); assert.ok((await runPasswordFlow(client,mode,form({password:'short'}),origin)).error);
  assert.ok((await runPasswordFlow(client,mode,form({confirmPassword:'different'}),origin)).error); assert.equal(calls.length,0);
 });
}
test('reset request is generic and sends callback to password page', async () => {
 const {client,calls}=fixture(); assert.match((await runPasswordFlow(client,'forgot',form(),origin)).message,/If an account exists/);
 assert.equal(calls[0].args[1].redirectTo,`${origin}/auth/callback?next=%2Freset-password`);
});
test('reset email failures show actionable availability errors without exposing account data', async () => {
 const {client}=fixture({resetPasswordForEmail:{error:{status:429,message:'private'}}}); assert.match((await runPasswordFlow(client,'forgot',form(),origin)).error,/Too many requests/);
});
test('expired reset session cannot change a password', async () => {
 const {client,calls}=fixture({getUser:{data:{user:null},error:{}}}); assert.match((await runPasswordFlow(client,'reset',form(),origin)).error,/expired/); assert.deepEqual(calls.map(x=>x.method),['getUser']);
});
test('successful password change signs out the local session and returns to login', async () => {
 const {client,calls}=fixture(); assert.equal((await runPasswordFlow(client,'reset',form(),origin)).destination,'/login?message=password-updated');
 assert.deepEqual(calls.map(x=>x.method),['getUser','updateUser','signOut']); assert.deepEqual(calls.at(-1).args,[{scope:'local'}]);
});
test('provider password rejection does not sign out or claim success', async () => {
 const {client,calls}=fixture({updateUser:{error:{message:'private'}}}); const result=await runPasswordFlow(client,'reset',form(),origin); assert.ok(result.error); assert.equal(result.destination,undefined); assert.ok(!calls.some(x=>x.method==='signOut'));
});
test('invalid email never reaches provider', async () => {
 const {client,calls}=fixture(); assert.ok((await runPasswordFlow(client,'login',form({email:'invalid'}),origin)).error); assert.equal(calls.length,0);
});
for (const next of ['https://evil.test','//evil.test','/\\evil.test','/\n/evil.test','/\t/evil.test']) {
 test(`external redirect rejected: ${JSON.stringify(next)}`,async()=>{const {client}=fixture();assert.equal((await runPasswordFlow(client,'login',form({next}),origin)).destination,'/dashboard');});
}

// Exercise the real route handlers with a fake Supabase boundary: no emails or live users.
async function loadRoute(path, client) {
 const result = await build({ entryPoints: [path], bundle: true, write: false, platform: 'node', format: 'esm', plugins: [{ name: 'auth-route-boundaries', setup(b) {
  b.onResolve({filter:/^next\/server$/},()=>({path:'next-server',namespace:'fake'}));
  b.onResolve({filter:/^@\/lib\/supabase\/server$/},()=>({path:'supabase',namespace:'fake'}));
  b.onLoad({filter:/.*/,namespace:'fake'},args=>({contents:args.path==='next-server' ? 'export const NextResponse = {redirect(url){return {location:String(url)}}};' : 'export async function createClient(){return globalThis.__authTestClient}',loader:'js'}));
 }}] });
 globalThis.__authTestClient=client;
 return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
}
function request(path) { const url=`${origin}${path}`; return {url,nextUrl:new URL(url)}; }
function routeClient({confirmed=true,onboarded=false,exchangeError=false}={}) {
 return {auth:{exchangeCodeForSession:async()=>({error:exchangeError?{}:null}),getUser:async()=>({data:{user:{id:'test-user'}}}),verifyOtp:async()=>({data:{user:confirmed?{id:'test-user'}:null},error:confirmed?null:{}})},from:()=>({insert:async()=>({}),select:()=>({eq:()=>({single:async()=>({data:{onboarding_completed_at:onboarded?'2026-01-01':null}})})})})};
}
test('PKCE recovery callback bypasses onboarding and opens password form',async()=>{
 const {GET}=await loadRoute('src/app/auth/callback/route.ts',routeClient());
 assert.equal((await GET(request('/auth/callback?code=synthetic&next=%2Freset-password'))).location,`${origin}/reset-password`);
});
test('OAuth callback still takes first-time users to onboarding',async()=>{
 const {GET}=await loadRoute('src/app/auth/callback/route.ts',routeClient());
 assert.equal((await GET(request('/auth/callback?code=synthetic&next=%2Fjob-agent'))).location,`${origin}/onboarding`);
});
test('OAuth callback preserves existing user destination',async()=>{
 const {GET}=await loadRoute('src/app/auth/callback/route.ts',routeClient({onboarded:true}));
 assert.equal((await GET(request('/auth/callback?code=synthetic&next=%2Fjob-agent'))).location,`${origin}/job-agent`);
});
test('missing and invalid PKCE codes do not authenticate',async()=>{
 const {GET}=await loadRoute('src/app/auth/callback/route.ts',routeClient({exchangeError:true}));
 assert.equal((await GET(request('/auth/callback'))).location,`${origin}/login?error=callback`);
 assert.equal((await GET(request('/auth/callback?code=bad'))).location,`${origin}/login?error=callback`);
});
test('token-hash recovery supports another device and cannot redirect externally',async()=>{
 const {GET}=await loadRoute('src/app/auth/confirm/route.ts',routeClient());
 assert.equal((await GET(request('/auth/confirm?token_hash=synthetic&type=recovery&next=https://evil.test'))).location,`${origin}/reset-password`);
});
test('invalid recovery link returns to request reset with an expired-link message',async()=>{
 const {GET}=await loadRoute('src/app/auth/confirm/route.ts',routeClient({confirmed:false}));
 assert.equal((await GET(request('/auth/confirm?token_hash=bad&type=recovery'))).location,`${origin}/forgot-password?error=expired`);
});
test('token-hash signup confirms identity and preserves onboarding',async()=>{
 const {GET}=await loadRoute('src/app/auth/confirm/route.ts',routeClient());
 assert.equal((await GET(request('/auth/confirm?token_hash=synthetic&type=email'))).location,`${origin}/onboarding`);
 assert.equal((await GET(request('/auth/confirm?token_hash=synthetic&type=unsupported'))).location,`${origin}/login?error=callback`);
});
