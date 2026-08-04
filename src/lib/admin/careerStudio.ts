import { CAREER_CATALOG, type CareerCatalogEntry } from "../../data/careerCatalog.ts";
import type { ManagedCareer } from "@/types/adminStudio";
import type { CareerWorkspaceData } from "@/types/careerWorkspace";

export const CAREER_STUDIO_SECTIONS = ["overview","roadmap","learning","interview","jobs","salary","skills","projects","seo","settings"] as const;
export type CareerStudioSection = (typeof CAREER_STUDIO_SECTIONS)[number];
export type CompletenessState = "complete" | "partial" | "missing" | "not-applicable" | "error";
export type PublicationReadiness = "ready" | "ready-with-warnings" | "not-ready" | "published" | "coming-soon";
export interface CompletionBlocker { section: CareerStudioSection; message: string; severity: "required" | "warning" }
export interface CareerSectionScore { id: CareerStudioSection; label: string; score: number; state: CompletenessState; blockers: CompletionBlocker[] }
export interface CareerCompletionEvaluation { completion: number; sections: CareerSectionScore[]; blockers: CompletionBlocker[]; missingCount: number; readiness: PublicationReadiness }
export interface CareerStudioCatalogItem extends CareerCompletionEvaluation {
  catalog: CareerCatalogEntry; career: ManagedCareer | null;
  contentStatus: "published" | "draft" | "empty" | "coming-soon" | "archived";
}

type ExtendedWorkspace = CareerWorkspaceData & {
  seo?: { metaTitle?: string; metaDescription?: string; canonical?: string; structuredData?: unknown };
  settings?: { visibility?: string; publicationEnabled?: boolean };
  salaryTables?: unknown[];
};
const meaningful = (value: unknown, min = 2) => typeof value === "string" && value.trim().length >= min && !/^(research required|define |complete this|tbd|todo)/i.test(value.trim());
const list = (value: unknown) => Array.isArray(value) ? value : [];
const blocker = (section: CareerStudioSection, message: string, severity: "required"|"warning" = "required"): CompletionBlocker => ({section,message,severity});
const section = (id: CareerStudioSection, checks: boolean[], blockers: CompletionBlocker[], error = false): CareerSectionScore => {
  const score = checks.length ? Math.round(checks.filter(Boolean).length / checks.length * 100) : 0;
  return { id, label: title(id), score, blockers, state: error ? "error" : score === 100 ? "complete" : score === 0 ? "missing" : "partial" };
};

