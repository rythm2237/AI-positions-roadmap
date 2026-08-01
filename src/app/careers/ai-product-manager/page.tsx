import CareerWorkspace from "@/components/career/CareerWorkspace";
import { aiProductManagerCareer } from "@/data/careers/ai-product-manager";
import { getPublishedCareer } from "@/lib/publishedCareerRepository";

export const metadata = {
  title: "AI Product Manager – AI Career OS",
  description:
    "Lead useful, responsible AI products through discovery, strategy, evaluation, delivery, launch, adoption, and iteration.",
};

export default async function AIProductManagerPage() {
  const managed = await getPublishedCareer("ai-product-manager");
  return (
    <CareerWorkspace career={managed?.data ?? aiProductManagerCareer} />
  );
}
