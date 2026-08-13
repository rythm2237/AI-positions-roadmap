"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const generationSteps = [
  "Defining role identity and boundaries",
  "Building the 10-stage professional roadmap",
  "Creating projects, assessments and readiness criteria",
  "Validating and repairing the Career Blueprint contract",
];

const errorMessages: Record<string, string> = {
  INVALID_CAREER_TITLE: "Enter a Career title between 2 and 120 characters.",
  GENERATED_IDENTITY_INVALID: "The generated Career identity did not pass validation. Please retry.",
  AI_GATEWAY_NOT_CONFIGURED: "AI generation is not available in this environment. Check the Vercel AI Gateway connection.",
  AI_GATEWAY_BILLING_REQUIRED: "Vercel AI Gateway requires a valid payment card for this team. Add a card in Vercel Billing, then retry.",
  AI_GATEWAY_MODEL_RESTRICTED: "The selected AI model is not available on this Vercel AI Gateway credit tier. Use a Free Tier model or add paid Gateway credits, then retry.",
  AI_GATEWAY_RATE_LIMITED: "The AI provider is temporarily busy. Wait a moment and retry; your existing Careers were not changed.",
  AI_SCHEMA_REJECTED: "The AI provider rejected the structured content contract. The issue has been logged; please retry after the service update.",
  AI_OUTPUT_INVALID: "AI could not produce a complete Career Blueprint after automatic repair. Nothing was saved; please retry.",
  CAREER_GENERATION_FAILED: "Generation could not be completed. Your existing Careers were not changed; please retry.",
  AUTH_REQUIRED: "Your Admin session expired. Sign in again and retry.",
  ADMIN_REQUIRED: "This action requires an authorized Admin account.",
};

export default function GenerativeCareerBuilder({ initialTitle = "" }: { initialTitle?: string }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState<"idle" | "generating" | "error">("idle");
  const [activeStep, setActiveStep] = useState(0);
  const [message, setMessage] = useState("");
  const [existingCareerId, setExistingCareerId] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "generating") return;
    const timer = window.setInterval(() => {
      setActiveStep((current) => Math.min(current + 1, generationSteps.length - 1));
    }, 9000);
    return () => window.clearInterval(timer);
  }, [status]);

  async function generateCareer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (cleanTitle.length < 2) {
      setStatus("error");
      setMessage(errorMessages.INVALID_CAREER_TITLE);
      return;
    }
    setStatus("generating");
    setActiveStep(0);
    setMessage("");
    setExistingCareerId(null);

    try {
      const response = await fetch("/api/admin/careers/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: cleanTitle }),
      });
      const result = await response.json() as { ok?: boolean; code?: string; careerId?: string };
      if (!response.ok || !result.ok || !result.careerId) {
        if (result.code === "CAREER_EXISTS" && result.careerId) {
          setExistingCareerId(result.careerId);
          throw new Error("CAREER_EXISTS");
        }
        throw new Error(result.code || "CAREER_GENERATION_FAILED");
      }
      router.push(`/admin/careers/${result.careerId}/content?generated=1`);
      router.refresh();
    } catch (error) {
      const code = error instanceof Error ? error.message : "CAREER_GENERATION_FAILED";
      setStatus("error");
      setMessage(code === "CAREER_EXISTS"
        ? "This Career already exists. Open its current workspace instead of creating a duplicate."
        : errorMessages[code] ?? errorMessages.CAREER_GENERATION_FAILED);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <form onSubmit={generateCareer} className="overflow-hidden rounded-3xl border border-violet-300/20 bg-gradient-to-br from-violet-500/10 via-white/[.035] to-cyan-400/5 shadow-2xl shadow-violet-950/20">
        <div className="border-b border-white/10 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-400/15 text-xl" aria-hidden="true">✦</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-200">Generative Career Builder</p>
              <p className="mt-1 text-sm text-slate-400">One title creates the complete reviewable Career Blueprint.</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <label htmlFor="career-title" className="block text-sm font-semibold text-white">What Career do you want to create?</label>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Enter the exact professional title. AI will define the taxonomy, overview, roadmap, projects, assessments, portfolio, job preparation and resource requirements.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              id="career-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={status === "generating"}
              autoFocus
              autoComplete="off"
              maxLength={120}
              placeholder="e.g. AI Governance Specialist"
              className="input-field min-h-14 flex-1 px-4 text-base disabled:cursor-wait disabled:opacity-60"
            />
            <button disabled={status === "generating" || title.trim().length < 2} className="btn-primary min-h-14 min-w-52 disabled:cursor-not-allowed disabled:opacity-45">
              {status === "generating" ? "Generating…" : "Generate Career"}
            </button>
          </div>

          {status === "generating" ? (
            <section aria-live="polite" aria-busy="true" className="mt-7 rounded-2xl border border-cyan-300/15 bg-slate-950/45 p-5">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-1/3 animate-pulse rounded-full bg-gradient-to-r from-violet-400 to-cyan-300" />
              </div>
              <ol className="mt-5 grid gap-3 sm:grid-cols-2">
                {generationSteps.map((step, index) => (
                  <li key={step} className={`flex items-center gap-3 text-sm ${index <= activeStep ? "text-slate-100" : "text-slate-600"}`}>
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${index < activeStep ? "bg-emerald-400/15 text-emerald-300" : index === activeStep ? "bg-cyan-300/15 text-cyan-200" : "bg-white/5"}`}>
                      {index < activeStep ? "✓" : index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <p className="mt-5 text-xs leading-5 text-slate-500">This can take a few minutes. Keep this page open; nothing is published automatically.</p>
            </section>
          ) : null}

          {status === "error" ? (
            <div role="alert" className="mt-6 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm text-rose-100">
              <p>{message}</p>
              {existingCareerId ? (
                <button type="button" onClick={() => router.push(`/admin/careers/${existingCareerId}`)} className="mt-3 font-semibold text-white underline underline-offset-4">
                  Open existing Career
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </form>

      <aside className="rounded-3xl border border-white/10 bg-white/[.025] p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Creation flow</p>
        <ol className="mt-5 space-y-5">
          {[
            ["01", "Generate Blueprint", "AI creates Career-specific content and requirements—without external links."],
            ["02", "Review content", "Inspect every stage, project and validation finding in a visual workspace."],
            ["03", "Create learning sources", "AI researches Reading, Video and Practice options in a separate step."],
            ["04", "Approve & publish", "Publication unlocks only after content and source validation pass."],
          ].map(([number, label, description]) => (
            <li key={number} className="flex gap-3">
              <span className="text-xs font-bold text-violet-300">{number}</span>
              <div><p className="text-sm font-semibold text-white">{label}</p><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
