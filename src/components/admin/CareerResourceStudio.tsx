"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CareerWorkspaceData } from "@/types/careerWorkspace";

const generationSteps = [
  "Researching official and high-quality providers",
  "Selecting Reading, Video and Practice for every stage",
  "Creating resource-specific assessments",
  "Validating links, mappings and publication readiness",
];

const generationErrors: Record<string, string> = {
  CAREER_BLUEPRINT_MISSING: "Generate and save the Career Blueprint before creating learning sources.",
  CAREER_BLUEPRINT_INVALID: "Resolve the Career Blueprint validation findings before creating sources.",
  AI_GATEWAY_NOT_CONFIGURED: "AI resource research is unavailable in this environment. Check the AI Gateway connection.",
  AI_GATEWAY_BILLING_REQUIRED: "Vercel AI Gateway requires a valid payment card for this team. Add a card in Vercel Billing, then retry.",
  AI_GATEWAY_MODEL_RESTRICTED: "The selected research model is not available on this Vercel AI Gateway credit tier. Use a Free Tier model or add paid Gateway credits, then retry.",
  AI_GATEWAY_RATE_LIMITED: "The AI provider is temporarily busy. Wait a moment and retry; the current draft is unchanged.",
  AI_SCHEMA_REJECTED: "The provider rejected the structured resource contract. The issue has been logged; retry after the service update.",
  AI_OUTPUT_INVALID: "AI returned an incomplete source pack. Nothing was approved; regenerate a fresh validated pack.",
  RESOURCE_GENERATION_FAILED: "Learning-source generation could not finish. The current draft is unchanged; please retry.",
  AUTH_REQUIRED: "Your Admin session expired. Sign in again and retry.",
  ADMIN_REQUIRED: "This action requires an authorized Admin account.",
};

