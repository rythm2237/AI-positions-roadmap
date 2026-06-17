// ─── Career Position ───────────────────────────────────────────────────────

export type DifficultyLevel =
  | "Beginner"
  | "Beginner to Intermediate"
  | "Intermediate"
  | "Advanced";

export type PositionStatus = "mvp-ready" | "coming-soon";

export interface CareerPosition {
  id: string;
  title: string;
  description: string;
  level: DifficultyLevel;
  duration: string;
  category: string;
  keySkills: string[];
  status: PositionStatus;
}

// ─── Roadmap Phase ─────────────────────────────────────────────────────────

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
