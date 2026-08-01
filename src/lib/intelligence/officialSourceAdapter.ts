import type{IntelligenceCapability,SourceApprovalDecision}from"./sourceApproval.ts";import type{NormalizedObservationInput}from"./normalizedObservation.ts";
export type NormalizedObservationDraft=Omit<NormalizedObservationInput,"sourceId"|"sourceReleaseId">&{sourceSlug:string;sourceReleaseKey:string};
export type OfficialRefreshMode="dry-run"|"candidate-generation"|"publish";
export interface OfficialRefreshSelection{occupationFamilyId:string;occupationFamilySlug:string;countries:string[];capabilities:IntelligenceCapability[];querySize:number;queryDefinitionVersion:string;mode:OfficialRefreshMode;candidateId?:string}
export interface AdapterPlanItem{sourceSlug:string;countryCode:string;capability:IntelligenceCapability;endpoint:string;requestCount:number;estimatedResponseBytes:number;mappingVersion:string;queryDefinitionVersion:string}
export interface AdapterPlan{items:AdapterPlanItem[];totalRequests:number;estimatedResponseBytes:number;warnings:string[]}
export interface RetrievedRelease{providerReleaseId:string;releaseDate:string|null;referencePeriodStart:string;referencePeriodEnd:string;retrievedAt:string;sourceMetadata:Record<string,unknown>;records:unknown[]}
export interface OfficialSourceAdapter{id:string;countries:readonly string[];capabilities:readonly IntelligenceCapability[];plan(selection:OfficialRefreshSelection):Promise<AdapterPlan>;retrieve(item:AdapterPlanItem):Promise<RetrievedRelease>;normalize(item:AdapterPlanItem,release:RetrievedRelease):Promise<NormalizedObservationDraft[]>}
export interface ApprovedSourceRuntime{sourceId:string;sourceSlug:string;countryCode:string;capability:IntelligenceCapability;allowedOrigins:string[];approval:SourceApprovalDecision}
