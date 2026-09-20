"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type Project = { id: string; name: string; archived: boolean };
type KnowledgeFile = {
  id: string; project_id: string; original_name: string; mime_type: string; size_bytes: number | string;
  sha256: string; status: string; extraction_meta?: { chunkCount?: number; extractedChars?: number }; created_at: string;
};
type Memory = {
  id: string; project_id: string | null; scope: "user" | "project"; kind: string; content: string;
  provenance: Record<string, unknown>; status: string; updated_at: string;
};

function humanBytes(value: number | string) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

async function apiError(response: Response) {
  const body = await response.json().catch(() => null) as { error?: string } | null;
  return body?.error ?? `HTTP_${response.status}`;
}

export function AIKnowledgeClient() {
  const [booting, setBooting] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [uploading, setUploading] = useState(false);
  const [savingMemory, setSavingMemory] = useState(false);
  const [memoryScope, setMemoryScope] = useState<"user" | "project">("project");
  const [memoryKind, setMemoryKind] = useState("fact");
  const [memoryText, setMemoryText] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const loadKnowledge = useCallback(async (pid: string) => {
    if (!pid) return;
    setError("");
    const [fileResponse, memoryResponse] = await Promise.all([
      fetch(`/api/ai-workspace/files?projectId=${encodeURIComponent(pid)}`, { cache: "no-store" }),
      fetch(`/api/ai-workspace/memories?projectId=${encodeURIComponent(pid)}&includeUser=true`, { cache: "no-store" }),
    ]);
    if (!fileResponse.ok) throw new Error(await apiError(fileResponse));
    if (!memoryResponse.ok) throw new Error(await apiError(memoryResponse));
    setFiles(((await fileResponse.json()) as { files?: KnowledgeFile[] }).files ?? []);
    setMemories(((await memoryResponse.json()) as { memories?: Memory[] }).memories ?? []);
  }, []);

  useEffect(() => {
    void (async () => {
      setBooting(true);
      try {
        const session = await fetch("/api/ai-workspace/session", { cache: "no-store" });
        if (!session.ok) throw new Error("UNAUTHENTICATED");
        const response = await fetch("/api/ai-workspace/projects", { cache: "no-store" });
        if (!response.ok) throw new Error(await apiError(response));
        const list = (((await response.json()) as { projects?: Project[] }).projects ?? []).filter(item => !item.archived);
        setProjects(list);
        if (list[0]) {
          setProjectId(list[0].id);
          await loadKnowledge(list[0].id);
        }
      } catch (reason) {
        setError(reason instanceof Error && reason.message === "UNAUTHENTICATED" ? "Sign in or activate a Guest Code from AI Workspace first." : "Knowledge could not be loaded.");
      } finally {
        setBooting(false);
      }
    })();
  }, [loadKnowledge]);

  const selectedProject = useMemo(() => projects.find(item => item.id === projectId), [projectId, projects]);
  const userMemories = memories.filter(item => item.scope === "user");
  const projectMemories = memories.filter(item => item.scope === "project");

  const changeProject = async (next: string) => {
    setProjectId(next); setNotice(""); setError("");
    try { await loadKnowledge(next); } catch { setError("Knowledge could not be loaded for this project."); }
  };

  const uploadFile = async (file: File | null) => {
    if (!file || !projectId || uploading) return;
    setUploading(true); setError(""); setNotice("");
    try {
      const form = new FormData(); form.set("projectId", projectId); form.set("file", file);
      const response = await fetch("/api/ai-workspace/files", { method: "POST", body: form });
      if (!response.ok) throw new Error(await apiError(response));
      const body = await response.json() as { duplicate?: boolean };
      setNotice(body.duplicate ? "This exact file is already indexed in the project." : "File uploaded, extracted and indexed for project-aware answers.");
      await loadKnowledge(projectId);
    } catch (reason) {
      const code = reason instanceof Error ? reason.message : "UPLOAD_FAILED";
      const labels: Record<string, string> = {
        FILE_TOO_LARGE: "Files are limited to 10 MB.",
        UNSUPPORTED_FILE_TYPE: "Use PDF, DOCX, TXT, Markdown or CSV.",
        FILE_HAS_NO_EXTRACTABLE_TEXT: "No extractable text was found in this file.",
        EXTRACTED_TEXT_TOO_LARGE: "The extracted document is too large for the current knowledge limit.",
      };
      setError(labels[code] ?? `Upload failed: ${code}`);
    } finally { setUploading(false); }
  };

  const deleteFile = async (id: string) => {
    if (!confirm("Remove this file and its indexed knowledge from the project?")) return;
    setError("");
    const response = await fetch(`/api/ai-workspace/files/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) { setError(`File could not be removed: ${await apiError(response)}`); return; }
    setFiles(current => current.filter(file => file.id !== id));
    setNotice("File and indexed chunks removed.");
  };

  const addMemory = async (event: FormEvent) => {
    event.preventDefault();
    const content = memoryText.trim();
    if (!content || savingMemory) return;
    setSavingMemory(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/ai-workspace/memories", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: memoryScope, projectId: memoryScope === "project" ? projectId : null, kind: memoryKind, content }),
      });
      if (!response.ok) throw new Error(await apiError(response));
      setMemoryText(""); setNotice(memoryScope === "user" ? "Saved as account memory for all your projects." : "Saved as memory for this project.");
      await loadKnowledge(projectId);
    } catch (reason) { setError(`Memory could not be saved: ${reason instanceof Error ? reason.message : "FAILED"}`); }
    finally { setSavingMemory(false); }
  };

  const archiveMemory = async (id: string) => {
    const response = await fetch(`/api/ai-workspace/memories/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) { setError(`Memory could not be removed: ${await apiError(response)}`); return; }
    setMemories(current => current.filter(memory => memory.id !== id));
  };

  if (booting) return <main className="flex min-h-screen items-center justify-center bg-[#070912] text-slate-400"><div className="text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-violet-300/20 border-t-violet-300" /><p className="mt-4 text-sm">Loading knowledge…</p></div></main>;

  return <main className="min-h-screen bg-[radial-gradient(circle_at_top,#15142a_0,#090b14_38%,#070912_100%)] px-4 py-6 text-white sm:px-6 lg:px-8">
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-col gap-4 border-b border-white/[.07] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div><Link href="/ai" className="text-xs font-semibold uppercase tracking-[.18em] text-violet-300 hover:text-violet-200">← AI Workspace</Link><h1 className="mt-3 text-3xl font-semibold">Knowledge & Memory</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Give the workspace private reference material without changing platform permissions. Retrieved content is treated as untrusted data, never as system instructions.</p></div>
        <label className="min-w-56"><span className="mb-1 block text-[11px] uppercase tracking-[.14em] text-slate-600">Project</span><select value={projectId} onChange={event => void changeProject(event.target.value)} className="h-11 w-full rounded-xl border border-white/10 bg-[#10131f] px-3 text-sm text-slate-200 outline-none focus:border-violet-300/40">{projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
      </header>

      {error ? <div role="alert" className="mt-5 rounded-xl border border-rose-300/20 bg-rose-400/[.08] px-4 py-3 text-sm text-rose-200">{error}</div> : null}
      {notice ? <div role="status" className="mt-5 rounded-xl border border-emerald-300/15 bg-emerald-400/[.06] px-4 py-3 text-sm text-emerald-200">{notice}</div> : null}
      {!projects.length ? <div className="mt-8 rounded-2xl border border-white/[.08] bg-white/[.025] p-6 text-sm text-slate-400">Create a Project in AI Workspace before adding knowledge.</div> : null}

      {selectedProject ? <div className="mt-7 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <section className="rounded-2xl border border-white/[.08] bg-[#0d101a]/80 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-cyan-300">Private files</p><h2 className="mt-2 text-xl font-semibold">{selectedProject.name} knowledge</h2><p className="mt-2 text-sm leading-6 text-slate-500">PDF, DOCX, TXT, Markdown or CSV · max 10 MB. Text is extracted, chunked and indexed only for this Project.</p></div><label className={`inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/[.06] px-4 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/[.1] ${uploading ? "pointer-events-none opacity-50" : ""}`}><input type="file" className="hidden" accept=".pdf,.docx,.txt,.md,.markdown,.csv,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown,text/csv" onChange={event => { void uploadFile(event.target.files?.[0] ?? null); event.currentTarget.value = ""; }} />{uploading ? "Indexing…" : "Upload file"}</label></div>
          <div className="mt-5 space-y-2">{files.length ? files.map(file => <div key={file.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/[.065] bg-white/[.02] px-4 py-3"><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-200">{file.original_name}</p><p className="mt-1 text-[11px] text-slate-600">{humanBytes(file.size_bytes)} · {file.status} · {file.extraction_meta?.chunkCount ?? 0} chunks</p></div><button onClick={() => void deleteFile(file.id)} className="shrink-0 rounded-lg px-2 py-1 text-xs text-slate-600 hover:bg-rose-400/10 hover:text-rose-300">Remove</button></div>) : <div className="rounded-xl border border-dashed border-white/[.08] px-4 py-10 text-center text-sm text-slate-600">No indexed files yet.</div>}</div>
        </section>

        <section className="rounded-2xl border border-white/[.08] bg-[#0d101a]/80 p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-violet-300">Memory</p><h2 className="mt-2 text-xl font-semibold">Controlled memory</h2><p className="mt-2 text-sm leading-6 text-slate-500">User memory follows your account across Projects. Project memory is isolated to {selectedProject.name}. Nothing is auto-saved here.</p>
          <form onSubmit={addMemory} className="mt-5 space-y-3"><div className="flex gap-2"><select value={memoryScope} onChange={event => setMemoryScope(event.target.value as "user" | "project")} className="h-10 flex-1 rounded-lg border border-white/[.08] bg-[#10131f] px-3 text-xs text-slate-300"><option value="project">Project memory</option><option value="user">Account memory</option></select><select value={memoryKind} onChange={event => setMemoryKind(event.target.value)} className="h-10 flex-1 rounded-lg border border-white/[.08] bg-[#10131f] px-3 text-xs text-slate-300"><option value="fact">Fact</option><option value="preference">Preference</option><option value="decision">Decision</option><option value="instruction_context">Context</option></select></div><textarea value={memoryText} onChange={event => setMemoryText(event.target.value)} maxLength={12000} rows={4} placeholder="Add information you want AI Workspace to remember…" className="w-full resize-y rounded-xl border border-white/[.08] bg-white/[.025] px-3 py-3 text-sm text-slate-200 outline-none focus:border-violet-300/35" /><div className="flex items-center justify-between"><span className="text-[10px] text-slate-700">{memoryText.length}/12000</span><button disabled={!memoryText.trim() || savingMemory} className="rounded-lg bg-violet-500 px-4 py-2 text-xs font-semibold disabled:opacity-40">{savingMemory ? "Saving…" : "Save memory"}</button></div></form>
        </section>
      </div> : null}

      {selectedProject ? <section className="mt-6 rounded-2xl border border-white/[.08] bg-[#0d101a]/80 p-5 sm:p-6"><div className="grid gap-6 md:grid-cols-2"><div><div className="flex items-center justify-between"><h3 className="font-semibold text-slate-200">Project memory</h3><span className="text-xs text-slate-600">{projectMemories.length}</span></div><div className="mt-3 space-y-2">{projectMemories.length ? projectMemories.map(memory => <MemoryRow key={memory.id} memory={memory} onArchive={archiveMemory} />) : <p className="text-sm text-slate-600">No Project memory yet.</p>}</div></div><div><div className="flex items-center justify-between"><h3 className="font-semibold text-slate-200">Account memory</h3><span className="text-xs text-slate-600">{userMemories.length}</span></div><div className="mt-3 space-y-2">{userMemories.length ? userMemories.map(memory => <MemoryRow key={memory.id} memory={memory} onArchive={archiveMemory} />) : <p className="text-sm text-slate-600">No account memory yet.</p>}</div></div></div></section> : null}
    </div>
  </main>;
}

function MemoryRow({ memory, onArchive }: { memory: Memory; onArchive: (id: string) => Promise<void> }) {
  return <div className="rounded-xl border border-white/[.06] bg-white/[.018] px-3 py-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[10px] uppercase tracking-[.12em] text-slate-600">{memory.kind}</p><p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-slate-300">{memory.content}</p></div><button onClick={() => void onArchive(memory.id)} className="shrink-0 text-xs text-slate-700 hover:text-rose-300">Remove</button></div></div>;
}