export default function CareerResourceStudio({
  careerId,
  workspace,
  approveAction,
}: {
  careerId: string;
  workspace: CareerWorkspaceData;
  approveAction: (formData: FormData) => void;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "generating" | "error">("idle");
  const [activeStep, setActiveStep] = useState(0);
  const [message, setMessage] = useState("");
  const requirements = workspace.resourceRequirements ?? [];
  const mappings = workspace.resourceMappings ?? [];
  const complete = workspace.generationMetadata?.resourceStatus === "complete";
  const readyForApproval = requirements.length > 0
    && mappings.length === requirements.length
    && mappings.every((mapping) => mapping.reading && mapping.video && mapping.practice);

  useEffect(() => {
    if (status !== "generating") return;
    const timer = window.setInterval(() => {
      setActiveStep((current) => Math.min(current + 1, generationSteps.length - 1));
    }, 11000);
    return () => window.clearInterval(timer);
  }, [status]);

  async function generateResources() {
    setStatus("generating");
    setActiveStep(0);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/careers/${careerId}/resources/generate`, { method: "POST" });
      const result = await response.json() as { ok?: boolean; code?: string };
      if (!response.ok || !result.ok) throw new Error(result.code || "RESOURCE_GENERATION_FAILED");
      router.refresh();
      setStatus("idle");
    } catch (error) {
      const code = error instanceof Error ? error.message : "RESOURCE_GENERATION_FAILED";
      setMessage(generationErrors[code] ?? generationErrors.RESOURCE_GENERATION_FAILED);
      setStatus("error");
    }
  }

  if (!workspace.globalResources.length) {
    return (
      <section className="overflow-hidden rounded-3xl border border-violet-300/20 bg-gradient-to-br from-violet-500/10 via-white/[.03] to-cyan-400/5">
        <div className="p-6 sm:p-8">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
            <div>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-400/15 text-xl" aria-hidden="true">⌕</span>
              <h2 className="mt-5 font-display text-2xl font-semibold text-white">Create the learning sources</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                AI will research current sources for each approved requirement, then map one Reading, one Video and one Practice experience to every Career stage. Nothing is published automatically.
              </p>
              <button type="button" onClick={generateResources} disabled={status === "generating"} className="btn-primary mt-6 min-h-12 disabled:cursor-wait disabled:opacity-60">
                {status === "generating" ? "Researching learning sources…" : "Create the learning sources"}
              </button>
            </div>
            <aside className="rounded-2xl border border-white/10 bg-black/15 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Guardrails</p>
              <ul className="mt-4 space-y-3 text-xs leading-5 text-slate-400">
                <li>✓ Career Blueprint remains independent from provider URLs.</li>
                <li>✓ Official and free sources are preferred.</li>
                <li>✓ Direct YouTube links are excluded.</li>
                <li>✓ Every source receives a five-question assessment.</li>
              </ul>
            </aside>
          </div>
          {status === "generating" ? <GenerationProgress activeStep={activeStep} /> : null}
          {status === "error" ? <p role="alert" className="mt-6 rounded-xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm text-rose-100">{message}</p> : null}
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[.045] to-transparent p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${complete ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-200"}`}>{complete ? "Sources approved" : "Admin review required"}</span>
              <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">AI researched</span>
            </div>
            <h2 className="mt-4 font-display text-2xl font-semibold text-white">Learning-source review</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Check the selected providers, canonical URLs and Career relevance. Approval unlocks publication only when all mappings pass validation.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={generateResources} disabled={status === "generating"} className="btn-secondary min-h-11 disabled:cursor-wait disabled:opacity-50">{status === "generating" ? "Regenerating…" : "Regenerate sources"}</button>
            {!complete ? <form action={approveAction}><input type="hidden" name="id" value={careerId}/><button disabled={!readyForApproval || status === "generating"} className="btn-primary min-h-11 disabled:cursor-not-allowed disabled:opacity-40">Approve learning sources</button></form> : null}
          </div>
        </div>
        {status === "generating" ? <GenerationProgress activeStep={activeStep} /> : null}
        {status === "error" ? <p role="alert" className="mt-6 rounded-xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm text-rose-100">{message}</p> : null}
      </section>

      <div className="space-y-4">
        {requirements.map((requirement, index) => {
          const stage = workspace.journeyStages.find((item) => item.id === requirement.milestoneId);
          const resources = requirement.resourceIds
            .map((id) => workspace.globalResources.find((resource) => resource.id === id))
            .filter((resource) => Boolean(resource));
          const mapping = mappings.find((item) => item.requirementId === requirement.id);
          return (
            <details key={requirement.id} open={index === 0} className="group rounded-2xl border border-white/10 bg-white/[.025]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300">
                <div className="flex min-w-0 items-center gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-400/10 text-xs font-bold text-violet-200">{index + 1}</span>
                  <div className="min-w-0"><h3 className="truncate font-semibold text-white">{stage?.title ?? requirement.topic}</h3><p className="mt-1 truncate text-xs text-slate-500">{requirement.topic} · {resources.length}/3 sources</p></div>
                </div>
                <div className="flex items-center gap-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${mapping?.status === "complete" ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-200"}`}>{mapping?.status ?? "pending"}</span><span className="text-slate-500 transition group-open:rotate-180">⌄</span></div>
              </summary>
              <div className="border-t border-white/10 p-5">
                <p className="text-sm leading-6 text-slate-400">Required outcomes: {requirement.requiredLearningOutcomes.join(" · ")}</p>
                <div className="mt-5 grid gap-3 xl:grid-cols-3">
                  {resources.map((resource) => <ResourceCard key={resource!.id} resource={resource!} />)}
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}

function GenerationProgress({ activeStep }: { activeStep: number }) {
  return <section aria-live="polite" aria-busy="true" className="mt-7 rounded-2xl border border-cyan-300/15 bg-slate-950/45 p-5"><div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-2/5 animate-pulse rounded-full bg-gradient-to-r from-violet-400 to-cyan-300"/></div><ol className="mt-5 grid gap-3 sm:grid-cols-2">{generationSteps.map((step,index)=><li key={step} className={`flex items-center gap-3 text-sm ${index<=activeStep?"text-slate-100":"text-slate-600"}`}><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${index<activeStep?"bg-emerald-400/15 text-emerald-300":index===activeStep?"bg-cyan-300/15 text-cyan-200":"bg-white/5"}`}>{index<activeStep?"✓":index+1}</span>{step}</li>)}</ol><p className="mt-5 text-xs text-slate-500">Source research can take a few minutes. Keep this page open.</p></section>;
}

function ResourceCard({ resource }: { resource: CareerWorkspaceData["globalResources"][number] }) {
  return <article className="flex min-h-64 flex-col rounded-2xl border border-white/10 bg-black/15 p-4"><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold uppercase text-cyan-200">{resource.type}</span><span className="text-[10px] uppercase text-slate-500">{resource.priority}</span></div><h4 className="mt-4 font-semibold leading-6 text-white">{resource.title}</h4><p className="mt-1 text-xs text-slate-500">{resource.provider} · {resource.estimatedTime}</p><p className="mt-4 flex-1 text-sm leading-6 text-slate-400">{resource.whyUseful}</p><a href={resource.url} target="_blank" rel="noreferrer" className="mt-5 min-h-11 rounded-xl border border-white/10 px-3 py-3 text-center text-sm font-semibold text-cyan-300 hover:bg-white/5">Open canonical source ↗</a></article>;
}
