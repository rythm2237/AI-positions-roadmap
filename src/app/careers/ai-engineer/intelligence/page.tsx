import CareerWorkspace from "@/components/career/CareerWorkspace";
import { Suspense } from "react";
export const metadata={title:"AI Engineer Career Intelligence – AI Career OS",description:"Verified market, mobility, and role-alignment decision support for the AI Engineer Career."};
export default function AIEngineerIntelligencePage(){return <Suspense fallback={<main className="neural-bg grid h-screen place-items-center text-sm text-slate-400">Loading Career Intelligence…</main>}><CareerWorkspace initialSection="intelligence"/></Suspense>;}
