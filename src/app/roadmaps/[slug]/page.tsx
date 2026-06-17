// src/app/roadmaps/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRoadmapBySlug, getAllSlugs } from "@/data/roadmaps";
import RoadmapPageClient from "@/components/roadmap/RoadmapPageClient";
import ComingSoonRoadmap from "@/components/roadmap/ComingSoonRoadmap";
import Header from "@/components/landing/Header";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const roadmap = getRoadmapBySlug(slug);
  if (!roadmap) return { title: "Roadmap Not Found — AI Career Roadmaps" };
  return {
    title: `${roadmap.title} Roadmap — AI Career Roadmaps`,
    description: roadmap.description,
  };
}

export default async function RoadmapPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const roadmap = getRoadmapBySlug(slug);

  if (!roadmap) notFound();

  if (roadmap.status === "coming-soon") {
    return (
      <>
        <Header />
        <ComingSoonRoadmap roadmap={roadmap} />
      </>
    );
  }

  return <RoadmapPageClient roadmap={roadmap} />;
}
