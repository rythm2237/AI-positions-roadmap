"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { emptyKnowledge, type Knowledge } from "@/lib/applicationStudio/knowledge.mjs";
import { CAREER_SECTIONS, careerProfileScores, factsBySection } from "@/lib/identity/careerProfileHub";
import type { Profile } from "@/types/identity";

type Category=typeof CAREER_SECTIONS[number]["kind"];
type SemanticRecord={kind:Category;label:string;text:string;sourceQuote:string;details:Record<string,string>;edited?:boolean};
type Draft={sourceText:string;name:string;file?:File;records:SemanticRecord[];uncertain:string[];rejected:number;selected:number[]};
type KnowledgeResponse={userId?:string;knowledge?:Knowledge;error?:string};
const important=["header","experience","skills","education","certifications","projects","languages","development"] as Category[];
const shortNames:Record<string,string>={
 header:"Personal & contact",summary:"Professional summary",experience:"Work experience",
 skills:"Skills",education:"Education",certifications:"Certifications",
 development:"Courses & training",projects:"Projects",languages:"Languages",
 portfolio:"Portfolio",preferences:"Career preferences",additional:"Achievements",other:"Other details",
};
const icons:Record<string,string>={
 header:"user-round",experience:"briefcase-business",skills:"wrench",education:"graduation-cap",
 certifications:"award",projects:"folder-kanban",languages:"languages",development:"book-open",
};
function errorText(error:unknown){return error instanceof Error?error.message:"Something went wrong. Try again.";}
function categoryName(kind:string){return shortNames[kind]||"Other details";}
function normalised(value:string){return value.normalize("NFKC").replace(/\s+/g," ").trim().toLowerCase();}

