"use client";

import { motion, useReducedMotion } from "framer-motion";
import React from "react";
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
      className={`group absolute z-20 flex min-h-28 w-40 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center text-center transition-[opacity,transform] duration-300 focus-visible:rounded-lg disabled:pointer-events-none ${guidedMode && !active ? "opacity-35" : unlocked ? "opacity-100" : "opacity-50"}`}
      style={{ left: stage.x, top: stage.y, transform: `translate(-50%,-50%) scale(${active ? 1.04 : 1})` }}
    >
      <span className="pointer-events-none absolute bottom-[78%] left-1/2 z-30 hidden w-64 -translate-x-1/2 flex-col items-center group-hover:flex group-focus-visible:flex">
        {(stage.title.match(/.{1,22}(?:\s|$)/g) ?? [stage.title]).map((line, index) => <span key={`${line}-${index}`} className="journey-hover-line journey-handwriting block max-w-full overflow-hidden whitespace-nowrap text-xl font-bold leading-7 text-[#38291d] [text-shadow:0_1px_0_rgba(255,238,203,.55)]" style={{ animationDelay: `${index * 110}ms` }}>{line.trim()}</span>)}
      </span>
      <span className="relative transition-transform duration-300 group-hover:-translate-y-1 group-hover:contrast-125 group-focus-visible:contrast-125">
        <LandmarkSymbol stage={stage} active={active} technologyLevel={technologyLevel}/>
        <span className={`absolute -right-1 top-1 grid h-6 w-6 place-items-center rounded-full border text-[10px] font-semibold ${passed ? "rotate-[-7deg] border-[#9b7a45] text-[#806437]" : active ? "border-[#628994] text-[#456c77]" : "border-[#8d887e] text-[#706c64]"}`}>
          {passed ? "✓" : stage.order}
        </span>
      </span>
      <span className={`journey-handwriting -mt-1 max-w-40 px-1 text-[11px] font-bold leading-tight tracking-wide text-[#40352b] ${guidedMode && !active ? "opacity-0" : "opacity-100"}`}>{stage.label ?? stage.title}</span>
      <span className="mt-1 h-px w-16 overflow-hidden bg-[#77736b]/20"><span className="block h-full bg-[#6b8990]" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}/></span>
    </button>
  );
}

