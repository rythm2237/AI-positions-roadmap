import 'server-only';
import {createClient} from '@/lib/supabase/server';
import {assertKnowledge,emptyKnowledge,type Knowledge} from './knowledge.mjs';

// Dedicated namespace in the existing user-owned RLS table; never overwrites design defaults.
const scope = {career_slug:'candidate-knowledge',state_key:'starting_profile'};
export async function getKnowledge(userId:string) {
 const db=await createClient();
 const {data,error}=await db.from('career_user_state').select('payload,updated_at').eq('user_id',userId).eq('career_slug',scope.career_slug).eq('state_key',scope.state_key).eq('is_deleted',false).maybeSingle();
 if(error)throw Error('Your candidate knowledge could not load.');
 return {knowledge:data?.payload?.knowledge?assertKnowledge(data.payload.knowledge):emptyKnowledge(),token:data?.updated_at||null};
}
export async function putKnowledge(userId:string,knowledge:Knowledge,token:string|null) {
 const db=await createClient(),row={user_id:userId,...scope,payload:{schemaVersion:1,knowledge},is_deleted:false};
 const query=token?db.from('career_user_state').update(row).eq('user_id',userId).eq('career_slug',scope.career_slug).eq('state_key',scope.state_key).eq('updated_at',token).select('updated_at'):db.from('career_user_state').insert(row).select('updated_at');
 const {data,error}=await query;
 if(error||!data?.length)throw Error('Your profile changed in another tab. Reload candidate knowledge and retry.');
 return data[0].updated_at;
}
