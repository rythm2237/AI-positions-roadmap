import CareerWorkspace from "@/components/career/CareerWorkspace";
import { aiAutomationSpecialistCareer } from "@/data/careers/ai-automation-specialist";

export const metadata = {
  title: "AI Automation Specialist – AI Career OS",
  description:
    "Explore the AI Automation Specialist career workspace and follow a practical journey from automation foundations to job-ready portfolio evidence.",
};

export default function AIAutomationSpecialistCareerPage() {
  return <CareerWorkspace career={aiAutomationSpecialistCareer} />;
}
