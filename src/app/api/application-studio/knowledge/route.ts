import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {getKnowledge,putKnowledge} from '@/lib/applicationStudio/knowledgeStore';
import {importKnowledge,importSemanticKnowledge,confirmFact,retractFact,updateEntityMetadata,moveKnowledgeFact,confirmFactBatch,emptyKnowledge} from '@/lib/applicationStudio/knowledge.mjs';
import {limitedText} from '@/lib/applicationStudio/validation.mjs';
import {readCompletedLearning} from '@/lib/applicationStudio/completedLearning';
import {applyRepair,repairCandidates} from '@/lib/identity/profileReconstruction.mjs';
export const dynamic='force-dynamic';
const json=(value:unknown,status=200)=>NextResponse.json(value,{status,headers:{'Cache-Control':'private, no-store'}});
async function identity(){const db=await createClient();const {data:{user},error}=await db.auth.getUser();return !error&&user&&!user.is_anonymous?user:null;}
export async function GET(){try{const user=await identity();if(!user)return json({error:'Sign in to load candidate knowledge.'},401);return json({userId:user.id,...await getKnowledge(user.id)});}catch{return json({error:'Candidate knowledge is temporarily unavailable.'},503);}}
export async function POST(request:Request){
 try{
  if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Untrusted request origin.'},403);
  if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'JSON required.'},400);
  const user=await identity();if(!user)return json({error:'Sign in to save candidate knowledge.'},401);
  const body=JSON.parse(await limitedText(request));if(body.sessionUserId!==user.id)return json({error:'Your account changed. Reload this workspace.'},409);
  if(body.consent!==true)return json({error:'Confirm permission to save professional facts to your account.'},400);
  const current=await getKnowledge(user.id);if(body.revision!==current.knowledge.revision)return json({error:'Candidate knowledge changed. Reload it before saving.'},409);
  let knowledge;
  if(body.operation==='import'){if(body.type==='platform-learning')return json({error:'Platform learning must come from your account records.'},400);knowledge=importKnowledge(current.knowledge,{text:body.text,type:body.type,label:body.label,sections:body.sections});}
  else if(body.operation==='semantic-import')knowledge=importSemanticKnowledge(current.knowledge,{text:body.text,type:body.type,label:body.label,records:body.records});
  else if(body.operation==='reconcile') {
   const available=repairCandidates(current.knowledge,body.kind,40);
   if(!Array.isArray(body.records)||body.records.length<1||body.records.length>40)return json({error:'Review at least one reconstructed record before saving.'},400);
   knowledge=applyRepair(current.knowledge,body.kind,body.records,available.candidates.map(c=>c.id));
   // Make an immutable, RLS-protected snapshot before any existing evidence is retired.
   // 'retention_snapshots' is an allowed key in career_user_state, while
   // a unique career_slug permits multiple separately addressable backups.
   const db=await createClient();
   const backupSlug='candidate-knowledge-backup-'+crypto.randomUUID().replace(/-/g,'');
   const snapshot=await db.from('career_user_state').insert({
     user_id:user.id,career_slug:backupSlug,state_key:'retention_snapshots',
     payload:{schemaVersion:1,backupOf:'candidate-knowledge',originalRevision:current.knowledge.revision,
       createdAt:new Date().toISOString(),knowledge:current.knowledge},is_deleted:false,
   });
   if(snapshot.error)return json({error:'A private backup could not be saved. No career records were changed.'},503);
  }
  else if(body.operation==='learning'){
   const db=await createClient(),items=await readCompletedLearning(db,user.id);
   knowledge=current.knowledge;for(const item of items)knowledge=importKnowledge(knowledge,{text:'Professional Development\n'+item.title+' — '+item.provider+'; '+item.provenance,type:'platform-learning',label:item.id});
  }
  else if(body.operation==='confirm')knowledge=confirmFact(current.knowledge,body.fact||{});
  else if(body.operation==='metadata')knowledge=updateEntityMetadata(current.knowledge,{entityId:body.entityId,metadata:body.metadata});
  else if(body.operation==='move')knowledge=moveKnowledgeFact(current.knowledge,{claimId:body.claimId,kind:body.kind,label:body.label});
  else if(body.operation==='batch-confirm')knowledge=confirmFactBatch(current.knowledge,body.facts);
  else if(body.operation==='clear'){
   if(body.confirmation!=='CLEAR MY CAREER FACTS')return json({error:'Explicit confirmation required to clear career facts.'},400);
   knowledge=emptyKnowledge();knowledge.revision=current.knowledge.revision+1;
  }
  else if(body.operation==='replace') {
   const oldClaim=current.knowledge.claims.find(claim=>claim.id===body.claimId&&!claim.retracted&&!current.knowledge.declined.includes(claim.id));
   if(!oldClaim)return json({error:'The fact no longer exists. Reload your profile.'},409);
   const entity=current.knowledge.entities.find(item=>item.id===oldClaim.entityId);
   if(!entity||typeof body.text!=='string'||!body.text.trim())return json({error:'Enter the corrected professional fact.'},400);
   if(oldClaim.original.trim()===body.text.trim())return json({userId:user.id,...current});
   const updated=confirmFact(current.knowledge,{entityId:entity.id,kind:entity.kind,label:entity.label,text:body.text,field:'context'});
   knowledge=retractFact(updated,oldClaim.id);
  }
  else if(body.operation==='retract')knowledge=retractFact(current.knowledge,body.claimId);
  else return json({error:'Invalid candidate knowledge operation.'},400);
  if(knowledge.revision===current.knowledge.revision)return json({userId:user.id,...current});
  const token=await putKnowledge(user.id,knowledge,current.token);return json({userId:user.id,knowledge,token});
 }catch(error){const message=error instanceof Error?error.message:'Candidate knowledge could not save.';return json({error:message},message.includes('another tab')?409:400);}
}
