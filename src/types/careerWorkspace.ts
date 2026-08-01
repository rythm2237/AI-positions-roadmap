export type CareerWorkspaceSectionId =
  | "hero"
  | "intelligence"
  | "roadmap"
  | "learning"
  | "project"
  | "portfolio"
  | "jobs"
  | "interview-brief";

export type CareerResourceType =
  | "Video"
  | "Article"
  | "Course"
  | "Documentation"
  | "Practice"
  | "Exam";

export type ResourcePriority = "Essential" | "Recommended" | "Optional";
export type ResourceCost = "Free" | "Paid" | "Free/Paid";
export type WorkspaceDifficulty = "Beginner" | "Intermediate" | "Advanced";

export interface CareerMetric {
  label: string;
  value: string;
  detail: string;
}

export interface CareerMapSection {
  id: CareerWorkspaceSectionId;
  label: string;
  eyebrow: string;
  summary: string;
  x: number;
  y: number;
}

export type CareerJourneyStageType =
  | "orientation"
  | "foundation"
  | "core-skills"
  | "tools"
  | "projects"
  | "portfolio"
  | "resume"
  | "profile"
  | "job-search"
  | "jobs"
  | "interview"
  | "assessment"
  | "ready";

export type CareerJourneyThemeId =
  | "treasure-map"
  | "mountain-expedition"
  | "island-adventure"
  | "ai-laboratory"
  | "cyber-fortress"
  | "tech-city"
  | "future-space-colony";

export type CareerJourneyTerrainType =
  | "mountain"
  | "river"
  | "forest"
  | "bridge"
  | "village"
  | "ruins"
  | "port"
  | "cave"
  | "cliff"
  | "symbol"
  | "mist"
  | "ship";

export interface CareerVisualMetadata {
  nodeLabel: string;
  sceneTitle: string;
  sceneDescription: string;
  imageAlt: string;
}

export interface CareerResource {
  id: string;
  title: string;
  type: CareerResourceType;
  provider: string;
  cost: ResourceCost;
  estimatedTime: string;
  whyUseful: string;
  url: string;
  priority: ResourcePriority;
}

export interface CareerLesson {
  id: string;
  title: string;
  summary: string;
  estimatedTime: string;
  difficulty: WorkspaceDifficulty;
  outcomes: string[];
  resources: CareerResource[];
  mission: string;
}

export interface CareerQuizQuestion {
  id: string;
  question: string;
  answers: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: WorkspaceDifficulty;
  relatedTopic: string;
  learningObjectiveId?: string;
  skillLevel?: WorkspaceDifficulty;
  questionType?: "multiple-choice" | "true-false" | "scenario" | "code-interpretation";
  referenceId?: string;
  segmentId?: string;
  status?: "active" | "needs-review" | "retired";
  lastReviewedAt?: string;
  version?: number;
}

export interface CareerQuiz {
  id: string;
  title: string;
  phaseId?: string;
  description: string;
  questions: CareerQuizQuestion[];
  officialPracticeLink?: {
    title: string;
    url: string;
  };
}

export interface CareerAssessment {
  id: string;
  title: string;
  description: string;
  passingScore: number;
  assessmentType?: "topic" | "comprehensive";
  topicId?: string;
  topicLabel?: string;
  durationMinutes?: number;
  questionsPerAttempt?: number;
  questions: CareerQuizQuestion[];
  officialPracticeLinks?: {
    title: string;
    url: string;
  }[];
}

export interface CareerJourneyTask {
  id: string;
  title: string;
  description: string;
  type: "lesson" | "resource" | "project" | "portfolio" | "career" | "interview" | "job-search";
}

export interface CareerEffortRange {
  minMinutes: number;
  maxMinutes: number;
}

export interface CareerJourneyEffortEstimate extends CareerEffortRange {
  breakdown: {
    resources: CareerEffortRange;
    activities: CareerEffortRange;
    assessment: CareerEffortRange;
  };
  ongoing?: {
    note: string;
  };
}

export interface CareerJourneyStage {
  id: string;
  order: number;
  title: string;
  label?: string;
  type: CareerJourneyStageType;
  landmark: string;
  landmarkType?: CareerJourneyTerrainType;
  theme: string;
  x: number;
  y: number;
  connections?: string[];
  terrain?: CareerJourneyTerrainType[];
  /** @deprecated Use estimatedEffort for planning and UI. */
  duration?: string;
  estimatedEffort?: CareerJourneyEffortEstimate;
  summary: string;
  explanation: string;
  lessons: string[];
  resources: CareerResource[];
  tasks: CareerJourneyTask[];
  /** @deprecated Active Journey UI uses topicAssessments. */
  test?: CareerAssessment;
  topicAssessments?: CareerAssessment[];
  phaseExam?: CareerAssessment;
}

