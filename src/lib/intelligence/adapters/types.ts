import type { CareerIntelligenceResult, IntelligenceFilters } from "@/types/careerIntelligence";
export interface IntelligenceSourceAdapter { readonly id:string; readonly sourceId:string; isConfigured():boolean; getCareerIntelligence(careerId:string, filters:IntelligenceFilters, signal?:AbortSignal):Promise<CareerIntelligenceResult>; }
export class IntelligenceSourceNotConfiguredError extends Error { constructor(public sourceId:string) { super(`Source not configured: ${sourceId}`); this.name="IntelligenceSourceNotConfiguredError"; } }
