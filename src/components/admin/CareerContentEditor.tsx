"use client";
import { useMemo, useState } from "react";
import type { CareerWorkspaceData } from "@/types/careerWorkspace";

type AIDraft={
  category:string;shortDescription:string;difficulty:string;estimatedLearningTime:string;
  overview:{title:string;body:string;responsibilities:string[];industries:string[]};
  journeyMap:{overviewTitle:string;overviewDescription:string};
  stages:Array<{id:string;title:string;description:string;learningGoals:string[]}>;
  roadmap:Array<{title:string;description:string;outcomes:string[]}>;
  projects:Array<{title:string;description:string;skills:string[]}>;
  resourceNeeds:Array<{stageId:string;topic:string;preferredProviderTypes:string[];searchIntent:string}>;
  qualityNotes:string[];
};

export default function CareerContentEditor({careerId,slug,data,action}:{careerId:string;slug:string;data:CareerWorkspaceData|null;action:(formData:FormData)=>void}){
  const [value,setValue]=useState(()=>JSON.stringify(data??starter(slug),null,2));
  const [aiState,setAiState]=useState<{status:"idle"|"working"|"ready"|"error";message?:string;draft?:AIDraft}>({status:"idle"});
  const state=useMemo(()=>{try{const parsed=JSON.parse(value);return{ok:true,summary:`${parsed.journeyStages?.length??0} stages · ${parsed.roadmap?.length??0} phases · ${parsed.projects?.length??0} projects`}}catch(error){return{ok:false,summary:error instanceof Error?error.message:"Invalid JSON"}}},[value]);

  async function generateWithAI(){
    if(aiState.status==="working")return;
    setAiState({status:"working",message:"Generating a role-specific Career blueprint…"});
    try{
      const response=await fetch("/api/admin/ai/career-draft",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({careerId})});
      const body=await response.json() as {draft?:AIDraft;message?:string;error?:string};
      if(!response.ok||!body.draft)throw new Error(body.message||body.error||"AI generation failed.");
      setAiState({status:"ready",message:"AI draft generated. Review it, then apply it to the working draft.",draft:body.draft});
    }catch(error){setAiState({status:"error",message:error instanceof Error?error.message:"AI generation failed."})}
  }

  function applyAIDraft(){
    const draft=aiState.draft;if(!draft)return;
    try{
      const current=JSON.parse(value) as Record<string,any>;
      const next={...current,category:draft.category,shortDescription:draft.shortDescription,difficulty:draft.difficulty,estimatedLearningTime:draft.estimatedLearningTime,overview:draft.overview,journeyMap:{...(current.journeyMap??{}),overviewTitle:draft.journeyMap.overviewTitle,overviewDescription:draft.journeyMap.overviewDescription},journeyStages:draft.stages.map((stage,index)=>({id:stage.id,order:index+1,title:stage.title,type:index===0?"orientation":index===draft.stages.length-1?"assessment":"core-skills",landmark:`Stage ${index+1}`,theme:"Career progression",x:18+index*12,y:24+((index%2)*16),summary:stage.description,explanation:stage.description,lessons:stage.learningGoals,resources:[],tasks:[],topicAssessments:[],phaseExam:null})),roadmap:draft.roadmap.map((phase,index)=>({id:`phase-${index+1}`,phaseNumber:index+1,title:phase.title,duration:"To be estimated",goal:phase.description,status:index===0?"unlocked":"locked",mentorTip:"Review and customize this AI-generated draft before publication.",sections:phase.outcomes,lessons:[],practicalMissions:phase.outcomes,expectedOutcome:phase.outcomes.join(" "),quiz:{id:`phase-${index+1}-quiz`,title:`${phase.title} review`,description:"Assessment content must be generated and reviewed separately.",questions:[]}})),projects:draft.projects.map((project,index)=>({id:`project-${index+1}`,title:project.title,difficulty:index===0?"Beginner":index===draft.projects.length-1?"Advanced":"Intermediate",estimatedTime:"To be estimated",phaseId:`phase-${Math.min(index+1,draft.roadmap.length)}`,description:project.description,deliverables:[],skills:project.skills})),lastUpdated:new Date().toISOString().slice(0,10)};
      setValue(JSON.stringify(next,null,2));
      setAiState(currentState=>({...currentState,message:`AI blueprint applied to the working draft. ${draft.resourceNeeds.length} learning-resource needs remain for the Resource Finder workflow. Validate and review before saving.`}));
    }catch{setAiState({status:"error",message:"The current workspace JSON must be valid before applying an AI draft."})}
  }

  return <form action={action} className="space-y-4"><input type="hidden" name="id" value={careerId}/><section className="rounded-xl border border-cyan-300/15 bg-cyan-400/5 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold text-white">AI Content Copilot</p><p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400">Generate a role-specific first draft for overview, learning stages, roadmap and projects. AI never publishes automatically. Learning resources, assessments and externally verifiable claims stay behind separate review gates.</p></div><div className="flex gap-2"><button type="button" onClick={()=>void generateWithAI()} disabled={aiState.status==="working"} className="btn-secondary min-h-11 disabled:opacity-50">{aiState.status==="working"?"Generating…":"Generate with AI"}</button>{aiState.draft?<button type="button" onClick={applyAIDraft} className="btn-primary min-h-11">Apply draft</button>:null}</div></div>{aiState.message?<p aria-live="polite" className={`mt-3 text-xs ${aiState.status==="error"?"text-rose-300":"text-slate-300"}`}>{aiState.message}</p>:null}{aiState.draft?<div className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-3"><span>{aiState.draft.stages.length} proposed stages</span><span>{aiState.draft.projects.length} proposed projects</span><span>{aiState.draft.resourceNeeds.length} resource needs queued for later verification</span></div>:null}</section><div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[.025] p-4"><div><p className="font-semibold text-white">Workspace content</p><p className={`mt-1 text-xs ${state.ok?"text-emerald-300":"text-rose-300"}`}>{state.ok?state.summary:`JSON error: ${state.summary}`}</p></div><button disabled={!state.ok} className="btn-primary min-h-11 disabled:cursor-not-allowed disabled:opacity-40">Validate & save</button></div><textarea aria-label="Career workspace JSON" spellCheck={false} name="workspaceData" value={value} onChange={event=>setValue(event.target.value)} className="min-h-[65vh] w-full rounded-2xl border border-white/10 bg-[#060914] p-5 font-mono text-xs leading-6 text-slate-200 outline-none focus:border-cyan-300/50"/></form>
}