export interface CareerJourneyMapConfig {
  theme: CareerJourneyThemeId;
  overviewTitle: string;
  overviewDescription: string;
  width?: number;
  height?: number;
  worldPadding?: number;
}

export interface CareerRoadmapPhase {
  id: string;
  phaseNumber: number;
  title: string;
  duration: string;
  goal: string;
  status: "unlocked" | "locked";
  mentorTip: string;
  sections: string[];
  lessons: CareerLesson[];
  practicalMissions: string[];
  expectedOutcome: string;
  quiz: CareerQuiz;
}

export interface CareerProject {
  id: string;
  title: string;
  difficulty: WorkspaceDifficulty;
  estimatedTime: string;
  phaseId: string;
  description: string;
  deliverables: string[];
  skills: string[];
}

export interface CareerReadinessItem {
  id: string;
  label: string;
  description: string;
  weight: number;
}

export interface CareerWorkspaceData {
  slug: string;
  title: string;
  category: string;
  visual: CareerVisualMetadata;
  shortDescription: string;
  difficulty: string;
  estimatedLearningTime: string;
  salary: string;
  hiringDemand: string;
  remoteAvailability: string;
  aiCompatibilityScore: string;
  bestFor: string[];
  programmingRequirement: string;
  mathRequirement: string;
  creativityLevel: string;
  communicationLevel: string;
  lastUpdated: string;
  metrics: CareerMetric[];
  overview: {
    title: string;
    body: string;
    responsibilities: string[];
    industries: string[];
  };
  mapSections: CareerMapSection[];
  journeyMap: CareerJourneyMapConfig;
  journeyStages: CareerJourneyStage[];
  roadmap: CareerRoadmapPhase[];
  projects: CareerProject[];
  globalResources: CareerResource[];
  readiness: CareerReadinessItem[];
  finalChallenge: {
    title: string;
    description: string;
    requirements: string[];
    deliverables: string[];
    evaluation: string[];
  };
  relatedCareers: string[];
  progressRules: {
    readinessThreshold: number;
    minimumProjects: number;
    minimumQuizScore: number;
  };
  jobBoard: {
    title: string;
    description: string;
    integrationStatus: "coming-soon" | "live";
    filters: string[];
    sampleDisclaimer: string;
  };
  portfolioTasks: CareerJourneyTask[];
  jobSearchTasks: CareerJourneyTask[];
  interviewPrep: {
    title: string;
    practiceAreas: string[];
    questions: string[];
  };
}

export interface CareerNote {
  id: string;
  contextType: "career" | "phase" | "step" | "resource" | "project" | "quiz" | "exam";
  contextId: string;
  contextLabel: string;
  body: string;
  updatedAt: string;
}

export interface CareerQuizAnswer {
  questionId: string;
  selectedAnswerIndex: number;
  correct: boolean;
  answeredAt: string;
}

export interface CareerAssessmentResult {
  assessmentId: string;
  assessmentType?: "topic" | "comprehensive";
  score: number;
  passed: boolean;
  submittedAt: string;
  reviewTopics: string[];
  attemptId?: string;
  answers?: Record<string, number>;
  bestScore?: number;
  attemptNumber?: number;
  completedAt?: string;
}

export interface CareerWorkspaceProgress {
  completedLessons: string[];
  completedResources: string[];
  completedProjects: string[];
  completedStageTasks: string[];
  completedReadinessItems: string[];
  quizAnswers: Record<string, CareerQuizAnswer>;
  assessmentResults: Record<string, CareerAssessmentResult>;
  notes: CareerNote[];
  lastActiveStageId?: string;
  resourceViewedAt: Record<string, string>;
  assessmentAttempts: CareerAssessmentResult[];
  startedAt?: string;
}

export interface CareerWorkspaceStats {
  overallProgress: number;
  lessonProgress: number;
  resourceProgress: number;
  projectProgress: number;
  quizProgress: number;
  readinessScore: number;
  completedLessons: number;
  totalLessons: number;
  completedResources: number;
  totalResources: number;
  completedProjects: number;
  totalProjects: number;
  completedQuizzes: number;
  totalQuizzes: number;
  notesCount: number;
  stageProgress: number;
  passedAssessments: number;
  totalAssessments: number;
}
