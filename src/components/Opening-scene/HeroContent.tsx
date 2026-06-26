
"use client";
// src/components/opening-scene/HeroContent.tsx — v6
//
// CHANGE: Removed useRouter and the router.push("/#roadmaps") auto-exit.
// The universe never exits automatically. Navigation is 100% user-controlled.
// The user leaves only by clicking "Open Roadmap" inside the career preview card.

import { motion, AnimatePresence } from "framer-motion";
import { useScene } from "./SceneContext";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18, delayChildren: 0.6 } },
  exit:    { transition: { staggerChildren: 0.08, staggerDirection: -1 } },
};

const lineVariants = {
  hidden:  { opacity: 0, y: 22, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -12, filter: "blur(6px)", transition: { duration: 0.5, ease: [0.55, 0, 1, 0.45] } },
};

const ctaVariants = {
  hidden:  { opacity: 0, scale: 0.92, filter: "blur(6px)" },
  visible: { opacity: 1, scale: 1,    filter: "blur(0px)", transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, scale: 1.08, filter: "blur(8px)", transition: { duration: 0.6, ease: [0.55, 0, 1, 0.45] } },
};

function CTAButton() {
  const { phase, activate } = useScene();
  const isActivating = phase === "activating" || phase === "travelling" || phase === "arrived" || phase === "exploring";

  return (
    <motion.button
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
      }}
      whileHover={isActivating ? {} : { scale: 1.04 }}
      whileTap={isActivating ? {} : { scale: 0.97 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Enter the AI Career Universe"
    >
      <motion.div
        className="absolute inset-0 rounded-[13px]"
        style={{
          background: "radial-gradient(ellipse at center, rgba(99,102,241,0.18) 0%, transparent 70%)",
          opacity: 0,
        }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
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
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>
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
    </motion.button>
  );
}

export default function HeroContent() {
  const { phase } = useScene();
  // Hide the hero once the user is exploring — the career preview takes over
  const isExiting = phase === "activating" || phase === "travelling" || phase === "arrived" || phase === "exploring";

  return (
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
              display: "flex", flexDirection: "column",
              alignItems: "center", textAlign: "center",
              gap: "clamp(16px, 2.5vh, 28px)",
              padding: "0 clamp(20px, 5vw, 60px)",
              maxWidth: 680,
            }}
          >
            {/* Eyebrow */}
            <motion.p
              variants={lineVariants}
              style={{
                fontSize: "clamp(10px, 1vw, 12px)",
                fontWeight: 700, letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(99,102,241,0.8)",
                fontFamily: "inherit",
              }}
            >
              AI Career OS
            </motion.p>

            {/* Headline */}
            <motion.h1
              variants={lineVariants}
              style={{
                fontSize: "clamp(36px, 6vw, 76px)",
                fontWeight: 800, lineHeight: 1.05,
                letterSpacing: "-0.03em",
                color: "#e0e7ff",
                margin: 0, fontFamily: "inherit",
              }}
            >
              Your AI Career{" "}
              <span style={{
                background: "linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #38bdf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Universe
              </span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              variants={lineVariants}
              style={{
                fontSize: "clamp(14px, 1.6vw, 18px)",
                lineHeight: 1.65, color: "rgba(165,180,252,0.65)",
                maxWidth: 480, margin: 0, fontFamily: "inherit",
              }}
            >
              Explore every AI career path. Discover where you belong.
              Build your future — one node at a time.
            </motion.p>

            {/* CTA */}
            <motion.div variants={ctaVariants}>
              <CTAButton />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
