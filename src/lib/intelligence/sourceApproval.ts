export const INTELLIGENCE_CAPABILITIES=["salary","employment_count","historical_trend","outlook","regional_hotspots"] as const;
export type IntelligenceCapability=typeof INTELLIGENCE_CAPABILITIES[number];
export type RightsDecision="yes"|"no"|"unknown";
export type ApprovalStatus="draft"|"approved"|"conditional"|"suspended"|"expired";
export interface SourceApprovalDecision{approvalStatus:ApprovalStatus;commercialUse:RightsDecision;redistribution:RightsDecision;aggregation:RightsDecision;derivedStatistics:RightsDecision;localStorage:RightsDecision;attributionText:string;reviewedAt:string|null;expiresAt:string|null}

export function canUseSourceInProduction(value:SourceApprovalDecision,now=new Date()){
  const approved=value.approvalStatus==="approved"||value.approvalStatus==="conditional";
  const rights=[value.commercialUse,value.redistribution,value.aggregation,value.derivedStatistics,value.localStorage].every(item=>item==="yes");
  const current=Boolean(value.reviewedAt)&&Boolean(value.expiresAt)&&Date.parse(value.expiresAt!)>now.getTime();
  return approved&&rights&&current&&value.attributionText.trim().length>0;
}

export function isAllowlistedEndpoint(rawUrl:string,allowedOrigins:string[]){
  try{const url=new URL(rawUrl);return url.protocol==="https:"&&allowedOrigins.some(origin=>{const allowed=new URL(origin);return allowed.protocol==="https:"&&url.origin===allowed.origin})}catch{return false}
}
