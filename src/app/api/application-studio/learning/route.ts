import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {readCompletedLearning} from '@/lib/applicationStudio/completedLearning';
export const dynamic='force-dynamic';
export async function GET(){
 const db=await createClient();const {data:{user},error}=await db.auth.getUser();
 if(error||!user||user.is_anonymous)return NextResponse.json({error:'Sign in to load completed learning.'},{status:401});
 try{return NextResponse.json({userId:user.id,items:await readCompletedLearning(db,user.id)},{headers:{'Cache-Control':'private, no-store'}});}catch{return NextResponse.json({error:'Completed learning could not load. Your CV is unchanged.'},{status:503});}
}
