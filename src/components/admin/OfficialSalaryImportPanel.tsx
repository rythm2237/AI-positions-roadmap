"use client";
import Link from "next/link";
import { useState } from "react";
import { importOfficialSalaryFileAction } from "@/app/admin/(studio)/intelligence/official-salary/actions";
import type { OfficialSalarySourceDefinition } from "@/lib/intelligence/officialSalaryRegistry";

export default function OfficialSalaryImportPanel({sources,ready}:{sources:OfficialSalarySourceDefinition[];ready:string[]}) {
  const [results,setResults]=useState<Record<string,string>>({});
  function refreshAll(){setResults(Object.fromEntries(sources.map(source=>[source.countryCode,ready.includes(source.countryCode)?source.automationImplemented?"Ready for import":"Skipped: adapter not enabled":"Skipped: readiness gate"])))}
  return <>
    <div className="mt-5 flex flex-wrap gap-3"><button onClick={refreshAll} className="btn-primary">Refresh All Ready Countries</button><Link href="/admin/intelligence/manual-salary" className="btn-secondary">Manual Salary fallback</Link></div>
    <div className="mt-6 space-y-4">{sources.map(source=>{const isReady=ready.includes(source.countryCode),uploadAllowed=source.licence.confirmed&&source.access!=="BLOCKED";return <article key={source.countryCode} className="rounded-2xl border border-white/10 p-5">
      <div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-semibold text-white">{source.countryCode.toUpperCase()} · {source.organization}</h3><p className="mt-1 text-sm text-slate-400">{source.dataset}</p></div><span className={isReady?"text-xs font-semibold text-emerald-300":"text-xs font-semibold text-amber-200"}>{isReady?"Ready":source.defaultReadiness.replaceAll("_"," ")}</span></div>
      <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3"><div><dt className="text-slate-500">Access</dt><dd>{source.access.replaceAll("_"," ")}</dd></div><div><dt className="text-slate-500">Latest verified</dt><dd>{source.latestVerifiedRelease}</dd></div><div><dt className="text-slate-500">Classification</dt><dd>{source.classificationSystem}</dd></div><div><dt className="text-slate-500">Licence</dt><dd className={source.licence.confirmed?"text-emerald-200":"text-rose-200"}>{source.licence.name}</dd></div><div className="md:col-span-2"><dt className="text-slate-500">Blocker / next action</dt><dd>{source.blocker??source.nextAction}</dd></div></dl>
      <div className="mt-4 flex flex-wrap gap-2"><button disabled={!isReady||!source.automationImplemented} className="btn-primary disabled:cursor-not-allowed disabled:opacity-40">Import latest release</button><Link href="/admin/intelligence/manual-salary" className="btn-secondary">Open Candidate Review</Link></div>
      <form action={importOfficialSalaryFileAction} className="mt-3 flex flex-wrap items-center gap-2"><input type="hidden" name="countryCode" value={source.countryCode}/><input required disabled={!uploadAllowed} name="officialFile" type="file" accept=".csv,.json" className="max-w-full text-sm text-slate-300 disabled:opacity-40"/><button name="intent" value="preview" disabled={!uploadAllowed} className="btn-secondary disabled:opacity-40">Preview parsed data</button><button name="intent" value="create" disabled={!isReady||!uploadAllowed} className="btn-secondary disabled:opacity-40">Create candidates</button></form>
      <p aria-live="polite" className="mt-3 text-xs text-slate-400">{results[source.countryCode]??"No import attempted. Publication always requires separate Admin review."}</p>
    </article>})}</div>
  </>;
}
