import { notFound } from "next/navigation";
import CareerWorkspace from "@/components/career/CareerWorkspace";
import { aiIntegrationSpecialistCareer } from "@/data/careers/ai-integration-specialist";
import { aiTransformationConsultantCareer } from "@/data/careers/ai-transformation-consultant";
import {
  aiAdoptionConsultantCareer,
  aiMarketingSpecialistCareer,
  dataAnalystCareer,
  dataScientistCareer,
} from "@/data/careers/activation-batch-five";
import {
  aiKnowledgeEngineerCareer,
  biDeveloperCareer,
  businessAiConsultantCareer,
  dataEngineerCareer,
  devOpsEngineerCareer,
} from "@/data/careers/activation-batch-six";
import { cloudEngineerCareer } from "@/data/careers/cloud-engineer";
import { cybersecurityAnalystCareer } from "@/data/careers/cybersecurity-analyst";
import { generativeEngineOptimizationSpecialistCareer } from "@/data/careers/generative-engine-optimization-specialist";
import { microsoftCopilotConsultantCareer } from "@/data/careers/microsoft-copilot-consultant-workspace";
import { getPublishedCareer } from "@/lib/publishedCareerRepository";
import type { CareerWorkspaceData } from "@/types/careerWorkspace";

const builtIn: Record<string, CareerWorkspaceData> = {
  "ai-integration-specialist": aiIntegrationSpecialistCareer,
  "ai-transformation-consultant": aiTransformationConsultantCareer,
  "ai-adoption-consultant": aiAdoptionConsultantCareer,
  "ai-marketing-specialist": aiMarketingSpecialistCareer,
  "microsoft-copilot-consultant": microsoftCopilotConsultantCareer,
  "generative-engine-optimization-specialist": generativeEngineOptimizationSpecialistCareer,
  "data-analyst": dataAnalystCareer,
  "data-scientist": dataScientistCareer,
  "bi-developer": biDeveloperCareer,
  "ai-knowledge-engineer": aiKnowledgeEngineerCareer,
  "data-engineer": dataEngineerCareer,
  "devops-engineer": devOpsEngineerCareer,
  "business-ai-consultant": businessAiConsultantCareer,
  "cybersecurity-analyst": cybersecurityAnalystCareer,
  "cloud-engineer": cloudEngineerCareer,
};

export default async function ManagedCareerLearningPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const managed = await getPublishedCareer(slug);
  const career = managed?.data ?? builtIn[slug] ?? null;
  if (!career) notFound();
  return <CareerWorkspace career={career} initialSection="learning" />;
}
