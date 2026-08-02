import CareerWorkspace from "@/components/career/CareerWorkspace";
import { aiContentStrategistCareer } from "@/data/careers/ai-content-strategist";
import { getPublishedCareer } from "@/lib/publishedCareerRepository";

export const metadata = {
  title: "AI Content Strategist – AI Career OS",
  description: "Design governed AI-assisted content systems across audience research, knowledge architecture, editorial workflows, distribution, and measurement.",
};

export default async function AiContentStrategistPage() {
  const managed = await getPublishedCareer("ai-content-strategist");
  return <CareerWorkspace career={managed?.data ?? aiContentStrategistCareer} />;
}
