// src/app/layout.tsx
// Root layout — wraps all pages with global styles and metadata defaults.

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Career Roadmaps — Build your future AI career",
  description:
    "Choose a role, follow a structured learning path, build real portfolio projects, and track your progress step by step.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
