import CareerWorkspace from "@/components/career/CareerWorkspace";
import { aiTransformationConsultantCareer } from "@/data/careers/ai-transformation-consultant";
import { getPublishedCareer } from "@/lib/publishedCareerRepository";

export const metadata = {
  title: "AI Transformation Consultant – AI Career OS",
  description: "Lead enterprise AI transformation through strategy, portfolios, operating models, governance, adoption, delivery, and value realization.",
};

export default async function AiTransformationConsultantPage() {
  const managed = await getPublishedCareer("ai-transformation-consultant");
  return <CareerWorkspace career={managed?.data ?? aiTransformationConsultantCareer} />;
}
