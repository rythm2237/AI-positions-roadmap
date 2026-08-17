import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import AnalyticsScripts from "@/components/analytics/AnalyticsScripts";
import GlobalExplainMode from "@/components/help/GlobalExplainMode";
import AuthDock from "@/components/identity/AuthDock";
import AuthenticatedWaitlistEnhancer from "@/components/identity/AuthenticatedWaitlistEnhancer";
import CookieConsent from "@/components/legal/CookieConsent";
import CareerSwitcherDock from "@/components/navigation/CareerSwitcherDock";
import FirstVisitGuidedTour from "@/components/onboarding/FirstVisitGuidedTour";
import { absoluteUrl, isIndexableDeployment, seoConfig } from "@/lib/seo";
import "./globals.css";
import "./experience-fixes.css";
import "./guided-tour-mobile.css";

export const viewport: Viewport = {
  themeColor: "#03050e",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(seoConfig.siteUrl),
  title: { default: seoConfig.defaultTitle, template: seoConfig.titleTemplate },
  description: seoConfig.defaultDescription,
  keywords: ["AI career", "AI career roadmap", "AI automation career", "data career", "cybersecurity career", "digital transformation career", "AI Career OS"],
  authors: [{ name: seoConfig.productName }],
  creator: seoConfig.productName,
  publisher: seoConfig.productName,
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    type: "website",
    locale: seoConfig.locale,
    url: absoluteUrl("/"),
    siteName: seoConfig.siteName,
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    images: [{ url: absoluteUrl(seoConfig.defaultOgImage), width: 1200, height: 630, alt: seoConfig.productName }],
  },
  twitter: { card: "summary_large_image", title: seoConfig.defaultTitle, description: seoConfig.defaultDescription, images: [absoluteUrl(seoConfig.defaultOgImage)] },
  robots: { index: isIndexableDeployment, follow: isIndexableDeployment },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } : undefined,
  },
  icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${absoluteUrl("/")}#organization`,
  name: seoConfig.productName,
  url: absoluteUrl("/"),
  description: seoConfig.entityDescription,
  logo: absoluteUrl("/icon.svg"),
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${absoluteUrl("/")}#website`,
  name: seoConfig.siteName,
  url: absoluteUrl("/"),
  description: seoConfig.defaultDescription,
  inLanguage: seoConfig.language,
  publisher: { "@id": `${absoluteUrl("/")}#organization` },
};

const applicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: seoConfig.productName,
  url: absoluteUrl("/"),
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  description: seoConfig.entityDescription,
  publisher: { "@id": `${absoluteUrl("/")}#organization` },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={seoConfig.language} className="dark neural-bg" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {[organizationSchema, websiteSchema, applicationSchema].map((schema) => (
          <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
        ))}
      </head>
      <body className="antialiased">
        <AnalyticsScripts />
        {children}
        <CareerSwitcherDock />
        <AuthDock />
        <AuthenticatedWaitlistEnhancer />
        <CookieConsent />
        <FirstVisitGuidedTour />
        <GlobalExplainMode />
      </body>
    </html>
  );
}
