import CareerWorkspace from "@/components/career/CareerWorkspace";
import { aiEngineerCareer } from "@/data/careers/ai-engineer";
import { getPublishedCareer } from "@/lib/publishedCareerRepository";

export const metadata = {
  title: "AI Engineer – AI Career OS",
  description: "Enter the AI Engineer career world and follow the interactive journey map from beginner to job-ready.",
};

export default async function AIEngineerCareerPage() {
  const managed=await getPublishedCareer("ai-engineer");
  return <CareerWorkspace career={managed?.data??aiEngineerCareer} />;
}
