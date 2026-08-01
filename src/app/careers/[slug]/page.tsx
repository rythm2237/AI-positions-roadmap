import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CareerWorkspace from "@/components/career/CareerWorkspace";
import { aiEngineerCareer } from "@/data/careers/ai-engineer";
import { aiAutomationSpecialistCareer } from "@/data/careers/ai-automation-specialist";
import { getPublishedCareer } from "@/lib/publishedCareerRepository";

const builtIn:Record<string,typeof aiEngineerCareer>={"ai-engineer":aiEngineerCareer,"ai-automation-specialist":aiAutomationSpecialistCareer};
async function resolve(slug:string){const managed=await getPublishedCareer(slug);return managed?.data??builtIn[slug]??null}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params,career=await resolve(slug);return career?{title:`${career.title} – AI Career OS`,description:career.shortDescription}:{title:"Career not found"}}
export default async function ManagedCareerPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params,career=await resolve(slug);if(!career)notFound();return <CareerWorkspace career={career}/>}
