import type {
  CareerAssessment,
  CareerJourneyStage,
  CareerMapSection,
  CareerQuizQuestion,
  CareerResource,
  CareerWorkspaceData,
} from "@/types/careerWorkspace";
import type { ResourceRequirement } from "@/types/resourceRequirement";
import type {
  GeneratedCareerBlueprint,
  GeneratedCareerStage,
  GeneratedLearningResource,
  GeneratedResourcePack,
} from "@/types/careerGeneration";
import { normalizeCareerSlug } from "../admin/careerValidation.ts";

const JOURNEY_MAP_WIDTH = 3200;
const JOURNEY_MAP_HEIGHT = 2200;

const coordinatePercentages = [
  [18, 12], [38, 20], [63, 14], [78, 28], [66, 43],
  [42, 39], [22, 53], [39, 66], [65, 62], [79, 78],
] as const;

const mapSections: CareerMapSection[] = [
  { id: "hero", label: "Career", eyebrow: "Discover", summary: "Role identity, fit and professional scope.", x: 14, y: 16 },
  { id: "intelligence", label: "Intelligence", eyebrow: "Understand", summary: "Market context and career signals.", x: 35, y: 21 },
  { id: "roadmap", label: "Roadmap", eyebrow: "Plan", summary: "Career-specific phases and outcomes.", x: 58, y: 18 },
  { id: "learning", label: "Learning", eyebrow: "Learn", summary: "Mapped reading, video and practice resources.", x: 77, y: 32 },
  { id: "project", label: "Projects", eyebrow: "Build", summary: "Employer-relevant proof of skill.", x: 66, y: 51 },
  { id: "portfolio", label: "Portfolio", eyebrow: "Prove", summary: "Evidence, narrative and presentation.", x: 43, y: 57 },
  { id: "jobs", label: "Jobs", eyebrow: "Apply", summary: "Search, positioning and applications.", x: 26, y: 72 },
  { id: "interview-brief", label: "Interview", eyebrow: "Validate", summary: "Practice and final readiness.", x: 58, y: 82 },
];

function idPart(value: string) {
  return normalizeCareerSlug(value) || "item";
}

function rotateAnswers(correct: string, distractors: string[], offset: number) {
  const answers = [correct, ...distractors].slice(0, 4);
  const shift = offset % answers.length;
  const rotated = [...answers.slice(shift), ...answers.slice(0, shift)];
  return { answers: rotated, correctAnswerIndex: rotated.indexOf(correct) };
}

function phaseQuestion(
  slug: string,
  stage: GeneratedCareerStage,
  stageIndex: number,
  questionIndex: number,
): CareerQuizQuestion {
  const seed = stage.assessmentSeeds[questionIndex % stage.assessmentSeeds.length];
  const mode = questionIndex % 4;
  const prompts = [
    `In this ${stage.title} scenario, what is the strongest professional response? ${seed.scenario}`,
    `Which principle best demonstrates readiness for ${stage.title}? ${seed.scenario}`,
    `A reviewer challenges the evidence produced in ${stage.title}. What should the practitioner defend first?`,
    `What choice most directly supports the outcome “${stage.expectedOutcome}”?`,
  ];
  const { answers, correctAnswerIndex } = rotateAnswers(
    seed.correctPrinciple,
    [seed.commonMistake, "Skip validation and rely on assumptions", "Use an unrelated shortcut without documenting trade-offs"],
    questionIndex,
  );
  return {
    id: `${slug}-stage-${stageIndex + 1}-q${questionIndex + 1}`,
    question: prompts[mode],
    answers,
    correctAnswerIndex,
    explanation: `${seed.correctPrinciple} is the defensible approach. The common failure mode is: ${seed.commonMistake}`,
    difficulty: stage.skillLevel,
    relatedTopic: stage.resourceTopic,
    learningObjectiveId: `${slug}-stage-${stageIndex + 1}-outcome-${(questionIndex % stage.learningOutcomes.length) + 1}`,
    skillLevel: stage.skillLevel,
    questionType: mode === 0 ? "scenario" : "multiple-choice",
    status: "needs-review",
    lastReviewedAt: new Date().toISOString().slice(0, 10),
    version: 1,
  };
}

