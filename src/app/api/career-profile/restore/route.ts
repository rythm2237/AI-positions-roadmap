import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {getKnowledge,putKnowledge} from "@/lib/applicationStudio/knowledgeStore";
import {assertKnowledge} from "@/lib/applicationStudio/knowledge.mjs";
export const dynamic="force-dynamic";
const json=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{"Cache-Control":"private, no-store"}});

export async function POST(request:Request){
 const origin=request.headers.get("origin");
 if(origin!==new URL(request.url).origin)return json({error:"Untrusted request origin."},403);
 if(!request.headers.get("content-type")?.startsWith("application/json"))return json({error:"JSON required."},415);
 const db=await createClient();
 const {data:{user},error:authError}=await db.auth.getUser();
 if(authError||!user||user.is_anonymous)return json({error:"Sign in to restore a private profile snapshot."},401);
 try{
  const raw=await request.text();
  if(raw.length>700)return json({error:"Invalid request."},413);
  const body=JSON.parse(raw) as {confirmation?:string;revision?:number;sessionUserId?:string};
  if(body.confirmation!=="RESTORE MY PROFILE"||body.sessionUserId!==user.id)return json({error:"Explicit account confirmation required."},400);
  const current=await getKnowledge(user.id);
  if(body.revision!==current.knowledge.revision)return json({error:"Profile changed. Reload and retry."},409);
  const {data:backup,error}=await db.from("career_user_state")
   .select("payload,career_slug,created_at").eq("user_id",user.id).eq("state_key","retention_snapshots")
   .like("career_slug","candidate-knowledge-backup-%")
   .eq("is_deleted",false).order("created_at",{ascending:false}).limit(1).maybeSingle();
  if(error||!backup?.payload?.knowledge||backup.payload.backupOf!=="candidate-knowledge")
   return json({error:"No valid previous cleanup backup was found."},404);
  const previous=structuredClone(assertKnowledge(backup.payload.knowledge));
  if(previous.revision>current.knowledge.revision)return json({error:"The saved backup is newer than the active profile."},409);
  const rollbackId="candidate-knowledge-backup-"+crypto.randomUUID().replace(/-/g,"");
  const protectedCopy=await db.from("career_user_state").insert({
    user_id:user.id,career_slug:rollbackId,state_key:"retention_snapshots",is_deleted:false,
    payload:{schemaVersion:1,backupOf:"candidate-knowledge",createdAt:new Date().toISOString(),
      originalRevision:current.knowledge.revision,knowledge:current.knowledge},
  });
  if(protectedCopy.error)return json({error:"Cannot create a recovery snapshot. Nothing was changed."},503);
  previous.revision=current.knowledge.revision+1;
  const token=await putKnowledge(user.id,previous,current.token);
  return json({userId:user.id,knowledge:previous,token,restored:true});
 }catch{return json({error:"Could not safely restore your previous profile; no changes were applied."},503);}
}
