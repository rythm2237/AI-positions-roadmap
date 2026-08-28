"use client";

import type { CSSProperties } from "react";
import { AVAILABLE_CAREERS } from "@/data/careerCatalog";

const NODE_INTERVAL_SECONDS = 2.4;
const SHOWCASE_NODE_COUNT = 8;
const LOOP_SECONDS = NODE_INTERVAL_SECONDS * SHOWCASE_NODE_COUNT;

const PATHS = [
  { sx: "-62vw", sy: "28vh", mx: "-18vw", my: "8vh", ex: "54vw", ey: "-30vh" },
  { sx: "58vw", sy: "24vh", mx: "18vw", my: "-5vh", ex: "-58vw", ey: "-24vh" },
  { sx: "-46vw", sy: "-40vh", mx: "-10vw", my: "-12vh", ex: "48vw", ey: "34vh" },
  { sx: "44vw", sy: "-38vh", mx: "12vw", my: "10vh", ex: "-48vw", ey: "30vh" },
  { sx: "-70vw", sy: "-8vh", mx: "-22vw", my: "-4vh", ex: "62vw", ey: "12vh" },
  { sx: "68vw", sy: "-4vh", mx: "22vw", my: "6vh", ex: "-64vw", ey: "-16vh" },
  { sx: "-34vw", sy: "46vh", mx: "-6vw", my: "15vh", ex: "38vw", ey: "-44vh" },
  { sx: "36vw", sy: "44vh", mx: "7vw", my: "13vh", ex: "-40vw", ey: "-46vh" },
] as const;

type FlowStyle = CSSProperties & Record<`--${string}`, string>;

function selectShowcaseCareers() {
  if (AVAILABLE_CAREERS.length <= SHOWCASE_NODE_COUNT) {
    return AVAILABLE_CAREERS;
  }

  const step = AVAILABLE_CAREERS.length / SHOWCASE_NODE_COUNT;
  return Array.from({ length: SHOWCASE_NODE_COUNT }, (_, index) =>
    AVAILABLE_CAREERS[Math.floor(index * step)]
  );
}

const SHOWCASE_CAREERS = selectShowcaseCareers();

export default function PassiveCareerFlow() {
  return (
    <div
      className="passive-career-flow"
      aria-hidden="true"
    >
      {SHOWCASE_CAREERS.map((career, index) => {
        const path = PATHS[index % PATHS.length];
        const delay = -(index * NODE_INTERVAL_SECONDS);
        const style: FlowStyle = {
          "--sx": path.sx,
          "--sy": path.sy,
          "--mx": path.mx,
          "--my": path.my,
          "--ex": path.ex,
          "--ey": path.ey,
          animationDuration: `${LOOP_SECONDS}s`,
          animationDelay: `${delay}s`,
        };

        return (
          <div className="flow-node" style={style} key={career.id}>
            <span className="flow-orb" />
            <span
              className="flow-label"
              style={{
                animationDuration: `${LOOP_SECONDS}s`,
                animationDelay: `${delay}s`,
              }}
            >
              {career.title}
            </span>
          </div>
        );
      })}

      <style jsx>{`
        .passive-career-flow {
          position: absolute;
          inset: 0;
          z-index: 7;
          overflow: hidden;
          pointer-events: none;
          contain: layout paint;
        }

        .flow-node {
          position: absolute;
          left: 50%;
          top: 50%;
          display: flex;
          align-items: center;
          gap: 10px;
          opacity: 0;
          will-change: transform, opacity, filter;
          animation-name: career-node-drift;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .flow-orb {
          display: block;
          width: 10px;
          height: 10px;
          flex: 0 0 auto;
          border-radius: 999px;
          background: rgba(199, 210, 254, 0.98);
          border: 1px solid rgba(255, 255, 255, 0.72);
          box-shadow:
            0 0 10px rgba(129, 140, 248, 0.95),
            0 0 26px rgba(124, 58, 237, 0.62),
            0 0 54px rgba(99, 102, 241, 0.32);
        }

        .flow-label {
          display: block;
          max-width: min(230px, 42vw);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          border: 1px solid rgba(165, 180, 252, 0.18);
          border-radius: 999px;
          padding: 5px 10px;
          color: rgba(238, 242, 255, 0.95);
          background: rgba(8, 11, 28, 0.62);
          box-shadow: 0 8px 28px rgba(3, 5, 14, 0.24);
          backdrop-filter: blur(8px);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.01em;
          opacity: 0;
          transform: translateX(-4px);
          animation-name: career-label-presence;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        @keyframes career-node-drift {
          0% {
            opacity: 0;
            filter: blur(2.5px);
            transform: translate3d(calc(-50% + var(--sx)), calc(-50% + var(--sy)), 0) scale(0.24);
          }
          8% {
            opacity: 0.42;
          }
          30% {
            opacity: 0.88;
            filter: blur(0.7px);
          }
          46% {
            opacity: 1;
            filter: blur(0);
            transform: translate3d(calc(-50% + var(--mx)), calc(-50% + var(--my)), 0) scale(1.22);
          }
          58% {
            opacity: 0.98;
            filter: blur(0);
          }
          78% {
            opacity: 0.56;
            filter: blur(0.8px);
          }
          92% {
            opacity: 0.08;
          }
          100% {
            opacity: 0;
            filter: blur(2.8px);
            transform: translate3d(calc(-50% + var(--ex)), calc(-50% + var(--ey)), 0) scale(0.3);
          }
        }

        @keyframes career-label-presence {
          0%, 28% {
            opacity: 0;
            transform: translateX(-5px) scale(0.96);
          }
          36% {
            opacity: 0.68;
          }
          42%, 56% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          66% {
            opacity: 0.48;
          }
          74%, 100% {
            opacity: 0;
            transform: translateX(4px) scale(0.98);
          }
        }

        @media (max-width: 640px) {
          .flow-node {
            gap: 7px;
          }

          .flow-orb {
            width: 8px;
            height: 8px;
          }

          .flow-label {
            max-width: 58vw;
            padding: 4px 8px;
            font-size: 10px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .flow-node {
            display: none;
          }

          .flow-node:nth-child(-n + 3) {
            display: flex;
            opacity: 0.8;
            animation: none;
          }

          .flow-node:nth-child(1) {
            transform: translate3d(-34vw, -12vh, 0) scale(0.9);
          }

          .flow-node:nth-child(2) {
            transform: translate3d(12vw, 2vh, 0) scale(1.05);
          }

          .flow-node:nth-child(3) {
            transform: translate3d(-8vw, 24vh, 0) scale(0.8);
          }

          .flow-node:nth-child(-n + 3) .flow-label {
            opacity: 0.82;
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
