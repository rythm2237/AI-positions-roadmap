import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {studioLearningCareers} from '@/lib/applicationStudio/learningCareers';
import type {CareerWorkspaceData} from '@/types/careerWorkspace';
export const dynamic='force-dynamic';
export async function GET(){
 const db=await createClient();const {data:{user},error}=await db.auth.getUser();
 if(error||!user||user.is_anonymous)return NextResponse.json({error:'Sign in to load completed learning.'},{status:401});
 const state=await db.from('career_user_state').select('career_slug,payload').eq('user_id',user.id).eq('state_key','workspace_progress').eq('is_deleted',false).limit(100);
 if(state.error)return NextResponse.json({error:'Completed learning could not load. Your CV is unchanged.'},{status:503});
 const slugs=[...new Set((state.data||[]).map(row=>row.career_slug))];
 const published=slugs.length?await db.from('careers').select('slug,workspace_data').eq('status','published').in('slug',slugs):{data:[],error:null};
 if(published.error)return NextResponse.json({error:'Learning catalogue could not load.'},{status:503});
 const items=new Map();
 for(const row of state.data||[]){
  const career=(published.data?.find(c=>c.slug===row.career_slug)?.workspace_data as CareerWorkspaceData|undefined)||studioLearningCareers[row.career_slug];
  if(!career)continue;
  const completed=new Set(Array.isArray(row.payload?.completedResources)?row.payload.completedResources:[]);
  const resources=[...(career.journeyStages||[]).flatMap(s=>s.resources||[]),...(career.roadmap||[]).flatMap(p=>(p.lessons||[]).flatMap(l=>l.resources||[]))];
  for(const resource of resources){if(!completed.has(resource.id))continue;const id=row.career_slug+':'+resource.id;items.set(id,{id,title:resource.title,provider:resource.provider||'AI Role Path',career:career.title,provenance:'Learning marked complete in AI Role Path (self-reported; not a verified certification or employment)',completed:true});}
 }
 return NextResponse.json({userId:user.id,items:[...items.values()]},{headers:{'Cache-Control':'private, no-store'}});
}
