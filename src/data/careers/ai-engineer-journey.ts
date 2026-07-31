import { aiEngineerCareer } from "@/data/careers/ai-engineer";
import { formatEffortRange } from "@/lib/careerEffort";
import { validateJourneyData } from "@/lib/journey/validateJourneyData";
import type { CareerAssessment, CareerResource, CareerJourneyStage } from "@/types/careerWorkspace";
import type { CareerJourneyData, JourneyResource, JourneyStationVisualType } from "@/types/careerJourney";

const access = (cost: CareerResource["cost"]): JourneyResource["access"] =>
  cost === "Free" ? "free" : cost === "Paid" ? "paid" : "freemium";

const resourceType = (type: CareerResource["type"]): JourneyResource["type"] =>
  type === "Exam" ? "practice" : type.toLowerCase() as JourneyResource["type"];

const visualType: Record<CareerJourneyStage["type"], JourneyStationVisualType> = {
  orientation: "camp", foundation: "mountain", "core-skills": "library", tools: "workshop",
  projects: "bridge", portfolio: "tower", resume: "village", profile: "city",
  "job-search": "harbor", jobs: "gate", interview: "ruins", assessment: "mountain", ready: "launch-point",
};

const stations = aiEngineerCareer.journeyStages.map((stage, index, stages) => ({
  id: stage.id,
  order: stage.order,
  phaseId: `journey-phase-${stage.order}`,
  title: stage.title,
  shortTitle: stage.label,
  summary: stage.summary,
  description: stage.explanation,
  position: { x: stage.x, y: stage.y },
  visualType: visualType[stage.type],
  estimatedTime: stage.estimatedEffort
    ? formatEffortRange(stage.estimatedEffort)
    : "Estimate pending",
  prerequisites: index ? [stages[index - 1].id] : [],
  lessons: stage.lessons.map((title, lessonIndex) => ({ id: `${stage.id}-lesson-${lessonIndex + 1}`, title })),
  resources: stage.resources.map((resource) => ({
    id: resource.id, title: resource.title, type: resourceType(resource.type), provider: resource.provider,
    url: resource.url, access: access(resource.cost), estimatedTime: resource.estimatedTime,
    priority: resource.priority.toLowerCase() as JourneyResource["priority"], description: resource.whyUseful,
  })),
  missions: stage.tasks.map((task) => ({ ...task, required: true })),
  test: {
    ...(stage.topicAssessments?.[0] as CareerAssessment),
    required: true,
    kind: stage.type === "assessment" ? "final" as const : "station" as const,
  },
  phaseTest: stage.phaseExam ? { ...stage.phaseExam, required: true, kind: "phase" as const } : undefined,
  noteContext: { careerId: aiEngineerCareer.slug, phaseId: `journey-phase-${stage.order}`, stationId: stage.id },
  previousStationId: stages[index - 1]?.id,
  nextStationId: stages[index + 1]?.id,
}));

const mapPadding = aiEngineerCareer.journeyMap.worldPadding ?? 760;

export const aiEngineerJourneyData: CareerJourneyData = {
  careerId: aiEngineerCareer.slug,
  slug: aiEngineerCareer.slug,
  themeId: aiEngineerCareer.journeyMap.theme,
  map: {
    width: aiEngineerCareer.journeyMap.width ?? Math.max(...stations.map(({ position }) => position.x)) + mapPadding,
    height: aiEngineerCareer.journeyMap.height ?? Math.max(...stations.map(({ position }) => position.y)) + Math.round(mapPadding * 0.64),
    overviewPadding: mapPadding,
  },
  phases: stations.map((station) => ({
    id: station.phaseId, order: station.order, title: station.title, summary: station.summary,
    stationIds: [station.id], test: station.phaseTest,
  })),
  stations,
  connections: stations.slice(0, -1).map((station, index) => ({
    from: station.id, to: stations[index + 1].id, type: "primary",
  })),
};

/** Exposed for build tooling and future content pipelines; the current UI remains unchanged. */
export const aiEngineerJourneyValidation = validateJourneyData(aiEngineerJourneyData);
