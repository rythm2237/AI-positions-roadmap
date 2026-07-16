import type {
  CareerJourneyMapConfig,
  CareerJourneyStage,
  CareerJourneyTerrainType,
  CareerWorkspaceProgress,
} from "@/types/careerWorkspace";

export type JourneyCameraPhase = "overview" | "travel" | "focus";

export type JourneyViewport = {
  width: number;
  height: number;
};

export type JourneyThemeLayer =
  | "background"
  | "terrain"
  | "water"
  | "forest"
  | "mountain"
  | "road"
  | "landmark"
  | "station"
  | "lighting"
  | "fog"
  | "particle"
  | "overlay";

export type JourneyThemeDefinition = {
  id: CareerJourneyMapConfig["theme"];
  name: string;
  layers: JourneyThemeLayer[];
  defaultTerrainByStage: Record<string, CareerJourneyTerrainType[]>;
};

export type JourneyEngineProps = {
  map: CareerJourneyMapConfig;
  stages: CareerJourneyStage[];
  progress: CareerWorkspaceProgress;
  viewport: JourneyViewport;
  focusedStage: CareerJourneyStage;
  selectedStage: CareerJourneyStage;
  guidedMode: boolean;
  navigationOpen: boolean;
  guidedIndex: number;
  cameraPhase: JourneyCameraPhase;
  learningMode: boolean;
  reduceMotion: boolean;
  dataWarnings: string[];
  isStageUnlocked: (stageId: string) => boolean;
  getStageProgress: (stageId: string) => number;
  onSelectStage: (stage: CareerJourneyStage) => void;
  onStartJourney: () => void;
  onStartLearning: () => void;
  onExitJourney: () => void;
  onGuidedIndexChange: (index: number) => void;
};
