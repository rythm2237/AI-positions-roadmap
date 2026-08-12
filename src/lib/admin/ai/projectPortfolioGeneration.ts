import "server-only";
import { createStructuredAdminResponse } from "@/lib/admin/ai/openaiAdminClient";

export type ProjectPortfolioDraft = {
  projects: Array<{title:string;difficulty:"Beginner"|"Intermediate"|"Advanced";estimatedTime:string;phaseId:string;description:string;deliverables:string[];skills:string[]}>;
  portfolioTasks: Array<{title:string;description:string;type:"portfolio"}>;
  finalChallenge: {title:string;description:string;requirements:string[];deliverables:string[];evaluation:string[]};
  qualityNotes:string[];
};

const schema={
  type:"object",additionalProperties:false,
  required:["projects","portfolioTasks","finalChallenge","qualityNotes"],
  properties:{
    projects:{type:"array",minItems:3,maxItems:6,items:{type:"object",additionalProperties:false,required:["title","difficulty","estimatedTime","phaseId","description","deliverables","skills"],properties:{title:{type:"string"},difficulty:{type:"string",enum:["Beginner","Intermediate","Advanced"]},estimatedTime:{type:"string"},phaseId:{type:"string"},description:{type:"string"},deliverables:{type:"array",minItems:2,maxItems:8,items:{type:"string"}},skills:{type:"array",minItems:2,maxItems:10,items:{type:"string"}}}}},
    portfolioTasks:{type:"array",minItems:3,maxItems:8,items:{type:"object",additionalProperties:false,required:["title","description","type"],properties:{title:{type:"string"},description:{type:"string"},type:{type:"string",enum:["portfolio"]}}}},
    finalChallenge:{type:"object",additionalProperties:false,required:["title","description","requirements","deliverables","evaluation"],properties:{title:{type:"string"},description:{type:"string"},requirements:{type:"array",minItems:3,maxItems:10,items:{type:"string"}},deliverables:{type:"array",minItems:3,maxItems:10,items:{type:"string"}},evaluation:{type:"array",minItems:3,maxItems:10,items:{type:"string"}}}},
    qualityNotes:{type:"array",items:{type:"string"}}
  }
} as const;

const instructions=`You are the Career OS Admin Studio project and portfolio architect.
Create role-specific, realistic projects, portfolio tasks and a final challenge based only on the supplied Career structure.
Projects must demonstrate progressively stronger job-relevant skills and must not be generic templates that could be reused unchanged for unrelated roles.
Do not invent salary figures, market statistics, employer claims, certifications, external URLs, or proprietary requirements.
Do not claim a project uses a specific vendor product unless that product is already present in the supplied Career context.
Every project needs concrete deliverables and skills. The final challenge must integrate the core capabilities of the Career and be assessable by observable deliverables.
Output only the requested structured object. AI output is a draft for human review and never authorizes publication.`;

export function generateProjectPortfolioDraft(input:{careerTitle:string;overview:string;roadmap:Array<{id:string;title:string;goal:string}>;stages:Array<{title:string;summary:string;lessons:string[]}>;existingProjects:Array<{title:string}>}){
  return createStructuredAdminResponse<ProjectPortfolioDraft>({name:"career_os_project_portfolio_draft",description:"Role-specific Career OS projects, portfolio tasks and final challenge for Admin review.",schema,instructions,input:JSON.stringify(input,null,2)});
}
