"use client";

import { useEffect, useMemo, useState } from "react";
import { emptyKnowledge, type Knowledge } from "@/lib/applicationStudio/knowledge.mjs";
import { factsBySection } from "@/lib/identity/careerProfileHub";

const terms = (text: string) => new Set((text.toLocaleLowerCase().match(/[\p{L}\p{N}+#.]{3,}/gu) || []).filter(t => !["with","from","were","that","this","have","been","your","and","for","the"].includes(t)));
function relevance(text: string, vacancy: string) {
  const v = terms(vacancy), c = terms(text);
  if (!v.size) return 0;
  return [...c].filter(t => v.has(t)).length / Math.sqrt(Math.max(1, v.size * c.size));
}
type PortfolioEntry = { id: string; title: string; facts: Array<{ text: string; claimId: string; verification: string; sourceType: string }>; score: number };
export function ProfilePortfolioEvidence({ careerTitle }: { careerTitle: string }) {
  const [knowledge, setKnowledge] = useState<Knowledge>(emptyKnowledge);
  const [loaded, setLoaded] = useState(false);
  const [vacancy, setVacancy] = useState("");
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    fetch("/api/application-studio/knowledge", { cache: "no-store" }).then(async response => {
      if (!response.ok) { if (response.status !== 401) throw new Error("Your saved career profile could not be loaded."); return null; }
      return response.json();
    }).then(payload => { if (live && payload?.knowledge) setKnowledge(payload.knowledge); })
      .catch(e => { if (live) setError(e instanceof Error ? e.message : "Profile unavailable."); })
      .finally(() => { if (live) setLoaded(true); });
    return () => { live = false; };
  }, []);

  const projects = useMemo(() => {
    const facts = factsBySection(knowledge).projects || [];
    const grouped = new Map<string, PortfolioEntry>();
    for (const item of facts) {
      const key = item.entityId;
      const previous = grouped.get(key) || { id: key, title: item.label, facts: [], score: 0 };
      previous.facts.push({ text: item.text, claimId: item.id, verification: item.verification, sourceType: item.sourceType });
      grouped.set(key, previous);
    }
    return [...grouped.values()].map(item => ({ ...item, score: relevance(item.title + " " + item.facts.map(f => f.text).join(" "), vacancy || careerTitle) }))
      .sort((a,b) => b.score - a.score);
  }, [knowledge, vacancy, careerTitle]);

  function exportMarkdown() {
    const chosen = projects.filter(p => enabled[p.id] !== false);
    const contents = ["# Career portfolio — candidate-reported work", "", "Target role: " + (vacancy.trim().slice(0, 150) || careerTitle), "Generated: " + new Date().toISOString(), "The candidate must review every fact before publication.", ""];
    for (const project of chosen) {
      contents.push("## " + project.title, ...project.facts.map(f => "- " + f.text + " (source: " + f.sourceType + "; evidence: " + f.claimId + "; status: " + f.verification + ")"), "");
    }
    const url = URL.createObjectURL(new Blob([contents.join("\n")], { type: "text/markdown" }));
    const link = document.createElement("a");link.href = url; link.download = "career-portfolio-draft.md";link.click();URL.revokeObjectURL(url);
  }

  return <section className="rounded-2xl border border-indigo-300/20 bg-slate-950/75 p-5" aria-labelledby="candidate-project-portfolio">
    <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">Candidate portfolio</p>
    <h3 id="candidate-project-portfolio" className="mt-2 text-xl font-semibold text-white">Build a role-specific portfolio from your profile</h3>
    <p className="mt-2 text-sm leading-6 text-slate-400">Projects imported from your CV or added in Career Profile Hub can be selected for a vacancy. They remain candidate-reported until separately reviewed; they are never presented as verified training projects.</p>
    <label className="mt-4 block text-sm text-slate-300">Vacancy description or role keywords (optional)
      <textarea className="input-field mt-2 min-h-20 w-full" maxLength={2000} value={vacancy} onChange={e => setVacancy(e.target.value)} placeholder={careerTitle} />
    </label>
    {!loaded && <p className="mt-4 text-sm text-slate-400">Loading profile projects…</p>}
    {error && <p className="mt-3 text-sm text-rose-200">{error}</p>}
    {loaded && !projects.length && <p className="mt-4 text-sm text-slate-400">No profile projects yet. Add them in <a href="/profile" className="text-cyan-200 underline">Career Profile Hub</a> or upload your CV.</p>}
    <div className="mt-4 space-y-3">{projects.slice(0, 15).map(p => <div key={p.id} className="rounded-xl border border-white/10 p-3">
      <label className="flex items-start gap-2 text-sm font-semibold text-white">
        <input type="checkbox" className="mt-1" checked={enabled[p.id] !== false} onChange={e => setEnabled(v => ({ ...v, [p.id]: e.target.checked }))} />
        {p.title} <span className="font-normal text-xs text-slate-500">({p.facts.length} grounded facts)</span>
      </label>
      <ul className="mt-2 list-disc space-y-1 pl-6 text-xs text-slate-300">{p.facts.slice(0,5).map(f => <li key={f.claimId}>{f.text}</li>)}</ul>
    </div>)}</div>
    <button disabled={!projects.some(p => enabled[p.id] !== false)} type="button" onClick={exportMarkdown} className="btn-secondary mt-4 min-h-11 disabled:opacity-50">Export selected portfolio draft</button>
    <p className="mt-2 text-xs text-slate-500">The export is an editable draft and includes source identifiers. Public proof links continue to include only reviewed platform projects.</p>
  </section>;
}
