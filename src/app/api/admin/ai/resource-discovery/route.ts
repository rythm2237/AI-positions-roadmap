import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/adminAuth";
import { getCareer } from "@/lib/admin/careerRepository";
import { AdminAIError } from "@/lib/admin/ai/openaiAdminClient";
import { discoverLearningResources } from "@/lib/admin/ai/resourceDiscovery";

export async function POST(request:Request){
  const authorization=await requireAdmin();
  if(authorization.status!=="admin")return NextResponse.json({error:"ADMIN_REQUIRED"},{status:403});
  const body=(await request.json().catch(()=>null)) as {careerId?:string;stageId?:string;topic?:string}|null;
  const careerId=body?.careerId??"",stageId=(body?.stageId??"").trim(),topic=(body?.topic??"").trim();
  if(!/^[0-9a-f-]{36}$/i.test(careerId)||!stageId||topic.length<3||topic.length>240)return NextResponse.json({error:"INVALID_REQUEST"},{status:400});
  const career=await getCareer(authorization.accessToken,careerId);if(!career)return NextResponse.json({error:"CAREER_NOT_FOUND"},{status:404});
  const stage=career.workspace_data?.journeyStages?.find(item=>item.id===stageId);
  if(!stage)return NextResponse.json({error:"STAGE_NOT_FOUND"},{status:404});
  try{return NextResponse.json(await discoverLearningResources({careerTitle:career.title,stageTitle:stage.title,topic}))}
  catch(error){if(error instanceof AdminAIError)return NextResponse.json({error:error.code,message:error.message},{status:error.code==="not_configured"?503:502});return NextResponse.json({error:"RESOURCE_DISCOVERY_FAILED"},{status:500})}
}
