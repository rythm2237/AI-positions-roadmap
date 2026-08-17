"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useScene } from "./SceneContext";

const TRANSITION = "opacity .6s cubic-bezier(.22,1,.36,1), transform .6s cubic-bezier(.22,1,.36,1), filter .6s cubic-bezier(.22,1,.36,1)";

export default function HeroContent() {
  const { phase } = useScene();
  const [mounted, setMounted] = useState(false);
  const exiting = phase !== "idle";

  useEffect(() => setMounted(true), []);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[68px] z-10 flex items-center justify-center">
      <div aria-hidden="true" className="absolute left-1/2 top-[48%] h-[380px] w-[min(720px,88vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,.18),rgba(76,29,149,.07)_38%,transparent_72%)] blur-2xl sm:h-[420px] sm:w-[min(760px,90vw)]" />
      <div
        className="relative flex w-full max-w-5xl flex-col items-center px-4 text-center sm:px-5"
        style={{
          paddingTop: "clamp(22px,6vh,90px)",
          opacity: exiting ? 0 : mounted ? 1 : 0,
          transform: exiting ? "translateY(20px)" : mounted ? "translateY(0)" : "translateY(14px)",
          filter: exiting ? "blur(6px)" : "blur(0)",
          transition: TRANSITION,
        }}
      >
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[.22em] text-violet-300/80 sm:mb-5 sm:text-xs sm:tracking-[.24em]">Your AI career, organized</p>
        <h1 className="font-display text-[clamp(38px,11vw,64px)] font-bold leading-[.98] tracking-[-.045em] text-indigo-50 sm:text-[clamp(48px,9vw,76px)] lg:text-[clamp(72px,6.2vw,96px)]">
          Build your career in AI.
        </h1>
        <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-indigo-200/70 sm:mt-6 sm:text-[clamp(15px,1.6vw,19px)] sm:leading-8">
          Choose a focused direction, follow a practical roadmap, build evidence through projects, and prepare for your next role.
        </p>
        <Link
          href="/careers"
          className="pointer-events-auto mt-6 inline-flex min-h-12 w-full max-w-[280px] items-center justify-center rounded-2xl border border-violet-300/35 bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-semibold tracking-[.04em] text-white shadow-[0_18px_55px_rgba(99,102,241,.28)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_70px_rgba(99,102,241,.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 sm:mt-8 sm:w-auto sm:max-w-none sm:px-8"
        >
          Explore AI Careers
        </Link>
        <p className="mt-3 max-w-xs text-[11px] leading-5 text-slate-600 sm:mt-4 sm:max-w-none sm:text-xs">
          Open the complete career list, compare paths, and scroll through every active roadmap.
        </p>
      </div>
    </div>
  );
}
