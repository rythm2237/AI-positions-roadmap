import Link from "next/link";
import AIWorkspacePlanForm from "@/components/admin/AIWorkspacePlanForm";
import { createServiceClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AIWorkspacePlansPage() {
  const service = createServiceClient();
  const [models, plans] = await Promise.all([
    service.from("aiw_models").select("id,config").order("id"),
    service.from("aiw_plan_entitlements").select("plan_key,config,active,updated_at").order("plan_key"),
  ]);
  const enabledModels = (models.data ?? []).filter(row => !row.id.startsWith("test-") && (row.config as { enabled?: boolean })?.enabled === true).map(row => row.id);
  return <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
    <Link href="/admin/ai-workspace" className="text-xs font-semibold uppercase tracking-[.15em] text-violet-300">← AI Control Center</Link>
    <h1 className="mt-3 font-display text-3xl font-semibold text-white">AI Plan Entitlements</h1>
    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Subscription price and provider-cost allowance are deliberately separate. Configure the AI allowance explicitly; no price or credit is inferred automatically.</p>
    <div className="mt-7"><AIWorkspacePlanForm models={enabledModels} /></div>
    <section className="mt-6 rounded-2xl border border-white/10 bg-white/[.025] p-5"><h2 className="text-lg font-semibold">Existing plans</h2><div className="mt-4 space-y-3">{(plans.data ?? []).length ? (plans.data ?? []).map(plan => <div key={plan.plan_key} className="rounded-xl border border-white/[.07] bg-slate-950/40 p-4"><div className="flex justify-between gap-3"><strong>{plan.plan_key}</strong><span className={plan.active ? "text-emerald-300" : "text-slate-600"}>{plan.active ? "active" : "inactive"}</span></div><pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-[11px] leading-5 text-slate-500">{JSON.stringify(plan.config, null, 2)}</pre></div>) : <p className="text-sm text-slate-600">No plan configured yet.</p>}</div></section>
  </main>;
}
