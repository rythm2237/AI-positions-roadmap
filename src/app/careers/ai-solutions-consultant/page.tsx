import { notFound } from "next/navigation";
import CareerWorkspace from "@/components/career/CareerWorkspace";
import { aiSolutionsConsultantCareer } from "@/data/careers/ai-solutions-consultant";
import { getPublishedCareer } from "@/lib/careerContentServer";

export const dynamic = "force-dynamic";

export default async function AiSolutionsConsultantPage() {
  const managed = await getPublishedCareer("ai-solutions-consultant");
  const career = managed ?? aiSolutionsConsultantCareer;

  if (!career) notFound();

  return <CareerWorkspace career={career} />;
}