function buildPhaseExam(slug: string, stage: GeneratedCareerStage, stageIndex: number): CareerAssessment {
  return {
    id: `${slug}-stage-${stageIndex + 1}-exam`,
    title: `${stage.title} comprehensive assessment`,
    description: `Twenty career-specific questions covering the declared outcomes, practical judgment and evidence expectations for ${stage.title}.`,
    passingScore: 70,
    assessmentType: "comprehensive",
    durationMinutes: 35,
    questionsPerAttempt: 20,
    questions: Array.from({ length: 20 }, (_, questionIndex) =>
      phaseQuestion(slug, stage, stageIndex, questionIndex),
    ),
  };
}

function normalizeReadinessWeights(items: GeneratedCareerBlueprint["readiness"]) {
  const total = items.reduce((sum, item) => sum + Math.max(1, item.weight), 0);
  let allocated = 0;
  return items.map((item, index) => {
    const weight = index === items.length - 1
      ? 100 - allocated
      : Math.max(1, Math.round((Math.max(1, item.weight) / total) * 100));
    allocated += weight;
    return { id: `readiness-${index + 1}`, label: item.label, description: item.description, weight };
  });
}

function buildRequirement(slug: string, stage: GeneratedCareerStage, stageIndex: number): ResourceRequirement {
  return {
    id: `${slug}-stage-${stageIndex + 1}-resource-requirement`,
    careerSlug: slug,
    milestoneId: `${slug}-stage-${stageIndex + 1}`,
    topic: stage.resourceTopic,
    requiredModes: ["reading", "video", "practice"],
    requiredLearningOutcomes: stage.learningOutcomes,
    skillLevel: stage.skillLevel,
    allowedContentTypes: ["documentation", "official-course", "video-course", "hands-on-lab", "guided-module"],
    preferredProviders: stage.preferredProviders,
    officialPreferred: true,
    freePreferred: true,
    estimatedDuration: {
      minMinutes: Math.max(45, Math.round(stage.effortMinutes.min * 0.25)),
      maxMinutes: Math.max(90, Math.round(stage.effortMinutes.max * 0.4)),
    },
    resourceIds: [],
  };
}

