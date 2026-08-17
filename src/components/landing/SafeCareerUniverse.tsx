"use client";

import Link from "next/link";
import { Component, type ErrorInfo, type ReactNode, useEffect, useState } from "react";
import OpeningScene from "@/components/opening-scene/OpeningScene";

type SupportState = "checking" | "supported" | "unsupported";

function canCreateWebGLContext() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ||
        canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true }) ||
        canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}

function UniverseFallback({ checking = false }: { checking?: boolean }) {
  return (
    <div className="relative flex h-dvh min-h-0 w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_15%,rgba(124,58,237,.2),transparent_42%),linear-gradient(180deg,#080b1c,#03050e)] px-6 text-center">
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:44px_44px]" aria-hidden="true" />
      <div className="relative max-w-2xl pt-16">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-violet-300/20 bg-violet-500/10 text-violet-200 shadow-[0_0_45px_rgba(124,58,237,.25)]" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 17 9 12l3 3 8-8" />
            <path d="M15 7h5v5" />
          </svg>
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[.2em] text-violet-300">Career Universe</p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {checking ? "Preparing the interactive map" : "Career Universe is unavailable on this device"}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
          {checking
            ? "We are checking whether this device can run the interactive 3D career map safely."
            : "This device cannot create a stable WebGL context. You can still browse every public career roadmap or sign in to your private workspace."}
        </p>
        {!checking && (
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link href="/careers" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">
              Browse careers
            </Link>
            <Link href="/login" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

class UniverseErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Career Universe failed to render safely", error, info.componentStack);
  }

  render() {
    if (this.state.failed) return <UniverseFallback />;
    return this.props.children;
  }
}

export default function SafeCareerUniverse() {
  const [support, setSupport] = useState<SupportState>("checking");

  useEffect(() => {
    setSupport(canCreateWebGLContext() ? "supported" : "unsupported");
  }, []);

  if (support === "checking") return <UniverseFallback checking />;
  if (support === "unsupported") return <UniverseFallback />;

  return (
    <UniverseErrorBoundary>
      <div className="h-dvh min-h-0 w-full overflow-hidden bg-[#03050e]">
        <OpeningScene />
      </div>
    </UniverseErrorBoundary>
  );
}
