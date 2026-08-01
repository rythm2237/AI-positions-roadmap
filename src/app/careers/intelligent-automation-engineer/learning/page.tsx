import CareerWorkspace from "@/components/career/CareerWorkspace";
import { intelligentAutomationEngineerCareer } from "@/data/careers/intelligent-automation-engineer";
import { getPublishedCareer } from "@/lib/publishedCareerRepository";

export const metadata = {
  title: "Intelligent Automation Engineer Learning – AI Career OS",
  description:
    "Follow the Intelligent Automation Engineer learning path from process discovery through production automation and job readiness.",
};

export default async function IntelligentAutomationEngineerLearningPage() {
  const managed = await getPublishedCareer("intelligent-automation-engineer");
  return (
    <CareerWorkspace
      initialSection="learning"
      career={managed?.data ?? intelligentAutomationEngineerCareer}
    />
  );
}
