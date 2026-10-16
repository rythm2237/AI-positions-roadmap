"use client";

import { useState } from "react";
const descriptors: Record<string, Array<[string, string, string]>> = {
  skills: [["category","Category","text"],["level","Proficiency (beginner/intermediate/advanced/expert/unknown)","select-level"],["yearsExperience","Years of practice","number"],["lastUsed","Last used (year)","text"],["evidenceLink","Evidence link","url"],["relatedProjects","Associated projects","text"]],
  experience: [["company","Employer","text"],["jobTitle","Position","text"],["employmentType","Employment type","text"],["startDate","Start date","month"],["endDate","End date","month"],["country","Country","text"]],
  education: [["institution","Institution","text"],["degree","Degree","text"],["field","Field of study","text"],["startDate","Start date","month"],["endDate","End date","month"],["grade","Grade","text"]],
  certifications: [["issuer","Issuer","text"],["credentialId","Credential ID","text"],["issuedAt","Date issued","date"],["expiresAt","Expires","date"],["credentialUrl","Verification URL","url"],["status","Status","text"]],
  development: [["provider","Provider","text"],["status","Status (in progress/completed)","text"],["completedAt","Completion date","date"],["hours","Hours studied","number"]],
  projects: [["projectType","Project type","text"],["role","My role","text"],["status","Implementation status","text"],["projectUrl","Live demo or artifact URL","url"],["repositoryUrl","Repository URL","url"],["startDate","Start date","month"],["endDate","End date","month"]],
  languages: [["cefr","CEFR level (A1–C2)","text"],["proficiency","Proficiency","text"],["certificate","Language exam evidence","text"]],
  additional: [["awardIssuer","Award issuer","text"],["awardedAt","Award date","date"],["url","Proof link","url"]],
  header: [["city","City","text"],["country","Country","text"],["phone","Phone","text"],["linkedin","LinkedIn","url"],["website","Website","url"]],
  summary: [["targetRole","Target role","text"],["industry","Industry","text"]],
  other: [["category","Category","text"],["url","Evidence link","url"]],
};

export function CareerRecordDetails({ kind, entityId, value, onSave, busy }: {
  kind: string; entityId: string; value?: Record<string, unknown>;
  busy: boolean; onSave: (entityId: string, metadata: Record<string, string | null>) => Promise<void>;
}) {
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const inputs = descriptors[kind] || [];
  if (!inputs.length) return null;
  const current = (key: string) => Object.hasOwn(draft, key) ? draft[key] : String(value?.[key] ?? "");
  async function save() {
    setError(""); setSaved(false);
    const changes: Record<string, string | null> = {};
    for (const [key] of inputs) if (Object.hasOwn(draft, key)) changes[key] = draft[key].trim() || null;
    if (!Object.keys(changes).length) return;
    try { await onSave(entityId, changes); setDraft({}); setSaved(true); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not save details."); }
  }
  return <details className="mt-3 rounded-lg border border-indigo-300/10 bg-indigo-300/[.02] px-3 py-2">
    <summary className="cursor-pointer text-xs font-semibold text-indigo-200">Structured record details</summary>
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      {inputs.map(([key,label,type]) => <label key={key} className="text-xs text-slate-300">{label}
        {type === "select-level" ? <select value={current(key)} onChange={(e) => setDraft(v => ({ ...v, [key]: e.target.value }))} className="input-field mt-1 w-full"><option value="">Not specified</option>{["beginner","intermediate","advanced","expert","unknown"].map(level => <option value={level} key={level}>{level}</option>)}</select> :
          <input className="input-field mt-1 min-h-10 w-full" type={type} value={current(key)} onChange={(e) => setDraft(v => ({ ...v, [key]: e.target.value }))} maxLength={500} />}
      </label>)}
    </div>
    <button type="button" disabled={busy || !Object.keys(draft).length} onClick={() => void save()} className="btn-secondary mt-3 min-h-10 text-xs disabled:opacity-50">Save structured details</button>
    {error && <p className="mt-2 text-xs text-rose-200">{error}</p>}{saved && <p className="mt-2 text-xs text-emerald-200">Details saved.</p>}
  </details>;
}
