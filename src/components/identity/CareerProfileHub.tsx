"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { emptyKnowledge, type Knowledge } from "@/lib/applicationStudio/knowledge.mjs";
import { CAREER_SECTIONS, careerProfileScores, factsBySection, previewCareerImport, type ProfileFact } from "@/lib/identity/careerProfileHub";
import type { Profile } from "@/types/identity";
import { CareerProfileAssistant } from "./CareerProfileAssistant";
import { CareerRecordDetails } from "./CareerRecordDetails";

type KnowledgeResponse = { userId?: string; knowledge?: Knowledge; token?: string | null; error?: string };
type ImportSource = "cv" | "certification" | "project-document" | "linkedin";
type ImportDraft = { file?: File; name: string; sourceType: ImportSource; text: string; characters: number };
const MAX_BYTES = 8 * 1024 * 1024;
const fields = [
  { key: "context", name: "General detail" }, { key: "company", name: "Company / organisation" },
  { key: "title", name: "Job title / qualification" }, { key: "dates", name: "Dates" },
  { key: "location", name: "Location" }, { key: "responsibilities", name: "Responsibilities" },
  { key: "tools", name: "Tools & technology" }, { key: "skills", name: "Skills" },
  { key: "outcomes", name: "Measurable achievements" }, { key: "links", name: "Portfolio / evidence link" },
  { key: "role", name: "Project role" }, { key: "workflows", name: "Process / workflow" },
];
function messageOf(error: unknown) { return error instanceof Error ? error.message : "Please retry this operation."; }

