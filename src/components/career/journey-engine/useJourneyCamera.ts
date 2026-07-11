import { useMemo } from "react";
import type { CareerJourneyStage } from "@/types/careerWorkspace";
import type { JourneyCameraPhase, JourneyViewport } from "./types";

export function getStageAnchor(stage: CareerJourneyStage) {
  return { x: stage.x, y: stage.y };
}

export function getJourneyPath(stages: CareerJourneyStage[]): string {
  return stages
    .map((stage, index) => {
      const point = getStageAnchor(stage);
      if (index === 0) return `M ${point.x} ${point.y}`;

      const previous = getStageAnchor(stages[index - 1]);
      const dx = point.x - previous.x;
      const bend = index % 2 === 0 ? -90 : 90;
      return `C ${previous.x + dx * 0.38} ${previous.y + bend} ${point.x - dx * 0.38} ${point.y - bend} ${point.x} ${point.y}`;
    })
    .join(" ");
}

export function getWorldSize(stages: CareerJourneyStage[], configuredWidth?: number, configuredHeight?: number, padding = 760) {
  return {
    width: configuredWidth ?? Math.max(...stages.map((stage) => stage.x)) + padding,
    height: configuredHeight ?? Math.max(...stages.map((stage) => stage.y)) + Math.round(padding * 0.64),
  };
}

export function useJourneyCamera({
  stages,
  focusedStage,
  viewport,
  mapWidth,
  mapHeight,
  guidedMode,
  cameraPhase,
  learningMode,
}: {
  stages: CareerJourneyStage[];
  focusedStage: CareerJourneyStage;
  viewport: JourneyViewport;
  mapWidth: number;
  mapHeight: number;
  guidedMode: boolean;
  cameraPhase: JourneyCameraPhase;
  learningMode: boolean;
}) {
  return useMemo(() => {
    const isMobile = viewport.width < 640;
    const isDesktop = viewport.width >= 1024;
    const workspaceWidth = Math.max(320, viewport.width);
    const workspaceHeight = Math.max(320, viewport.height);
    // Overview is a window into an oversized world, not a fitted paper sheet.
    // Cover the viewport with generous bleed so no paper edge can enter view.
    const overviewScale = Math.max(workspaceWidth / mapWidth, workspaceHeight / mapHeight) * 1.14;
    const focusScale = isMobile ? 1.05 : 0.9;
    const travelScale = focusScale * 0.98;
    const learningScale = focusScale;
    const scale = guidedMode
      ? cameraPhase === "focus"
        ? focusScale
        : cameraPhase === "travel"
          ? travelScale
          : overviewScale
      : learningMode
        ? learningScale
        : overviewScale;

    const focusCenterX = isMobile ? workspaceWidth * 0.5 : workspaceWidth * 0.56;
    const focusCenterY = isMobile ? workspaceHeight * 0.4 : workspaceHeight * 0.5;
    const stageAnchor = getStageAnchor(focusedStage);
    const overviewX = (workspaceWidth - mapWidth * overviewScale) / 2;
    const overviewY = (workspaceHeight - mapHeight * overviewScale) / 2;
    const x = guidedMode || learningMode ? focusCenterX - stageAnchor.x * scale : overviewX;
    const y = guidedMode || learningMode ? focusCenterY - stageAnchor.y * scale : overviewY;
    const stationScreenX = x + stageAnchor.x * scale;
    const stationScreenY = y + stageAnchor.y * scale;
    const overlayWidth = Math.min(isMobile ? workspaceWidth - 24 : 510, 510);

    return {
      isMobile,
      workspaceWidth,
      workspaceHeight,
      scale,
      transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
      transitionMs: guidedMode ? (isMobile ? 950 : 1200) : 700,
      overlay: {
        width: overlayWidth,
        left: Math.min(
          Math.max(12, stationScreenX - overlayWidth / 2),
          Math.max(12, workspaceWidth - overlayWidth - 12)
        ),
        top: Math.min(
          Math.max(isMobile ? 250 : 190, stationScreenY + (isMobile ? 88 : 105)),
          Math.max(isMobile ? 250 : 190, workspaceHeight - (isMobile ? 136 : 82))
        ),
      },
      stationScreen: { x: stationScreenX, y: stationScreenY },
      path: getJourneyPath(stages),
    };
  }, [cameraPhase, focusedStage, guidedMode, learningMode, mapHeight, mapWidth, stages, viewport.height, viewport.width]);
}
