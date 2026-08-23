import type { ApplyDecision } from "@/lib/jobMatch";

export type ApplicationStage = "planned" | "applied" | "screening" | "interview" | "offer" | "rejected" | "withdrawn";

export interface TrackedApplication {
  id: string;
  matchId?: string;
  title: string;
  company: string;
  matchScore?: number;
  decision?: ApplyDecision;
  stage: ApplicationStage;
  appliedAt?: string;
  nextFollowUpAt?: string;
  lastActivityAt: string;
  notes: string;
}

export interface ApplicationMetrics {
  total: number;
  active: number;
  interviews: number;
  offers: number;
  closed: number;
  responseRate: number;
  interviewRate: number;
}

export function applicationTrackerStorageKey(careerSlug: string): string {
  return `career_applications__${careerSlug}`;
}

export function getApplicationMetrics(items: TrackedApplication[]): ApplicationMetrics {
  const activeStages: ApplicationStage[] = ["applied", "screening", "interview"];
  const responded = items.filter((item) => ["screening", "interview", "offer", "rejected"].includes(item.stage)).length;
  const interviews = items.filter((item) => item.stage === "interview" || item.stage === "offer").length;
  const offers = items.filter((item) => item.stage === "offer").length;
  const closed = items.filter((item) => ["offer", "rejected", "withdrawn"].includes(item.stage)).length;
  const appliedBase = items.filter((item) => item.stage !== "planned").length;
  return {
    total: items.length,
    active: items.filter((item) => activeStages.includes(item.stage)).length,
    interviews,
    offers,
    closed,
    responseRate: appliedBase ? Math.round((responded / appliedBase) * 100) : 0,
    interviewRate: appliedBase ? Math.round((interviews / appliedBase) * 100) : 0,
  };
}

export function nextTrackerAction(items: TrackedApplication[], now = new Date()): string {
  const overdue = items.filter((item) => item.nextFollowUpAt && new Date(item.nextFollowUpAt) <= now && !["offer", "rejected", "withdrawn"].includes(item.stage));
  if (overdue.length) return `Follow up on ${overdue[0].company || overdue[0].title}; ${overdue.length} follow-up${overdue.length === 1 ? " is" : "s are"} due.`;
  const interview = items.find((item) => item.stage === "interview");
  if (interview) return `Prepare for the interview with ${interview.company || interview.title}.`;
  const planned = items.find((item) => item.stage === "planned");
  if (planned) return `Decide whether to apply for ${planned.title}${planned.company ? ` at ${planned.company}` : ""}.`;
  return "Add a qualified opportunity from Job Match and keep the pipeline current.";
}
