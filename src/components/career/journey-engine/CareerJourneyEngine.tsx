"use client";

import { motion, useReducedMotion } from "framer-motion";
import React from "react";
import { isAssessmentQualified } from "@/lib/assessmentPolicy";
import type { CareerJourneyStage } from "@/types/careerWorkspace";
import type { JourneyEngineProps } from "./types";
import { getWorldSize, useJourneyCamera } from "./useJourneyCamera";
import { InfiniteLeatherBackground, LandmarkSymbol, TreasureMapSurface, TreasureTerrainFeature } from "./themes/treasureMapTheme";

function WritingText({ text, className = "" }: { text: string; className?: string }) {
  const reduceMotion = useReducedMotion();
  return <motion.p key={text} className={className} initial={reduceMotion ? false : { clipPath: "inset(0 100% 0 0)", opacity: .35 }} animate={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }} transition={{ duration: reduceMotion ? .12 : .9, delay: reduceMotion ? 0 : .12, ease: [0.22, 1, 0.36, 1] }}>{text}</motion.p>;
}

function StationLandmark({ stage, active, unlocked, passed, progress, technologyLevel, guidedMode, transitioning, onSelect }: {
  stage: CareerJourneyStage; active: boolean; unlocked: boolean; passed: boolean; progress: number; technologyLevel: number; guidedMode: boolean; transitioning: boolean; onSelect: () => void;
}) {
  return (
    <button
      type="button"
      id={`journey-station-${stage.id}`}
      onClick={onSelect}
      disabled={transitioning}
      aria-label={`${stage.title}, station ${stage.order}, ${active ? "current" : passed ? "completed" : unlocked ? "available" : "locked"}, ${progress} percent complete. Open station details.`}
      aria-disabled={!unlocked}
      className={`group absolute z-20 flex min-h-32 w-44 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-2xl border px-2 py-2 text-center backdrop-blur-[3px] transition-[opacity,transform,border-color,background-color,box-shadow] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 disabled:pointer-events-none ${
        active
          ? "border-cyan-300/65 bg-slate-950/88 shadow-[0_18px_48px_rgba(8,145,178,.2),inset_0_1px_rgba(255,255,255,.08)]"
          : passed
            ? "border-teal-300/50 bg-teal-950/82 shadow-[0_14px_36px_rgba(3,10,22,.34)]"
            : unlocked
              ? "border-slate-300/25 bg-slate-950/82 shadow-[0_14px_36px_rgba(3,10,22,.32)]"
              : "border-slate-500/20 bg-slate-950/72"
      } ${guidedMode && !active ? "opacity-40" : unlocked ? "opacity-100" : "opacity-70"}`}
      style={{ left: stage.x, top: stage.y, transform: `translate(-50%,-50%) scale(${active ? 1.04 : 1})` }}
    >
      <span className="pointer-events-none absolute bottom-[96%] left-1/2 z-30 hidden w-64 -translate-x-1/2 flex-col items-center rounded-xl border border-cyan-200/15 bg-slate-950/95 px-3 py-2 shadow-xl backdrop-blur-md group-hover:flex group-focus-visible:flex">
        {(stage.title.match(/.{1,22}(?:\s|$)/g) ?? [stage.title]).map((line, index) => <span key={`${line}-${index}`} className="journey-hover-line block max-w-full overflow-hidden whitespace-nowrap font-display text-sm font-semibold leading-5 text-slate-100" style={{ animationDelay: `${index * 110}ms` }}>{line.trim()}</span>)}
      </span>
      <span className="relative transition-transform duration-300 group-hover:-translate-y-1 group-hover:contrast-125 group-focus-visible:contrast-125">
        <LandmarkSymbol stage={stage} active={active} technologyLevel={technologyLevel}/>
        <span className={`absolute -right-1 top-1 grid h-6 w-6 place-items-center rounded-full border bg-slate-950/85 text-[10px] font-semibold ${passed ? "rotate-[-7deg] border-teal-300/55 text-teal-200" : active ? "border-cyan-300/70 text-cyan-100" : "border-slate-500/55 text-slate-300"}`}>
          {passed ? "✓" : stage.order}
        </span>
      </span>
      <span className={`-mt-1 max-w-40 overflow-hidden text-ellipsis px-1 text-xs font-semibold leading-tight tracking-wide text-slate-100 ${guidedMode && !active ? "opacity-0" : "opacity-100"}`}>{stage.label ?? stage.title}</span>
      <span className={`mt-1 text-[9px] font-semibold uppercase tracking-[.14em] ${active ? "text-cyan-100" : passed ? "text-teal-100" : unlocked ? "text-slate-300" : "text-slate-400"}`}>{active ? "Current" : passed ? "Complete" : unlocked ? "Available" : "Locked"}</span>
      <span className="mt-1 h-px w-16 overflow-hidden bg-slate-700/70"><span className={`block h-full ${passed ? "bg-teal-300" : "bg-cyan-300"}`} style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}/></span>
    </button>
  );
}

