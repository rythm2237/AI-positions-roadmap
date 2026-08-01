import CareerWorkspace from "@/components/career/CareerWorkspace";
import { aiContentStrategistCareer } from "@/data/careers/ai-content-strategist";
import { getPublishedCareer } from "@/lib/publishedCareerRepository";

export const metadata = {
  title: "AI Content Strategist Learning – AI Career OS",
  description: "Follow the complete AI Content Strategist learning path from audience discovery through content systems, governance, measurement, and employment.",
};

export default async function AiContentStrategistLearningPage() {
  const managed = await getPublishedCareer("ai-content-strategist");
  return <CareerWorkspace initialSection="learning" career={managed?.data ?? aiContentStrategistCareer} />;
}
