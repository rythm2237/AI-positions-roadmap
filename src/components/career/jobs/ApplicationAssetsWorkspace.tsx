"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buildApplicationAssetPack } from "@/lib/applicationAssets";
import { projectEvidenceStorageKey, type ProjectReview } from "@/lib/projectEvidence";
import type { JobMatchInput, JobMatchResult } from "@/lib/jobMatch";
import type { CareerWorkspaceData } from "@/types/careerWorkspace";

export function ApplicationAssetsWorkspace({ career, input, result }: { career: CareerWorkspaceData; input: JobMatchInput; result: JobMatchResult }) {
  const [reviews, setReviews] = useState<Record<string, ProjectReview>>({});
  const [copied, setCopied] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(projectEvidenceStorageKey(career.slug));
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setReviews(parsed.reviews || {});
    } catch { setReviews({}); }
  }, [career.slug]);

  const pack = useMemo(() => buildApplicationAssetPack(career, input, result, reviews), [career, input, result, reviews]);

  async function copy(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1500);
  }

  return <section className="rounded-2xl border border-indigo-300/15 bg-indigo-400/[0.04] p-5">
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300">Application assets</p><h3 className="mt-2 text-2xl font-semibold text-white">Tailor evidence for {input.title}</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">This pack reuses only JD-matched skills and reviewed project evidence. It does not invent work history, metrics, certifications, or experience.</p></div>
      <Link href="/cv-analyzer" className="rounded-xl border border-indigo-300/25 px-4 py-2.5 text-sm font-semibold text-indigo-100 hover:bg-indigo-300/10">Open CV Analyzer</Link>
    </div>

    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      <AssetCard title="ATS keywords" action="Copy keywords" onCopy={() => copy("keywords", pack.atsKeywords.join(", "))} copied={copied === "keywords"}>
        {pack.atsKeywords.length ? <div className="flex flex-wrap gap-2">{pack.atsKeywords.map((item) => <span key={item} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-300">{item}</span>)}</div> : <Empty text="No supported JD keywords yet." />}
      </AssetCard>
      <AssetCard title="LinkedIn headline" action="Copy headline" onCopy={() => copy("headline", pack.linkedinHeadline)} copied={copied === "headline"}><p className="text-sm leading-6 text-slate-300">{pack.linkedinHeadline}</p></AssetCard>
      <AssetCard title="CV evidence bullets" action="Copy bullets" onCopy={() => copy("bullets", pack.cvEvidenceBullets.map((item) => `• ${item}`).join("\n"))} copied={copied === "bullets"}>
        {pack.cvEvidenceBullets.length ? <ul className="space-y-2 text-sm leading-6 text-slate-300">{pack.cvEvidenceBullets.map((item) => <li key={item}>• {item}</li>)}</ul> : <Empty text="No reviewed project evidence is available for CV tailoring yet." />}
      </AssetCard>
      <AssetCard title="LinkedIn About draft" action="Copy About" onCopy={() => copy("about", pack.linkedinAbout)} copied={copied === "about"}><p className="text-sm leading-6 text-slate-300">{pack.linkedinAbout}</p></AssetCard>
      <AssetCard title="Cover-letter evidence brief" action="Copy brief" onCopy={() => copy("cover", pack.coverLetterEvidence.map((item) => `• ${item}`).join("\n"))} copied={copied === "cover"}>
        <ul className="space-y-2 text-sm leading-6 text-slate-300">{pack.coverLetterEvidence.map((item) => <li key={item}>• {item}</li>)}</ul>
      </AssetCard>
      <div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-4"><p className="text-sm font-semibold text-amber-100">Unsupported gaps — do not claim</p>{pack.unsupportedGaps.length ? <div className="mt-3 flex flex-wrap gap-2">{pack.unsupportedGaps.map((item) => <span key={item} className="rounded-full border border-amber-300/15 px-2.5 py-1 text-xs text-amber-100">{item}</span>)}</div> : <p className="mt-2 text-xs text-slate-400">No career-specific unsupported gaps detected in this JD.</p>}</div>
    </div>
    <p className="mt-4 border-t border-white/10 pt-4 text-xs leading-5 text-slate-500">{pack.integrityNote}</p>
  </section>;
}

function AssetCard({ title, action, onCopy, copied, children }: { title: string; action: string; onCopy: () => void; copied: boolean; children: React.ReactNode }) {
  return <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4"><div className="flex items-center justify-between gap-3"><h4 className="text-sm font-semibold text-white">{title}</h4><button type="button" onClick={onCopy} className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/[0.05]">{copied ? "Copied" : action}</button></div><div className="mt-3">{children}</div></div>;
}
function Empty({ text }: { text: string }) { return <p className="text-xs leading-5 text-slate-500">{text}</p>; }