function GuidedOverlay({ stage, index, total, travelling, navigationOpen, isMobile, onChange, onExit }: {
  stage: CareerJourneyStage; index: number; total: number; travelling: boolean; navigationOpen: boolean; isMobile: boolean;
  onChange: (index: number) => void; onExit: () => void;
}) {
  const button = "min-h-11 border-b border-[#69655d]/40 bg-transparent px-3 py-2 text-xs font-semibold text-[#4e4b45] transition hover:border-[#557e88] hover:text-[#365f69] disabled:cursor-not-allowed disabled:opacity-30";
  return <>
    <motion.div className="pointer-events-none absolute left-1/2 top-[max(0.75rem,env(safe-area-inset-top))] z-40 w-[min(34rem,calc(100%-1.5rem))] -translate-x-1/2 px-4 py-2 text-center text-[#49463f] transition-[opacity,margin] duration-200" style={{ marginLeft: navigationOpen && !isMobile ? "min(9rem, 18vw)" : 0, opacity: navigationOpen && isMobile ? 0 : 1 }} initial={{opacity:0,y:-5}} animate={{opacity:1,y:0}}>
      <p className="text-[9px] font-semibold uppercase tracking-[.18em] text-[#737068]">Station {index + 1} of {total}</p>
      <WritingText text={stage.title} className="journey-handwriting mt-1 text-lg font-semibold tracking-wide text-[#403d38] sm:text-2xl"/>
      <WritingText text={stage.explanation} className="text-clamp-3 mt-1 text-xs leading-5 text-[#605c54] sm:text-sm"/>
    </motion.div>
    <motion.div className="scrollbar-hide absolute bottom-[calc(4.75rem_+_env(safe-area-inset-bottom))] left-1/2 z-40 flex w-[min(34rem,calc(100%-1rem))] -translate-x-1/2 items-center justify-center gap-3 overflow-x-auto bg-[#eee7d5]/78 px-3 backdrop-blur-[2px] lg:bottom-4" initial={false} animate={{opacity: travelling ? .35 : 1}} transition={{duration:.18}}>
      {index > 0 ? <button aria-label="Previous station" className={button} disabled={travelling} onClick={() => onChange(index - 1)}>← Back</button> : <span className="w-11" aria-hidden="true"/>}
      <button aria-label="Next station" className={`${button} border border-[#6d929a]/45 px-4`} disabled={travelling || index === total - 1} onClick={() => onChange(index + 1)}>Continue →</button>
      <button className={button} onClick={onExit}>Overview</button>
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

  if (!stages.length) return <section className="grid h-full place-items-center bg-[#cab98f] p-6 text-center text-[#392817]"><div><h2 className="font-display text-2xl font-bold">Journey unavailable</h2><p className="mt-2">This career map has no stations yet.</p></div></section>;

  return (
    <motion.section className={`relative h-full touch-none select-none overflow-hidden bg-[#d8c69e] ${dragging ? "cursor-grabbing" : "cursor-grab"}`} initial={false} animate={{opacity:1}} exit={{opacity:0}} tabIndex={-1}
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
              <path d={camera.path} stroke="rgba(94,90,82,.32)" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="8 8"/>
              <path d={camera.path} stroke="rgba(73,70,64,.58)" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="2 13"/>
            </svg>
            {stages.map((stage, index) => <StationLandmark key={stage.id} stage={stage} active={(guidedMode ? focusedStage : selectedStage).id === stage.id} unlocked={isStageUnlocked(stage.id)} passed={Boolean(progress.assessmentResults[stage.test.id]?.passed)} progress={getStageProgress(stage.id)} technologyLevel={index / Math.max(1, stages.length - 1)} guidedMode={guidedMode} transitioning={travelling} onSelect={() => onSelectStage(stage)}/>)}
          </TreasureMapSurface>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_72%,rgba(78,68,49,.09)_100%)]"/>
      {!guidedMode && showStartPopup ? <motion.div className={`absolute inset-0 z-40 grid place-items-center px-4 transition-[opacity,padding] duration-200 ${navigationOpen ? "pointer-events-none opacity-0 sm:pl-[19rem] sm:opacity-100" : "opacity-100"}`} initial={reduceMotion ? false : {opacity:0,scale:.97}} animate={{opacity:1,scale:1}}>
        <section role="dialog" aria-modal="true" aria-labelledby="journey-start-title" aria-describedby="journey-start-description" className="w-full max-w-lg rounded-3xl border border-[#f3d79b]/35 bg-[#5f4029]/78 p-6 text-center text-[#fff4dd] shadow-[0_24px_80px_rgba(57,32,17,.34),inset_0_1px_rgba(255,244,215,.18)] backdrop-blur-md sm:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#e9c980]">Your career journey</p>
          <h2 id="journey-start-title" className="journey-handwriting mx-auto mt-3 max-w-md text-[1.35rem] font-semibold leading-tight sm:text-3xl">Zero to Employment Expedition</h2>
          <p id="journey-start-description" className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#f1e2c7]">Open the career map and follow the gold route from first signal to job-ready launch.</p>
          {dataWarnings[0] ? <p className="mt-3 text-xs text-amber-100">{dataWarnings[0]}</p> : null}
          <button autoFocus type="button" className="mt-6 min-h-11 rounded-full border border-[#ffe0a0]/50 bg-gradient-to-r from-[#a66c28] via-[#d09a43] to-[#a66c28] px-7 py-3 text-sm font-bold text-[#fff8e9] shadow-[0_6px_24px_rgba(224,164,66,.28)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffe0a0]" onClick={() => { setShowStartPopup(false); onStartJourney(); }}>Begin Journey →</button>
        </section>
      </motion.div> : !guidedMode ? null : (
        <GuidedOverlay stage={presentedStage} index={presentedIndex} total={stages.length} travelling={travelling} navigationOpen={navigationOpen} isMobile={viewport.width < 640} onChange={(index) => onGuidedIndexChange(index)} onExit={onExitJourney}/>
      )}
      {pan.x || pan.y ? <button type="button" onClick={() => setPan({x:0,y:0})} className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] right-3 z-40 min-h-11 border-b border-stone-600/40 bg-[#eadfca]/80 px-3 text-xs font-semibold text-stone-700">Recenter</button> : null}
      <div className="sr-only" aria-live="polite">{guidedMode && !travelling ? `Arrived at ${presentedStage.title}, station ${presentedIndex + 1} of ${stages.length}.` : ""}</div>
    </motion.section>
  );
}
