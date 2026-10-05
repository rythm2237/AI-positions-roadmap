"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { buildStudioProfileDraft } from "@/lib/applicationStudio/profileDraft";
import type { CareerWorkspaceData } from "@/types/careerWorkspace";

type StudioWindow = Window & { CareerAtelier?: {
  importProfile: (text: string, userId: string) => void;
  importSavedCV: (url: string, name: string, userId: string) => Promise<void>;
} };

export function ApplicationStudio({ career }: { career?: CareerWorkspaceData }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [open, setOpen] = useState(false);
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
    } catch (error) { setMessage(error instanceof Error ? error.message : "Import failed. Your editor contents are preserved."); }
    finally { setBusy(false); }
  }

  return <section id="application-studio" className="rounded-2xl border border-indigo-300/20 bg-indigo-400/[0.04] p-4 sm:p-5">
    <p className="label-sm text-indigo-300">Job Preparation · CV / Resume</p>
    <h3 className="mt-2 font-display text-2xl font-semibold text-white">Your application studio</h3>
    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">Build your master CV, match a real vacancy, review suggested changes, write cover and motivation letters, and export PDFs in your browser. Import your profile and completed learning as a draft you review first.</p>
    <div className="mt-4 flex flex-wrap gap-3">
      <button type="button" onClick={() => { setLoaded(true); setOpen(!open); }} aria-expanded={open} className="btn-primary min-h-11">{open ? "Close editor" : "Open CV editor & test demo"}</button>
      <Link href="/profile" className="btn-secondary min-h-11">Update my profile</Link>
      <Link href="/cv-analyzer" className="btn-secondary min-h-11">Career CV analysis</Link>
    </div>
    {loaded ? <div className={`mt-5 ${open ? "" : "hidden"}`}>
      <div className="mb-3 flex flex-wrap gap-3">
        <button type="button" disabled={busy} onClick={() => void importSource("profile")} className="btn-secondary min-h-11">Import my profile & completed learning</button>
        <button type="button" disabled={busy} onClick={() => void importSource("cv")} className="btn-secondary min-h-11">Import my saved CV</button>
        <Link href={`/login?next=${encodeURIComponent(career ? `/careers/${career.slug}?section=jobs` : "/application-studio")}`} className="min-h-11 px-3 py-3 text-sm text-cyan-200">Sign in for AI & profile import</Link>
      </div>
      <p className="mb-3 text-xs leading-5 text-slate-400">Try the NEURA demo in Candidate for a synthetic test without an AI request. Your own documents use the signed-in site AI service. Course completion never becomes employment or a verified certificate.</p>
      {message ? <p role="status" className="mb-3 rounded-xl border border-white/10 p-3 text-sm text-slate-200">{message}</p> : null}
      <iframe ref={frame} src="/application-studio/index.html" title="CV and job application editor" className="h-[85vh] min-h-[650px] w-full rounded-xl border border-white/10 bg-white" />
      <p className="mt-3 text-xs text-slate-500">Documents and drafts stay in this editor. Use Account & privacy to save on this device or download an editable backup.</p>
    </div> : null}
  </section>;
}
