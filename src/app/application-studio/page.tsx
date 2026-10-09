import Link from "next/link";
import { ApplicationStudio } from "@/components/career/jobs/ApplicationStudio";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Application Studio — AI Career", robots: { index: false, follow: false } };

export default async function ApplicationStudioPage({searchParams}:{searchParams:Promise<{mode?:string}>}) {
  const query=await searchParams;const mode=query.mode==='general'?'general':query.mode==='targeted'?'targeted':undefined;
  return <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
    <Link href="/careers" className="text-sm text-cyan-200">← Career roadmaps</Link>
    <h1 className="mt-5 mb-6 font-display text-3xl font-semibold text-white">Prepare your CV & application</h1>
    <ApplicationStudio initialMode={mode} autoOpen={!!mode} />
  </main>;
}
