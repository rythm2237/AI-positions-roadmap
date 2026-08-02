import CareerWorkspace from "@/components/career/CareerWorkspace";
import { aiSolutionsConsultantCareer } from "@/data/careers/ai-solutions-consultant";
import { getPublishedCareer } from "@/lib/publishedCareerRepository";

export const metadata = {
  title: "AI Solutions Consultant – AI Career OS",
  description:
    "Translate business problems into practical, trustworthy AI solution recommendations, proofs of value, delivery roadmaps, and adoption plans.",
};

export default async function AiSolutionsConsultantPage() {
  const managed = await getPublishedCareer("ai-solutions-consultant");
  return (
    <CareerWorkspace career={managed?.data ?? aiSolutionsConsultantCareer} />
  );
}
