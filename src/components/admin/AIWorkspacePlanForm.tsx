"use client";

import { useState, useTransition } from "react";
import { upsertAIPlanAction } from "@/app/admin/(studio)/ai-workspace/planActions";

export default function AIWorkspacePlanForm({ models }: { models: string[] }) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState("");
  return <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5">
    <p className="text-xs font-semibold uppercase tracking-[.16em] text-cyan-300">Plan configuration</p>
    <h2 className="mt-2 text-xl font-semibold">Define AI allowance</h2>
    <p className="mt-2 text-xs leading-5 text-slate-500">Nothing is inferred from the subscription price. Enter the provider-cost allowance explicitly. Saving an inactive plan does not enable AI.</p>
    {status ? <p role="status" className="mt-3 text-xs text-cyan-200">{status}</p> : null}
    <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={event => {
      event.preventDefault(); const data = new FormData(event.currentTarget); setStatus("");
      startTransition(() => { void upsertAIPlanAction(data).then(() => setStatus("Plan configuration saved.")).catch(reason => setStatus(reason instanceof Error ? reason.message : "PLAN_SAVE_FAILED")); });
    }}>
      <Field name="planKey" label="Plan key" placeholder="pro" />
      <label><span className="mb-1 block text-[11px] text-slate-500">Status</span><select name="active" defaultValue="false" className="h-10 w-full rounded-lg border border-white/10 bg-slate-950 px-3 text-sm"><option value="false">Inactive</option><option value="true">Active</option></select></label>
      <Money name="periodCreditUsd" label="Period AI credit (USD)" />
      <Money name="monthlyLimitUsd" label="Monthly hard limit (USD)" />
      <Money name="dailyLimitUsd" label="Daily hard limit (USD)" />
      <Money name="maxRequestUsd" label="Max request cost (USD)" />
      <NumberField name="maxContextTokens" label="Max context tokens" defaultValue="80000" min={1000} max={272000} />
      <NumberField name="maxOutputTokens" label="Max output tokens" defaultValue="8192" min={256} max={128000} />
      <div className="rounded-lg border border-white/[.07] p-3"><p className="text-[11px] text-slate-500">Modes</p><div className="mt-2 flex flex-wrap gap-3">{["auto","fast","best"].map(mode => <label key={mode} className="text-xs"><input type="checkbox" name="modes" value={mode} defaultChecked={mode !== "best"} className="mr-1.5"/>{mode}</label>)}</div></div>
      <div className="rounded-lg border border-white/[.07] p-3"><p className="text-[11px] text-slate-500">Models</p><div className="mt-2 flex flex-wrap gap-3">{models.map(model => <label key={model} className="text-xs"><input type="checkbox" name="models" value={model} defaultChecked={model.includes("luna")} className="mr-1.5"/>{model}</label>)}</div></div>
      <button disabled={pending} className="sm:col-span-2 h-10 rounded-lg bg-cyan-500/20 text-sm font-semibold text-cyan-100 ring-1 ring-cyan-300/20 disabled:opacity-50">{pending ? "Saving…" : "Save explicit AI plan"}</button>
    </form>
  </div>;
}

function Field({ name, label, placeholder }: { name: string; label: string; placeholder?: string }) { return <label><span className="mb-1 block text-[11px] text-slate-500">{label}</span><input name={name} required placeholder={placeholder} className="h-10 w-full rounded-lg border border-white/10 bg-slate-950 px-3 text-sm"/></label>; }
function Money({ name, label }: { name: string; label: string }) { return <label><span className="mb-1 block text-[11px] text-slate-500">{label}</span><input name={name} required inputMode="decimal" pattern="\d{1,7}(\.\d{1,6})?" defaultValue="0.00" className="h-10 w-full rounded-lg border border-white/10 bg-slate-950 px-3 text-sm"/></label>; }
function NumberField({ name, label, defaultValue, min, max }: { name: string; label: string; defaultValue: string; min: number; max: number }) { return <label><span className="mb-1 block text-[11px] text-slate-500">{label}</span><input type="number" name={name} required defaultValue={defaultValue} min={min} max={max} className="h-10 w-full rounded-lg border border-white/10 bg-slate-950 px-3 text-sm"/></label>; }
