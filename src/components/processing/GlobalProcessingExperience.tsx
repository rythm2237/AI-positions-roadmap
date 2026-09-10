"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ProcessingConfig = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  phases: Array<{ label: string; kicker: string; detail: string }>;
  signals: Array<{ label: string; description: string }>;
  insights: string[];
};

const CONFIGS: Array<{ match: (url: string) => boolean; config: ProcessingConfig }> = [
  {
    match: (url) => url.includes("/api/cv-analyzer/extract"),
    config: {
      id: "cv-extract",
      eyebrow: "Career Intelligence · CV Analyzer",
      title: "Turning your career history into structured evidence.",
      description: "AI Role Path is reading the document, identifying professional signals and preparing it for evidence-based analysis.",
      accent: "violet",
      phases: [
        { label: "Reading document", kicker: "Opening your career record", detail: "Extracting the text and preserving the original professional context." },
        { label: "Structuring experience", kicker: "Organizing the signal", detail: "Separating roles, education, skills, projects, certifications and languages." },
        { label: "Detecting evidence", kicker: "Finding what proves capability", detail: "Looking for achievements, outcomes, tools and experience that can support career fit." },
        { label: "Preparing analysis", kicker: "Building the evidence baseline", detail: "Getting the structured profile ready for semantic CV analysis and career matching." },
      ],
      signals: [
        { label: "Experience", description: "Roles & impact" },
        { label: "Skills", description: "Tools & capability" },
        { label: "Evidence", description: "Outcomes & proof" },
        { label: "Career fit", description: "Role direction" },
      ],
      insights: [
        "Strong CV analysis depends on evidence, not keyword density alone.",
        "Achievements and measurable outcomes carry more signal than responsibility lists.",
        "Projects can strengthen a career profile when they demonstrate transferable capability.",
        "The analyzer keeps role fit separate from proof strength so gaps remain explainable.",
      ],
    },
  },
  {
    match: (url) => url.includes("/api/cv-analyzer/evidence"),
    config: {
      id: "cv-evidence",
      eyebrow: "Career Intelligence · Evidence Layer",
      title: "Connecting your CV evidence to the rest of Career OS.",
      description: "Your approved CV signals are being linked to the evidence layer used by Job Agent and career recommendations.",
      accent: "cyan",
      phases: [
        { label: "Collecting evidence", kicker: "Gathering approved signals", detail: "Preparing skills, languages, projects, certifications and experience evidence." },
        { label: "Linking provenance", kicker: "Keeping the source traceable", detail: "Associating evidence with its CV origin so later recommendations remain explainable." },
        { label: "Updating career context", kicker: "Strengthening your profile", detail: "Making the new evidence available to Career OS without overwriting your profile." },
        { label: "Finalizing evidence", kicker: "Closing the loop", detail: "Preparing the evidence set for future job matching and application readiness checks." },
      ],
      signals: [
        { label: "Skills", description: "Verified capability" },
        { label: "Languages", description: "Eligibility signal" },
        { label: "Projects", description: "Proof of work" },
        { label: "Provenance", description: "Source traceability" },
      ],
      insights: [
        "Career OS keeps evidence provenance so recommendations can be explained later.",
        "Your profile and your evidence store serve different purposes and are not silently merged.",
        "Job matching becomes more reliable when evidence can be traced back to a real source.",
      ],
    },
  },
  {
    match: (url) => url.includes("/api/career-intelligence/"),
    config: {
      id: "career-intelligence",
      eyebrow: "Career Market Intelligence",
      title: "Building a trustworthy view of the market.",
      description: "AI Role Path is loading published occupation data and separating source-backed benchmarks from unavailable or unapproved evidence.",
      accent: "cyan",
      phases: [
        { label: "Loading markets", kicker: "Opening published snapshots", detail: "Retrieving the selected country and occupation-family data." },
        { label: "Checking sources", kicker: "Protecting source quality", detail: "Keeping provider identity, publication dates and source confidence visible." },
        { label: "Comparing countries", kicker: "Normalizing the view", detail: "Preparing comparable market and salary signals across the selected countries." },
        { label: "Preparing benchmark", kicker: "Making the result readable", detail: "Building the final comparison while leaving unsupported metrics explicitly unavailable." },
      ],
      signals: [
        { label: "Salary", description: "Published benchmark" },
        { label: "Country", description: "Market context" },
        { label: "Source", description: "Evidence quality" },
        { label: "Freshness", description: "Publication timing" },
      ],
      insights: [
        "A missing official metric is better than an invented market statistic.",
        "Career intelligence keeps source quality separate from occupation-mapping confidence.",
        "Published dates and retrieval dates matter when comparing labor-market evidence.",
      ],
    },
  },
  {
    match: (url) => url.includes("/api/project-review"),
    config: {
      id: "project-review",
      eyebrow: "Career Proof · Project Review",
      title: "Turning a project into career evidence.",
      description: "The review is examining what you built, what capability it proves and how that evidence maps to your target career.",
      accent: "violet",
      phases: [
        { label: "Reading project", kicker: "Understanding the work", detail: "Reviewing the project description, scope, tools and outcome." },
        { label: "Evaluating proof", kicker: "Looking for demonstrated capability", detail: "Separating concrete evidence from unsupported claims." },
        { label: "Mapping skills", kicker: "Connecting proof to career signals", detail: "Matching project evidence to relevant skills and role expectations." },
        { label: "Preparing feedback", kicker: "Making the next action clear", detail: "Building an explainable review with strengths, gaps and improvement actions." },
      ],
      signals: [
        { label: "Scope", description: "What you built" },
        { label: "Skills", description: "What it proves" },
        { label: "Evidence", description: "How strong it is" },
        { label: "Career fit", description: "Where it matters" },
      ],
      insights: [
        "A portfolio project is strongest when the outcome and your contribution are explicit.",
        "Transferable skills can be valuable even when the project domain differs from the target role.",
        "Career proof is more useful when a reviewer can see exactly why it supports a skill claim.",
      ],
    },
  },
  {
    match: (url) => url.includes("/api/interview-review"),
    config: {
      id: "interview-review",
      eyebrow: "Career Readiness · Interview Review",
      title: "Turning your answer into a stronger interview signal.",
      description: "AI Role Path is reviewing clarity, evidence, relevance and delivery so the feedback is specific rather than generic.",
      accent: "cyan",
      phases: [
        { label: "Reading response", kicker: "Understanding your answer", detail: "Identifying the question intent, structure and key claims in your response." },
        { label: "Checking evidence", kicker: "Testing answer strength", detail: "Looking for examples, outcomes and concrete proof behind the claims." },
        { label: "Evaluating relevance", kicker: "Matching the hiring signal", detail: "Checking whether the response answers what a recruiter or hiring manager needs to hear." },
        { label: "Preparing coaching", kicker: "Making improvement actionable", detail: "Producing specific feedback on structure, evidence and delivery." },
      ],
      signals: [
        { label: "Clarity", description: "Answer structure" },
        { label: "Evidence", description: "Examples & outcomes" },
        { label: "Relevance", description: "Hiring signal" },
        { label: "Delivery", description: "Communication" },
      ],
      insights: [
        "Interview answers become stronger when claims are anchored in a concrete example.",
        "Relevance matters as much as completeness: the best answer addresses the hiring signal directly.",
        "Specific outcomes make behavioral answers easier to trust and remember.",
      ],
    },
  },
];

