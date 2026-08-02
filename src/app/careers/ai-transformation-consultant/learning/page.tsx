import CareerWorkspace from "@/components/career/CareerWorkspace";
import { aiTransformationConsultantCareer } from "@/data/careers/ai-transformation-consultant";
import { getPublishedCareer } from "@/lib/publishedCareerRepository";

export const metadata = {
  title: "AI Transformation Consultant Learning – AI Career OS",
  description: "Follow the complete AI Transformation Consultant path from enterprise assessment through strategy, governance, adoption, value realization, and employment.",
};

export default async function AiTransformationConsultantLearningPage() {
  const managed = await getPublishedCareer("ai-transformation-consultant");
  return <CareerWorkspace initialSection="learning" career={managed?.data ?? aiTransformationConsultantCareer} />;
}
