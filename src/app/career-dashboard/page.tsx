// src/app/career-dashboard/page.tsx
// AI Career Path Analyzer — 9-tab interactive dashboard.
// Renders the CareerDashboard client component inside the Next.js App Router.

import type { Metadata } from "next";
import CareerDashboard from "@/components/career/CareerDashboard";

export const metadata: Metadata = {
  title: "AI Career Path Analyzer — AI Career Roadmaps",
  description:
    "Explore the 2026 AI job market, required skills, salary data, certifications, portfolio projects, best countries, gap analysis, strategy, and CV analyzer — all in one place.",
};

export default function CareerDashboardPage() {
  return <CareerDashboard />;
}
