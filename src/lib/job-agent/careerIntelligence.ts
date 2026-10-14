import type { CareerEvidenceItem, CareerTrack, EligibilityReason, NormalizedJobSearchIntent } from '../../types/jobAgent.ts';
import type { CanonicalJobCandidate } from './contracts.ts';

export const CAREER_GATE_VERSION = 'career-gate-v1';
export const DOMAINS = {
  operations: /\b(fulfil[l]?ment|replenishment|warehouse|logistics|supply chain|stock flow|flow planner|operations|operations specialist|operations? planner|production planner)\b/i,
  ai_automation: /\b(ai|artificial intelligence|machine learning|automation|power platform|power apps|power automate|copilot|digital transformation)\b/i,
  marketing: /\b(seo|geo specialist|marketing|gtm|content|growth)\b/i,
  product_management: /\bproduct manag(?:er|ement)\b/i,
  project_management: /\bproject manag(?:er|ement)\b/i,
  business_analysis: /\b(business analyst|business analysis)\b/i,
  software: /\b(software|developer|programmer|full.stack|frontend|backend|engineering)\b/i,
  data: /\b(data scientist|data analyst|analytics|business intelligence|power bi)\b/i,
};
export function careerDomain(text: string): string {
  return Object.entries(DOMAINS).find(([, pattern]) => pattern.test(text))?.[0] ?? 'unknown';
}
export const LEVELS = ['internship','graduate','entry','junior','associate','mid','specialist','senior','lead','principal','manager','head','director','executive','unknown'] as const;
export type Seniority = typeof LEVELS[number];
export function levelRank(level: string | null | undefined): number | null {
  const s = (level ?? '').toLowerCase().replace(/[-_]/g,' ');
  if (/executive|chief|\bc[etfo]o\b/.test(s)) return 7;
  if (/director|head|vice president|\bvp\b/.test(s)) return 6;
  if (/lead|principal|staff/.test(s)) return 5;
  if (/senior|\bsr\b/.test(s)) return 4;
  if (/manager/.test(s)) return 4;
  if (/mid|intermediate/.test(s)) return 3;
  if (/specialist/.test(s)) return 2;
  if (/associate/.test(s)) return 2;
  if (/junior|\bjr\b/.test(s)) return 1;
  if (/entry|intern|graduate|trainee/.test(s)) return 0;
  return null;
}
const preferred = /\b(preferred|desirable|nice.to.have|bonus|ideally|advantage|von vorteil|wünschenswert)\b/i;
export function classifyJob(job: Pick<CanonicalJobCandidate,'title'|'description'|'seniority'|'descriptionComplete'>) {
  const evidence: string[] = [];
  const years: Array<{minimum:number; preferred:boolean; domain:string; evidence:string}> = [];
  for (const clause of job.description.split(/[\n;.!?]+/).filter(Boolean)) {
    const match = clause.match(/\b(\d{1,2})(?:\s*[-–]\s*\d{1,2})?\s*\+?\s*(?:years?|yrs?|jahre[n]?)\b[^\n]{0,100}\b(?:experience|background|expertise|berufserfahrung|erfahrung)\b/i)
      ?? clause.match(/\b(?:experience|background|berufserfahrung|erfahrung)\b[^\n]{0,60}\b(\d{1,2})\s*\+?\s*(?:years?|yrs?|jahre[n]?)\b/i);
    if (match) years.push({minimum:Number(match[1]),preferred:preferred.test(clause),domain:careerDomain(clause),evidence:clause.trim().slice(0,400)});
  }
  const peopleManagement = /\b(?:manage|lead|supervise)\s+(?:a\s+)?(?:team of|direct reports|engineers|employees)|\b(?:people management|hiring and performance|line management)\b/i.test(job.description);
  const architectureOwnership = /\b(?:own|lead|define)\b[^.\n]{0,65}\b(?:enterprise|technical|solution) architecture\b/i.test(job.description);
  let seniority: Seniority = 'unknown';
  const t = job.title;
  const titleRules: Array<[Seniority,RegExp]> = [
    ['executive',/\b(chief|ceo|cto|cfo|vice president|vp)\b/i],['director',/\bdirector\b/i],['head',/\bhead\b/i],
    ['principal',/\b(principal|staff)\b/i],['lead',/\b(?:lead|team lead)\b/i],
    ['senior',/\b(senior|sr)\b/i],['internship',/\bintern(?:ship)?\b/i],['graduate',/\b(graduate|trainee)\b/i],
    ['junior',/\b(junior|jr)\b/i],['entry',/\bentry.level\b/i],['associate',/\bassociate\b/i],['specialist',/\bspecialist\b/i],['mid',/\b(mid.level|intermediate)\b/i],
  ];
  for (const [level,pattern] of titleRules) if(pattern.test(t)) {seniority=level;evidence.push(`Title: ${t}`);break;}
  // Manager is a function in Project/Product/Account Manager titles, not proof of direct reports.
  if (peopleManagement && (levelRank(seniority) ?? 0)<4) {seniority='manager';evidence.push('Description explicitly requires people management');}
  const providerRank=levelRank(job.seniority);
  if(providerRank!==null && providerRank>=4 && providerRank>(levelRank(seniority)??0)) {
    seniority=LEVELS.find(level=>job.seniority?.toLowerCase().includes(level)) ?? (providerRank>=7?'executive':providerRank>=6?'director':providerRank>=5?'lead':'senior');
    evidence.push(`Provider seniority evidence: ${job.seniority}`);
  }
  const mandatoryYears = Math.max(0,...years.filter(x=>!x.preferred).map(x=>x.minimum));
  if (mandatoryYears>=5 && (levelRank(seniority) ?? 0)<4) {seniority='senior'; evidence.push(...years.filter(x=>!x.preferred).map(x=>x.evidence));}
  if (architectureOwnership && (levelRank(seniority) ?? 0)<4) {seniority='senior';evidence.push('Enterprise architecture ownership');}
  if(seniority==='unknown' && job.seniority && levelRank(job.seniority)!==null) {
    const normalized=job.seniority.toLowerCase();
    seniority=LEVELS.find(l=>normalized.includes(l)) ?? 'unknown'; evidence.push(`Provider: ${job.seniority}`);
  }
  return {seniority,domain:careerDomain(t),years,mandatoryYears,peopleManagement,architectureOwnership,
    confidence: seniority!=='unknown' && job.descriptionComplete ? 'high' : 'low',evidence};
}
export function inferCareerTracks(intent: NormalizedJobSearchIntent, evidence: CareerEvidenceItem[]): CareerTrack[] {
  if(intent.careerTracks?.length) return intent.careerTracks;
  const titles=[intent.primaryTargetRole,...intent.soft.secondaryRoles,...intent.soft.marketTitleVariants,...intent.soft.adjacentRoles];
  return [...new Set(titles.map(careerDomain))].map(domain=>{
    const direct=evidence.filter(e=>e.evidenceType==='role_history' && e.provenance.scope!=='total_experience' && careerDomain(e.value)===domain && domain!=='unknown');
    // Unknown duration is kept unknown. Portfolio work and total employment years never become domain years.
    const durations=direct.flatMap(e=>e.durationMonths===null?[]:[e.durationMonths]);
    return {id:domain,name:domain.replaceAll('_',' '),domain,targetTitles:titles.filter(t=>careerDomain(t)===domain),
      directYears:durations.length?Math.max(...durations)/12:direct.length?null:0,
      maximumSeniority:direct.length?'specialist':'associate',transition:!direct.length,maximumRequiredYears:null,
      flexibility:'standard',mandatorySkills:[],preferredSkills:[],industries:[],qualifications:[],
      professionalEvidence:direct.map(e=>e.id??e.fingerprint),projectEvidence:evidence.filter(e=>e.evidenceType==='project_implementation'||e.evidenceType==='portfolio_artifact').map(e=>e.id??e.fingerprint),
      confirmed:false};
  });
}
export function evaluateCareerEligibility(job: CanonicalJobCandidate,intent:NormalizedJobSearchIntent,evidence:CareerEvidenceItem[]) {
  const analysis=classifyJob(job);
  const tracks=inferCareerTracks(intent,evidence);
  const track=tracks.find(t=>t.domain===analysis.domain);
  const reasons:EligibilityReason[]=[];
  const add=(code:string,outcome:'block'|'unknown',message:string,proof:string|null=null)=>reasons.push({code,outcome,field:'career',message,evidence:proof});
  if(!track && analysis.domain!=='unknown') add('WRONG_CAREER_DOMAIN','block','Vacancy belongs to a domain outside the configured career tracks.',analysis.domain);
  else if(!track || analysis.domain==='unknown') add('CAREER_TRACK_UNKNOWN','unknown','Confirm the relevant career track for this vacancy.');
  if(track) {
    for(const skill of track.mandatorySkills??[]) if(!job.description.toLowerCase().includes(skill.toLowerCase())) add('TRACK_REQUIRED_SKILL_UNKNOWN','unknown',`Vacancy does not confirm your required skill: ${skill}.`);
    const rank=levelRank(analysis.seniority),max=levelRank(track.maximumSeniority);
    if(rank!==null && max!==null && rank>max) add('TRACK_SENIORITY_CONFLICT','block',`Role is ${analysis.seniority}; track ${track.name} targets up to ${track.maximumSeniority}.`,analysis.evidence.join('; '));
    for(const requirement of analysis.years.filter(y=>!y.preferred)) {
      // A vacancy may require experience in a second domain. Do not borrow the selected track's years.
      const relevant=requirement.domain==='unknown'?track:tracks.find(t=>t.domain===requirement.domain);
      if(track.maximumRequiredYears!==null && requirement.minimum>track.maximumRequiredYears) add('EXPERIENCE_PREFERENCE_CONFLICT','block',`Mandatory ${requirement.minimum} years exceeds the track's configured maximum.`,requirement.evidence);
      if(!relevant || relevant.directYears===null) add('DOMAIN_EXPERIENCE_UNKNOWN','unknown','Relevant professional experience duration needs confirmation.',requirement.evidence);
      else if(requirement.minimum>relevant.directYears) add('MANDATORY_EXPERIENCE_MISSING','block',`Requires ${requirement.minimum} professional years; ${relevant.directYears} evidenced in ${relevant.name}.`,requirement.evidence);
    }
    if(analysis.peopleManagement && !evidence.some(e=>e.evidenceType==='role_history' && careerDomain(e.value)===track.domain && e.provenance.peopleManagement===true)) add('LEADERSHIP_EVIDENCE_UNKNOWN','unknown','People management experience needs confirmation.');
  }
  if(analysis.confidence==='low' && analysis.seniority==='unknown') add('SENIORITY_REVIEW_REQUIRED','unknown','Seniority needs review; experience requirements were not inferred from keywords.');
  return {analysis,track,reasons,status:reasons.some(r=>r.outcome==='block')?'blocked' as const:reasons.length?'unverified' as const:'eligible' as const};
}
export function parseCareerTracks(value:unknown):CareerTrack[] {
  if(!Array.isArray(value)||value.length>12) throw new Error('Invalid career tracks');
  return value.map(raw=>{
    if(!raw||typeof raw!=='object') throw new Error('Invalid track');
    const t=raw as CareerTrack;
    if(typeof t.id!=='string'||typeof t.name!=='string'||typeof t.domain!=='string'||!t.targetTitles?.every(x=>typeof x==='string')||levelRank(t.maximumSeniority)===null) throw new Error('Invalid track fields');
    for(const n of [t.directYears,t.maximumRequiredYears]) if(n!==null && (typeof n!=='number'||!Number.isFinite(n)||n<0||n>60)) throw new Error('Invalid track years');
    return {...t,confirmed:true};
  });
}
