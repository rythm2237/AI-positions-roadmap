import "server-only";
import { cache } from "react";
import type { ManagedCareer } from "@/types/adminStudio";
import { validateCareerWorkspaceData } from "@/lib/careerContentValidation";

function config(){const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_ANON_KEY??process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;return url&&key?{url,key}:null}

export const getPublishedCareer=cache(async(slug:string)=>{
  const settings=config();if(!settings)return null;
  const columns="id,slug,title,short_title,summary,status,taxonomy,default_country_codes,workspace_data,content_version,published_at,updated_at";
  const response=await fetch(`${settings.url}/rest/v1/careers?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=${columns}&limit=1`,{headers:{apikey:settings.key,Authorization:`Bearer ${settings.key}`},next:{revalidate:300,tags:[`career:${slug}`]}});
  if(!response.ok)return null;
  const career=(await response.json() as ManagedCareer[])[0];if(!career)return null;
  const validation=validateCareerWorkspaceData(career.workspace_data,career.slug);
  return validation.valid?{record:career,data:validation.data}:null;
});
