import { careerDomain } from "./careerIntelligence.ts";
import type { NormalizedJobSearchIntent } from "../../types/jobAgent.ts";

export type SearchQuery = { query: string; origin: "exact" | "market_variant" | "secondary" | "adjacent"; priority: number };

const ROLE_VARIANTS: Record<string, string[]> = {
  "ai automation specialist": ["Intelligent Automation Specialist", "Automation Solutions Specialist", "AI Workflow Specialist", "Intelligent Automation Engineer", "Automation Consultant", "AI Solutions Consultant"],
  "ai engineer": ["Applied AI Engineer", "Generative AI Engineer", "LLM Engineer", "Machine Learning Engineer"],
  "data analyst": ["Business Data Analyst", "BI Analyst", "Analytics Analyst", "Insights Analyst"],
  "microsoft copilot consultant": ["Copilot Studio Consultant", "Microsoft 365 Copilot Consultant", "Power Platform Consultant"],
};

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9+#]+/g, " ").replace(/\s+/g, " ").trim();

export function planSearchQueries(intent: NormalizedJobSearchIntent, limit = 8): SearchQuery[] {
  const trackQueries=(intent.careerTracks??[]).flatMap(track=>track.targetTitles.flatMap(title=>[
    {query:title,origin:"exact" as const,priority:110},
    ...(track.transition ? [{query:`Junior ${title.replace(/^(?:junior|associate)\s+/i,"")}`,origin:"market_variant" as const,priority:105}] : []),
  ]));
  const candidates: SearchQuery[] = [
    ...trackQueries,
    { query: intent.primaryTargetRole, origin: "exact", priority: 100 },
    ...(ROLE_VARIANTS[normalize(intent.primaryTargetRole)] ?? []).map((query, index) => ({ query, origin: "market_variant" as const, priority: 90 - index })),
    ...intent.soft.marketTitleVariants.map((query, index) => ({ query, origin: "market_variant" as const, priority: 80 - index })),
    ...intent.soft.secondaryRoles.map((query, index) => ({ query, origin: "secondary" as const, priority: 60 - index })),
    ...intent.soft.adjacentRoles.map((query, index) => ({ query, origin: "adjacent" as const, priority: 40 - index })),
  ];
  const seen = new Set<string>();
  const unique = candidates.sort((a, b) => b.priority - a.priority).filter((candidate) => {
    const key = normalize(candidate.query);
    if (!key || seen.has(key) || intent.hard.excludedRoles.some((excluded) => key.includes(normalize(excluded)))) return false;
    seen.add(key);
    return true;
  });
  // Reserve a query for each configured domain before title variants consume the budget.
  const domains=new Set<string>();
  const seeds=unique.filter(candidate=>{const domain=careerDomain(candidate.query);if(domains.has(domain)) return false;domains.add(domain);return true;});
  const selected=[...seeds,...unique.filter(candidate=>!seeds.includes(candidate))].slice(0,Math.max(1,Math.min(limit,12)));
  return selected.sort((a,b)=>b.priority-a.priority);
}
