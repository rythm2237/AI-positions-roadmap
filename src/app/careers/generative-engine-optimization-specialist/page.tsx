import CareerWorkspace from "@/components/career/CareerWorkspace";
import { generativeEngineOptimizationSpecialistCareer } from "@/data/careers/generative-engine-optimization-specialist";
import { getPublishedCareer } from "@/lib/publishedCareerRepository";

export const metadata = {
  title: "Generative Engine Optimization Specialist – AI Career OS",
  description: "Build trusted visibility across generative answer engines through research, entities, evidence, technical discoverability, authority, and measurement.",
};

export default async function GeoSpecialistPage() {
  const managed = await getPublishedCareer("generative-engine-optimization-specialist");
  return <CareerWorkspace career={managed?.data ?? generativeEngineOptimizationSpecialistCareer} />;
}
