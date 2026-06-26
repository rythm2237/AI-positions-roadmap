"use client";
// src/components/opening-scene/HeroContent.tsx
//
// ─── THE HERO LIVES INSIDE THE WORLD ─────────────────────────────────────
//
// This component is NOT a Hero Section.
// It is the human-readable layer of the Career Network world.
// It floats inside the 3D environment as a transparent HTML overlay.
//
// Design principles:
//   • pointer-events-none on the container — the 3D world receives all
//     mouse events for parallax and future node hover interaction
//   • pointer-events-auto only on the CTA — the single interactive element
//   • Framer Motion for entrance — staggered, elegant, not flashy
//   • On activation — headline retreats, world takes over
//   • Typography: very few words, maximum weight, generous spacing
//   • The CTA is not a button. It is a portal into the Career Network.
//
// Reduced motion:
//   Framer Motion's MotionConfig reducedMotion="user" (set in World.tsx)
//   automatically removes all animations for users who prefer reduced motion.

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useScene } from "./SceneContext";
import { useRouter } from "next/navigation";

// ─── Animation variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.6, // wait for world to render
    },
  },
  exit: {
    transition: { staggerChildren: 0.08, staggerDirection: -1 },
  },
};

const lineVariants = {
  hidden:  { opacity: 0, y: 22, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -12,
    filter: "blur(6px)",
    transition: { duration: 0.5, ease: [0.55, 0, 1, 0.45] },
  },
};

const ctaVariants = {
  hidden:  { opacity: 0, scale: 0.92, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 1.08,
    filter: "blur(8px)",
    transition: { duration: 0.6, ease: [0.55, 0, 1, 0.45] },
  },
};

// ─── CTA button ───────────────────────────────────────────────────────────────

function CTAButton() {
  const { phase, activate } = useScene();
  const isActivating = phase === "activating" || phase === "travelling";

  return (
    <motion.button
      onClick={activate}
      disabled={isActivating}
      className="group relative overflow-hidden"
      style={{
        // The button is a portal — it should feel like the beginning of a journey
        background: "transparent",
        border: "1px solid rgba(99,102,241,0.45)",
        borderRadius: "14px",
        padding: "14px 38px",
        cursor: isActivating ? "default" : "pointer",
        pointerEvents: "auto",
      }}
      whileHover={isActivating ? {} : { scale: 1.04 }}
      whileTap={isActivating ? {} : { scale: 0.97 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Enter the AI Career Network"
    >
      {/* Hover glow */}
      <motion.div
        className="absolute inset-0 rounded-[13px]"
        style={{
          background: "radial-gradient(ellipse at center, rgba(99,102,241,0.18) 0%, transparent 70%)",
          opacity: 0,
        }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Animated border glow on activation */}
      <AnimatePresence>
        {isActivating && (
          <motion.div
            className="absolute inset-0 rounded-[13px]"
            style={{
              border: "1px solid rgba(99,102,241,0.9)",
              boxShadow: "0 0 24px rgba(99,102,241,0.6), inset 0 0 24px rgba(99,102,241,0.1)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Label */}
      <AnimatePresence mode="wait">
        {!isActivating ? (
          <motion.span
            key="idle"
            className="relative flex items-center gap-2.5"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "15px",
              fontWeight: 500,
              letterSpacing: "0.06em",
              color: "rgba(165,180,252,0.9)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <span>Enter Career Network</span>
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ display: "inline-block" }}
            >
              →
            </motion.span>
          </motion.span>
        ) : (
          <motion.span
            key="activating"
            className="relative flex items-center gap-2.5"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "15px",
              fontWeight: 500,
              letterSpacing: "0.06em",
              color: "rgba(165,180,252,1)",
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              ◆
            </motion.span>
            <span>Entering…</span>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function HeroContent() {
  const { phase } = useScene();
  const router = useRouter();
  const isExiting = phase === "travelling" || phase === "complete";

  // Navigate after the world animation completes
  useEffect(() => {
    if (phase === "travelling") {
      const timer = setTimeout(() => {
        router.push("/#roadmaps");
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [phase, router]);

  return (
    /*
      This container sits absolutely over the 3D canvas.
      pointer-events-none: the 3D world receives mouse events for parallax.
      The CTA re-enables pointer-events for itself.
    */
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ zIndex: 10 }}
    >
      <AnimatePresence>
        {!isExiting && (
          <motion.div
            key="hero"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: "0",
              maxWidth: "760px",
              padding: "0 24px",
            }}
          >
            {/* Eyebrow — very small, very precise */}
            <motion.p
              variants={lineVariants}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(99,102,241,0.75)",
                marginBottom: "28px",
              }}
            >
              AI Career Operating System
            </motion.p>

            {/* Primary headline — the most important text on the page */}
            <motion.h1
              variants={lineVariants}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "clamp(42px, 6.5vw, 80px)",
                fontWeight: 800,
                lineHeight: 1.06,
                letterSpacing: "-0.03em",
                color: "#ffffff",
                marginBottom: "0",
              }}
            >
              The future of
            </motion.h1>
            <motion.h1
              variants={lineVariants}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "clamp(42px, 6.5vw, 80px)",
                fontWeight: 800,
                lineHeight: 1.06,
                letterSpacing: "-0.03em",
                background: "linear-gradient(135deg, #818cf8 0%, #a78bfa 40%, #22d3ee 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                marginBottom: "32px",
              }}
            >
              AI careers starts here.
            </motion.h1>

            {/* Supporting line — one sentence, maximum clarity */}
            <motion.p
              variants={lineVariants}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "clamp(15px, 1.8vw, 18px)",
                fontWeight: 400,
                lineHeight: 1.65,
                color: "rgba(148,163,184,0.85)",
                maxWidth: "480px",
                marginBottom: "52px",
              }}
            >
              Navigate the AI career network. Find your path. Build what matters.
            </motion.p>

            {/* Single CTA — the only interactive element */}
            <motion.div variants={ctaVariants}>
              <CTAButton />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
