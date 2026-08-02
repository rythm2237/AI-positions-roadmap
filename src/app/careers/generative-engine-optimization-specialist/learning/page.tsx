import CareerWorkspace from "@/components/career/CareerWorkspace";
import { generativeEngineOptimizationSpecialistCareer } from "@/data/careers/generative-engine-optimization-specialist";
import { getPublishedCareer } from "@/lib/publishedCareerRepository";

export const metadata = {
  title: "GEO Specialist Learning – AI Career OS",
  description: "Follow the complete GEO learning path from answer-engine foundations through portfolio and job readiness.",
};

export default async function GeoSpecialistLearningPage() {
  const managed = await getPublishedCareer("generative-engine-optimization-specialist");
  return <CareerWorkspace initialSection="learning" career={managed?.data ?? generativeEngineOptimizationSpecialistCareer} />;
}
