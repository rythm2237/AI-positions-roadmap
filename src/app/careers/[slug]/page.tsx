import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CareerWorkspace from "@/components/career/CareerWorkspace";
import { aiEngineerCareer } from "@/data/careers/ai-engineer";
import { aiAutomationSpecialistCareer } from "@/data/careers/ai-automation-specialist";
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
  "ai-engineer": aiEngineerCareer,
  "ai-automation-specialist": aiAutomationSpecialistCareer,
  "ai-adoption-consultant": aiAdoptionConsultantCareer,
  "ai-marketing-specialist": aiMarketingSpecialistCareer,
  "microsoft-copilot-consultant": microsoftCopilotConsultantCareer,
  "data-analyst": dataAnalystCareer,
  "data-scientist": dataScientistCareer,
};

async function resolveCareer(slug: string) {
  const managed = await getPublishedCareer(slug);
  return managed?.data ?? builtIn[slug] ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const career = await resolveCareer(slug);
  return career
    ? { title: `${career.title} – AI Career OS`, description: career.shortDescription }
    : { title: "Career not found" };
}

export default async function ManagedCareerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const career = await resolveCareer(slug);
  if (!career) notFound();
  return <CareerWorkspace career={career} />;
}
