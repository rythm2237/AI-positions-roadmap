import CareerWorkspace from "@/components/career/CareerWorkspace";
import { aiProductManagerCareer } from "@/data/careers/ai-product-manager";
import { getPublishedCareer } from "@/lib/admin/careerPublishing";

export const dynamic = "force-dynamic";

export default async function AIProductManagerLearningPage() {
  const managed = await getPublishedCareer("ai-product-manager");
  return (
    <CareerWorkspace
      career={managed ?? aiProductManagerCareer}
      initialSection="learning"
    />
  );
}
