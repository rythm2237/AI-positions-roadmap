import CareerWorkspace from "@/components/career/CareerWorkspace";
import { aiAutomationSpecialistCareer } from "@/data/careers/ai-automation-specialist";
import { getPublishedCareer } from "@/lib/publishedCareerRepository";

export const metadata = {
  title: "AI Automation Specialist – AI Career OS",
  description:
    "Explore the AI Automation Specialist career workspace and follow a practical journey from automation foundations to job-ready portfolio evidence.",
};

export default async function AIAutomationSpecialistCareerPage() {
  const managed=await getPublishedCareer("ai-automation-specialist");
  return <CareerWorkspace career={managed?.data??aiAutomationSpecialistCareer} />;
}
