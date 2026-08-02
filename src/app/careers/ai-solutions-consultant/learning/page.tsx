import CareerWorkspace from "@/components/career/CareerWorkspace";
import { aiSolutionsConsultantCareer } from "@/data/careers/ai-solutions-consultant";
import { getPublishedCareer } from "@/lib/publishedCareerRepository";

export const metadata = {
  title: "AI Solutions Consultant Learning – AI Career OS",
  description:
    "Follow the AI Solutions Consultant learning path from discovery and opportunity assessment through proof of value, delivery, adoption, and interview readiness.",
};

export default async function AiSolutionsConsultantLearningPage() {
  const managed = await getPublishedCareer("ai-solutions-consultant");
  return (
    <CareerWorkspace
      career={managed?.data ?? aiSolutionsConsultantCareer}
      initialSection="learning"
    />
  );
}