export function CareerProfileSimple({profile,userId,hasResume}: {profile:Profile;userId:string;hasResume:boolean}){
 const [knowledge,setKnowledge]=useState<Knowledge>(emptyKnowledge);
 const [ready,setReady]=useState(false);
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState("");
 const [consent,setConsent]=useState(false);
 const [draft,setDraft]=useState<Draft|null>(null);
 const [pasted,setPasted]=useState("");
 const [activeCategory,setActiveCategory]=useState<string>("");
 const [more,setMore]=useState(false);
 const [query,setQuery]=useState("");
 const [editing,setEditing]=useState<{id:string;value:string}|null>(null);
 const [manual,setManual]=useState({kind:"skills",title:"",text:""});
 const [resumeStored,setResumeStored]=useState(hasResume);
 const [editDraftIndex,setEditDraftIndex]=useState<number|null>(null);
 const [stage,setStage]=useState<"upload"|"analysing"|"review">("upload");

 useEffect(()=>{
   const controller=new AbortController();
   fetch("/api/application-studio/knowledge",{cache:"no-store",signal:controller.signal})
     .then(async r=>{const v=await r.json() as KnowledgeResponse;if(!r.ok||v.userId!==userId||!v.knowledge)throw Error(v.error||"Could not load your profile.");setKnowledge(v.knowledge);setReady(true);})
     .catch(e=>{if(!controller.signal.aborted)setNotice(errorText(e));});
   return ()=>controller.abort();
 },[userId]);

 const groups=useMemo(()=>factsBySection(knowledge),[knowledge]);
 const scores=useMemo(()=>careerProfileScores(profile,knowledge,resumeStored),[profile,knowledge,resumeStored]);
 const total=Object.values(groups).reduce((n,a)=>n+a.length,0);
 const sections=useMemo(()=>CAREER_SECTIONS.filter(s=>(important.includes(s.kind)||more)&&
    (!query.trim()||(categoryName(s.kind)+" "+groups[s.kind].map(f=>f.text+" "+f.label).join(" ")).toLowerCase().includes(query.toLowerCase()))),[groups,more,query]);
 const counts=useMemo(()=>Object.fromEntries(CAREER_SECTIONS.map(s=>[s.kind,groups[s.kind]?.length||0])),[groups]);

 async function saveKnowledge(operation:string,data:Record<string,unknown>){
   const res=await fetch("/api/application-studio/knowledge",{
     method:"POST",headers:{"Content-Type":"application/json"},
     body:JSON.stringify({operation,...data,consent:true,sessionUserId:userId,revision:knowledge.revision}),
   });
   const result=await res.json() as KnowledgeResponse;
   if(!res.ok||result.userId!==userId||!result.knowledge)throw Error(result.error||"Could not save profile.");
   setKnowledge(result.knowledge);
 }

 async function analyseSource(text:string,name:string,file?:File){
   if(!ready||busy)return;
   if(text.trim().length<8){setNotice("The file contains too little readable text.");return;}
   if(text.length>90000){setNotice("This file is too long for automatic analysis. Try a shorter resume.");return;}
   setBusy(true);setStage("analysing");setNotice("");
   try{
     const res=await fetch("/api/career-profile/semantic",{
       method:"POST",headers:{"Content-Type":"application/json"},
       body:JSON.stringify({text,consent:true}),
     });
     const result=await res.json() as {records?:SemanticRecord[];uncertain?:string[];rejected?:number;error?:string};
     if(!res.ok||!result.records?.length)throw Error(result.error||"No reliable information could be extracted.");
     setDraft({sourceText:text,name,file,records:result.records,uncertain:result.uncertain||[],
       rejected:result.rejected||0,selected:result.records.map((_,i)=>i)});
     setStage("review");
   }catch(e){setStage("upload");setNotice(errorText(e));}
   finally{setBusy(false);}
 }

 async function fileSelected(file:File){
   if(!ready||busy||!consent)return;
   const extension=file.name.split(".").pop()?.toLowerCase();
   if(!["pdf","docx","txt"].includes(extension||"")||!file.size||file.size>8*1024*1024){
     setNotice("Choose a PDF, DOCX or TXT file smaller than 8 MB.");return;
   }
   setBusy(true);setStage("analysing");setNotice("");
   try{
     const form=new FormData();form.set("file",file);
     let res=await fetch("/api/cv-analyzer/extract",{method:"POST",body:form});
     let result=await res.json() as {text?:string;error?:string};
     if(res.status===422&&extension==="pdf"){
       // The user explicitly opted in to AI-based document understanding,
       // including scanned PDF transcription when needed.
       form.set("consent","yes");
       res=await fetch("/api/career-profile/ocr",{method:"POST",body:form});
       result=await res.json() as typeof result;
     }
     if(!res.ok||!result.text)throw Error(result.error||"The resume could not be read.");
     setBusy(false);
     await analyseSource(result.text,file.name,file);
   }catch(e){setBusy(false);setStage("upload");setNotice(errorText(e));}
 }

 function updateDraft(index:number,change:Partial<SemanticRecord>){
   setDraft(old=>old?{...old,records:old.records.map((r,i)=>i===index?{...r,...change,edited:true}:r)}:old);
 }
 function toggleSelected(index:number){
   setDraft(old=>old?{...old,selected:old.selected.includes(index)?old.selected.filter(x=>x!==index):[...old.selected,index]}:old);
 }
 async function storeMasterCv(file:File){
   const ext=file.name.split(".").pop()?.toLowerCase();if(ext!=="pdf"&&ext!=="docx")return "";
   const db=createClient(),id=crypto.randomUUID(),path=userId+"/"+id+"."+ext;
   const mime=ext==="pdf"?"application/pdf":"application/vnd.openxmlformats-officedocument.wordprocessingml.document";
   const uploaded=await db.storage.from("resumes").upload(path,file,{contentType:mime,upsert:false});
   if(uploaded.error)return "Resume content saved; original file could not be stored.";
   const added=await db.from("resumes").insert({id,user_id:userId,title:file.name.replace(/\.[^.]+$/,"").slice(0,160),file_type:ext,storage_path:path});
   if(added.error){await db.storage.from("resumes").remove([path]);return "Resume content saved; original file record could not be stored.";}
   setResumeStored(true);return "Original CV saved.";
 }
 async function confirmImport(){
   if(!draft||busy||!ready||!draft.selected.length)return;
   setBusy(true);setNotice("");
   try{
     const records=draft.selected.map(i=>draft.records[i]).filter(r=>r.label.trim()&&r.text.trim());
     if(!records.length)throw Error("Select at least one valid record.");
     await saveKnowledge("semantic-import",{text:draft.sourceText,type:"cv",label:draft.name,records});
     const detail=draft.file?await storeMasterCv(draft.file):"";
     setDraft(null);setStage("upload");
     setNotice("Profile updated. "+records.length+" reviewed records processed. "+detail);
   }catch(e){setNotice(errorText(e));}
   finally{setBusy(false);}
 }
 async function saveCorrection(id:string,value:string){
   if(!value.trim()||busy)return;
   setBusy(true);setNotice("");
   try{await saveKnowledge("replace",{claimId:id,text:value.trim()});setEditing(null);setNotice("Saved.");}
   catch(e){setNotice(errorText(e));}
   finally{setBusy(false);}
 }
 async function remove(id:string){
   if(!window.confirm("Remove this item from your profile and future career evidence?")||busy)return;
   setBusy(true);setNotice("");
   try{await saveKnowledge("retract",{claimId:id});setNotice("Item removed.");}
   catch(e){setNotice(errorText(e));}
   finally{setBusy(false);}
 }
 async function addManual(){
   if(!manual.text.trim()||busy||!ready)return;
   setBusy(true);
   try{await saveKnowledge("confirm",{fact:{kind:manual.kind,text:manual.text.trim(),label:manual.title.trim()||manual.text.trim().slice(0,70),field:"context"}});
     setManual({kind:"skills",title:"",text:""});setNotice("Information added.");}
   catch(e){setNotice(errorText(e));}
   finally{setBusy(false);}
 }
 function exportProfile(){
   const content=JSON.stringify({exportVersion:2,exportedAt:new Date().toISOString(),profile,knowledge},null,2);
   const url=URL.createObjectURL(new Blob([content],{type:"application/json"}));
   const a=document.createElement("a");a.href=url;a.download="career-profile.json";a.click();URL.revokeObjectURL(url);
 }
 async function clearFacts(){
   const input=window.prompt("To remove career facts, type CLEAR MY CAREER FACTS. Your uploaded CVs and account details are not deleted.");
   if(input!=="CLEAR MY CAREER FACTS")return;
   if(!window.confirm("Permanently clear all career facts?"))return;
   setBusy(true);try{await saveKnowledge("clear",{confirmation:input});setNotice("Career records cleared.");}
   catch(e){setNotice(errorText(e));}finally{setBusy(false);}
 }

 return <div className="mt-7 space-y-6">
   <section className="rounded-2xl border border-white/10 bg-white/[.025] px-5 py-5 sm:px-7">
     <div className="flex flex-wrap items-center justify-between gap-3">
       <div><p className="text-sm font-medium text-slate-300">Profile completeness</p>
         <p className="mt-1 text-xs text-slate-500">Complete your essentials once. Your CV and job applications can reuse them.</p></div>
       <span className="font-display text-2xl font-semibold text-white">{scores.completeness}%</span>
     </div>
     <div role="progressbar" aria-label="Profile completeness" aria-valuemin={0} aria-valuemax={100} aria-valuenow={scores.completeness} className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
       <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-300 transition-all" style={{width:scores.completeness+"%"}} />
     </div>
     <p className="mt-3 text-xs text-slate-400">{ready?total+" saved details · "+scores.missing.length+" essential sections to improve":"Loading saved profile…"}</p>
   </section>

   {draft ? <section className="rounded-2xl border border-indigo-300/20 bg-slate-950/80 p-5 sm:p-7">
     <div className="flex flex-wrap items-center justify-between gap-3">
       <div><p className="text-xs font-semibold uppercase tracking-widest text-indigo-300">Step 2 of 2 · Review</p>
         <h2 className="mt-2 text-xl font-semibold text-white">Does this look right?</h2>
         <p className="mt-1 text-sm text-slate-400">We grouped details by meaning. Edit or deselect anything incorrect before saving.</p></div>
       <button type="button" onClick={()=>{setDraft(null);setStage("upload");}} className="btn-secondary min-h-10 text-sm" disabled={busy}>Start over</button>
     </div>
     <div className="mt-5 rounded-xl bg-white/[.04] p-3 text-sm text-slate-300">{draft.name} <span className="text-slate-500">· {draft.selected.length} of {draft.records.length} selected</span></div>
     {draft.rejected>0&&<p className="mt-3 text-xs text-amber-200">{draft.rejected} unsupported extraction suggestions were excluded.</p>}
     {draft.uncertain.length>0&&<details className="mt-3 text-sm text-amber-200"><summary className="cursor-pointer">Needs attention ({draft.uncertain.length})</summary><ul className="mt-2 list-disc pl-5">{draft.uncertain.map((q,i)=><li key={i}>{q}</li>)}</ul></details>}
     <div className="mt-5 space-y-4">
       {CAREER_SECTIONS.filter(s=>draft.records.some(r=>r.kind===s.kind)).map(s=><details key={s.kind} className="rounded-xl border border-white/10 bg-white/[.025] p-4">
         <summary className="cursor-pointer text-sm font-semibold text-white">{categoryName(s.kind)} <span className="ml-2 text-xs font-normal text-slate-500">{draft.records.filter(r=>r.kind===s.kind).length} records · click to review</span></summary>
         <div className="space-y-3">{draft.records.map((r,i)=>({r,i})).filter(({r})=>r.kind===s.kind).map(({r,i})=><article key={i} className={"rounded-lg border p-3 "+(draft.selected.includes(i)?"border-indigo-400/20 bg-slate-900/50":"border-white/5 opacity-60")}>
           <div className="flex items-center gap-2"><input type="checkbox" aria-label={"Include "+r.label} checked={draft.selected.includes(i)} onChange={()=>toggleSelected(i)}/>
             <input aria-label="Record title" value={r.label} onChange={e=>updateDraft(i,{label:e.target.value})} maxLength={150} className="min-w-0 flex-1 border-0 border-b border-transparent bg-transparent text-sm font-semibold text-white outline-none focus:border-indigo-400"/>
             <select value={r.kind} aria-label={"Section for "+r.label} onChange={e=>updateDraft(i,{kind:e.target.value as Category})} className="max-w-28 rounded-lg border border-white/10 bg-slate-900 px-1 py-1 text-xs text-slate-300">
               {CAREER_SECTIONS.map(cat=><option value={cat.kind} key={cat.kind}>{categoryName(cat.kind)}</option>)}
             </select></div>
           {editDraftIndex===i ? <div className="mt-2">
             <textarea aria-label={"Extracted information for "+r.label} value={r.text} maxLength={2000} rows={Math.min(5,Math.max(2,Math.ceil(r.text.length/85)))} onChange={e=>updateDraft(i,{text:e.target.value})} className="w-full resize-y rounded-lg border border-indigo-400/30 bg-slate-950/30 p-2 text-sm leading-6 text-slate-200 focus:outline-none"/>
             <button type="button" onClick={()=>setEditDraftIndex(null)} className="mt-2 text-xs text-indigo-200">Done editing</button></div>
           : <div className="mt-2 flex items-start justify-between gap-3"><p className="min-w-0 whitespace-pre-wrap text-sm leading-6 text-slate-300">{r.text}</p>
             <button type="button" onClick={()=>setEditDraftIndex(i)} className="shrink-0 text-xs text-indigo-200 hover:text-white">Edit</button></div>}
           <details className="mt-1"><summary className="cursor-pointer text-xs text-slate-500">Show source</summary><pre className="mt-2 whitespace-pre-wrap text-xs text-slate-400">{r.sourceQuote}</pre></details>
         </article>)}</div>
       </details>)}
     </div>
     <div className="sticky bottom-3 z-10 mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-400/20 bg-slate-950/95 p-3 shadow-xl">
       <span className="text-xs text-slate-300">{draft.selected.length} records selected · Nothing saved yet</span>
       <button type="button" className="btn-primary min-h-11 disabled:opacity-50" disabled={busy||draft.selected.length===0} onClick={()=>void confirmImport()}>{busy?"Saving…":"Save to my profile"}</button>
     </div>
   </section> : <section className="relative overflow-hidden rounded-2xl border border-indigo-300/20 bg-gradient-to-br from-indigo-400/[.07] via-slate-950/70 to-cyan-400/[.04] px-5 py-7 sm:px-8">
     <div className="max-w-2xl">
       <p className="text-xs font-semibold uppercase tracking-widest text-indigo-300">Recommended · Quick setup</p>
       <h2 className="mt-3 font-display text-2xl font-semibold text-white">Build your profile from your CV</h2>
       <p className="mt-3 text-sm leading-6 text-slate-300">Upload once. AI will understand your work history, combine multi-line addresses, and organise skills, education and certificates into editable sections.</p>
       <label className="mt-5 flex items-start gap-3 text-xs leading-5 text-slate-400">
         <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-1"/>
         I agree to AI analysis of my CV to organise my private career profile. I will review the results before they are saved.
       </label>
       <label className={"mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold transition "+(ready&&consent&&!busy?"cursor-pointer bg-indigo-400 text-slate-950 hover:bg-indigo-300":"cursor-not-allowed bg-white/10 text-slate-400")}>
         <span>{busy||stage==="analysing"?"Reading and organising your CV…":"Choose CV file"}</span>
         <input type="file" accept=".pdf,.docx,.txt" className="sr-only" disabled={!ready||!consent||busy} onChange={e=>{const file=e.currentTarget.files?.[0];e.currentTarget.value="";if(file)void fileSelected(file);}}/>
       </label>
       <p className="mt-3 text-xs text-slate-500">PDF, DOCX or TXT · Maximum 8 MB · Scanned PDFs may require an extra AI transcription request</p>
       <details className="mt-5 max-w-xl rounded-xl border border-white/10 bg-black/10 px-4 py-3">
         <summary className="cursor-pointer text-sm font-medium text-indigo-100">Or paste your CV text instead</summary>
         <textarea className="input-field mt-3 min-h-28 w-full" value={pasted} onChange={e=>setPasted(e.target.value)} maxLength={90000} placeholder="Paste your résumé or LinkedIn profile text here…"/>
         <button className="btn-secondary mt-3 min-h-10 text-sm disabled:opacity-50" type="button" disabled={!ready||!consent||busy||pasted.trim().length<8} onClick={()=>void analyseSource(pasted,"Pasted CV / professional profile")}>Analyse pasted text</button>
       </details>
     </div>
   </section>}

   {notice&&<p role="status" aria-live="polite" className="rounded-xl border border-white/10 bg-slate-900/80 p-3 text-sm text-slate-200">{notice}</p>}

   <section aria-labelledby="career-simple-sections">
     <div className="flex flex-wrap items-end justify-between gap-3">
       <div><h2 id="career-simple-sections" className="font-display text-xl font-semibold text-white">My information</h2>
         <p className="mt-1 text-sm text-slate-400">Choose a section to review or edit. Imported details stay editable.</p></div>
       <input aria-label="Search my profile" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search profile…" className="input-field min-h-10 w-full sm:w-52"/>
     </div>
     <div className="mt-5 grid gap-3 md:grid-cols-2">
       {sections.map(s=>{
         const items=groups[s.kind]||[];
         const matches=query.trim()?items.filter(i=>normalised(i.text+" "+i.label).includes(normalised(query))):items;
         return <article key={s.kind} className={"min-w-0 rounded-xl border border-white/10 bg-slate-950/45 "+(activeCategory===s.kind?"md:col-span-2":"")}>
           <button type="button" aria-expanded={activeCategory===s.kind} className="flex w-full items-center justify-between gap-3 p-4 text-left" onClick={()=>setActiveCategory(v=>v===s.kind?"":s.kind)}>
             <span className="min-w-0"><span className="block font-semibold text-white">{categoryName(s.kind)}</span>
               <span className="mt-1 block truncate text-xs text-slate-400">{items.length?items.slice(0,2).map(x=>x.label).join(" · "):"Not added yet"}</span>
             </span><span className="flex shrink-0 items-center gap-3"><span className="rounded-full bg-white/[.08] px-2.5 py-1 text-xs text-slate-300">{counts[s.kind]}</span><span className="text-xl text-slate-400">{activeCategory===s.kind?"−":"+"}</span></span>
           </button>
           {activeCategory===s.kind&&<div className="border-t border-white/10 p-4">
             {matches.length===0?<p className="text-sm text-slate-500">No information here yet. Import your CV or add a detail below.</p>:
             <ul className="space-y-2">{matches.slice(0,80).map(item=><li key={item.id} className="rounded-lg border border-white/[.07] bg-white/[.02] p-3">
               {editing?.id===item.id?<div><textarea value={editing.value} maxLength={4000} onChange={e=>setEditing({id:item.id,value:e.target.value})} className="input-field min-h-20 w-full text-sm"/>
                 <div className="mt-2 flex gap-2"><button className="btn-primary min-h-10 text-xs" disabled={busy||!editing.value.trim()} onClick={()=>void saveCorrection(item.id,editing.value)}>Save</button>
                   <button className="btn-secondary min-h-10 text-xs" onClick={()=>setEditing(null)}>Cancel</button></div></div>:
                 <><p className="text-xs font-medium text-indigo-200">{item.label}</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-200">{item.text}</p>
                   <div className="mt-2 flex flex-wrap items-center gap-3 text-xs"><button className="text-slate-300 hover:text-white" type="button" onClick={()=>setEditing({id:item.id,value:item.text})}>Edit</button>
                   <button className="text-rose-300 hover:text-rose-200" type="button" disabled={busy} onClick={()=>void remove(item.id)}>Remove</button>
                   <span className="text-slate-500">{item.sourceType==="cv"?"From CV":item.verification==="candidate-confirmed"?"Added by you":"Saved source"}</span></div></>}
             </li>)}</ul>}
             <details className="mt-4 rounded-lg border border-white/10 px-3 py-2"><summary className="cursor-pointer text-sm text-indigo-200">+ Add information</summary>
               <div className="mt-3 space-y-3">
                 <label className="block text-xs text-slate-400">Title<input className="input-field mt-1 w-full" maxLength={150} value={manual.kind===s.kind?manual.title:""} onChange={e=>setManual({kind:s.kind,title:e.target.value,text:manual.kind===s.kind?manual.text:""})} placeholder={s.kind==="header"?"e.g. Address":s.kind==="skills"?"e.g. Power BI":"Record title"}/></label>
                 <label className="block text-xs text-slate-400">Details<textarea className="input-field mt-1 min-h-20 w-full" maxLength={4000} value={manual.kind===s.kind?manual.text:""} onChange={e=>setManual({kind:s.kind,title:manual.kind===s.kind?manual.title:"",text:e.target.value})}/></label>
                 <button className="btn-primary min-h-10 text-xs" type="button" disabled={busy||manual.kind!==s.kind||!manual.text.trim()} onClick={()=>void addManual()}>Add to profile</button>
               </div>
             </details>
           </div>}
         </article>;
       })}
     </div>
     <button type="button" className="mt-4 min-h-10 text-sm font-medium text-indigo-200 hover:text-indigo-100" onClick={()=>setMore(v=>!v)}>{more?"Show fewer sections":"Show more sections & preferences"} <span aria-hidden>{more?"↑":"↓"}</span></button>
   </section>
   <details className="rounded-xl border border-white/10 bg-white/[.02] p-4">
     <summary className="cursor-pointer text-sm text-slate-400">Data & privacy options</summary>
     <p className="mt-2 text-xs text-slate-500">Your professional data belongs to your account. Previous generated CVs remain separate snapshots.</p>
     <div className="mt-3 flex flex-wrap gap-3"><button type="button" onClick={exportProfile} className="btn-secondary min-h-10 text-xs">Export profile JSON</button>
       <button type="button" disabled={!ready||busy} onClick={()=>void clearFacts()} className="rounded-lg border border-rose-300/20 px-3 text-xs text-rose-200 disabled:opacity-50">Clear saved career facts</button></div>
   </details>
 </div>;
}
