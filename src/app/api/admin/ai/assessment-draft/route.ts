import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/adminAuth";
import { getCareer } from "@/lib/admin/careerRepository";
import { AdminAIError } from "@/lib/admin/ai/openaiAdminClient";
import { generateAssessmentDraft } from "@/lib/admin/ai/assessmentGeneration";

export async function POST(request:Request){
  const authorization=await requireAdmin();if(authorization.status!=="admin")return NextResponse.json({error:"ADMIN_REQUIRED"},{status:403});
  const body=(await request.json().catch(()=>null)) as {careerId?:string;stageId?:string;assessmentType?:"topic"|"comprehensive";topic?:string;questionCount?:number}|null;
  const careerId=body?.careerId??"",stageId=(body?.stageId??"").trim(),assessmentType=body?.assessmentType,topic=(body?.topic??"").trim();
  if(!/^[0-9a-f-]{36}$/i.test(careerId)||!stageId||!assessmentType||topic.length<2)return NextResponse.json({error:"INVALID_REQUEST"},{status:400});
  const career=await getCareer(authorization.accessToken,careerId);if(!career?.workspace_data)return NextResponse.json({error:"CAREER_NOT_FOUND"},{status:404});
  const stage=career.workspace_data.journeyStages?.find(item=>item.id===stageId);if(!stage)return NextResponse.json({error:"STAGE_NOT_FOUND"},{status:404});
  const learningGoals=[...(stage.lessons??[]),...(stage.tasks??[]).map(item=>item.title),...(stage.resources??[]).map(item=>item.title)].filter(Boolean);
  try{const draft=await generateAssessmentDraft({careerTitle:career.title,stageTitle:stage.title,assessmentType,topic,learningGoals,questionCount:assessmentType==="comprehensive"?20:5});return NextResponse.json({draft})}
  catch(error){if(error instanceof AdminAIError)return NextResponse.json({error:error.code,message:error.message},{status:error.code==="not_configured"?503:502});return NextResponse.json({error:"ASSESSMENT_GENERATION_FAILED"},{status:500})}
}
