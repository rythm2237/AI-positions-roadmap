"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AvatarUploader({ userId, currentUrl }: { userId: string; currentUrl: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false); const router = useRouter();
  async function upload(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) { setMessage("Choose a JPG, PNG, or WebP up to 5 MB."); return; }
    setBusy(true); setMessage("Uploading…"); const supabase = createClient(); const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1]; const path = `${userId}/avatar.${extension}`;
    const result = await supabase.storage.from("avatars").upload(path, file, { contentType: file.type, upsert: true });
    if (result.error) { setBusy(false); setMessage(result.error.message); return; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path); const avatarUrl = `${data.publicUrl}?v=${Date.now()}`;
    const update = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", userId);
    if (update.error) { setBusy(false); setMessage(update.error.message); return; }
    setBusy(false); setMessage("Photo updated."); router.refresh();
  }
  return <div className="flex items-center gap-4"><div className="grid size-16 place-items-center overflow-hidden rounded-2xl bg-indigo-500/20 text-lg font-bold text-indigo-200">{currentUrl ? <img src={currentUrl} alt="Profile avatar" className="size-full object-cover" /> : "AI"}</div><div><input ref={inputRef} type="file" className="sr-only" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); }} /><button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className="min-h-11 rounded-xl border border-white/10 px-4 text-sm text-white hover:bg-white/[.05] disabled:opacity-50">{busy ? "Uploading…" : "Change photo"}</button><p aria-live="polite" className="mt-1 text-xs text-slate-500">{message || "JPG, PNG, or WebP"}</p></div></div>;
}

