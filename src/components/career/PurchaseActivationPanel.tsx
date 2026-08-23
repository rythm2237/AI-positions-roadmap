"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { adaptiveDiagnosticStorageKey } from "@/lib/adaptiveDiagnostic";
import {
  ACTIVATION_STEPS,
  FREE_OUTCOMES,
  PRO_OUTCOMES,
  activationStorageKey,
  checkoutUrl,
  resolveRolePathPlan,
  type RolePathPlan,
} from "@/lib/productAccess";

export default function PurchaseActivationPanel({ careerSlug }: { careerSlug: string }) {
  const [plan, setPlan] = useState<RolePathPlan>("free");
  const [userId, setUserId] = useState<string | null>(null);
  const [hasDiagnostic, setHasDiagnostic] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const checkout = useMemo(() => checkoutUrl(), []);

  useEffect(() => {
    let active = true;
    const supabase = createSupabaseClient();
    void supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUserId(data.user?.id ?? null);
      setPlan(resolveRolePathPlan(data.user));
    });
    try {
      setHasDiagnostic(Boolean(localStorage.getItem(adaptiveDiagnosticStorageKey(careerSlug))));
    } catch {}
    return () => { active = false; };
  }, [careerSlug]);

  useEffect(() => {
    if (!userId || plan !== "pro") return;
    try {
      const raw = localStorage.getItem(activationStorageKey(userId, careerSlug));
      if (raw) setCompleted(JSON.parse(raw));
    } catch {}
  }, [careerSlug, plan, userId]);

  function toggleStep(id: string) {
    if (!userId) return;
    const next = completed.includes(id) ? completed.filter((item) => item !== id) : [...completed, id];
    setCompleted(next);
    try { localStorage.setItem(activationStorageKey(userId, careerSlug), JSON.stringify(next)); } catch {}
  }

  if (plan === "pro") {
    const pct = Math.round((completed.length / ACTIVATION_STEPS.length) * 100);
    return <section className="mt-5 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.035] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">Pro activation</p>
      <div className="mt-2 flex items-end justify-between gap-4"><div><h3 className="text-xl font-semibold text-white">Turn access into progress</h3><p className="mt-1 text-sm text-slate-400">Your paid entitlement is active. Complete these first actions to reach value quickly.</p></div><span className="text-2xl font-semibold text-white">{pct}%</span></div>
      <div className="mt-4 grid gap-2 md:grid-cols-2">{ACTIVATION_STEPS.map((step) => <button key={step.id} type="button" onClick={() => toggleStep(step.id)} className="rounded-xl border border-white/10 bg-slate-950/45 p-3 text-left"><span className={completed.includes(step.id) ? "text-emerald-300" : "text-slate-400"}>{completed.includes(step.id) ? "✓" : "○"}</span><span className="ml-2 text-sm text-slate-200">{step.label}</span></button>)}</div>
    </section>;
  }

  return <section className="mt-5 rounded-2xl border border-violet-300/15 bg-violet-300/[0.035] p-5">
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">Free vs Pro</p>
    <h3 className="mt-2 text-xl font-semibold text-white">See your gap before deciding to upgrade</h3>
    <p className="mt-1 text-sm leading-6 text-slate-400">Career discovery, the baseline diagnostic and roadmap preview stay free. Upgrade prompts appear only after the product has shown personalized value.</p>
    <div className="mt-4 grid gap-4 md:grid-cols-2"><div className="rounded-xl border border-white/10 p-4"><p className="font-semibold text-white">Free</p><ul className="mt-3 space-y-2 text-xs leading-5 text-slate-400">{FREE_OUTCOMES.map((item) => <li key={item}>• {item}</li>)}</ul></div><div className="rounded-xl border border-violet-300/20 bg-violet-300/[0.04] p-4"><p className="font-semibold text-white">Pro execution</p><ul className="mt-3 space-y-2 text-xs leading-5 text-slate-300">{PRO_OUTCOMES.map((item) => <li key={item}>• {item}</li>)}</ul></div></div>
    {hasDiagnostic ? <div className="mt-4 rounded-xl border border-cyan-300/15 bg-cyan-300/[0.04] p-4"><p className="text-sm font-semibold text-cyan-100">Your personalized gap is now visible.</p><p className="mt-1 text-xs leading-5 text-slate-400">Upgrade only if you want the execution layer: reviewed projects, proof profile, job targeting, interview scoring and application management.</p>{checkout ? <a href={checkout} className="mt-3 inline-flex rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950">Upgrade to Pro</a> : <button type="button" disabled className="mt-3 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-500">Checkout configuration pending</button>}</div> : <p className="mt-4 text-xs text-slate-500">Complete the free baseline diagnostic first. No upgrade prompt is needed before personalized value is demonstrated.</p>}
  </section>;
}