function GuidedOverlay({ stage, index, total, travelling, navigationOpen, isMobile, onChange, onExit }: {
  stage: CareerJourneyStage; index: number; total: number; travelling: boolean; navigationOpen: boolean; isMobile: boolean;
  onChange: (index: number) => void; onExit: () => void;
}) {
  const button = "min-h-11 rounded-full border border-white/10 bg-slate-950/75 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-cyan-300/40 hover:bg-slate-900 hover:text-cyan-100 active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:opacity-30 disabled:active:translate-y-0";
  return <>
    <motion.div className="pointer-events-none absolute left-1/2 top-[max(0.5rem,env(safe-area-inset-top))] z-40 w-[min(32rem,calc(100%-1rem))] -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-950/78 px-3 py-2.5 text-center text-slate-100 shadow-[0_12px_36px_rgba(1,4,12,.32)] backdrop-blur-md transition-opacity duration-200 sm:px-4" style={{ opacity: navigationOpen && isMobile ? 0 : 1 }} initial={{opacity:0,y:-5}} animate={{opacity:1,y:0}}>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-[9px] font-semibold uppercase tracking-[.15em]">
        <span className="text-cyan-200/80">Phase: {stage.title}</span>
        <span className="text-slate-400">Current checkpoint: {stage.label ?? stage.title}</span>
        <span className="text-slate-500">Station {index + 1} of {total}</span>
      </div>
      <WritingText text={stage.explanation} className="text-clamp-2 mt-1.5 text-xs leading-4 text-slate-300 sm:leading-5"/>
    </motion.div>
    <motion.div className="scrollbar-hide absolute bottom-[calc(4.75rem_+_env(safe-area-inset-bottom))] left-1/2 z-40 flex w-[min(34rem,calc(100%-1rem))] -translate-x-1/2 items-center justify-center gap-3 overflow-x-auto rounded-full border border-white/10 bg-slate-950/78 px-3 py-2 shadow-[0_16px_44px_rgba(1,4,12,.38)] backdrop-blur-md lg:bottom-4" initial={false} animate={{opacity: travelling ? .35 : 1}} transition={{duration:.18}}>
      {index > 0 ? <button aria-label="Previous station" className={button} disabled={travelling} onClick={() => onChange(index - 1)}>← Back</button> : <span className="w-11" aria-hidden="true"/>}
      <button aria-label="Next station" className={`${button} border-cyan-200/45 bg-gradient-to-r from-cyan-400 to-teal-300 px-5 text-slate-950 shadow-[0_8px_24px_rgba(34,211,238,.2)] hover:border-cyan-100 hover:text-slate-950 hover:brightness-105`} disabled={travelling || index === total - 1} onClick={() => onChange(index + 1)}>Continue →</button>
      <button className={`${button} border-transparent bg-transparent text-slate-400`} onClick={onExit}>Overview</button>
    </motion.div>
  </>;
}

