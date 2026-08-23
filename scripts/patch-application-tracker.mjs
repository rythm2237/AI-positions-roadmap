import fs from "node:fs";

const file = "src/components/career/jobs/JobLaunchWorkspace.tsx";
let source = fs.readFileSync(file, "utf8");

const importLine = 'import ApplicationTrackerWorkspace from "@/components/career/jobs/ApplicationTrackerWorkspace";';
if (!source.includes(importLine)) {
  const marker = 'import { getJobReadinessReport } from "@/lib/jobReadiness";';
  if (!source.includes(marker)) throw new Error("Application tracker import marker not found.");
  source = source.replace(marker, `${marker}\n${importLine}`);
}

const renderLine = '      <ApplicationTrackerWorkspace career={career} />';
if (!source.includes(renderLine)) {
  const marker = '      {saved.length > 0 ? <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Saved analyses</p><h3 className="mt-1 text-lg font-semibold text-white">Compare opportunities</h3></div><span className="text-xs text-slate-500">Last {saved.length}</span></div><div className="mt-4 grid gap-3 lg:grid-cols-2">{saved.map((match) => <button key={match.id} type="button" onClick={() => setCurrent(match)} className="rounded-xl border border-white/10 bg-slate-950/40 p-4 text-left hover:border-cyan-300/20"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-white">{match.input.title}</p><p className="mt-1 text-xs text-slate-500">{match.input.company || "Company not specified"}</p></div><span className="text-lg font-semibold text-cyan-200">{match.result.matchScore}%</span></div><p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{decisionLabel(match.result.decision)}</p></button>)}</div></section> : null}';
  if (!source.includes(marker)) throw new Error("Application tracker render marker not found.");
  source = source.replace(marker, `${marker}\n${renderLine}`);
}

fs.writeFileSync(file, source);
console.log("Application tracker wired into Job Launch Workspace.");