export function CareerProfileHub({ profile, userId, hasResume }: { profile: Profile; userId: string; hasResume: boolean }) {
  const [knowledge, setKnowledge] = useState<Knowledge>(emptyKnowledge);
  const [loaded, setLoaded] = useState(false);
  const [knowledgeReady, setKnowledgeReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [importDraft, setImportDraft] = useState<ImportDraft | null>(null);
  const [sourceKind, setSourceKind] = useState<ImportSource>("cv");
  const [pastedProfile, setPastedProfile] = useState("");
  const [lastCvText, setLastCvText] = useState("");
  const [kind, setKind] = useState<string>("experience");
  const [entityId, setEntityId] = useState("");
  const [label, setLabel] = useState("");
  const [field, setField] = useState("context");
  const [factText, setFactText] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editingText, setEditingText] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [savedResume, setSavedResume] = useState(hasResume);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/application-studio/knowledge", { cache: "no-store", signal: controller.signal })
      .then(async (res) => {
        const result = await res.json() as KnowledgeResponse;
        if (!res.ok || result.userId !== userId || !result.knowledge) throw new Error(result.error || "Your career profile could not load.");
        setKnowledge(result.knowledge);
        setKnowledgeReady(true);
      })
      .catch((error) => { if (!controller.signal.aborted) setStatus(messageOf(error)); })
      .finally(() => { if (!controller.signal.aborted) setLoaded(true); });
    return () => controller.abort();
  }, [userId]);

  const scores = useMemo(() => careerProfileScores(profile, knowledge, savedResume), [profile, knowledge, savedResume]);
  const grouped = useMemo(() => factsBySection(knowledge), [knowledge]);
  const preview = useMemo(() => {
    if (!importDraft) return null;
    try { return { result: previewCareerImport(knowledge, importDraft.text, importDraft.name, importDraft.sourceType), error: "" }; }
    catch (error) { return { result: null, error: messageOf(error) }; }
  }, [knowledge, importDraft]);

  async function changeKnowledge(operation: string, values: Record<string, unknown>): Promise<Knowledge> {
    const response = await fetch("/api/application-studio/knowledge", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation, ...values, sessionUserId: userId, consent: true, revision: knowledge.revision }),
    });
    const payload = await response.json() as KnowledgeResponse;
    if (!response.ok || payload.userId !== userId || !payload.knowledge) throw new Error(payload.error || "The profile could not be saved.");
    setKnowledge(payload.knowledge);
    return payload.knowledge;
  }

  async function readCV(file: File) {
    setStatus("");
    setImportDraft(null);
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx", "txt"].includes(extension || "") || !file.size || file.size > MAX_BYTES) {
      setStatus("Choose a readable PDF, DOCX or TXT file up to 8 MB.");
      return;
    }
    setBusy(true);
    try {
      const data = new FormData();
      data.set("file", file);
      const response = await fetch("/api/cv-analyzer/extract", { method: "POST", body: data });
      const result = await response.json() as { text?: string; error?: string };
      if (!response.ok || !result.text) throw new Error(result.error || "No readable CV text was found. Scanned image-only PDFs need an OCR-capable file.");
      setImportDraft({ file, name: file.name, sourceType: sourceKind, text: result.text, characters: result.text.length });
      setStatus("Review what will be added to your profile. This preview has not been saved.");
    } catch (error) { setStatus(messageOf(error)); }
    finally { setBusy(false); }
  }

  async function saveOriginalCV(file: File) {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension !== "pdf" && extension !== "docx") return "TXT facts imported. Upload a PDF or DOCX to also keep a master CV.";
    const supabase = createClient();
    const id = crypto.randomUUID();
    const path = userId + "/" + id + "." + extension;
    const mime = extension === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const upload = await supabase.storage.from("resumes").upload(path, file, { contentType: mime, upsert: false });
    if (upload.error) return "Facts imported, but the original CV could not be stored: " + upload.error.message;
    const stored = await supabase.from("resumes").insert({
      id, user_id: userId, title: file.name.replace(/\.[^.]+$/, "").slice(0, 160) || "Master CV",
      file_type: extension, storage_path: path,
    });
    if (stored.error) {
      await supabase.storage.from("resumes").remove([path]);
      return "Facts imported, but the original CV record could not be saved: " + stored.error.message;
    }
    setSavedResume(true);
    return "The original CV was also saved securely for CV Maker.";
  }

  async function confirmImport() {
    if (!importDraft || !preview?.result || !knowledgeReady || busy) return;
    setBusy(true);
    setStatus("");
    try {
      await changeKnowledge("import", { type: importDraft.sourceType, text: importDraft.text, label: importDraft.name });
      const detail = importDraft.file && importDraft.sourceType === "cv" ? await saveOriginalCV(importDraft.file) : "The extracted source facts were saved with provenance.";
      setStatus("Profile import completed. " + preview.result.added + " new facts added. " + detail);
      if (importDraft.sourceType === "cv") setLastCvText(importDraft.text.slice(0,22000));
      setImportDraft(null);
    } catch (error) { setStatus(messageOf(error)); }
    finally { setBusy(false); }
  }

  async function approveAssistantFacts(facts: Array<{ kind: string; field: string; label: string; text: string }>) {
    if (!knowledgeReady || busy) throw new Error("Profile is not available.");
    setBusy(true);
    try {
      await changeKnowledge("batch-confirm", { facts });
      setStatus(facts.length + " reviewed facts saved to the Career Profile Hub.");
    } finally { setBusy(false); }
  }

  async function saveMetadata(entityId: string, metadata: Record<string, string | null>) {
    if (!knowledgeReady || busy) throw new Error("Profile is not available.");
    setBusy(true);
    try { await changeKnowledge("metadata", { entityId, metadata }); }
    finally { setBusy(false); }
  }

  async function moveFact(claimId: string, kind: string, label: string) {
    if (!knowledgeReady || busy) return;
    setBusy(true);
    try {
      await changeKnowledge("move", { claimId, kind, label });
      setStatus("Fact moved to " + (CAREER_SECTIONS.find(s => s.kind === kind)?.title || kind));
    } catch (error) { setStatus(messageOf(error)); }
    finally { setBusy(false); }
  }

  async function clearProfileFacts() {
    if (!knowledgeReady || busy) return;
    const answer = window.prompt("To permanently clear your saved career facts, type: CLEAR MY CAREER FACTS\n\nYour basic account details and uploaded CV files are NOT deleted.");
    if (answer !== "CLEAR MY CAREER FACTS") return;
    if (!window.confirm("Clear all Career Profile Hub facts? CV Maker snapshots and uploaded files remain unchanged.")) return;
    setBusy(true);
    try {
      await changeKnowledge("clear", { confirmation: answer });
      setStatus("Career knowledge cleared. Previously saved CV documents and account basics were preserved.");
      setLastCvText("");
    } catch (error) { setStatus(messageOf(error)); }
    finally { setBusy(false); }
  }

  function exportProfile() {
    const payload = JSON.stringify({ exportVersion: 1, exportedAt: new Date().toISOString(), account: profile.id, basics: profile, knowledge }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "career-profile-backup.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function addFact() {
    if (!knowledgeReady || !factText.trim() || busy) return;
    setBusy(true); setStatus("");
    try {
      await changeKnowledge("confirm", { fact: { text: factText.trim(), kind, entityId: entityId || undefined, label: label.trim() || factText.trim().slice(0, 70), field } });
      setFactText(""); setEntityId(""); setLabel(""); setField("context");
      setStatus("Professional fact saved. It can now be reused as candidate-confirmed evidence.");
    } catch (error) { setStatus(messageOf(error)); }
    finally { setBusy(false); }
  }

  async function removeFact(id: string) {
    if (!knowledgeReady || busy || !window.confirm("Remove this fact from active CV and portfolio evidence?")) return;
    setBusy(true); setStatus("");
    try {
      await changeKnowledge("retract", { claimId: id });
      setStatus("Fact removed from active career evidence. Original source provenance is retained.");
    } catch (error) { setStatus(messageOf(error)); }
    finally { setBusy(false); }
  }

  async function correctFact(id: string) {
    if (!knowledgeReady || busy || !editingText.trim()) return;
    setBusy(true); setStatus("");
    try {
      await changeKnowledge("replace", { claimId: id, text: editingText.trim() });
      setEditingId(""); setEditingText("");
      setStatus("Fact corrected. The old version is excluded from CV generation.");
    } catch (error) { setStatus(messageOf(error)); }
    finally { setBusy(false); }
  }

  function addDetail(item: ProfileFact) {
    setKind(item.kind);
    setEntityId(item.entityId);
    setLabel(item.label);
    setField("context");
    setFactText("");
    document.getElementById("career-profile-add-fact")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return <div className="mt-8 space-y-6">
    <section className="glass rounded-2xl border border-white/10 p-5 sm:p-7" aria-labelledby="career-profile-title">
      <p className="eyebrow">Career identity · Source of truth</p>
      <h2 id="career-profile-title" className="mt-2 text-2xl font-semibold text-white">Career Profile Hub</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Build your career profile once. Its candidate-confirmed facts, CV evidence and project history are reusable in CV Maker, Portfolio and job matching.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          { title: "Profile completeness", value: scores.completeness, note: "Essential sections only" },
          { title: "Evidence traceability", value: scores.evidence, note: "Document sources and user confirmations" },
          { title: "CV readiness", value: scores.readiness, note: "Minimum profile content for a draft" },
        ].map((metric) => <div className="rounded-xl border border-white/10 bg-white/[.03] p-4" key={metric.title}>
          <div className="flex justify-between gap-2 text-sm"><span className="text-slate-300">{metric.title}</span><strong className="text-white">{metric.value}%</strong></div>
          <div role="progressbar" aria-label={metric.title} aria-valuenow={metric.value} aria-valuemin={0} aria-valuemax={100} className="mt-3 h-2 overflow-hidden rounded-full bg-slate-700"><div className="h-full rounded-full bg-indigo-400 transition-all" style={{ width: metric.value + "%" }} /></div>
          <p className="mt-2 text-xs text-slate-500">{metric.note}</p>
        </div>)}
      </div>
      {scores.missing.length > 0 && <p className="mt-4 text-sm text-amber-100">Suggested next sections: {scores.missing.slice(0, 3).join(" · ")}</p>}
      <p className="mt-2 text-xs text-slate-500">Self-reported CV information is not independently verified. Optional sections do not reduce profile completeness.</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button type="button" disabled={!knowledgeReady} onClick={exportProfile} className="btn-secondary min-h-10 text-xs disabled:opacity-50">Export my full career profile (JSON)</button>
        <button type="button" disabled={!knowledgeReady || busy} onClick={() => void clearProfileFacts()} className="rounded-xl border border-rose-400/20 px-3 py-2 text-xs text-rose-200 disabled:opacity-50">Clear all saved career facts</button>
      </div>
    </section>

    <section className="glass rounded-2xl border border-indigo-300/20 p-5 sm:p-7" aria-labelledby="career-cv-import-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="eyebrow">Fast onboarding</p><h2 id="career-cv-import-title" className="mt-2 text-xl font-semibold text-white">Import your career history</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Upload a CV to extract your experience, skills, degrees, credentials and projects. Missing facts are added under the right section; repeated facts are not copied again.</p></div>
        <label className="btn-primary inline-flex min-h-11 cursor-pointer items-center justify-center text-sm">
          {busy ? "Processing…" : "Upload a CV"}
          <input className="sr-only" type="file" accept=".pdf,.docx,.txt" disabled={!knowledgeReady || busy} onChange={(event) => { const file = event.currentTarget.files?.[0]; event.currentTarget.value = ""; if (file) void readCV(file); }} />
        </label>
      </div>
      <label className="mt-4 block text-sm text-slate-300">Document type
        <select className="input-field mt-2 min-h-11 w-full max-w-sm" value={sourceKind} onChange={e => setSourceKind(e.target.value as ImportSource)}>
          <option value="cv">CV / résumé</option>
          <option value="certification">Certificate / qualification</option>
          <option value="project-document">Project document / portfolio file</option>
          <option value="linkedin">Exported LinkedIn text</option>
        </select>
      </label>
      <details className="mt-3 rounded-lg border border-white/10 p-3">
        <summary className="cursor-pointer text-sm text-indigo-100">Paste LinkedIn profile or another professional source</summary>
        <label className="mt-3 block text-xs text-slate-300">Professional text
          <textarea className="input-field mt-2 min-h-24 w-full" maxLength={100000} value={pastedProfile} onChange={e => setPastedProfile(e.target.value)} placeholder="Paste exported profile text, job history, accomplishments and credentials. No login credentials or private messages." />
        </label>
        <button type="button" className="btn-secondary mt-3 min-h-11 text-sm" disabled={!knowledgeReady || busy || pastedProfile.trim().length < 5} onClick={() => {setImportDraft({name:"Pasted professional profile",text:pastedProfile,characters:pastedProfile.length,sourceType:"linkedin"});setStatus("Review the extracted profile facts before saving.");}}>Review pasted profile</button>
      </details>
      <p className="mt-3 text-xs text-slate-500">PDF / DOCX / TXT · max 8 MB · Extracted information is reviewed before being saved. Scanned PDFs without extractable text are not supported yet.</p>
      {!loaded && <p className="mt-4 text-sm text-slate-400">Loading saved professional evidence…</p>}
      {preview?.error && <p role="alert" className="mt-4 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-200">{preview.error}</p>}
      {preview?.result && importDraft && <div className="mt-5 space-y-4 rounded-xl border border-white/10 bg-white/[.02] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-semibold text-white">{importDraft.name}</h3><p className="text-xs text-slate-400">{importDraft.characters.toLocaleString()} characters extracted</p></div>
          <span className="rounded-full bg-indigo-400/10 px-3 py-1 text-sm font-semibold text-indigo-200">{preview.result.added} new facts</span></div>
        {preview.result.added === 0 && <p className="text-sm text-slate-300">No new distinct facts found. You can still save this CV as your master document.</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          {CAREER_SECTIONS.filter((section) => preview.result!.groups[section.kind]?.length).map((section) => <div key={section.kind} className="rounded-lg border border-white/10 p-3">
            <p className="text-sm font-semibold text-indigo-100">{section.title} · {preview.result!.groups[section.kind].length}</p>
            <ul className="mt-2 space-y-1 text-xs text-slate-300">{preview.result!.groups[section.kind].slice(0, 4).map((fact: ProfileFact) => <li key={fact.id} className="break-words">• {fact.text}</li>)}</ul>
            {preview.result!.groups[section.kind].length > 4 && <p className="mt-1 text-xs text-slate-500">More facts will be imported into this section.</p>}
          </div>)}
        </div>
        <p className="text-xs text-amber-100">Please check the categorisation. If a CV has unclear headings, some extracted facts can appear in Other career information. Edit or reassign them after importing. Only facts actually present in the file are saved.</p>
        <div className="flex flex-wrap gap-3"><button type="button" disabled={busy} onClick={() => void confirmImport()} className="btn-primary min-h-11 disabled:opacity-50">Confirm & import to my profile</button>
          <button type="button" disabled={busy} onClick={() => setImportDraft(null)} className="btn-secondary min-h-11">Cancel</button></div>
      </div>}
      {status && <p role="status" aria-live="polite" className="mt-4 rounded-lg border border-white/10 bg-white/[.03] p-3 text-sm text-slate-200">{status}</p>}
    </section>

    <CareerProfileAssistant busy={busy} disabled={!knowledgeReady} cvText={lastCvText} onApprove={approveAssistantFacts} />

    <section id="career-profile-add-fact" className="glass scroll-mt-20 rounded-2xl border border-white/10 p-5 sm:p-7" aria-labelledby="career-add-title">
      <h2 id="career-add-title" className="text-xl font-semibold text-white">{entityId ? "Add details to an existing record" : "Add professional information"}</h2>
      <p className="mt-2 text-sm text-slate-400">Add or correct individual facts. These are saved as candidate-confirmed, not independently verified.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-slate-300">Section
          <select className="input-field mt-2 w-full" value={kind} onChange={(event) => { setKind(event.target.value); setEntityId(""); }}>
            {CAREER_SECTIONS.map((section) => <option key={section.kind} value={section.kind}>{section.title}</option>)}
          </select></label>
        <label className="text-sm text-slate-300">Record title (company, project or qualification)
          <input className="input-field mt-2 w-full" maxLength={150} value={label} onChange={(event) => { setLabel(event.target.value); setEntityId(""); }} placeholder="e.g. Logistics Flow Planner" disabled={Boolean(entityId)} />
        </label>
        <label className="text-sm text-slate-300">Detail type
          <select className="input-field mt-2 w-full" value={field} onChange={(event) => setField(event.target.value)}>{fields.map((item) => <option key={item.key} value={item.key}>{item.name}</option>)}</select>
        </label>
        <div className="flex items-end">{entityId && <button type="button" onClick={() => { setEntityId(""); setLabel(""); }} className="btn-secondary min-h-11">Start a separate record</button>}</div>
      </div>
      <label className="mt-4 block text-sm text-slate-300">Professional fact
        <textarea className="input-field mt-2 min-h-28 w-full" value={factText} maxLength={4000} onChange={(event) => setFactText(event.target.value)} placeholder="Describe one genuine achievement, responsibility, course, skill or project detail. Add evidence links where available." />
      </label>
      <button type="button" disabled={!knowledgeReady || busy || !factText.trim()} onClick={() => void addFact()} className="btn-primary mt-4 min-h-11 disabled:opacity-50">Save fact</button>
    </section>

    <section className="space-y-4" aria-labelledby="career-records-title">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 id="career-records-title" className="text-2xl font-semibold text-white">Your career records</h2><p className="mt-1 text-sm text-slate-400">Each section can contain multiple independently editable facts.</p></div>
        <label className="text-sm text-slate-300">Search records<input className="input-field mt-2 block min-h-11" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Skill, role, certificate…" /></label>
      </div>
      {CAREER_SECTIONS.map((section) => {
        const facts = grouped[section.kind].filter((fact) => !search.trim() || (fact.text + " " + fact.label).toLowerCase().includes(search.toLowerCase()));
        const visible = expanded[section.kind] ? facts : facts.slice(0, 12);
        return <details key={section.kind} className="glass rounded-xl border border-white/10 p-4 sm:p-5" open={undefined}>
          <summary className="cursor-pointer text-base font-semibold text-white">{section.title} <span className="ml-2 rounded-full bg-white/10 px-2 py-1 text-xs font-normal text-slate-300">{facts.length}</span></summary>
          <p className="mt-2 text-xs text-slate-500">{section.hint}</p>
          {facts.length === 0 && <p className="mt-3 text-sm text-slate-400">No facts in this section yet. Use Add professional information or import your CV.</p>}
          <ul className="mt-3 space-y-3">{visible.map((item) => <li key={item.id} className="rounded-lg border border-white/10 bg-white/[.02] p-3">
            <p className="text-xs font-medium text-indigo-200">{item.label} · {item.sourceType === "cv" ? "Imported from CV" : "Added to profile"}</p>
            {editingId === item.id ? <div className="mt-2 space-y-2"><textarea className="input-field min-h-24 w-full" maxLength={4000} value={editingText} onChange={(event) => setEditingText(event.target.value)} />
              <div className="flex flex-wrap gap-2"><button type="button" disabled={busy || !editingText.trim()} className="btn-primary min-h-11 text-sm" onClick={() => void correctFact(item.id)}>Save correction</button>
                <button type="button" className="btn-secondary min-h-11 text-sm" onClick={() => setEditingId("")}>Cancel</button></div></div>
              : <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-200">{item.text}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
              <span className="text-slate-500">{item.verification === "candidate-confirmed" ? "Candidate confirmed" : "CV reported · review recommended"}</span>
              <button type="button" disabled={busy} className="text-indigo-200 underline-offset-2 hover:underline" onClick={() => addDetail(item)}>Add detail</button>
              <button type="button" disabled={busy} className="text-indigo-200 underline-offset-2 hover:underline" onClick={() => { setEditingId(item.id); setEditingText(item.text); }}>Edit</button>
              <label className="text-slate-300">Move to
                <select aria-label={"Move fact to a different section: " + item.text.slice(0, 40)} disabled={busy} value={item.kind} onChange={(e) => void moveFact(item.id, e.target.value, item.label || item.text.slice(0, 70))} className="ml-2 rounded border border-white/20 bg-slate-900 px-1 py-1 text-xs text-white">
                  {CAREER_SECTIONS.map(sec => <option key={sec.kind} value={sec.kind}>{sec.title}</option>)}
                </select>
              </label>
              <button type="button" disabled={busy} className="text-rose-200 underline-offset-2 hover:underline" onClick={() => void removeFact(item.id)}>Remove</button>
            </div>
            <CareerRecordDetails kind={item.kind} entityId={item.entityId} value={item.metadata} busy={busy} onSave={saveMetadata} />
          </li>)}</ul>
          {facts.length > 12 && <button type="button" className="btn-secondary mt-3 min-h-11 text-sm" onClick={() => setExpanded((previous) => ({ ...previous, [section.kind]: !previous[section.kind] }))}>{expanded[section.kind] ? "Show fewer" : "Show all " + facts.length + " facts"}</button>}
        </details>;
      })}
    </section>
  </div>;
}
