import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import AuthDock from "@/components/identity/AuthDock";
import CareerSwitcherDock from "@/components/navigation/CareerSwitcherDock";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#03050e",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-positions-roadmap.vercel.app"),
  title: {
    default: "AI Career OS — Your Personal AI Career Operating System",
    template: "%s · AI Career OS",
  },
  description:
    "Choose a career direction in AI, automation, data, or digital transformation. Follow a practical roadmap, build proof, and prepare for your next role.",
  keywords: ["AI career", "AI roadmap", "AI engineer path", "AI product manager", "AI automation", "data career", "digital transformation career", "AI Career OS"],
  authors: [{ name: "AI Career OS" }],
  creator: "AI Career OS",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ai-positions-roadmap.vercel.app",
    siteName: "AI Career OS",
    title: "AI Career OS — Your Personal AI Career Operating System",
    description: "A personal Career Operating System for AI, Automation & Digital Transformation.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "AI Career OS" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Career OS — Your Personal AI Career Operating System",
    description: "Choose an AI career direction, follow a practical roadmap, build projects, and prepare credible proof of your skills.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark neural-bg" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", name: "AI Career OS", url: "https://ai-positions-roadmap.vercel.app", description: "A personal Career Operating System for AI, Automation & Digital Transformation." }) }} />
      </head>
      <body className="antialiased">
        {children}
        <CareerSwitcherDock />
        <AuthDock />
      </body>
    </html>
  );
}
