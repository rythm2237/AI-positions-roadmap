import type { Metadata } from "next";
import CareerWorkspace from "@/components/career/CareerWorkspace";
import { aiEngineerCareer } from "@/data/careers/ai-engineer";
import { getPublishedCareer } from "@/lib/publishedCareerRepository";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "AI Engineer Learning Path",
  description:
    "Study the AI Engineer learning path with roadmap-synchronized lessons, official resources, practical missions, assessments, projects, and progress tracking.",
  path: "/careers/ai-engineer/learning",
  keywords: [
    "AI Engineer learning path",
    "AI engineering courses",
    "learn RAG",
    "learn LLM engineering",
    "machine learning engineer study plan",
  ],
});

export default async function AIEngineerLearningPage() {
  const managed = await getPublishedCareer("ai-engineer");
  const career = managed?.data ?? aiEngineerCareer;
  return <CareerWorkspace career={career} initialSection="learning" />;
}
