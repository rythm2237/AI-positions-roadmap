import { notFound } from "next/navigation";
import CareerWorkspace from "@/components/career/CareerWorkspace";
import { getPublishedCareer } from "@/lib/publishedCareerRepository";

export const metadata = {
  title: "AI Integration Specialist Learning – AI Career OS",
  description:
    "Follow the published AI Integration Specialist learning path with course checks and comprehensive step assessments.",
};

export default async function AIIntegrationSpecialistLearningPage() {
  const managed = await getPublishedCareer("ai-integration-specialist");

  if (!managed) {
    notFound();
  }

  return <CareerWorkspace career={managed.data} initialSection="learning" />;
}