export default function CareerJourneyEngine(props: JourneyEngineProps) {
  const { map, stages, progress, viewport, focusedStage, selectedStage, guidedMode, navigationOpen, guidedIndex, cameraPhase, learningMode, reduceMotion, dataWarnings, isStageUnlocked, getStageProgress, onSelectStage, onStartJourney, onExitJourney, onGuidedIndexChange } = props;
  const [presentedStage, setPresentedStage] = React.useState(focusedStage);
  const [presentedIndex, setPresentedIndex] = React.useState(guidedIndex);
  const [travelling, setTravelling] = React.useState(false);
  const [showStartPopup, setShowStartPopup] = React.useState(true);
  const guidedModeRef = React.useRef(guidedMode);
  const world = getWorldSize(stages, map.width, map.height, map.worldPadding);
  const camera = useJourneyCamera({ stages, focusedStage, viewport, mapWidth: world.width, mapHeight: world.height, guidedMode, cameraPhase, learningMode });
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [dragging, setDragging] = React.useState(false);
  const drag = React.useRef<{ id: number; x: number; y: number; panX: number; panY: number } | null>(null);
  const constrainPan = React.useCallback((x: number, y: number) => {
    const visibleX = Math.min(viewport.width * .22, 180);
    const visibleY = Math.min(viewport.height * .22, 140);
    const minX = visibleX - camera.x - world.width * camera.scale;
    const maxX = viewport.width - visibleX - camera.x;
    const minY = visibleY - camera.y - world.height * camera.scale;
    const maxY = viewport.height - visibleY - camera.y;
    return { x: Math.max(minX, Math.min(maxX, x)), y: Math.max(minY, Math.min(maxY, y)) };
  }, [camera.scale, camera.x, camera.y, viewport.height, viewport.width, world.height, world.width]);
  const movePan = (x: number, y: number) => setPan(constrainPan(x, y));

  React.useEffect(() => {
    setPan((current) => constrainPan(current.x, current.y));
  }, [constrainPan]);

  React.useEffect(() => {
    const enteringGuidedMode = guidedMode && !guidedModeRef.current;
    guidedModeRef.current = guidedMode;
    if (!guidedMode || reduceMotion) {
      setPresentedStage(focusedStage); setPresentedIndex(guidedIndex); setTravelling(false); return;
    }
    if (presentedStage.id === focusedStage.id && !enteringGuidedMode) return;
    setTravelling(true);
    const mobile = viewport.width < 640;
    const presentTimer = window.setTimeout(() => { setPresentedStage(focusedStage); setPresentedIndex(guidedIndex); }, mobile ? 500 : 650);
    const endTimer = window.setTimeout(() => setTravelling(false), mobile ? 950 : 1200);
    return () => { window.clearTimeout(presentTimer); window.clearTimeout(endTimer); };
  // Presented copy follows near arrival so the camera destination can change immediately.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedStage.id, guidedIndex, guidedMode, reduceMotion, viewport.width]);

  if (!stages.length) return <section className="grid h-full place-items-center bg-[#030712] p-6 text-center text-slate-100"><div><h2 className="font-display text-2xl font-bold">Journey unavailable</h2><p className="mt-2 text-slate-400">This career map has no stations yet.</p></div></section>;

  return (
    <motion.section className={`relative h-full touch-none select-none overflow-hidden bg-[#030712] ${dragging ? "cursor-grabbing" : "cursor-grab"}`} initial={false} animate={{opacity:1}} exit={{opacity:0}} tabIndex={-1}
      onPointerDown={(event) => { if ((event.target as HTMLElement).closest("button")) return; event.currentTarget.setPointerCapture(event.pointerId); drag.current = { id:event.pointerId, x:event.clientX, y:event.clientY, panX:pan.x, panY:pan.y }; setDragging(true); }}
      onPointerMove={(event) => { const start=drag.current; if (!start || start.id!==event.pointerId) return; movePan(start.panX+event.clientX-start.x,start.panY+event.clientY-start.y); }}
      onPointerUp={(event) => { if (drag.current?.id===event.pointerId) { drag.current=null; setDragging(false); event.currentTarget.releasePointerCapture(event.pointerId); } }} onPointerCancel={() => { drag.current=null; setDragging(false); }}
      onKeyDown={(event) => { if (!guidedMode || travelling) return; if (event.key === "ArrowRight" && guidedIndex < stages.length - 1) { event.preventDefault(); setPan({x:0,y:0}); onGuidedIndexChange(guidedIndex + 1); } if (event.key === "ArrowLeft" && guidedIndex > 0) { event.preventDefault(); setPan({x:0,y:0}); onGuidedIndexChange(guidedIndex - 1); } }}>
      <InfiniteLeatherBackground />
      <div className="absolute inset-0">
        <div className="absolute left-0 top-0 origin-top-left will-change-transform" style={{ width: world.width, height: world.height, transform: `translate3d(${camera.x + pan.x}px,${camera.y + pan.y}px,0) scale(${camera.scale})`, transition: reduceMotion || dragging ? "none" : `transform ${camera.transitionMs}ms cubic-bezier(.22,1,.36,1)` }}>
          <TreasureMapSurface width={world.width} height={world.height}>
            {stages.map((stage, index) => <TreasureTerrainFeature key={`${stage.id}-terrain`} stage={stage} technologyLevel={index / Math.max(1, stages.length - 1)}/>)}
            <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${world.width} ${world.height}`} fill="none" aria-hidden="true">
              <defs>
                <linearGradient id="expedition-route" x1="0" x2={world.width} gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#d2aa72"/>
                  <stop offset=".42" stopColor="#2dd4bf"/>
                  <stop offset=".72" stopColor="#67e8f9"/>
                  <stop offset="1" stopColor="#a78bfa"/>
                </linearGradient>
              </defs>
              <path d={camera.path} stroke="rgba(2,6,23,.8)" strokeWidth="8" strokeLinecap="round"/>
              <path d={camera.path} stroke="url(#expedition-route)" strokeOpacity=".48" strokeWidth="3.4" strokeLinecap="round"/>
              <path d={camera.path} stroke="url(#expedition-route)" strokeOpacity=".92" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="3 12"/>
            </svg>
            {stages.map((stage, index) => { const passed = Boolean(stage.phaseExam && isAssessmentQualified(stage.phaseExam, progress.assessmentResults[stage.phaseExam.id])); return <StationLandmark key={stage.id} stage={stage} active={(guidedMode ? focusedStage : selectedStage).id === stage.id} unlocked={isStageUnlocked(stage.id)} passed={passed} progress={getStageProgress(stage.id)} technologyLevel={index / Math.max(1, stages.length - 1)} guidedMode={guidedMode} transitioning={travelling} onSelect={() => onSelectStage(stage)}/>; })}
          </TreasureMapSurface>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_64%,rgba(1,4,12,.42)_100%)]"/>
      {!guidedMode && showStartPopup ? <motion.div className="absolute inset-0 z-40 grid place-items-center px-4" initial={reduceMotion ? false : {opacity:0,scale:.97}} animate={{opacity:1,scale:1}}>
        <section role="dialog" aria-modal="true" aria-labelledby="journey-start-title" aria-describedby="journey-start-description" className="w-full max-w-lg rounded-3xl border border-cyan-200/15 bg-slate-950/88 p-6 text-center text-slate-100 shadow-[0_24px_80px_rgba(1,4,12,.6),inset_0_1px_rgba(255,255,255,.08)] backdrop-blur-xl sm:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-cyan-200/80">Your career journey</p>
          <h2 id="journey-start-title" className="mx-auto mt-3 max-w-md font-display text-[1.35rem] font-semibold leading-tight tracking-tight text-white sm:text-3xl">Zero to Employment Expedition</h2>
          <p id="journey-start-description" className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-300">Open the career map and follow the gold route from first signal to job-ready launch.</p>
          {dataWarnings[0] ? <p className="mt-3 text-xs text-amber-100">{dataWarnings[0]}</p> : null}
          <button autoFocus type="button" className="mt-6 min-h-11 rounded-full border border-cyan-200/30 bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 px-7 py-3 text-sm font-bold text-slate-950 shadow-[0_8px_28px_rgba(34,211,238,.22)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200" onClick={() => { setShowStartPopup(false); onStartJourney(); }}>Begin Journey →</button>
        </section>
      </motion.div> : !guidedMode ? null : (
        <GuidedOverlay stage={presentedStage} index={presentedIndex} total={stages.length} travelling={travelling} navigationOpen={navigationOpen} isMobile={viewport.width < 640} onChange={(index) => onGuidedIndexChange(index)} onExit={onExitJourney}/>
      )}
      {pan.x || pan.y ? <button type="button" onClick={() => setPan({x:0,y:0})} className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] right-3 z-40 min-h-11 rounded-full border border-white/10 bg-slate-950/80 px-4 text-xs font-semibold text-slate-300 shadow-lg backdrop-blur-md transition hover:border-cyan-300/40 hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">Recenter</button> : null}
      <div className="sr-only" aria-live="polite">{guidedMode && !travelling ? `Arrived at ${presentedStage.title}, station ${presentedIndex + 1} of ${stages.length}.` : ""}</div>
    </motion.section>
  );
}
