// src/types/roadmap.ts
// Full TypeScript type definitions for the roadmap system.
// Designed to be easily connected to Supabase/database later.

// ─── Learning Types ─────────────────────────────────────────────────────────

export type LearningType = "Video" | "Reading" | "Practice" | "Project" | "Quiz";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type RoadmapStatus = "mvp-ready" | "coming-soon";

export type PhaseAccessLevel = "free" | "locked";

export type TestResultStatus = "not-attempted" | "passed" | "needs-review";

// ─── Resource ───────────────────────────────────────────────────────────────

export interface RoadmapResource {
  label: string;
  type: "video" | "article" | "practice" | "tool" | "project";
  url: string; // placeholder "#" for now
}

// ─── Recommended Course ─────────────────────────────────────────────────────

export interface RecommendedCourse {
  title: string;
  provider: string;   // e.g. "Udemy", "DeepLearning.AI", "Coursera"
  url: string;
  price: string;      // e.g. "Free", "~$15", "$49/mo"
  level: Difficulty;
  durationHours: number;
  highlights: string; // one-line summary of what makes it great
}

// ─── Question ───────────────────────────────────────────────────────────────

export interface RoadmapQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

// ─── Test ───────────────────────────────────────────────────────────────────

export interface RoadmapTest {
  id: string;
  title: string;
  questions: RoadmapQuestion[];
}

// ─── Section ────────────────────────────────────────────────────────────────

export interface RoadmapSection {
  id: string;
  title: string;
  description: string;
  estimatedTime: string; // e.g. "20 min"
  difficulty: Difficulty;
  learningTypes: LearningType[];
  resources: RoadmapResource[];
  test: RoadmapTest;
}

// ─── Phase ──────────────────────────────────────────────────────────────────

export interface RoadmapPhase {
  id: string;
  phaseNumber: number;
  title: string;
  description: string;
  estimatedDuration: string; // e.g. "~10 hours of content"
  estimatedHours: number;    // numeric hours for timeline calculations
  weekRange: string;         // kept for display reference
  outcome: string;           // what the learner can do after this phase
  access: PhaseAccessLevel;
  sections: RoadmapSection[];
  finalTest: RoadmapTest;
  recommendedCourses?: RecommendedCourse[];
}

// ─── Project ────────────────────────────────────────────────────────────────

export interface RoadmapProject {
  id: string;
  title: string;
  scenario: string;
  skills: string[];
  deliverables: string[];
  estimatedTime: string;
  difficulty: Difficulty;
  relatedPhaseId: string;
}

// ─── Roadmap ────────────────────────────────────────────────────────────────

export interface Roadmap {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  status: RoadmapStatus;
  totalEstimatedHours: number;
  phases: RoadmapPhase[];
  projects: RoadmapProject[];
  recommendedCourses?: RecommendedCourse[]; // top-level cross-phase courses
}

// ─── Progress State ──────────────────────────────────────────────────────────

export interface SectionTestResult {
  sectionId: string;
  score: number;         // 0–100
  status: TestResultStatus;
  answeredAt: string;    // ISO date string
}

export interface PhaseTestResult {
  phaseId: string;
  score: number;
  status: TestResultStatus;
  answeredAt: string;
}

export interface ProgressState {
  completedSections: string[];    // section ids
  completedProjects: string[];    // project ids
  sectionTestResults: Record<string, SectionTestResult>;
  phaseTestResults: Record<string, PhaseTestResult>;
  sectionNotes: Record<string, string>;  // key: `${phaseId}__${sectionId}`
  phaseNotes: Record<string, string>;    // key: phaseId
}
