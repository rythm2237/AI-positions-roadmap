import { aiContentStrategistCareer } from "@/data/careers/ai-content-strategist";
import { aiTransformationConsultantCareer } from "@/data/careers/ai-transformation-consultant";
import { intelligentAutomationEngineerCareer } from "@/data/careers/intelligent-automation-engineer";
import { aiSolutionsConsultantCareer } from "@/data/careers/ai-solutions-consultant";
import { aiWorkflowArchitectCareer } from "@/data/careers/ai-workflow-architect";
import { aiProductManagerCareer } from "@/data/careers/ai-product-manager";
import { aiEngineerCareer } from "@/data/careers/ai-engineer";
import { aiAutomationSpecialistCareer } from "@/data/careers/ai-automation-specialist";
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
import { enterpriseAiConsultantCareer } from "@/data/careers/enterprise-ai-consultant";
import { generativeEngineOptimizationSpecialistCareer } from "@/data/careers/generative-engine-optimization-specialist";
import { microsoftCopilotConsultantCareer } from "@/data/careers/microsoft-copilot-consultant-workspace";
import type { CareerWorkspaceData } from "@/types/careerWorkspace";
export const studioLearningCareers: Record<string, CareerWorkspaceData> = {
  "ai-content-strategist": aiContentStrategistCareer,
  "ai-transformation-consultant": aiTransformationConsultantCareer,
  "intelligent-automation-engineer": intelligentAutomationEngineerCareer,
  "ai-solutions-consultant": aiSolutionsConsultantCareer,
  "ai-workflow-architect": aiWorkflowArchitectCareer,
  "ai-product-manager": aiProductManagerCareer,
  "ai-engineer": aiEngineerCareer,
  "ai-automation-specialist": aiAutomationSpecialistCareer,
  "ai-adoption-consultant": aiAdoptionConsultantCareer,
  "ai-marketing-specialist": aiMarketingSpecialistCareer,
  "microsoft-copilot-consultant": microsoftCopilotConsultantCareer,
  "generative-engine-optimization-specialist": generativeEngineOptimizationSpecialistCareer,
  "enterprise-ai-consultant": enterpriseAiConsultantCareer,
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

