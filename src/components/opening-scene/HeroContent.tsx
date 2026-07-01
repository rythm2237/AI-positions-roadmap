
"use client";
// src/components/opening-scene/HeroContent.tsx — v6
//
// CHANGE: Removed useRouter and the router.push("/#roadmaps") auto-exit.
// The universe never exits automatically. Navigation is 100% user-controlled.
// The user leaves only by clicking "Open Roadmap" inside the career preview card.

import { useEffect, useState } from "react";
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
        {isActivating ? "Entering Universe..." : "Enter the Career Universe"}
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
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ zIndex: 10 }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "clamp(16px, 2.5vh, 28px)",
          padding: "0 clamp(20px, 5vw, 60px)",
          maxWidth: 680,
          opacity: isExiting ? 0 : isMounted ? 1 : 0,
          transform: isExiting ? "translateY(20px)" : isMounted ? "translateY(0)" : "translateY(12px)",
          filter: isExiting ? "blur(6px)" : "blur(0)",
          transition: TRANSITION_BASE,
          pointerEvents: "none",
        }}
      >
        <p style={{
          fontSize: "clamp(10px, 1vw, 12px)",
          fontWeight: 700, letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(99,102,241,0.8)",
          fontFamily: "inherit",
          margin: 0,
        }}>
          AI Career OS
        </p>

        <h1 style={{
          fontSize: "clamp(36px, 6vw, 76px)",
          fontWeight: 800, lineHeight: 1.05,
          letterSpacing: "-0.03em",
          color: "#e0e7ff",
          margin: 0, fontFamily: "inherit",
        }}>
          Your AI Career{" "}
          <span style={{
            background: "linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #38bdf8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Universe
          </span>
        </h1>

        <p style={{
          fontSize: "clamp(14px, 1.6vw, 18px)",
          lineHeight: 1.65, color: "rgba(165,180,252,0.65)",
          maxWidth: 480, margin: 0, fontFamily: "inherit",
        }}>
          Explore every AI career path. Discover where you belong.
          Build your future — one node at a time.
        </p>

        <div>
          <CTAButton />
        </div>
      </div>
    </div>
  );
}
