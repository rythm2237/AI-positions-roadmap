"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { extractMasterCvSkills } from "@/lib/cvAnalyzer/masterCvEvidence";

const formats = { "application/pdf": "pdf", "application/msword": "doc", "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx" } as const;

export function ResumeUploader({ userId, label = "Upload resume" }: { userId: string; label?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function enrichProfileEvidence(file: File, supabase: ReturnType<typeof createClient>) {
    if (!file.type.includes("pdf") && !file.type.includes("wordprocessingml")) return 0;
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/cv-analyzer/extract", { method: "POST", body });
      const data = await response.json() as { text?: string };
      if (!response.ok || !data.text) return 0;

      const detected = extractMasterCvSkills(data.text);
      if (!detected.length) return 0;

      const profileResult = await supabase.from("profiles").select("skills").eq("id", userId).single();
      if (profileResult.error) return 0;
      const profileData = profileResult.data as { skills?: string[] } | null;
      const existing: string[] = profileData?.skills ?? [];
      const byKey = new Map(existing.map((skill: string) => [skill.trim().toLowerCase(), skill]));
      for (const skill of detected) if (!byKey.has(skill.toLowerCase())) byKey.set(skill.toLowerCase(), skill);
      const merged = [...byKey.values()].slice(0, 50);
      const update = await supabase.from("profiles").update({ skills: merged }).eq("id", userId);
      return update.error ? 0 : Math.max(0, merged.length - existing.length);
    } catch {
      return 0;
    }
  }

  async function upload(file: File) {
    const fileType = formats[file.type as keyof typeof formats];
    if (!fileType || file.size > 10 * 1024 * 1024) {
      setMessage("Choose a PDF, DOC, or DOCX up to 10 MB.");
      return;
    }

    setBusy(true);
    setMessage("Saving Master CV securely…");
    const supabase = createClient();
    const id = crypto.randomUUID();
    const storagePath = `${userId}/${id}.${fileType}`;
    const uploadResult = await supabase.storage.from("resumes").upload(storagePath, file, { contentType: file.type, upsert: false });
    if (uploadResult.error) {
      setBusy(false);
      setMessage(uploadResult.error.message);
      return;
    }

    const insertResult = await supabase.from("resumes").insert({ id, user_id: userId, title: file.name.replace(/\.[^.]+$/, ""), file_type: fileType, storage_path: storagePath });
    if (insertResult.error) {
      await supabase.storage.from("resumes").remove([storagePath]);
      setBusy(false);
      setMessage(insertResult.error.message);
      return;
    }

    const addedSkills = await enrichProfileEvidence(file, supabase);
    await supabase.from("user_activity").insert({
      user_id: userId,
      action: "resume_uploaded",
      metadata: { resume_id: id, master_cv: true, profile_skills_added: addedSkills },
    });

    setBusy(false);
    setMessage(addedSkills ? `Master CV saved. ${addedSkills} CV-evidenced skill${addedSkills === 1 ? "" : "s"} added to your profile.` : "Master CV saved. No new profile skills were added automatically.");
    router.refresh();
  }

  return <div>
    <input ref={inputRef} type="file" className="sr-only" accept=".pdf,.doc,.docx" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); }} />
    <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className="btn-primary min-h-11 text-sm disabled:opacity-50">{busy ? "Uploading…" : label}</button>
    <p aria-live="polite" className="mt-2 text-xs text-slate-500">{message || "PDF, DOC, or DOCX · 10 MB max"}</p>
  </div>;
}
