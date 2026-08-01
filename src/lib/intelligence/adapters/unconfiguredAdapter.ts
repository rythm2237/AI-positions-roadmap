import type { IntelligenceSourceAdapter } from "./types";
import { IntelligenceSourceNotConfiguredError } from "./types";
export class UnconfiguredIntelligenceAdapter implements IntelligenceSourceAdapter { readonly id="unconfigured-market"; readonly sourceId="jobs.provider.unconfigured"; isConfigured(){return false;} async getCareerIntelligence():Promise<never>{throw new IntelligenceSourceNotConfiguredError(this.sourceId);} }
