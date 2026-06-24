// ─── Career Position ───────────────────────────────────────────────────────

export type DifficultyLevel =
  | "Beginner"
  | "Beginner to Intermediate"
  | "Intermediate"
  | "Advanced";

export type PositionStatus = "available" | "coming-soon";

export type AnalyzerTabId =
  | "market"
  | "skills"
  | "roadmap"
  | "certs"
  | "portfolio"
  | "countries"
  | "gap"
  | "strategy"
  | "cv";

export interface SkillInsight {
  category: "Technical" | "AI" | "Automation" | "Business";
  name: string;
  demand: number;
  frequencyLabel: string;
  difficulty: number;
  hireImpact: number;
}

export interface AnalyzerRoadmapPhase {
  phase: number;
  title: string;
  hours: number;
  color: string;
  topics: string[];
  freeResources: string[];
  paidResources: string[];
  exercise: string;
}

export interface CertificationInsight {
  name: string;
  value: string;
  cost: string;
  difficulty: string;
  roi: string;
  recommendation: string;
}

export interface PortfolioProjectInsight {
  rank: number;
  name: string;
  difficulty: string;
  techStack: string;
  timeEstimate: string;
  hiringScore: number;
}

export interface CountryInsight {
  rank: number;
  country: string;
  salary: string;
  vacancies: string;
  visa: string;
  english: string;
  remote: string;
  potential: string;
  note: string;
}

export interface GapItem {
  skill: string;
  urgency: "Critical" | "High" | "Medium";
}

export interface LearningStep {
  step: string;
  text: string;
  time: string;
}

export interface StrategyStage {
  title: string;
  tone: "blue" | "purple" | "green";
  items: string[];
}

export interface MarketStat {
  value: string;
  label: string;
  colorClass: string;
}

export interface JobTitleInsight {
  title: string;
  salary: string;
  demand: "Very High" | "High" | "Medium";
}

export interface HiringCompanyInsight {
  name: string;
  type: string;
  count: string;
}

export interface CareerAnalyzerContent {
  heroLabel: string;
  heroDescription: string;
  roleSummary: string;
  marketInsightTitle: string;
  marketInsightBody: string;
  marketStats: MarketStat[];
  topJobTitles: JobTitleInsight[];
  topHiringCompanies: HiringCompanyInsight[];
  skills: SkillInsight[];
  roadmapPhases: AnalyzerRoadmapPhase[];
  certifications: CertificationInsight[];
  portfolioProjects: PortfolioProjectInsight[];
  countries: CountryInsight[];
  gaps: GapItem[];
  learningSteps: LearningStep[];
  strategyStages: StrategyStage[];
  salaryStrategyResearch: string[];
  salaryStrategyNegotiation: string[];
  cvIntro: string;
}

export interface CareerPosition {
  id: string;
  title: string;
  description: string;
  level: DifficultyLevel;
  duration: string;
  category: string;
  keySkills: string[];
  status: PositionStatus;
  analyzerContent: CareerAnalyzerContent;
}

// ─── Landing Roadmap Preview ───────────────────────────────────────────────

export type PhaseAccessLevel = "free" | "locked";

export interface RoadmapPhase {
  phaseNumber: number;
  title: string;
  explanation: string;
  access: PhaseAccessLevel;
}

// ─── Pricing Plan ──────────────────────────────────────────────────────────

export type PricingTier = "free" | "single" | "all-access";

export interface PricingPlan {
  id: PricingTier;
  name: string;
  pricingLabel: string;
  features: string[];
  highlighted: boolean;
  ctaLabel: string;
}
