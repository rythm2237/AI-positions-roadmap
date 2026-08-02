"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const formats = { "application/pdf": "pdf", "application/msword": "doc", "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx" } as const;
export function ResumeUploader({ userId }: { userId: string }) {
  const inputRef = useRef<HTMLInputElement>(null); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false); const router = useRouter();
  async function upload(file: File) {
    const fileType = formats[file.type as keyof typeof formats];
    if (!fileType || file.size > 10 * 1024 * 1024) { setMessage("Choose a PDF, DOC, or DOCX up to 10 MB."); return; }
    setBusy(true); setMessage("Uploading securely…"); const supabase = createClient(); const id = crypto.randomUUID(); const storagePath = `${userId}/${id}.${fileType}`;
    const uploadResult = await supabase.storage.from("resumes").upload(storagePath, file, { contentType: file.type, upsert: false });
    if (uploadResult.error) { setBusy(false); setMessage(uploadResult.error.message); return; }
    const insertResult = await supabase.from("resumes").insert({ id, user_id: userId, title: file.name.replace(/\.[^.]+$/, ""), file_type: fileType, storage_path: storagePath });
    if (insertResult.error) { await supabase.storage.from("resumes").remove([storagePath]); setBusy(false); setMessage(insertResult.error.message); return; }
    await supabase.from("user_activity").insert({ user_id: userId, action: "resume_uploaded", metadata: { resume_id: id } });
    setBusy(false); setMessage("Resume uploaded."); router.refresh();
  }
  return <div><input ref={inputRef} type="file" className="sr-only" accept=".pdf,.doc,.docx" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); }} /><button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className="btn-primary min-h-11 text-sm disabled:opacity-50">{busy ? "Uploading…" : "Upload resume"}</button><p aria-live="polite" className="mt-2 text-xs text-slate-500">{message || "PDF, DOC, or DOCX · 10 MB max"}</p></div>;
}
