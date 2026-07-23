
"use client";
// src/components/opening-scene/HeroContent.tsx — v6
//
// CHANGE: Removed useRouter and the router.push("/#roadmaps") auto-exit.
// The universe never exits automatically. Navigation is 100% user-controlled.
// The user leaves only by clicking "Open Roadmap" inside the career preview card.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useScene } from "./SceneContext";

const TRANSITION_BASE = "opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), filter 0.6s cubic-bezier(0.22, 1, 0.36, 1)";

function CTAButton() {
  const { phase, activate } = useScene();
  const isActivating = phase === "activating" || phase === "travelling" || phase === "arrived" || phase === "exploring";

  return (
    <button
      onClick={activate}
      disabled={isActivating}
      className="group relative overflow-hidden"
      style={{
        background: "transparent",
        border: "1px solid rgba(99,102,241,0.45)",
        borderRadius: "14px",
        padding: "14px 38px",
        cursor: isActivating ? "default" : "pointer",
        pointerEvents: "auto",
        transition: "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s ease",
      }}
      aria-label="Enter the AI Career Universe"
    >
      <div
        className="absolute inset-0 rounded-[13px]"
        style={{
          background: "radial-gradient(ellipse at center, rgba(99,102,241,0.18) 0%, transparent 70%)",
          opacity: 0,
          transition: TRANSITION_BASE,
        }}
      />
      {isActivating && (
        <div
          className="absolute inset-0 rounded-[13px]"
          style={{
            border: "1px solid rgba(99,102,241,0.9)",
            boxShadow: "0 0 24px rgba(99,102,241,0.6), inset 0 0 24px rgba(99,102,241,0.1)",
          }}
        />
      )}
      <span style={{
        position: "relative", zIndex: 1,
        fontSize: "clamp(13px, 1.2vw, 15px)",
        fontWeight: 600, letterSpacing: "0.06em",
        color: isActivating ? "rgba(165,180,252,0.7)" : "#a5b4fc",
        transition: "color 0.3s",
        fontFamily: "inherit",
      }}>
        {isActivating ? "Opening Career Network..." : "Explore AI Careers"}
      </span>
    </button>
  );
}

export default function HeroContent() {
  const { phase } = useScene();
  const isExiting = phase === "activating" || phase === "travelling" || phase === "arrived" || phase === "exploring";
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 top-[62px] flex items-center justify-center pt-[clamp(20px,5dvh,52px)]"
      style={{ zIndex: 10 }}
    >
      <div
        className="w-full max-w-[min(680px,100vw)] lg:max-w-[min(1040px,calc(100vw-96px))]"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "clamp(14px, 2.2vh, 24px)",
          padding: "0 clamp(20px, 5vw, 60px)",
          alignSelf: "stretch",
          margin: "0 auto",
          boxSizing: "border-box",
          opacity: isExiting ? 0 : isMounted ? 1 : 0,
          transform: isExiting ? "translateY(20px)" : isMounted ? "translateY(0)" : "translateY(12px)",
          filter: isExiting ? "blur(6px)" : "blur(0)",
          transition: TRANSITION_BASE,
          pointerEvents: "none",
        }}
      >
        <h1 className="font-display text-[clamp(34px,10vw,48px)] font-bold lg:text-[clamp(64px,5vw,76px)]" style={{
          lineHeight: 1,
          letterSpacing: "-0.035em",
          color: "#e0e7ff",
          width: "100%",
          whiteSpace: "normal",
          margin: 0, fontFamily: "inherit",
        }}>
          <span className="block lg:whitespace-nowrap">Build your career in AI.</span>
          <span className="block lg:whitespace-nowrap" style={{
            background: "linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #38bdf8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Know what comes next.
          </span>
        </h1>

        <p style={{
          fontSize: "clamp(14px, 1.6vw, 18px)",
          lineHeight: 1.65, color: "rgba(165,180,252,0.65)",
          maxWidth: 520, margin: 0, fontFamily: "inherit",
        }}>
          Choose an AI career direction, follow a practical roadmap, build proof through projects, and prepare for your next role.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <CTAButton />
          <Link
            href="/careers/ai-engineer"
            className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            style={{ pointerEvents: "auto" }}
          >
            Open AI Engineer Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