export function evaluateCareerCompletion(data: CareerWorkspaceData | null, options: { status?: ManagedCareer["status"]; availability?: CareerCatalogEntry["availability"]; validationErrors?: string[] } = {}): CareerCompletionEvaluation {
  if (!data) {
    const sections = CAREER_STUDIO_SECTIONS.map((id) => section(id,[false],[blocker(id,`${title(id)} content has not been created.`)]));
    return finalize(sections, options);
  }
  const extended = data as ExtendedWorkspace;
  const roadmap = list(data.roadmap) as CareerWorkspaceData["roadmap"];
  const milestones = list(data.journeyStages) as CareerWorkspaceData["journeyStages"];
  const projects = list(data.projects) as CareerWorkspaceData["projects"];
  const overviewChecks = [meaningful(data.title),meaningful(data.shortDescription,40),meaningful(data.overview?.title),meaningful(data.overview?.body,80),list(data.overview?.responsibilities).length>0,meaningful(data.category)];
  const roadmapChecks = [roadmap.length>0,roadmap.every((phase)=>meaningful(phase.title)&&meaningful(phase.goal,10)),roadmap.every((phase)=>list(phase.sections).some((item)=>meaningful(item))),roadmap.every((phase)=>list(phase.lessons).every((lesson)=>meaningful(lesson.title)&&meaningful(lesson.summary,10)))];
  const learningChecks = [milestones.length>0,milestones.every((item)=>meaningful(item.title)&&meaningful(item.summary,10)),milestones.every((item)=>list(item.resources).length>0),milestones.every((item)=>list(item.resources).every((resource)=>meaningful(resource.title)&&meaningful(resource.provider)&&/^https?:\/\//.test(resource.url??"")))];
  const interviewChecks = [meaningful(data.interviewPrep?.title),list(data.interviewPrep?.practiceAreas).length>=2,list(data.interviewPrep?.questions).some((question)=>meaningful(question,12))];
  const jobsChecks = [meaningful(data.jobBoard?.title),meaningful(data.jobBoard?.description,20),list(data.jobBoard?.filters).length>0,list(data.jobSearchTasks).length>0];
  const salaryChecks = [meaningful(data.salary),list(extended.salaryTables).length>0||meaningful(data.salary,8),meaningful(data.hiringDemand),meaningful(data.remoteAvailability)];
  const skillsChecks = [list(data.readiness).length>0,list(data.readiness).every((item)=>meaningful(item.label)&&meaningful(item.description,10)),list(data.bestFor).length>0,meaningful(data.programmingRequirement)];
  const projectChecks = [projects.length>0,projects.every((item)=>meaningful(item.title)&&meaningful(item.description,20)),projects.every((item)=>list(item.skills).length>0&&list(item.deliverables).length>0),list(data.portfolioTasks).length>0];
  const seoChecks = [meaningful(extended.seo?.metaTitle??data.title,20),meaningful(extended.seo?.metaDescription??data.shortDescription,80),meaningful(extended.seo?.canonical),Boolean(extended.seo?.structuredData),meaningful(data.visual?.imageAlt,10)];
  const settingsChecks = [/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug??""),meaningful(data.category),meaningful(extended.settings?.visibility),typeof extended.settings?.publicationEnabled==="boolean",meaningful(data.lastUpdated)];
  const sections = [
    section("overview",overviewChecks,requiredFailures("overview",overviewChecks,["Career title is missing.","Add a useful summary of at least 40 characters.","Overview title is missing.","Overview description needs substantive content.","Add at least one responsibility.","Career category is missing."])),
    section("roadmap",roadmapChecks,requiredFailures("roadmap",roadmapChecks,["Add at least one roadmap phase.","Every roadmap phase needs a title and goal.","Every roadmap phase needs at least one named step.","Roadmap lessons need usable titles and summaries."])),
    section("learning",learningChecks,requiredFailures("learning",learningChecks,["Add at least one learning milestone.","Every milestone needs a title and description.","One or more milestones have no resources.","Learning resources need title, provider, and valid URL."],2)),
    section("interview",interviewChecks,requiredFailures("interview",interviewChecks,["Interview section title is missing.","Add at least two interview practice categories.","Add meaningful interview questions."])),
    section("jobs",jobsChecks,requiredFailures("jobs",jobsChecks,["Jobs title is missing.","Jobs guidance is missing.","Add at least one job filter.","Add at least one job-search task."],2)),
    section("salary",salaryChecks,requiredFailures("salary",salaryChecks,["Salary summary is missing.","Add salary data or a supported salary table.","Hiring-demand guidance is missing.","Remote-work guidance is missing."],1)),
    section("skills",skillsChecks,requiredFailures("skills",skillsChecks,["Add a meaningful skills/readiness list.","Skills need labels and descriptions.","Add audience-fit guidance.","Programming requirement is missing."])),
    section("projects",projectChecks,requiredFailures("projects",projectChecks,["Add at least one portfolio project.","Projects need titles and descriptions.","Projects need skills and deliverables.","Add at least one portfolio task."],2)),
    section("seo",seoChecks,requiredFailures("seo",seoChecks,["Meta title is missing.","Meta description needs at least 80 characters.","Canonical URL is missing.","Structured data is missing.","Social image alternative text is missing."],2)),
    section("settings",settingsChecks,requiredFailures("settings",settingsChecks,["Career slug is invalid.","Career category is missing.","Visibility is not configured.","Publication configuration is missing.","Last-updated date is missing."])),
  ];
  if (options.validationErrors?.length) sections.find((item)=>item.id==="settings")?.blockers.push(blocker("settings",`${options.validationErrors.length} workspace validation finding(s) must be resolved.`));
  return finalize(sections,options);
}

function requiredFailures(id: CareerStudioSection, checks:boolean[], messages:string[], warningFrom=Number.POSITIVE_INFINITY){return checks.flatMap((ok,index)=>ok?[]:[blocker(id,messages[index],index>=warningFrom?"warning":"required")])}
function finalize(sections:CareerSectionScore[],options:{status?:ManagedCareer["status"];availability?:CareerCatalogEntry["availability"]}){
  const blockers=sections.flatMap((item)=>item.blockers), required=blockers.filter((item)=>item.severity==="required");
  const completion=Math.round(sections.reduce((sum,item)=>sum+item.score,0)/sections.length),missingCount=sections.filter((item)=>item.state==="missing"||item.state==="error").length;
  const readiness:PublicationReadiness=options.availability==="planned"?"coming-soon":options.status==="published"?"published":required.length?"not-ready":blockers.length?"ready-with-warnings":"ready";
  return{completion,sections,blockers,missingCount,readiness};
}
export function scoreCareerSections(data:CareerWorkspaceData|null){return evaluateCareerCompletion(data).sections}
export function buildCareerStudioCatalog(careers:ManagedCareer[]):CareerStudioCatalogItem[]{const managed=new Map(careers.map((career)=>[career.slug,career]));return CAREER_CATALOG.map((catalog)=>{const career=managed.get(catalog.slug)??null;const evaluation=evaluateCareerCompletion(career?.workspace_data??null,{status:career?.status,availability:catalog.availability,validationErrors:career?.validation_errors});return{catalog,career,...evaluation,contentStatus:career?.status==="archived"?"archived":career?.status==="published"?"published":career?"draft":catalog.availability==="planned"?"coming-soon":"empty"}})}
export function title(value:string){return value.replace(/-/g," ").replace(/\b\w/g,(letter)=>letter.toUpperCase())}
