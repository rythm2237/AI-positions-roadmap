// src/app/roadmap/[id]/page.tsx
// Dynamic roadmap detail page — renders for each career position by ID.
// Uses Next.js App Router static generation via generateStaticParams.

import { notFound, redirect } from "next/navigation";
import { careerPositions } from "@/data/careerRoadmaps";
import type { Metadata } from "next";

// ─── Static params — pre-render a page for every career position ────────────
export function generateStaticParams() {
  return careerPositions.map((position) => ({ id: position.id }));
}

// ─── Dynamic metadata per roadmap ──────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const position = careerPositions.find((p) => p.id === id);
  if (!position) return { title: "Roadmap Not Found" };

  return {
    title: `${position.title} Roadmap — AI Career Roadmaps`,
    description: position.description,
  };
}

// ─── Page component ─────────────────────────────────────────────────────────
export default async function RoadmapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const position = careerPositions.find((p) => p.id === id);

  if (!position) notFound();

  redirect(`/roadmaps/${id}`);
}
