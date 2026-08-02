import { notFound } from "next/navigation";
import CareerWorkspace from "@/components/career/CareerWorkspace";
import { getPublishedCareer } from "@/lib/publishedCareerRepository";

export const metadata = {
  title: "AI Integration Specialist – AI Career OS",
  description:
    "Explore the AI Integration Specialist career workspace and follow the published journey from integration foundations to job-ready portfolio evidence.",
};

export default async function AIIntegrationSpecialistCareerPage() {
  const managed = await getPublishedCareer("ai-integration-specialist");

  if (!managed) {
    notFound();
  }

  return <CareerWorkspace career={managed.data} />;
}