export function assembleCareerWorkspace(
  blueprint: GeneratedCareerBlueprint,
  slug = normalizeCareerSlug(blueprint.title),
): CareerWorkspaceData {
  const resourceRequirements = blueprint.stages.map((stage, index) => buildRequirement(slug, stage, index));
  const journeyStages: CareerJourneyStage[] = blueprint.stages.map((stage, index) => {
    const [xPercent, yPercent] = coordinatePercentages[index] ?? [50, 50];
    const x = Math.round((xPercent / 100) * JOURNEY_MAP_WIDTH);
    const y = Math.round((yPercent / 100) * JOURNEY_MAP_HEIGHT);
    const assessment = buildPhaseExam(slug, stage, index);
    const assessmentMinutes = 40;
    const normalizedMaxEffort = Math.max(stage.effortMinutes.min, stage.effortMinutes.max);
    const activityMin = Math.max(30, stage.effortMinutes.min - assessmentMinutes);
    const activityMax = Math.max(activityMin, normalizedMaxEffort - assessmentMinutes);
    return {
      id: `${slug}-stage-${index + 1}`,
      order: index + 1,
      title: stage.title,
      // The map label is the Career-specific checkpoint name. Stage order is
      // rendered separately, while Current/Complete/Locked remains a status.
      label: stage.title,
      type: stage.type,
      landmark: stage.landmark,
      theme: stage.theme,
      x,
      y,
      connections: index < blueprint.stages.length - 1 ? [`${slug}-stage-${index + 2}`] : [],
      summary: stage.summary,
      explanation: stage.explanation,
      lessons: stage.lessons,
      resources: [],
      tasks: stage.tasks.map((task, taskIndex) => ({
        id: `${slug}-stage-${index + 1}-task-${taskIndex + 1}`,
        ...task,
      })),
      topicAssessments: [],
      phaseExam: assessment,
      estimatedEffort: {
        minMinutes: activityMin + assessmentMinutes,
        maxMinutes: activityMax + assessmentMinutes,
        breakdown: {
          resources: { minMinutes: 0, maxMinutes: 0 },
          activities: { minMinutes: activityMin, maxMinutes: activityMax },
          assessment: { minMinutes: assessmentMinutes, maxMinutes: assessmentMinutes },
        },
      },
    };
  });

  return {
    slug,
    title: blueprint.title,
    titleAliases: [...new Map(
      blueprint.aliases
        .map((alias) => alias.trim())
        .filter((alias) => alias && alias.toLocaleLowerCase("en") !== blueprint.title.toLocaleLowerCase("en"))
        .map((alias) => [alias.toLocaleLowerCase("en"), alias] as const),
    ).values()].map((title) => ({ title, note: "AI-generated market title variant; confirm against current vacancies." })),
    category: blueprint.category,
    visual: {
      nodeLabel: `${blueprint.shortTitle} career node`,
      sceneTitle: `${blueprint.title} professional journey`,
      sceneDescription: blueprint.journeyDescription,
      imageAlt: `Interactive roadmap for becoming a ${blueprint.title}`,
    },
    shortDescription: blueprint.summary,
    difficulty: blueprint.difficulty,
    estimatedLearningTime: blueprint.estimatedLearningTime,
    salary: blueprint.salaryContext,
    hiringDemand: blueprint.hiringDemandContext,
    remoteAvailability: blueprint.remoteAvailability,
    aiCompatibilityScore: blueprint.aiCompatibility,
    bestFor: blueprint.bestFor,
    programmingRequirement: blueprint.programmingRequirement,
    mathRequirement: blueprint.mathRequirement,
    creativityLevel: blueprint.creativityLevel,
    communicationLevel: blueprint.communicationLevel,
    lastUpdated: new Date().toISOString().slice(0, 10),
    metrics: blueprint.metrics,
    overview: blueprint.overview,
    mapSections,
    journeyMap: {
      theme: blueprint.journeyTheme,
      overviewTitle: `${blueprint.shortTitle} journey`,
      overviewDescription: blueprint.journeyDescription,
      width: JOURNEY_MAP_WIDTH,
      height: JOURNEY_MAP_HEIGHT,
      worldPadding: 240,
    },
    journeyStages,
    roadmap: blueprint.stages.map((stage, index) => ({
      id: `${slug}-phase-${index + 1}`,
      phaseNumber: index + 1,
      title: stage.title,
      duration: `${Math.ceil(stage.effortMinutes.min / 60)}–${Math.ceil(stage.effortMinutes.max / 60)} hours`,
      goal: stage.phaseGoal,
      status: index === 0 ? "unlocked" : "locked",
      mentorTip: stage.mentorTip,
      sections: stage.learningOutcomes,
      lessons: stage.lessons.map((lesson, lessonIndex) => ({
        id: `${slug}-phase-${index + 1}-lesson-${lessonIndex + 1}`,
        title: lesson,
        summary: `Develop and demonstrate ${lesson.toLocaleLowerCase("en")} in the context of ${blueprint.title}.`,
        estimatedTime: "60–120 minutes",
        difficulty: stage.skillLevel,
        outcomes: [stage.learningOutcomes[lessonIndex % stage.learningOutcomes.length]],
        resources: [],
        mission: stage.practicalMissions[lessonIndex % stage.practicalMissions.length],
      })),
      practicalMissions: stage.practicalMissions,
      expectedOutcome: stage.expectedOutcome,
      quiz: {
        id: `${slug}-phase-${index + 1}-quiz`,
        title: `${stage.title} checkpoint`,
        phaseId: `${slug}-phase-${index + 1}`,
        description: `A five-question checkpoint before the comprehensive ${stage.title} assessment.`,
        questions: journeyStages[index].phaseExam?.questions.slice(0, 5) ?? [],
      },
    })),
    projects: blueprint.projects.map((project, index) => ({
      id: `${slug}-project-${index + 1}`,
      title: project.title,
      difficulty: project.difficulty,
      estimatedTime: project.estimatedTime,
      phaseId: `${slug}-phase-${project.stageNumber}`,
      description: project.description,
      deliverables: project.deliverables,
      skills: project.skills,
    })),
    globalResources: [],
    readiness: normalizeReadinessWeights(blueprint.readiness),
    finalChallenge: blueprint.finalChallenge,
    relatedCareers: blueprint.relatedCareers,
    progressRules: {
      readinessThreshold: 80,
      minimumProjects: Math.min(4, blueprint.projects.length),
      minimumQuizScore: 70,
    },
    jobBoard: {
      title: `${blueprint.title} opportunities`,
      description: `Role-aware opportunities and title variants for ${blueprint.title}.`,
      integrationStatus: "coming-soon",
      filters: ["Country", "Seniority", "Remote", "Employment type", "Title variant"],
      sampleDisclaimer: "Live job and salary intelligence must be reviewed separately before publication.",
    },
    portfolioTasks: blueprint.portfolioTasks.map((task, index) => ({ id: `${slug}-portfolio-task-${index + 1}`, ...task })),
    jobSearchTasks: blueprint.jobSearchTasks.map((task, index) => ({ id: `${slug}-job-task-${index + 1}`, ...task })),
    interviewPrep: blueprint.interviewPrep,
    resourceRequirements,
    resourceMappings: resourceRequirements.map((requirement) => ({
      requirementId: requirement.id,
      milestoneId: requirement.milestoneId,
      status: "pending",
    })),
    generationMetadata: {
      model: "openai/gpt-5.4-mini",
      generatedAt: new Date().toISOString(),
      blueprintStatus: "generated",
      resourceStatus: "pending",
    },
  };
}

