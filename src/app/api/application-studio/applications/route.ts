import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {limitedText} from '@/lib/applicationStudio/validation.mjs';
import {sanitizeApplication} from '@/lib/applicationStudio/applicationState.mjs';
export const dynamic='force-dynamic';
const json=(value:unknown,status=200)=>NextResponse.json(value,{status,headers:{'Cache-Control':'private, no-store'}});
export async function GET(){try{const db=await createClient(),{data:{user},error}=await db.auth.getUser();if(error||!user||user.is_anonymous)return json({error:'Sign in to load applications.'},401);const result=await db.from('career_user_state').select('payload,updated_at').eq('user_id',user.id).eq('state_key','applications').like('career_slug','cv-document-%').eq('is_deleted',false).order('updated_at',{ascending:false}).limit(20);if(result.error)throw Error();return json({userId:user.id,applications:(result.data||[]).map(r=>({document:r.payload.document,token:r.updated_at}))});}catch{return json({error:'Saved applications could not load.'},503);}}
export async function POST(request:Request){try{
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Untrusted request origin.'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'JSON required.'},400);
 const db=await createClient(),{data:{user},error}=await db.auth.getUser();if(error||!user||user.is_anonymous)return json({error:'Sign in to save an application.'},401);
 const body=JSON.parse(await limitedText(request));if(body.sessionUserId!==user.id)return json({error:'Your account changed. Reload the workspace.'},409);if(body.consent!==true)return json({error:'Confirm permission to save this application.'},400);
 const document=sanitizeApplication(body.document),scope={user_id:user.id,career_slug:'cv-document-'+document.id,state_key:'applications'};
 const current=await db.from('career_user_state').select('updated_at').match(scope).maybeSingle();if(current.error)throw Error('Saved application is unavailable.');
 if((current.data?.updated_at||null)!==(body.token||null))return json({error:'This application changed on another device. Load the saved version before saving.'},409);
 const row={...scope,payload:{schemaVersion:1,document},is_deleted:false};
 const result=current.data?await db.from('career_user_state').update(row).match(scope).eq('updated_at',current.data.updated_at).select('updated_at'):await db.from('career_user_state').insert(row).select('updated_at');
 if(result.error||!result.data?.length)return json({error:'Application changed. Reload saved applications and retry.'},409);
 return json({userId:user.id,token:result.data[0].updated_at});
 }catch(error){return json({error:error instanceof Error?error.message:'Application could not save.'},400);}}
