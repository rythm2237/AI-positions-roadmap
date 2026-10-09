import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {getKnowledge,putKnowledge} from '@/lib/applicationStudio/knowledgeStore';
import {importKnowledge,confirmFact,retractFact} from '@/lib/applicationStudio/knowledge.mjs';
import {limitedText} from '@/lib/applicationStudio/validation.mjs';
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
  if(body.operation==='import')knowledge=importKnowledge(current.knowledge,{text:body.text,type:body.type,label:body.label,sections:body.sections});
  else if(body.operation==='confirm')knowledge=confirmFact(current.knowledge,body.fact||{});
  else if(body.operation==='retract')knowledge=retractFact(current.knowledge,body.claimId);
  else return json({error:'Invalid candidate knowledge operation.'},400);
  if(knowledge.revision===current.knowledge.revision)return json({userId:user.id,...current});
  const token=await putKnowledge(user.id,knowledge,current.token);return json({userId:user.id,knowledge,token});
 }catch(error){const message=error instanceof Error?error.message:'Candidate knowledge could not save.';return json({error:message},message.includes('another tab')?409:400);}
}
