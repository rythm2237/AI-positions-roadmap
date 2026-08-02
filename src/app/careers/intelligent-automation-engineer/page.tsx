import CareerWorkspace from "@/components/career/CareerWorkspace";
import { intelligentAutomationEngineerCareer } from "@/data/careers/intelligent-automation-engineer";
import { getPublishedCareer } from "@/lib/publishedCareerRepository";

export const metadata = {
  title: "Intelligent Automation Engineer – AI Career OS",
  description:
    "Build enterprise automation systems across process engineering, RPA, workflows, APIs, document intelligence, agents, governance, and production operations.",
};

export default async function IntelligentAutomationEngineerCareerPage() {
  const managed = await getPublishedCareer("intelligent-automation-engineer");
  return (
    <CareerWorkspace
      career={managed?.data ?? intelligentAutomationEngineerCareer}
    />
  );
}
