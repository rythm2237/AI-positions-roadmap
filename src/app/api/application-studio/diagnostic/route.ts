import {generateText} from "ai";
import {NextResponse} from "next/server";
import {SYSTEM,SCHEMAS} from "@/lib/applicationStudio/prompts.mjs";
import {sourceMap,validate} from "@/lib/applicationStudio/validation.mjs";
import {submittedCV} from "@/lib/applicationStudio/recruiter.mjs";
let ran=false;
export const runtime="nodejs";
export const maxDuration=120;
export async function GET(request:Request) {
 if(process.env.VERCEL_ENV!=="preview" || Date.now()>1791256532105 || new URL(request.url).searchParams.get("nonce")!=="probe-1791255418898-0qbqwsjb2wfn" || ran) return new Response("Not found",{status:404}); ran=true;
 const context={candidate:"Taylor Example\nSkills: SQL, Excel\nExperience: Two years of production scheduling at Example Manufacturing.",linkedin:"",cv:[{id:"skills",title:"Skills",text:"SQL, Excel"},{id:"experience",title:"Experience",text:"Two years of production scheduling at Example Manufacturing."}],vacancy:"Production Planner at Example Supply Co. in Berlin. Required: Excel, production scheduling. Preferred: SQL.",job:{title:"Production Planner",company:"Example Supply Co.",location:"Berlin"},language:"English"};
 const sources=sourceMap(submittedCV(context)); const {candidate,linkedin,...prompt}=context;
 try { const result=await generateText({model:"openai/gpt-4.1-mini",system:SYSTEM+"\n"+SCHEMAS.analysis,prompt:JSON.stringify({...prompt,sources}),maxOutputTokens:6500,maxRetries:0,abortSignal:AbortSignal.timeout(100000)});
 const parsed=JSON.parse(result.text.replace(/^\`\`\`(?:json)?\s*/i,"").replace(/\s*\`\`\`$/,"")); const validated=validate("analysis",parsed,context,sources);
 return NextResponse.json({ok:true,finishReason:result.finishReason,score:validated.score,requirements:validated.matrix.length,usage:result.usage},{headers:{"Cache-Control":"no-store"}}); }
 catch(error){return NextResponse.json({ok:false,name:(error as Error).name,message:(error as Error).message},{status:500});}
}