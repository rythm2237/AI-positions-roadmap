"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { buildStudioProfileDraft } from "@/lib/applicationStudio/profileDraft";
import type { CareerWorkspaceData } from "@/types/careerWorkspace";

type StudioWindow = Window & { CareerAtelier?: {
  importProfile: (text: string, userId: string) => void;
  importSavedCV: (url: string, name: string, userId: string) => Promise<void>;
} };

export function ApplicationStudio({ career }: { career?: CareerWorkspaceData }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [open, setOpen] = useState(false);
  const [fullPage, setFullPage] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function importSource(kind: "profile" | "cv") {
    const studio = (frame.current?.contentWindow as StudioWindow | null)?.CareerAtelier;
    if (!studio) { setMessage("The editor is loading. Try again in a moment."); return; }
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/application-studio/profile${career ? `?career=${encodeURIComponent(career.slug)}` : ""}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Profile import is unavailable.");
      if (kind === "cv") {
        if (!data.resume) throw new Error("No saved CV yet. Upload a CV in the editor or add one to your account first.");
        await studio.importSavedCV(data.resume.url, data.resume.name, data.userId);
      } else {
        studio.importProfile(buildStudioProfileDraft(data.profile, career, data.progress, data.projects), data.userId);
      }
      setMessage("Imported as an editable draft. Check every fact, add missing details, then choose Confirm master profile in the editor.");
    } catch (error) { setMessage(error && typeof error === "object" && "message" in error && typeof error.message === "string" ? error.message : "Import failed. Your editor contents are preserved."); }
    finally { setBusy(false); }
  }

  const editor = loaded ? createPortal(<div
    aria-hidden={!open}
    className={`fixed ${fullPage ? "inset-0" : "inset-x-4 inset-y-6 md:inset-x-[5vw] md:inset-y-[5vh] rounded-2xl border border-white/10 shadow-2xl"} z-[1000] flex flex-col overflow-hidden bg-slate-950 p-2 sm:p-3`}
    style={{ display: open ? "flex" : "none", ...(fullPage ? { height: "100dvh" } : {}) }}
  >
    <div className="mb-2 flex shrink-0 flex-wrap items-center gap-2">
      {fullPage ? <span className="mr-auto text-sm font-semibold text-white">CV & Application Studio</span> : null}
      <button type="button" disabled={busy} onClick={() => void importSource("profile")} style={{ maxWidth: "100%", whiteSpace: "normal" }} className="btn-secondary min-h-11">Import my profile & completed learning</button>
      <button type="button" disabled={busy} onClick={() => void importSource("cv")} className="btn-secondary min-h-11">Import my saved CV</button>
      <Link href={`/login?next=${encodeURIComponent(career ? `/careers/${career.slug}?section=jobs` : "/application-studio")}`} className="min-h-11 px-3 py-3 text-sm text-cyan-200">Sign in for AI & profile import</Link>
      <button type="button" onClick={() => setFullPage(value => !value)} className="btn-secondary min-h-11">{fullPage ? "Exit full screen" : "Full screen"}</button>
      {fullPage ? <button type="button" onClick={() => setOpen(false)} className="btn-secondary min-h-11">Close</button> : null}
    </div>
    {!fullPage ? <p className="mb-3 shrink-0 text-xs leading-5 text-slate-400">You can load a fictional sample to explore the workflow. For your own assessment, sign in, upload your CV and add the real vacancy. AI analysis runs only when you request it. Completed learning is never presented as work experience or a verified certificate.</p> : null}
    {message ? <p role="status" className="mb-2 shrink-0 rounded-xl border border-white/10 p-3 text-sm text-slate-200">{message}</p> : null}
    <iframe ref={frame} src="/application-studio/index.html" title="CV and job application editor" className="min-h-0 w-full flex-1 rounded-xl border border-white/10 bg-white" />
    {!fullPage ? <p className="mt-3 shrink-0 text-xs text-slate-500">Documents and drafts stay in this editor. Use Account & privacy to save on this device or download an editable backup.</p> : null}
  </div>, document.body) : null;

  return <section id="application-studio" className="rounded-2xl border border-indigo-300/20 bg-indigo-400/[0.04] p-4 sm:p-5">
    <p className="label-sm text-indigo-300">Job Preparation · CV / Resume</p>
    <h3 className="mt-2 font-display text-2xl font-semibold text-white">Your application studio</h3>
    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">Build your master CV, match a real vacancy, review suggested changes, write cover and motivation letters, and export PDFs in your browser. Import your profile and completed learning as a draft you review first.</p>
    <div className="mt-4 flex flex-wrap gap-3">
      <button type="button" onClick={() => { setLoaded(true); if (!open) setFullPage(true); setOpen(!open); }} aria-expanded={open} className="btn-primary min-h-11">{open ? "Close Application Studio" : "Open CV & Application Studio"}</button>
      <Link href="/profile" className="btn-secondary min-h-11">Update my profile</Link>
      <Link href="/cv-analyzer" className="btn-secondary min-h-11">Career CV analysis</Link>
    </div>
    {editor}
  </section>;
}
