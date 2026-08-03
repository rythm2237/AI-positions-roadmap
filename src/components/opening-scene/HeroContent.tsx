"use client";

import { useEffect, useState } from "react";
import { useScene } from "./SceneContext";

const TRANSITION = "opacity .6s cubic-bezier(.22,1,.36,1), transform .6s cubic-bezier(.22,1,.36,1), filter .6s cubic-bezier(.22,1,.36,1)";

export default function HeroContent() {
  const { phase, activate } = useScene();
  const [mounted, setMounted] = useState(false);
  const exiting = ["activating", "travelling", "arrived", "exploring"].includes(phase);
  const busy = phase !== "idle";

  useEffect(() => setMounted(true), []);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[68px] z-10 flex items-center justify-center">
      <div aria-hidden="true" className="absolute left-1/2 top-[48%] h-[420px] w-[min(760px,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,.18),rgba(76,29,149,.07)_38%,transparent_72%)] blur-2xl" />
      <div
        className="relative flex w-full max-w-5xl flex-col items-center px-5 text-center"
        style={{
          paddingTop: "clamp(58px,11vh,130px)",
          opacity: exiting ? 0 : mounted ? 1 : 0,
          transform: exiting ? "translateY(20px)" : mounted ? "translateY(0)" : "translateY(14px)",
          filter: exiting ? "blur(6px)" : "blur(0)",
          transition: TRANSITION,
        }}
      >
        <p className="mb-5 text-xs font-semibold uppercase tracking-[.24em] text-violet-300/80">Your AI career, organized</p>
        <h1 className="font-display text-[clamp(46px,10vw,76px)] font-bold leading-[.98] tracking-[-.045em] text-indigo-50 lg:text-[clamp(72px,6.2vw,96px)]">
          Build your career in AI.
        </h1>
        <p className="mt-6 max-w-2xl text-[clamp(15px,1.6vw,19px)] font-medium leading-8 text-indigo-200/70">
          Choose a focused direction, follow a practical roadmap, build evidence through projects, and prepare for your next role.
        </p>
        <button
          type="button"
          onClick={activate}
          disabled={busy}
          className="pointer-events-auto mt-8 min-h-12 rounded-2xl border border-violet-300/35 bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3.5 text-sm font-semibold tracking-[.04em] text-white shadow-[0_18px_55px_rgba(99,102,241,.28)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_70px_rgba(99,102,241,.4)] disabled:cursor-wait disabled:opacity-60"
        >
          {busy ? "Opening Career Universe…" : "Explore AI Careers"}
        </button>
        <p className="mt-4 text-xs text-slate-600">Explore active workspaces and see which careers are in development.</p>
      </div>
    </div>
  );
}
