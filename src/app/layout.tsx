// src/app/layout.tsx
// AI Career OS — Root layout. Dark mode only. Premium fonts. Rich metadata.

import type { Metadata, Viewport } from "next";
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
    "Discover your perfect AI career, follow a structured roadmap, build real portfolio projects, and become job-ready — guided by intelligent AI every step of the way.",
  keywords: [
    "AI career",
    "AI roadmap",
    "machine learning career",
    "AI engineer path",
    "prompt engineer",
    "AI product manager",
    "MLOps",
    "LLM engineer",
    "AI career OS",
    "career operating system",
  ],
  authors: [{ name: "AI Career OS" }],
  creator: "AI Career OS",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ai-positions-roadmap.vercel.app",
    siteName: "AI Career OS",
    title: "AI Career OS — Your Personal AI Career Operating System",
    description:
      "The world's first AI Career Operating System. Discover, plan, and build a successful AI career with intelligent guidance.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Career OS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Career OS — Your Personal AI Career Operating System",
    description:
      "Discover your perfect AI career path. Structured roadmaps, real projects, intelligent guidance.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark neural-bg" suppressHydrationWarning>
      <head>
        {/* Preconnect to font origins for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Structured data — Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "AI Career OS",
              url: "https://ai-positions-roadmap.vercel.app",
              description:
                "The world's first AI Career Operating System — helping people discover, plan, and build successful AI careers.",
              sameAs: [],
            }),
          }}
        />
        {/* Structured data — WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "AI Career OS",
              url: "https://ai-positions-roadmap.vercel.app",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://ai-positions-roadmap.vercel.app/roadmaps/{search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
