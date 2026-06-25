// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Career OS — Build Your Future AI Career",
  description:
    "The personal AI Career Operating System. Explore AI roles, follow structured roadmaps, build a portfolio, and become job-ready with AI-powered guidance.",
  keywords: ["AI career", "machine learning", "roadmap", "AI jobs", "career platform"],
  openGraph: {
    title: "AI Career OS",
    description: "Your personal AI Career Operating System.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="neural-bg min-h-screen antialiased">{children}</body>
    </html>
  );
}
