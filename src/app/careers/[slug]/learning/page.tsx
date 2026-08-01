import { notFound } from "next/navigation";
import CareerWorkspace from "@/components/career/CareerWorkspace";
import {
  aiAdoptionConsultantCareer,
  aiMarketingSpecialistCareer,
  dataAnalystCareer,
  dataScientistCareer,
  microsoftCopilotConsultantCareer,
} from "@/data/careers/activation-batch-five";
import { getPublishedCareer } from "@/lib/publishedCareerRepository";
import type { CareerWorkspaceData } from "@/types/careerWorkspace";

const builtIn: Record<string, CareerWorkspaceData> = {
  "ai-adoption-consultant": aiAdoptionConsultantCareer,
  "ai-marketing-specialist": aiMarketingSpecialistCareer,
  "microsoft-copilot-consultant": microsoftCopilotConsultantCareer,
  "data-analyst": dataAnalystCareer,
  "data-scientist": dataScientistCareer,
};

export default async function ManagedCareerLearningPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const managed = await getPublishedCareer(slug);
  const career = managed?.data ?? builtIn[slug] ?? null;
  if (!career) notFound();
  return <CareerWorkspace career={career} initialSection="learning" />;
}
