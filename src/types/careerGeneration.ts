import type {
  CareerJourneyStageType,
  CareerJourneyThemeId,
  CareerJourneyTask,
  CareerQuizQuestion,
  ResourceCost,
  WorkspaceDifficulty,
} from "@/types/careerWorkspace";

export interface GeneratedCareerStage {
  title: string;
  type: CareerJourneyStageType;
  landmark: string;
  theme: string;
  summary: string;
  explanation: string;
  lessons: string[];
  learningOutcomes: string[];
  tasks: Array<Pick<CareerJourneyTask, "title" | "description" | "type">>;
  phaseGoal: string;
  mentorTip: string;
  practicalMissions: string[];
  expectedOutcome: string;
  resourceTopic: string;
  preferredProviders: string[];
  skillLevel: WorkspaceDifficulty;
  effortMinutes: {
    min: number;
    max: number;
  };
  assessmentSeeds: Array<{
    scenario: string;
    correctPrinciple: string;
    commonMistake: string;
  }>;
}

export interface GeneratedCareerBlueprint {
  title: string;
  shortTitle: string;
  category: string;
  summary: string;
  aliases: string[];
  difficulty: string;
  estimatedLearningTime: string;
  salaryContext: string;
  hiringDemandContext: string;
  remoteAvailability: string;
  aiCompatibility: string;
  bestFor: string[];
  programmingRequirement: string;
  mathRequirement: string;
  creativityLevel: string;
  communicationLevel: string;
  metrics: Array<{ label: string; value: string; detail: string }>;
  overview: {
    title: string;
    body: string;
    responsibilities: string[];
    industries: string[];
  };
  journeyTheme: CareerJourneyThemeId;
  journeyDescription: string;
  stages: GeneratedCareerStage[];
  projects: Array<{
    title: string;
    difficulty: WorkspaceDifficulty;
    estimatedTime: string;
    stageNumber: number;
    description: string;
    deliverables: string[];
    skills: string[];
  }>;
  readiness: Array<{ label: string; description: string; weight: number }>;
  finalChallenge: {
    title: string;
    description: string;
    requirements: string[];
    deliverables: string[];
    evaluation: string[];
  };
  relatedCareers: string[];
  portfolioTasks: Array<Pick<CareerJourneyTask, "title" | "description" | "type">>;
  jobSearchTasks: Array<Pick<CareerJourneyTask, "title" | "description" | "type">>;
  interviewPrep: {
    title: string;
    practiceAreas: string[];
    questions: string[];
  };
}

export interface GeneratedLearningResource {
  mode: "reading" | "video" | "course" | "practice";
  title: string;
  provider: string;
  canonicalUrl: string;
  contentType: string;
  estimatedTime: string;
  whyUseful: string;
  priority: "Essential" | "Recommended";
  official: boolean;
  cost: ResourceCost;
  assessmentSeeds: Array<Pick<CareerQuizQuestion, "question" | "answers" | "correctAnswerIndex" | "explanation">>;
}

export interface GeneratedResourcePack {
  requirementId: string;
  milestoneId: string;
  resources: GeneratedLearningResource[];
}

export interface CareerResourceMapping {
  requirementId: string;
  milestoneId: string;
  reading?: string;
  video?: string;
  course?: string;
  practice?: string;
  status: "pending" | "partial" | "complete" | "needs-review";
}

export interface CareerGenerationMetadata {
  model: string;
  generatedAt: string;
  blueprintStatus: "generated" | "reviewed";
  resourceStatus: "pending" | "generated" | "needs-review" | "complete";
}