import type { CareerJourneyStage } from "@/types/careerWorkspace";

const GENERATED_MAP_WIDTH = 3200;
const GENERATED_MAP_HEIGHT = 2200;

export type NormalizedJourneyGeometry = {
  stages: CareerJourneyStage[];
  width?: number;
  height?: number;
  convertedFromPercentages: boolean;
};

/**
 * Early generated Career drafts stored percentage values in the pixel-based x/y
 * fields. Detect that legacy contract and expand it into the shared logical map.
 * Pixel-based careers are returned unchanged.
 */
export function normalizeJourneyGeometry(
  stages: CareerJourneyStage[],
  configuredWidth?: number,
  configuredHeight?: number,
): NormalizedJourneyGeometry {
  const percentageCoordinates = stages.length > 0
    && (configuredWidth ?? 0) > 100
    && (configuredHeight ?? 0) > 100
    && stages.every((stage) => (
      Number.isFinite(stage.x)
      && Number.isFinite(stage.y)
      && stage.x >= 0
      && stage.x <= 100
      && stage.y >= 0
      && stage.y <= 100
    ));

  if (!percentageCoordinates) {
    return {
      stages,
      width: configuredWidth,
      height: configuredHeight,
      convertedFromPercentages: false,
    };
  }

  const width = Math.max(configuredWidth ?? 0, GENERATED_MAP_WIDTH);
  const height = Math.max(configuredHeight ?? 0, GENERATED_MAP_HEIGHT);

  return {
    stages: stages.map((stage) => ({
      ...stage,
      x: Math.round((stage.x / 100) * width),
      y: Math.round((stage.y / 100) * height),
    })),
    width,
    height,
    convertedFromPercentages: true,
  };
}