function starter(slug:string):Partial<CareerWorkspaceData>{return{slug,title:"New Career",category:"AI",visual:{nodeLabel:`Career Node: ${slug}`,sceneTitle:"Career workspace",sceneDescription:"A guided professional journey.",imageAlt:"Career journey workspace"},shortDescription:"Complete this description before publishing.",difficulty:"Beginner to Intermediate",estimatedLearningTime:"6-12 months",salary:"Research required",hiringDemand:"Research required",remoteAvailability:"Research required",aiCompatibilityScore:"Research required",bestFor:[],programmingRequirement:"Define requirement",mathRequirement:"Define requirement",creativityLevel:"Define level",communicationLevel:"Define level",lastUpdated:new Date().toISOString().slice(0,10),metrics:[],overview:{title:"Career overview",body:"Complete this overview.",responsibilities:[],industries:[]},mapSections:[],journeyMap:{theme:"treasure-map",overviewTitle:"Career journey",overviewDescription:"Complete journey overview."},journeyStages:[],roadmap:[],projects:[],globalResources:[],readiness:[],finalChallenge:{title:"Final challenge",description:"Complete this challenge.",requirements:[],deliverables:[],evaluation:[]},relatedCareers:[],progressRules:{readinessThreshold:80,minimumProjects:2,minimumQuizScore:80},jobBoard:{title:"Career opportunities",description:"Curated opportunities.",integrationStatus:"coming-soon",filters:[],sampleDisclaimer:"Job data is illustrative until live integration is enabled."},portfolioTasks:[],jobSearchTasks:[],interviewPrep:{title:"Interview preparation",practiceAreas:[],questions:[]}}}