function requestUrl(input: RequestInfo | URL) {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

function configFor(url: string) {
  return CONFIGS.find((entry) => entry.match(url))?.config ?? null;
}

export default function GlobalProcessingExperience() {
  const [active, setActive] = useState<ProcessingConfig | null>(null);
  const [visible, setVisible] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const pendingCount = useRef(0);
  const startedAt = useRef(0);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = requestUrl(input);
      const config = configFor(url);
      if (!config) return originalFetch(input, init);

      pendingCount.current += 1;
      if (pendingCount.current === 1) {
        startedAt.current = Date.now();
        setElapsedSeconds(0);
        setActive(config);
        revealTimer.current = window.setTimeout(() => setVisible(true), 280);
      }

      try {
        return await originalFetch(input, init);
      } finally {
        pendingCount.current = Math.max(0, pendingCount.current - 1);
        if (pendingCount.current === 0) {
          if (revealTimer.current) window.clearTimeout(revealTimer.current);
          revealTimer.current = null;
          const elapsed = Date.now() - startedAt.current;
          const finish = () => {
            setVisible(false);
            window.setTimeout(() => setActive(null), 220);
          };
          if (visible && elapsed < 900) window.setTimeout(finish, 900 - elapsed);
          else finish();
        }
      }
    };

    return () => {
      window.fetch = originalFetch;
      if (revealTimer.current) window.clearTimeout(revealTimer.current);
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setInterval(() => setElapsedSeconds(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
    return () => {
      window.clearInterval(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  const phaseIndex = useMemo(() => {
    if (elapsedSeconds < 2) return 0;
    if (elapsedSeconds < 7) return 1;
    if (elapsedSeconds < 15) return 2;
    return 3;
  }, [elapsedSeconds]);

  if (!active || !visible) return null;

  const phase = active.phases[phaseIndex];
  const insight = active.insights[Math.floor(elapsedSeconds / 5) % active.insights.length];
  const progress = [18, 44, 70, 90][phaseIndex];
  const accentText = active.accent === "violet" ? "text-violet-200" : "text-cyan-200";
  const accentBorder = active.accent === "violet" ? "border-violet-300/25 bg-violet-300/[0.08]" : "border-cyan-300/25 bg-cyan-300/[0.08]";
  const accentDot = active.accent === "violet" ? "bg-violet-200 shadow-[0_0_18px_rgba(196,181,253,0.85)]" : "bg-cyan-200 shadow-[0_0_18px_rgba(165,243,252,0.85)]";
  const accentBar = active.accent === "violet" ? "from-violet-300 via-fuchsia-200 to-cyan-200" : "from-cyan-300 via-blue-300 to-violet-300";

  return (
    <div className="fixed inset-0 z-[140] isolate overflow-hidden bg-[#06101d] text-white" role="status" aria-live="polite" aria-label={`${active.eyebrow} processing`}>
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute -left-28 top-[-10rem] h-[34rem] w-[34rem] rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -right-28 bottom-[-10rem] h-[34rem] w-[34rem] rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.065)_1px,transparent_1px)] [background-size:30px_30px] [mask-image:linear-gradient(to_bottom,transparent,black_16%,black_84%,transparent)]" />
      </div>

      <div className="relative mx-auto flex min-h-full w-full max-w-7xl flex-col px-4 py-5 sm:px-6 sm:py-6 md:px-8 lg:px-10 xl:px-12">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl border border-white/15 bg-white/10 text-sm font-semibold tracking-[0.12em] backdrop-blur-xl">AR</div>
            <div>
              <p className="text-sm font-semibold tracking-wide">AI Role Path</p>
              <p className="text-xs text-white/45">Career intelligence in motion</p>
            </div>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/55 backdrop-blur-xl">{elapsedSeconds}s elapsed</div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center py-6 sm:py-8">
          <div className="mb-6 w-full max-w-4xl">
            <div className="relative grid grid-cols-4 gap-2 sm:gap-3">
              <div aria-hidden="true" className="absolute left-[12.5%] right-[12.5%] top-5 h-px bg-white/10" />
              <div aria-hidden="true" className={`absolute left-[12.5%] top-5 h-px bg-gradient-to-r ${accentBar} transition-[width] duration-700`} style={{ width: `${(phaseIndex / 3) * 75}%` }} />
              {active.phases.map((item, index) => {
                const complete = index < phaseIndex;
                const current = index === phaseIndex;
                return (
                  <div key={item.label} className="relative z-10 flex flex-col items-center text-center">
                    <div className={`grid size-10 place-items-center rounded-full border text-xs font-semibold transition-all duration-500 ${complete || current ? accentBorder : "border-white/10 bg-[#0b1726] text-white/30"}`}>
                      {complete ? "✓" : current ? <span className={`size-2.5 animate-pulse rounded-full ${accentDot}`} /> : index + 1}
                    </div>
                    <p className={`mt-2 hidden text-[10px] font-medium sm:block ${current ? "text-white" : complete ? "text-white/60" : "text-white/30"}`}>{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div key={`${active.id}-${phaseIndex}`} className="w-full animate-[pulse_1.2s_ease-out_1]">
            <div className="mx-auto max-w-3xl text-center">
              <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${accentText}`}>{active.eyebrow}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">{phase.kicker}</p>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.035em] sm:text-4xl lg:text-5xl">{active.title}</h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/55 sm:text-base">{phase.detail} {active.description}</p>
            </div>

            <div className="mx-auto mt-7 grid w-full max-w-4xl grid-cols-2 gap-2.5 sm:grid-cols-4">
              {active.signals.map((signal, index) => {
                const activeSignal = index <= phaseIndex;
                return (
                  <div key={signal.label} className={`rounded-2xl border px-3.5 py-3 backdrop-blur-xl transition-all duration-500 ${activeSignal ? accentBorder : "border-white/8 bg-white/[0.035]"}`}>
                    <div className="mb-2 flex items-center gap-2">
                      <span className={`size-1.5 rounded-full ${activeSignal ? accentDot : "bg-white/20"}`} />
                      <span className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${activeSignal ? accentText : "text-white/30"}`}>{activeSignal ? "Active" : "Queued"}</span>
                    </div>
                    <p className="text-sm font-medium text-white/90">{signal.label}</p>
                    <p className="mt-0.5 text-xs text-white/40">{signal.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="mx-auto mt-5 w-full max-w-4xl rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3.5 backdrop-blur-xl sm:px-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-xl bg-white/10 text-xs">✦</div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">While we work</p>
                  <p key={insight} className="mt-1 animate-[pulse_2s_ease-in-out_1] text-sm leading-5 text-white/65">{insight}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-4xl pb-2">
          <div className="mb-2 flex items-center justify-between gap-4 text-xs text-white/45">
            <span>{phase.label}</span>
            <span>Live process · progress is indicative</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className={`relative h-full rounded-full bg-gradient-to-r ${accentBar} transition-[width] duration-700 ease-out`} style={{ width: `${progress}%` }}>
              <span aria-hidden="true" className="absolute inset-y-0 right-0 w-16 animate-pulse bg-white/35 blur-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
