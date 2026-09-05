"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useScene } from "./SceneContext";

const TRANSITION = "opacity .6s cubic-bezier(.22,1,.36,1), transform .6s cubic-bezier(.22,1,.36,1), filter .6s cubic-bezier(.22,1,.36,1)";

export default function HeroContent() {
  const { phase, activate } = useScene();
  const [mounted, setMounted] = useState(false);
  const exiting = phase !== "idle";
  const busy = phase !== "idle";

  useEffect(() => setMounted(true), []);

  function enterUniverse() {
    if (busy) return;
    activate();
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[68px] z-10 flex items-start justify-center sm:items-center">
      <div aria-hidden="true" className="absolute left-1/2 top-[42%] h-[320px] w-[min(680px,88vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,.14),rgba(76,29,149,.045)_38%,transparent_72%)] blur-2xl sm:top-[48%] sm:h-[400px] sm:w-[min(720px,86vw)]" />
      <div
        className="relative flex w-full max-w-5xl flex-col items-center px-5 pt-[clamp(34px,6svh,58px)] text-center sm:px-5 sm:pt-[clamp(18px,5vh,72px)]"
        style={{
          opacity: exiting ? 0 : mounted ? 1 : 0,
          transform: exiting ? "translateY(20px)" : mounted ? "translateY(0)" : "translateY(14px)",
          filter: exiting ? "blur(6px)" : "blur(0)",
          transition: TRANSITION,
          pointerEvents: exiting ? "none" : "auto",
        }}
      >
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[.2em] text-violet-300/80 sm:mb-5 sm:text-xs sm:tracking-[.24em]">Your AI career, organized</p>
        <h1 className="max-w-[360px] font-display text-[clamp(40px,10.5vw,52px)] font-bold leading-[.96] tracking-[-.045em] text-indigo-50 min-[430px]:max-w-[420px] sm:max-w-none sm:text-[clamp(48px,9vw,76px)] lg:text-[clamp(72px,6.2vw,96px)]">
          Build your career in AI.
        </h1>
        <p className="mt-4 max-w-[350px] text-[15px] font-medium leading-[1.55] text-indigo-200/70 sm:mt-6 sm:max-w-2xl sm:text-[clamp(15px,1.6vw,19px)] sm:leading-8">
          Enter the Career Universe and let it tour AI roles automatically. Choose a node whenever one catches your attention.
        </p>

        <div className="pointer-events-auto mt-5 flex w-full max-w-[350px] flex-col gap-2.5 sm:mt-8 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-3">
          <button
            type="button"
            onClick={enterUniverse}
            disabled={busy}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-violet-300/35 bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold tracking-[.035em] text-white shadow-[0_18px_55px_rgba(99,102,241,.28)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_70px_rgba(99,102,241,.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 disabled:cursor-wait disabled:opacity-60 sm:w-auto sm:px-8 sm:py-3.5 sm:tracking-[.04em]"
          >
            {busy ? "Entering Universe…" : "Enter Career Universe"}
          </button>
          <Link
            href="/careers"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-[#050817]/58 px-5 py-3 text-sm font-semibold text-slate-200 backdrop-blur-md transition hover:border-violet-300/25 hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 sm:w-auto sm:px-6 sm:py-3.5"
          >
            Browse career list
          </Link>
        </div>

        <p className="mt-2.5 max-w-[350px] text-[10px] leading-[1.55] text-slate-500 sm:mt-4 sm:max-w-none sm:text-xs sm:leading-5">
          The tour pauses briefly on each role. Click or tap any node to zoom into that Career Journey, or use Browse career list for the standard directory.
        </p>
      </div>
    </div>
  );
}
