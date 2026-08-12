import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/adminAuth";
import { getCareer } from "@/lib/admin/careerRepository";
import { AdminAIError } from "@/lib/admin/ai/openaiAdminClient";
import { generateProjectPortfolioDraft } from "@/lib/admin/ai/projectPortfolioGeneration";

export async function POST(request:Request){
  const authorization=await requireAdmin();
  if(authorization.status!=="admin")return NextResponse.json({error:"ADMIN_REQUIRED"},{status:403});
  const body=(await request.json().catch(()=>null)) as {careerId?:string}|null;
  const careerId=body?.careerId??"";
  if(!/^[0-9a-f-]{36}$/i.test(careerId))return NextResponse.json({error:"INVALID_CAREER"},{status:400});
  const career=await getCareer(authorization.accessToken,careerId);
  if(!career?.workspace_data)return NextResponse.json({error:"CAREER_CONTENT_REQUIRED"},{status:404});
  const data=career.workspace_data;
  try{
    const draft=await generateProjectPortfolioDraft({
      careerTitle:career.title,
      overview:data.overview?.body??career.summary??"",
      roadmap:(data.roadmap??[]).map(item=>({id:item.id,title:item.title,goal:item.goal})),
      stages:(data.journeyStages??[]).map(item=>({title:item.title,summary:item.summary,lessons:item.lessons??[]})),
      existingProjects:(data.projects??[]).map(item=>({title:item.title}))
    });
    return NextResponse.json({draft});
  }catch(error){
    if(error instanceof AdminAIError)return NextResponse.json({error:error.code,message:error.message},{status:error.code==="not_configured"?503:502});
    return NextResponse.json({error:"PROJECT_PORTFOLIO_GENERATION_FAILED"},{status:500});
  }
}
