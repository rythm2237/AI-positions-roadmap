/** Financial amounts are decimal strings of USD micro-units (1 USD = 1,000,000). */
export type Micros = string;
export type WorkspaceMode = "auto" | "fast" | "best";
export type Reasoning = "none" | "low" | "medium" | "high";
export type Permission = "read" | "write" | "send" | "delete" | "execute";

export interface ModelConfiguration {
  id: string;
  provider: "openai";
  enabled: boolean;
  /** USD micro-units per one million tokens. */
  inputRate: Micros;
  cachedInputRate: Micros;
  outputRate: Micros;
  contextTokens: number;
  maxOutputTokens: number;
  quality: number;
  latency: number;
  reasoning: Reasoning[];
  vision: boolean;
  tools: boolean;
  pricingVerifiedAt: string;
}

export interface SkillVersion {
  id: string;
  version: number;
  name: string;
  description: string;
  instructions: string;
  ownerId: string | null;
  projectId: string | null;
  category: string;
  enabled: boolean;
  allowedTools: string[];
}

export interface Intent {
  category: string;
  complexity: "simple" | "standard" | "complex";
  currentInformation: boolean;
  requiresVision: boolean;
}

export interface Entitlements {
  enabled: boolean;
  modes: WorkspaceMode[];
  models: string[];
  tools: string[];
  maxOutputTokens: number;
  maxContextTokens: number;
  maxRequestMicros: Micros;
}

export interface WorkspaceMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ExecutionRoute {
  model: ModelConfiguration;
  reasoning: Reasoning;
  inputTokenBound: number;
  maxOutputTokens: number;
  reservationMicros: Micros;
  intent: Intent;
}

export interface ProviderUsage {
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
}

export class WorkspaceError extends Error {
  readonly code: string;
  readonly status: number;
  constructor(code: string, status = 400) {
    super(code);
    this.code = code;
    this.status = status;
    this.name = "WorkspaceError";
  }
}
