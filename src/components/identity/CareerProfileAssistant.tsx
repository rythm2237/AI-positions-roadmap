"use client";

import { useState } from "react";

type Proposal = { kind: string; field: string; label: string; text: string; excerpt: string; reason: string };
type AssistantResult = { proposals?: Proposal[]; questions?: string[]; omitted?: number; error?: string };

export function CareerProfileAssistant({ busy, disabled, onApprove }: {
  busy: boolean;
  disabled: boolean;
  onApprove: (facts: Array<{ kind: string; field: string; label: string; text: string }>) => Promise<void>;
}) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [questions, setQuestions] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const pending = busy || loading || disabled;

  async function propose() {
    setProposals([]); setSelected([]); setQuestions([]); setStatus("");
    if (note.trim().length < 10) return setStatus("Enter at least one genuine professional detail.");
    setLoading(true);
    try {
      const response = await fetch("/api/career-profile/assist", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: note, mode: "note" }),
      });
      const data = await response.json() as AssistantResult;
      if (!response.ok) throw new Error(data.error || "AI assistant is not available.");
      const facts = data.proposals || [];
      setProposals(facts); setSelected(facts.map((_, i) => i)); setQuestions(data.questions || []);
      setStatus(facts.length ? "Review and edit these proposals. Nothing has been saved." : "No supported facts were found; try a clearer description.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Request failed."); }
    finally { setLoading(false); }
  }

  async function approve() {
    if (!selected.length || pending) return;
    setLoading(true); setStatus("");
    try {
      await onApprove(selected.map((index) => {
        const { kind, label, text, field } = proposals[index];
        return { kind, label, text, field };
      }));
      setProposals([]); setSelected([]); setQuestions([]); setNote("");
      setStatus("Approved professional facts saved.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Save failed. Review and retry."); }
    finally { setLoading(false); }
  }

  return <section className="glass rounded-2xl border border-cyan-300/20 p-5 sm:p-7" aria-labelledby="career-assistant-title">
    <p className="eyebrow">Optional · AI supported</p>
    <h2 id="career-assistant-title" className="mt-2 text-xl font-semibold text-white">Career Profile AI Assistant</h2>
    <p className="mt-2 text-sm leading-6 text-slate-400">Describe a job, project, achievement, training or certificate in your own words. The assistant suggests where each verified excerpt belongs. You review every suggestion before it is saved.</p>
    <label className="mt-5 block text-sm text-slate-300">Professional details
      <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={22000} placeholder="Example: I built a Power BI dashboard for department-level replenishment planning in 2025. It compares daily workload with forecast demand." className="input-field mt-2 min-h-32 w-full" />
    </label>
    <button disabled={pending || note.trim().length < 10} type="button" className="btn-secondary mt-4 min-h-11 disabled:opacity-50" onClick={() => void propose()}>{loading ? "Reviewing…" : "Suggest profile updates"}</button>
    {status && <p role="status" className="mt-3 text-sm text-indigo-100">{status}</p>}
    {proposals.length > 0 && <div className="mt-5 space-y-3">
      <h3 className="font-semibold text-white">Proposed updates ({selected.length} selected)</h3>
      <div className="max-h-[75vh] space-y-3 overflow-y-auto pr-1">
        {proposals.map((fact, index) => <div key={index} className="rounded-xl border border-white/10 p-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-white">
            <input type="checkbox" checked={selected.includes(index)} onChange={(e) => setSelected((current) => e.target.checked ? [...current, index] : current.filter((v) => v !== index))} />
            {fact.kind} · {fact.label}
          </label>
          <p className="mt-2 text-xs text-slate-500">Source excerpt: “{fact.excerpt}”</p>
          <label className="mt-2 block text-xs text-slate-300">Review proposed fact
            <textarea className="input-field mt-1 min-h-16 w-full text-sm" value={fact.text} maxLength={1600} onChange={(e) => setProposals((current) => current.map((entry, i) => i === index ? { ...entry, text: e.target.value } : entry))} />
          </label>
          <p className="mt-2 text-xs text-slate-500">{fact.reason}</p>
        </div>)}
      </div>
      <button type="button" className="btn-primary min-h-11 disabled:opacity-50" disabled={pending || selected.length === 0 || selected.some(i => !proposals[i].text.trim())} onClick={() => void approve()}>Confirm & save selected facts</button>
    </div>}
    {questions.length > 0 && <div className="mt-4 rounded-lg border border-amber-300/20 p-3">
      <h3 className="text-sm font-semibold text-amber-100">Details worth clarifying</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">{questions.map((question, i) => <li key={i}>{question}</li>)}</ul>
    </div>}
    <p className="mt-4 text-xs text-slate-500">AI suggestions are not independently verified. Never include invented figures, qualifications or production experience. AI usage counts toward your account allowance.</p>
  </section>;
}
