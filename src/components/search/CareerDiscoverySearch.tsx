"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Candidate = { title: string; href: string; similarity?: number };

export function CareerDiscoverySearch() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [related, setRelated] = useState<Candidate[]>([]);

  async function submit(event?: FormEvent, confirmDistinct = false) {
    event?.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/career-discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, confirmDistinct }),
      });
      const result = await response.json() as { kind?: string; href?: string; statusHref?: string; candidates?: Candidate[]; error?: string; message?: string };
      if (result.kind === "existing" && result.href) {
        router.push(result.href);
        return;
      }
      if (result.kind === "queued" || result.kind === "ready_for_review") {
        if (result.statusHref) router.push(result.statusHref);
        return;
      }
      if (result.kind === "related_roles" || result.kind === "ambiguous") {
        setRelated(result.candidates ?? []);
        if (result.kind === "ambiguous") setError("This title matches more than one published career. Choose the one you mean.");
        else setError(result.message ?? "Choose whether this should be a separate career.");
        return;
      }
      setError(result.error ?? "Career search failed. Please try again.");
    } catch {
      setError("Career search is temporarily unavailable. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 max-w-3xl rounded-2xl border border-violet-300/20 bg-violet-300/[.045] p-4 sm:p-5">
      <label htmlFor="career-discovery-title" className="block text-sm font-semibold text-white">Search any career</label>
      <p className="mt-1 text-xs leading-5 text-slate-400">Published careers open immediately. Career Pro can request a new review draft when no equivalent exists.</p>
      <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={(event) => void submit(event)}>
        <input
          id="career-discovery-title"
          value={title}
          onChange={(event) => { setTitle(event.target.value); setRelated([]); setError(""); }}
          maxLength={120}
          minLength={2}
          required
          placeholder="e.g. AI Automation Specialist"
          className="min-h-12 min-w-0 flex-1 rounded-xl border border-white/10 bg-[#080b19] px-4 text-sm text-white placeholder:text-slate-500 focus:border-violet-300/60 focus:outline-none focus:ring-2 focus:ring-violet-300/20"
        />
        <button disabled={busy} className="min-h-12 rounded-xl bg-violet-500 px-5 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-wait disabled:opacity-60">
          {busy ? "Checking…" : "Find career"}
        </button>
      </form>
      {error ? <p className="mt-3 text-sm text-amber-100" role="status">{error}</p> : null}
      {related.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {related.map((candidate) => (
            <button key={candidate.href} onClick={() => router.push(candidate.href)} className="rounded-lg border border-white/10 px-3 py-2 text-left text-xs text-slate-200 hover:border-violet-300/40">
              Open {candidate.title}
            </button>
          ))}
          {related.length && !related.some((candidate) => candidate.similarity === undefined) ? (
            <button onClick={() => void submit(undefined, true)} disabled={busy} className="rounded-lg bg-violet-500/90 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-400 disabled:opacity-60">
              Create a separate career for “{title}”
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
