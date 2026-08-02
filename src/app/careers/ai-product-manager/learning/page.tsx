import CareerWorkspace from "@/components/career/CareerWorkspace";
import { aiProductManagerCareer } from "@/data/careers/ai-product-manager";
import { getPublishedCareer } from "@/lib/publishedCareerRepository";

export const metadata = {
  title: "AI Product Manager Learning – AI Career OS",
  description: "Follow the AI Product Manager learning path from discovery and strategy through evaluation, launch, adoption, and job readiness.",
};

export default async function AIProductManagerLearningPage() {
  const managed = await getPublishedCareer("ai-product-manager");
  return (
    <CareerWorkspace
      career={managed?.data ?? aiProductManagerCareer}
      initialSection="learning"
    />
  );
}
