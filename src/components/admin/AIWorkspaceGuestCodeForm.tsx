"use client";

import { useState, useTransition } from "react";
import { createGuestCodeAction } from "@/app/admin/(studio)/ai-workspace/actions";

export default function AIWorkspaceGuestCodeForm({ models }: { models: string[] }) {
  const [pending, startTransition] = useTransition();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  async function copyGuestCode() {
    if (!code) return;
    setCopyState("idle");

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
        setCopyState("copied");
        return;
      }
    } catch {
      // Fall through to the legacy selection-based copy path below.
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      textarea.style.pointerEvents = "none";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (!copied) throw new Error("COPY_FAILED");
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5">
    <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-violet-300">Guest access</p><h2 className="mt-2 text-xl font-semibold text-white">Create Guest Code</h2><p className="mt-2 text-xs leading-5 text-slate-500">Plaintext is shown once. Only its cryptographic hash is stored.</p></div></div>
    {code ? <div className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-400/[.06] p-4"><p className="text-xs font-semibold text-emerald-200">Copy this code now</p><div className="mt-2 flex gap-2"><code className="min-w-0 flex-1 overflow-x-auto rounded-lg bg-black/30 px-3 py-2 text-xs text-emerald-100">{code}</code><button type="button" onClick={() => void copyGuestCode()} className="rounded-lg border border-emerald-300/20 px-3 text-xs text-emerald-200">{copyState === "copied" ? "Copied" : "Copy"}</button></div>{copyState === "failed" ? <p role="alert" className="mt-2 text-xs text-amber-200">Automatic copy was blocked. Select the code text and copy it manually.</p> : null}<button type="button" onClick={() => { setCode(""); setCopyState("idle"); }} className="mt-3 text-xs text-slate-500 hover:text-white">Dismiss permanent view</button></div> : null}
    {error ? <p role="alert" className="mt-3 text-xs text-rose-300">{error}</p> : null}
    <form className="mt-5 grid gap-3 sm:grid-cols-2" onSubmit={event => {
      event.preventDefault(); setError(""); setCode(""); setCopyState("idle"); const form = new FormData(event.currentTarget);
      startTransition(() => { void createGuestCodeAction(form).then(result => setCode(result.code)).catch(reason => setError(reason instanceof Error ? reason.message : "CREATE_FAILED")); });
    }}>
      <label className="sm:col-span-2"><span className="mb-1 block text-[11px] text-slate-500">Label</span><input name="label" required maxLength={160} placeholder="MVP customer / demo guest" className="h-10 w-full rounded-lg border border-white/10 bg-slate-950 px-3 text-sm" /></label>
      <Money name="initialCreditUsd" label="Initial AI credit (USD)" defaultValue="1.00" />
      <Money name="maxRequestUsd" label="Max per request (USD)" defaultValue="0.25" />
      <Money name="dailyLimitUsd" label="Daily limit (USD)" defaultValue="1.00" />
      <Money name="monthlyLimitUsd" label="Monthly limit (USD)" defaultValue="1.00" />
      <NumberInput name="deviceLimit" label="Device limit" defaultValue="1" min={1} max={10} />
      <NumberInput name="maxActivations" label="Activation limit" defaultValue="1" min={1} max={1000} />
      <NumberInput name="expiryDays" label="Expires after days" defaultValue="30" min={1} max={365} />
      <div className="rounded-lg border border-white/[.07] p-3"><p className="text-[11px] text-slate-500">Modes</p><div className="mt-2 flex flex-wrap gap-3">{["auto","fast","best"].map(mode => <label key={mode} className="text-xs text-slate-300"><input type="checkbox" name="modes" value={mode} defaultChecked={mode !== "best"} className="mr-1.5" />{mode}</label>)}</div></div>
      <div className="sm:col-span-2 rounded-lg border border-white/[.07] p-3"><p className="text-[11px] text-slate-500">Allowed models</p><div className="mt-2 flex flex-wrap gap-3">{models.map(model => <label key={model} className="text-xs text-slate-300"><input type="checkbox" name="models" value={model} defaultChecked={model.includes("luna")} className="mr-1.5" />{model}</label>)}</div></div>
      <button disabled={pending} className="sm:col-span-2 h-10 rounded-lg bg-violet-500 text-sm font-semibold disabled:opacity-50">{pending ? "Creating…" : "Create secure Guest Code"}</button>
    </form>
  </div>;
}

function Money({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return <label><span className="mb-1 block text-[11px] text-slate-500">{label}</span><input name={name} required inputMode="decimal" pattern="\d{1,7}(\.\d{1,6})?" defaultValue={defaultValue} className="h-10 w-full rounded-lg border border-white/10 bg-slate-950 px-3 text-sm" /></label>;
}
function NumberInput({ name, label, defaultValue, min, max }: { name: string; label: string; defaultValue: string; min: number; max: number }) {
  return <label><span className="mb-1 block text-[11px] text-slate-500">{label}</span><input type="number" name={name} required min={min} max={max} defaultValue={defaultValue} className="h-10 w-full rounded-lg border border-white/10 bg-slate-950 px-3 text-sm" /></label>;
}
