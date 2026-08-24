"use client";

import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { adaptiveDiagnosticStorageKey } from "@/lib/adaptiveDiagnostic";
import { analyticsEvents, trackEvent } from "@/lib/analytics";
import {
  ACTIVATION_STEPS,
  FREE_OUTCOMES,
  PRO_OUTCOMES,
  activationStorageKey,
  resolveRolePathPlan,
  type RolePathPlan,
} from "@/lib/productAccess";
import { ROLE_PATH_PRICING, type BillingInterval } from "@/lib/billing/stripe";

const BILLING_ENABLED = process.env.NEXT_PUBLIC_ROLE_PATH_BILLING_ENABLED === "true";

export default function PurchaseActivationPanel({ careerSlug }: { careerSlug: string }) {
  const [plan, setPlan] = useState<RolePathPlan>("free");
  const [userId, setUserId] = useState<string | null>(null);
  const [hasDiagnostic, setHasDiagnostic] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [billingBusy, setBillingBusy] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);
  const trackedUpgradePrompt = useRef(false);
  const trackedPro = useRef(false);

  useEffect(() => {
    let active = true;
    const supabase = createSupabaseClient();
    void supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
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
    if (plan === "pro" && !trackedPro.current) {
      trackedPro.current = true;
      trackEvent(analyticsEvents.proEntitlementDetected, { career_slug: careerSlug });
    }
    if (BILLING_ENABLED && plan === "free" && hasDiagnostic && !trackedUpgradePrompt.current) {
      trackedUpgradePrompt.current = true;
      trackEvent(analyticsEvents.upgradePromptViewed, { career_slug: careerSlug });
    }
  }, [careerSlug, hasDiagnostic, plan]);

  useEffect(() => {
    if (!userId || (BILLING_ENABLED && plan !== "pro")) return;
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
    trackEvent(analyticsEvents.activationStepChanged, {
      career_slug: careerSlug,
      step_id: id,
      completed: next.includes(id),
      completed_count: next.length,
      total_steps: ACTIVATION_STEPS.length,
      access_mode: BILLING_ENABLED ? plan : "public-beta",
    });
    if (next.length === ACTIVATION_STEPS.length) {
      trackEvent(analyticsEvents.activationCompleted, { career_slug: careerSlug, total_steps: ACTIVATION_STEPS.length, access_mode: BILLING_ENABLED ? plan : "public-beta" });
    }
  }

  async function openBillingEndpoint(endpoint: "checkout" | "portal", interval: BillingInterval = "monthly") {
    setBillingError(null);
    if (!userId) {
      window.location.href = `/login?next=${encodeURIComponent(`/careers/${careerSlug}`)}`;
      return;
    }
    setBillingBusy(true);
    try {
      const response = await fetch(`/api/billing/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: endpoint === "checkout" ? JSON.stringify({ careerSlug, interval }) : undefined,
      });
      const body = await response.json();
      if (!response.ok || typeof body.url !== "string") throw new Error(body.error || "Billing could not be opened.");
      if (endpoint === "checkout") trackEvent(analyticsEvents.checkoutStarted, { career_slug: careerSlug, plan: "pro", billing_interval: interval });
      window.location.href = body.url;
    } catch (error) {
      setBillingError(error instanceof Error ? error.message : "Billing could not be opened.");
      setBillingBusy(false);
    }
  }

  if (plan === "pro") {
    const pct = Math.round((completed.length / ACTIVATION_STEPS.length) * 100);
    return <section className="mt-5 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.035] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">Pro activation</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4"><div><h3 className="text-xl font-semibold text-white">Turn access into progress</h3><p className="mt-1 text-sm text-slate-400">Your existing Pro entitlement remains active. Complete these first actions to reach value quickly.</p></div><div className="flex items-center gap-3"><span className="text-2xl font-semibold text-white">{pct}%</span><button type="button" disabled={billingBusy} onClick={() => void openBillingEndpoint("portal")} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/[0.05] disabled:opacity-50">Manage billing</button></div></div>
      <div className="mt-4 grid gap-2 md:grid-cols-2">{ACTIVATION_STEPS.map((step) => <button key={step.id} type="button" onClick={() => toggleStep(step.id)} className="rounded-xl border border-white/10 bg-slate-950/45 p-3 text-left"><span className={completed.includes(step.id) ? "text-emerald-300" : "text-slate-400"}>{completed.includes(step.id) ? "✓" : "○"}</span><span className="ml-2 text-sm text-slate-200">{step.label}</span></button>)}</div>
      {billingError ? <p className="mt-3 text-xs text-rose-300">{billingError}</p> : null}
    </section>;
  }

  if (!BILLING_ENABLED) {
    const pct = userId ? Math.round((completed.length / ACTIVATION_STEPS.length) * 100) : 0;
    return <section className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.04] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Free Public Beta</p>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4"><div className="max-w-3xl"><h3 className="text-xl font-semibold text-white">Full Zero-to-Hired access is unlocked during the beta</h3><p className="mt-1 text-sm leading-6 text-slate-400">No card is required. Use the complete workflow, tell us what is useful or confusing, and help validate the product before paid plans are activated.</p></div><span className="rounded-full border border-cyan-200/20 bg-cyan-200/[0.06] px-3 py-1 text-xs font-semibold text-cyan-100">€0 during beta</span></div>
      <div className="mt-4 grid gap-4 md:grid-cols-2"><div className="rounded-xl border border-white/10 p-4"><p className="font-semibold text-white">Foundation included</p><ul className="mt-3 space-y-2 text-xs leading-5 text-slate-400">{FREE_OUTCOMES.map((item) => <li key={item}>• {item}</li>)}</ul></div><div className="rounded-xl border border-cyan-300/20 bg-cyan-300/[0.035] p-4"><p className="font-semibold text-white">Execution layer included in beta</p><ul className="mt-3 space-y-2 text-xs leading-5 text-slate-300">{PRO_OUTCOMES.map((item) => <li key={item}>• {item}</li>)}</ul></div></div>
      {hasDiagnostic ? <p className="mt-4 rounded-xl border border-emerald-300/15 bg-emerald-300/[0.04] p-3 text-xs leading-5 text-emerald-100">Your baseline diagnostic is complete. Continue directly into the execution workflow; there is no upgrade step during Public Beta.</p> : <p className="mt-4 text-xs text-slate-500">Start with the baseline diagnostic. The rest of the workflow remains unlocked during Public Beta.</p>}
      {userId ? <div className="mt-4"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-white">Beta activation checklist</p><span className="text-sm font-semibold text-cyan-100">{pct}%</span></div><div className="mt-3 grid gap-2 md:grid-cols-2">{ACTIVATION_STEPS.map((step) => <button key={step.id} type="button" onClick={() => toggleStep(step.id)} className="rounded-xl border border-white/10 bg-slate-950/45 p-3 text-left"><span className={completed.includes(step.id) ? "text-emerald-300" : "text-slate-400"}>{completed.includes(step.id) ? "✓" : "○"}</span><span className="ml-2 text-sm text-slate-200">{step.label}</span></button>)}</div></div> : <p className="mt-4 text-xs text-slate-500">Sign in to save your beta progress and activation checklist.</p>}
    </section>;
  }

  return <section className="mt-5 rounded-2xl border border-violet-300/15 bg-violet-300/[0.035] p-5">
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">Free vs Pro</p>
    <h3 className="mt-2 text-xl font-semibold text-white">See your gap before deciding to upgrade</h3>
    <p className="mt-1 text-sm leading-6 text-slate-400">Career discovery, the baseline diagnostic and roadmap preview stay free. Upgrade prompts appear only after the product has shown personalized value.</p>
    <div className="mt-4 grid gap-4 md:grid-cols-2"><div className="rounded-xl border border-white/10 p-4"><p className="font-semibold text-white">Free</p><ul className="mt-3 space-y-2 text-xs leading-5 text-slate-400">{FREE_OUTCOMES.map((item) => <li key={item}>• {item}</li>)}</ul></div><div className="rounded-xl border border-violet-300/20 bg-violet-300/[0.04] p-4"><p className="font-semibold text-white">Pro execution</p><ul className="mt-3 space-y-2 text-xs leading-5 text-slate-300">{PRO_OUTCOMES.map((item) => <li key={item}>• {item}</li>)}</ul></div></div>
    {hasDiagnostic ? <div className="mt-4 rounded-xl border border-cyan-300/15 bg-cyan-300/[0.04] p-4"><p className="text-sm font-semibold text-cyan-100">Your personalized gap is now visible.</p><p className="mt-1 text-xs leading-5 text-slate-400">Upgrade only if you want the execution layer: reviewed projects, proof profile, job targeting, interview scoring and application management.</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><button type="button" disabled={billingBusy} onClick={() => void openBillingEndpoint("checkout", "monthly")} className="rounded-xl bg-cyan-300 px-4 py-3 text-left text-slate-950 disabled:cursor-wait disabled:opacity-60"><span className="block text-sm font-semibold">Pro Monthly</span><span className="mt-1 block text-xs">{ROLE_PATH_PRICING.monthly.label}</span></button><button type="button" disabled={billingBusy} onClick={() => void openBillingEndpoint("checkout", "annual")} className="rounded-xl border border-cyan-200/40 bg-cyan-200/[0.08] px-4 py-3 text-left text-cyan-50 disabled:cursor-wait disabled:opacity-60"><span className="block text-sm font-semibold">Pro Annual</span><span className="mt-1 block text-xs">{ROLE_PATH_PRICING.annual.label} · save €59.80/year</span></button></div>{!userId ? <p className="mt-2 text-xs text-slate-500">Sign in first; your selected plan will open in secure Stripe Checkout.</p> : null}{billingBusy ? <p className="mt-2 text-xs text-cyan-100">Opening secure checkout…</p> : null}{billingError ? <p className="mt-3 text-xs text-rose-300">{billingError}</p> : null}</div> : <p className="mt-4 text-xs text-slate-500">Complete the free baseline diagnostic first. No upgrade prompt is needed before personalized value is demonstrated.</p>}
  </section>;
}
