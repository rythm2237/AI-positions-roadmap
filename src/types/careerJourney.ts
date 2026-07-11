import type { CareerQuizQuestion, WorkspaceDifficulty } from "@/types/careerWorkspace";

export type JourneyPoint = { x: number; y: number };

export type JourneyStationState =
  | "locked"
  | "available"
  | "in-progress"
  | "completed"
  | "current";

export type JourneyStationVisualType =
  | "camp"
  | "mountain"
  | "bridge"
  | "village"
  | "library"
  | "workshop"
  | "harbor"
  | "gate"
  | "tower"
  | "ruins"
  | "city"
  | "launch-point";

export interface JourneyResource {
  id: string;
  title: string;
  type: "video" | "article" | "course" | "documentation" | "practice";
  provider: string;
  url: string;
  access: "free" | "paid" | "freemium";
  estimatedTime?: string;
  priority: "essential" | "recommended" | "optional";
  description?: string;
}

export interface JourneyLesson {
  id: string;
  title: string;
  summary?: string;
  estimatedTime?: string;
  difficulty?: WorkspaceDifficulty;
  outcomes?: string[];
  resourceIds?: string[];
}

export interface JourneyMission {
  id: string;
  title: string;
  description: string;
  type: "lesson" | "resource" | "project" | "portfolio" | "career" | "interview" | "job-search";
  estimatedTime?: string;
  deliverables?: string[];
  required?: boolean;
}

export interface JourneyTest {
  id: string;
  title: string;
  description: string;
  passingScore: number;
  questions: CareerQuizQuestion[];
  durationMinutes?: number;
  required: boolean;
  kind: "station" | "phase" | "final";
}

export interface JourneyEnvironmentItem {
  id: string;
  type: "mountain" | "river" | "forest" | "bridge" | "village" | "ruins" | "port" | "cave" | "cliff" | "symbol" | "mist" | "ship";
  position: JourneyPoint;
  label?: string;
  decorative?: boolean;
}

export interface JourneyStation {
  id: string;
  order: number;
  phaseId: string;
  title: string;
  shortTitle?: string;
  summary: string;
  description: string;
  position: JourneyPoint;
  mobilePosition?: JourneyPoint;
  visualType: JourneyStationVisualType;
  estimatedTime?: string;
  prerequisites?: string[];
  lessons: JourneyLesson[];
  resources: JourneyResource[];
  missions: JourneyMission[];
  test?: JourneyTest;
  phaseTest?: JourneyTest;
  noteContext?: {
    careerId: string;
    phaseId?: string;
    stationId?: string;
    lessonId?: string;
    resourceId?: string;
  };
  nextStationId?: string;
  previousStationId?: string;
}

export interface JourneyPhase {
  id: string;
  order: number;
  title: string;
  summary?: string;
  stationIds: string[];
  test?: JourneyTest;
}

export interface JourneyConnection {
  from: string;
  to: string;
  path?: string;
  type?: "primary" | "optional" | "branch";
}

export interface JourneyTheme {
  id: string;
  name: string;
  background: string;
  terrainPattern: string;
  pathStyle: { color: string; completedColor: string; width: number; dash?: string };
  stationStyles: Partial<Record<JourneyStationVisualType, { color: string; icon?: string }>>;
  environmentPalette: Record<string, string>;
  overlayStyle: { background: string; border: string; text: string };
}

export interface CareerJourneyData {
  careerId: string;
  slug: string;
  themeId: string;
  map: { width: number; height: number; overviewPadding?: number };
  phases: JourneyPhase[];
  stations: JourneyStation[];
  connections: JourneyConnection[];
  environment?: JourneyEnvironmentItem[];
}