function resourceType(mode: GeneratedLearningResource["mode"]): CareerResource["type"] {
  if (mode === "video") return "Video";
  if (mode === "practice") return "Practice";
  return "Documentation";
}

function topicAssessment(
  slug: string,
  stageId: string,
  resource: CareerResource,
  generated: GeneratedLearningResource,
): CareerAssessment {
  return {
    id: `${stageId}-${resource.id}-assessment`,
    title: `${resource.title} knowledge check`,
    description: `Five questions connecting this resource to the milestone outcomes and professional application.`,
    passingScore: 60,
    assessmentType: "topic",
    topicId: resource.id,
    topicLabel: resource.title,
    durationMinutes: 10,
    questionsPerAttempt: 5,
    officialPracticeLinks: [{ title: resource.title, url: resource.url }],
    questions: generated.assessmentSeeds.map((seed, index) => ({
      id: `${slug}-${resource.id}-q${index + 1}`,
      ...seed,
      difficulty: "Intermediate",
      relatedTopic: resource.title,
      referenceId: resource.id,
      status: "needs-review",
      lastReviewedAt: new Date().toISOString().slice(0, 10),
      version: 1,
    })),
  };
}

export function applyResourcePacks(
  workspace: CareerWorkspaceData,
  packs: GeneratedResourcePack[],
): CareerWorkspaceData {
  const requirements = workspace.resourceRequirements ?? [];
  const registry = new Map<string, CareerResource>(
    workspace.globalResources.map((resource) => [resource.url.replace(/\/$/, ""), resource]),
  );
  const generatedById = new Map<string, GeneratedLearningResource>();
  const packByRequirement = new Map(packs.map((pack) => [pack.requirementId, pack]));

  for (const pack of packs) {
    for (const generated of pack.resources) {
      if (/youtube\.com|youtu\.be/i.test(generated.canonicalUrl)) continue;
      const canonical = generated.canonicalUrl.replace(/\/$/, "");
      const existing = registry.get(canonical);
      const resource: CareerResource = existing ?? {
          id: `${workspace.slug}-${idPart(generated.provider)}-${idPart(generated.title)}-${generated.mode}-${registry.size + 1}`,
          title: generated.title,
          type: resourceType(generated.mode),
          provider: generated.provider,
          cost: "Free/Paid",
          estimatedTime: generated.estimatedTime,
          whyUseful: generated.whyUseful,
          url: generated.canonicalUrl,
          priority: generated.priority,
        };
      if (!existing) registry.set(canonical, resource);
      generatedById.set(resource.id, generated);
    }
  }

  const updatedRequirements = requirements.map((requirement) => {
    const pack = packByRequirement.get(requirement.id);
    if (!pack) return requirement;
    const resourceIds = pack?.resources
      .filter((item) => !/youtube\.com|youtu\.be/i.test(item.canonicalUrl))
      .map((item) => registry.get(item.canonicalUrl.replace(/\/$/, ""))?.id)
      .filter((id): id is string => Boolean(id)) ?? [];
    return { ...requirement, resourceIds: [...new Set(resourceIds)] };
  });

  const resourceById = new Map([...registry.values()].map((resource) => [resource.id, resource]));
  const journeyStages = workspace.journeyStages.map((stage) => {
    const requirement = updatedRequirements.find((item) => item.milestoneId === stage.id);
    const replaced = requirement ? packByRequirement.has(requirement.id) : false;
    if (!replaced) return stage;
    const resources = requirement?.resourceIds.map((id) => resourceById.get(id)).filter((item): item is CareerResource => Boolean(item)) ?? [];
    const topicAssessments = resources.flatMap((resource) => {
      const generated = generatedById.get(resource.id);
      return generated ? [topicAssessment(workspace.slug, stage.id, resource, generated)] : [];
    });
    return {
      ...stage,
      resources,
      topicAssessments,
      estimatedEffort: stage.estimatedEffort && requirement ? {
        ...stage.estimatedEffort,
        minMinutes: stage.estimatedEffort.breakdown.activities.minMinutes
          + stage.estimatedEffort.breakdown.assessment.minMinutes
          + requirement.estimatedDuration.minMinutes,
        maxMinutes: stage.estimatedEffort.breakdown.activities.maxMinutes
          + stage.estimatedEffort.breakdown.assessment.maxMinutes
          + requirement.estimatedDuration.maxMinutes,
        breakdown: {
          ...stage.estimatedEffort.breakdown,
          resources: {
            minMinutes: requirement.estimatedDuration.minMinutes,
            maxMinutes: requirement.estimatedDuration.maxMinutes,
          },
        },
      } : stage.estimatedEffort,
    };
  });

  const resourceMappings = updatedRequirements.map((requirement) => {
    const resources = requirement.resourceIds.map((id) => resourceById.get(id)).filter((item): item is CareerResource => Boolean(item));
    const reading = resources.find((item) => item.type === "Documentation" || item.type === "Article")?.id;
    const video = resources.find((item) => item.type === "Video")?.id;
    const practice = resources.find((item) => item.type === "Practice")?.id;
    return {
      requirementId: requirement.id,
      milestoneId: requirement.milestoneId,
      reading,
      video,
      practice,
      status: reading && video && practice ? "needs-review" as const : "partial" as const,
    };
  });

  const referencedResourceIds = new Set(updatedRequirements.flatMap((requirement) => requirement.resourceIds));
  const globalResources = [...registry.values()].filter((resource) => referencedResourceIds.has(resource.id));

  return {
    ...workspace,
    journeyStages,
    globalResources,
    resourceRequirements: updatedRequirements,
    resourceMappings,
    generationMetadata: {
      model: workspace.generationMetadata?.model ?? "openai/gpt-5.4-mini",
      generatedAt: workspace.generationMetadata?.generatedAt ?? new Date().toISOString(),
      blueprintStatus: "reviewed",
      resourceStatus: resourceMappings.every((mapping) => mapping.status === "needs-review")
        ? "needs-review"
        : "generated",
    },
  };
}
