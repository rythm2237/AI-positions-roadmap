import type { ReferenceLearningOption, ReferenceResource } from "@/types/reference";

const reviewedAt = "2026-08-03";
const nextReviewAt = "2026-10-02";

type OptionInput = Omit<ReferenceLearningOption, "verifiedContentType" | "verifiedAt" | "verificationSource"> & {
  verificationSource?: string;
};

type ResourceInput = Omit<
  ReferenceResource,
  "languages" | "segments" | "status" | "lastVerifiedAt" | "reviewIntervalDays" | "nextReviewAt" | "learningOptions"
> & { learningOptions: OptionInput[] };

function option(input: OptionInput): ReferenceLearningOption {
  return {
    ...input,
    verifiedContentType: true,
    verifiedAt: reviewedAt,
    verificationSource: input.verificationSource ?? (input.isOfficial ? "official-provider-page" : "curated-provider-page"),
  };
}

function resource(input: ResourceInput): ReferenceResource {
  return {
    ...input,
    languages: ["en"],
    segments: [],
    status: "active",
    lastVerifiedAt: reviewedAt,
    reviewIntervalDays: 60,
    nextReviewAt,
    learningOptions: input.learningOptions.map(option),
  };
}

const ahrefsAeoCourse: OptionInput = {
  mode: "video",
  contentType: "video-course",
  title: "Answer Engine Optimization Course",
  description: "A free, provider-hosted course covering AI-search mechanics, prompt research, content optimization, technical AEO, and measurement.",
  url: "https://ahrefs.com/academy/aeo-course",
  provider: "Ahrefs Academy",
  durationLabel: "1 hour 26 minutes",
  isOfficial: false,
  access: "free",
  curationReason: "Direct, structured, free training hosted on the provider's academy.",
};

const hubspotAeoCourse: OptionInput = {
  mode: "video",
  contentType: "official-course",
  title: "AEO Fundamentals Certification",
  description: "A free course covering answer-engine visibility, E-E-A-T, prompt planning, citation-ready structure, and measurement.",
  url: "https://academy.hubspot.com/courses/aeo-fundamentals-certification-en",
  provider: "HubSpot Academy",
  durationLabel: "2 hours 20 minutes",
  isOfficial: true,
  access: "free",
};

export const GEO_LEARNING_DATABASE: ReferenceResource[] = [
  resource({ id: "geo-foundational-paper", title: "GEO: Generative Engine Optimization", provider: "arXiv / Princeton NLP", description: "Primary research introducing GEO, GEO-Bench, visibility metrics, interventions, and limitations.", type: "research-paper", canonicalUrl: "https://arxiv.org/abs/2311.09735", isOfficial: false, topics: ["geo", "generative-search", "evaluation"], skillLevels: ["Intermediate", "Advanced"], priority: "essential", access: "free", durationLabel: "3-4 hours", learningOptions: [
    { mode: "reading", contentType: "official-publication", title: "Read the foundational GEO paper", description: "Focus on the problem definition, GEO-Bench methodology, visibility metrics, results, and limitations.", url: "https://arxiv.org/abs/2311.09735", provider: "arXiv / Princeton NLP", durationLabel: "3-4 hours", isOfficial: false, access: "free", curationReason: "Primary research source for the profession's original terminology and evidence base.", verificationSource: "publisher-record" }, ahrefsAeoCourse,
  ] }),
  resource({ id: "geo-critical-survey", title: "Critical Survey of Generative Engine Optimization", provider: "arXiv", description: "A critical synthesis of GEO evidence, reproducibility, transferability, stochasticity, and measurement problems.", type: "research-paper", canonicalUrl: "https://arxiv.org/abs/2607.14035", isOfficial: false, topics: ["geo", "evidence", "measurement", "uncertainty"], skillLevels: ["Intermediate", "Advanced"], priority: "essential", access: "free", durationLabel: "3-5 hours", learningOptions: [
    { mode: "reading", contentType: "official-publication", title: "Read the critical GEO survey", description: "Study the evidence hierarchy, reproducibility, transfer limits, and distinction between retrieval, citation, traffic, and outcomes.", url: "https://arxiv.org/abs/2607.14035", provider: "arXiv", durationLabel: "3-5 hours", isOfficial: false, access: "free", curationReason: "Critical synthesis used to prevent unsupported deterministic claims.", verificationSource: "publisher-record" }, hubspotAeoCourse,
  ] }),
  resource({ id: "geo-google-ai-features", title: "AI Features and Your Website", provider: "Google Search Central", description: "Official guidance for AI Overviews and AI Mode, including eligibility, controls, technical requirements, and measurement.", type: "documentation", canonicalUrl: "https://developers.google.com/search/docs/appearance/ai-features", isOfficial: true, topics: ["geo", "google-search", "ai-overviews"], skillLevels: ["Beginner", "Intermediate", "Advanced"], priority: "essential", access: "free", durationLabel: "45-75 minutes", learningOptions: [
    { mode: "reading", contentType: "documentation", title: "Read Google's AI features guidance", description: "Use the official source for eligibility, preview controls, accessibility, content quality, and Search Console context.", url: "https://developers.google.com/search/docs/appearance/ai-features", provider: "Google Search Central", durationLabel: "45-75 minutes", isOfficial: true, access: "free" }, ahrefsAeoCourse,
  ] }),
  resource({ id: "geo-search-essentials", title: "Google Search Essentials", provider: "Google Search Central", description: "Official technical requirements, spam policies, and people-first search practices foundational to GEO.", type: "documentation", canonicalUrl: "https://developers.google.com/search/docs/essentials", isOfficial: true, topics: ["technical-seo", "quality", "spam-policy"], skillLevels: ["Beginner", "Intermediate"], priority: "essential", access: "free", durationLabel: "2-3 hours", learningOptions: [
    { mode: "reading", contentType: "documentation", title: "Study Google Search Essentials", description: "Review technical requirements, spam policies, and core practices before GEO-specific changes.", url: "https://developers.google.com/search/docs/essentials", provider: "Google Search Central", durationLabel: "2-3 hours", isOfficial: true, access: "free" },
    { mode: "video", contentType: "official-course", title: "Technical SEO and AI Search Essentials", description: "A free Semrush Academy course covering crawlability, sitemaps, structured data, Core Web Vitals, AI crawlers, and audits.", url: "https://www.semrush.com/academy/courses/techincal-seo-and-ai-search-essentials-with-semrush/", provider: "Semrush Academy", durationLabel: "Self-paced", isOfficial: true, access: "free" },
    { mode: "practice", contentType: "hands-on-lab", title: "Run a free technical site audit", description: "Use Ahrefs Webmaster Tools to inspect technical issues and validate improvements after recrawling.", url: "https://ahrefs.com/webmaster-tools", provider: "Ahrefs Free", durationLabel: "2-4 hours", isOfficial: false, access: "free", curationReason: "Free real-site audit environment with repeatable validation." },
  ] }),
  resource({ id: "geo-bing-ai-performance", title: "AI Performance in Bing Webmaster Tools", provider: "Microsoft Bing", description: "Official guidance for cited pages, grounding queries, citation trends, intents, topics, comparison, and export.", type: "documentation", canonicalUrl: "https://www.bing.com/webmasters/help/ai-performance-9f8e7d6c", isOfficial: true, topics: ["bing", "measurement", "citations"], skillLevels: ["Intermediate", "Advanced"], priority: "essential", access: "free", durationLabel: "1-2 hours", learningOptions: [
    { mode: "reading", contentType: "documentation", title: "Study Bing AI Performance", description: "Learn how cited pages, grounding queries, trends, topics, intents, and citation share should be interpreted.", url: "https://www.bing.com/webmasters/help/ai-performance-9f8e7d6c", provider: "Microsoft Bing", durationLabel: "1-2 hours", isOfficial: true, access: "free" },
    { mode: "practice", contentType: "hands-on-analysis", title: "Analyze AI citations for a verified site", description: "Inspect cited pages and grounding queries, export data, segment by topic and intent, and compare periods.", url: "https://www.bing.com/webmasters/about", provider: "Bing Webmaster Tools", durationLabel: "2-4 hours", isOfficial: true, access: "free" },
  ] }),
  resource({ id: "geo-schema", title: "Structured Data and Entity Markup", provider: "Google Search Central / Schema.org", description: "Official implementation guidance and validation tools for visible entities and relationships.", type: "documentation", canonicalUrl: "https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data", isOfficial: true, topics: ["schema", "entities", "structured-data"], skillLevels: ["Intermediate", "Advanced"], priority: "essential", access: "free", durationLabel: "3-5 hours", learningOptions: [
    { mode: "reading", contentType: "documentation", title: "Learn structured-data implementation", description: "Study formats, visible-content requirements, quality policies, deployment, monitoring, and Schema.org vocabulary.", url: "https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data", provider: "Google Search Central", durationLabel: "2-3 hours", isOfficial: true, access: "free" },
    { mode: "practice", contentType: "interactive-labs", title: "Build and validate JSON-LD", description: "Implement markup, test it with Rich Results Test, and validate the complete graph.", url: "https://search.google.com/test/rich-results", provider: "Google Rich Results Test", durationLabel: "1-3 hours", isOfficial: true, access: "free" },
  ] }),
  resource({ id: "geo-genai-content", title: "Guidance on Generative AI Content", provider: "Google Search Central", description: "Official guidance on using generative AI without sacrificing accuracy, relevance, metadata quality, or user value.", type: "documentation", canonicalUrl: "https://developers.google.com/search/docs/fundamentals/using-gen-ai-content", isOfficial: true, topics: ["content-quality", "generative-ai", "spam-policy"], skillLevels: ["Beginner", "Intermediate", "Advanced"], priority: "essential", access: "free", durationLabel: "45-75 minutes", learningOptions: [
    { mode: "reading", contentType: "documentation", title: "Read Google's generative AI content guidance", description: "Use the official quality and policy baseline for AI-assisted research, drafting, metadata, review, and publication.", url: "https://developers.google.com/search/docs/fundamentals/using-gen-ai-content", provider: "Google Search Central", durationLabel: "45-75 minutes", isOfficial: true, access: "free" },
    { mode: "video", contentType: "official-course", title: "Content Marketing Essentials for SEO and AI Search", description: "A free course covering topic clusters, E-E-A-T, citation-oriented content, authority, and workflows.", url: "https://www.semrush.com/academy/courses/content-marketing-essentials-for-seo-and-ai-search-with-semrush/", provider: "Semrush Academy", durationLabel: "1 hour", isOfficial: true, access: "free" },
    { mode: "practice", contentType: "interactive-course", title: "Optimize a page for AI citations", description: "Use HubSpot Academy's free AEO course to audit and revise an existing page.", url: "https://academy.hubspot.com/courses/aeo-fundamentals-certification-en", provider: "HubSpot Academy", durationLabel: "2-3 hours", isOfficial: true, access: "free" },
  ] }),
  resource({ id: "geo-quality-guidelines", title: "Search Quality Rater Guidelines", provider: "Google", description: "Primary guidance for evaluating purpose, trust, experience, expertise, reputation, transparency, and high-stakes quality.", type: "official-publication", canonicalUrl: "https://guidelines.raterhub.com/searchqualityevaluatorguidelines.pdf", isOfficial: true, topics: ["quality", "trust", "reputation"], skillLevels: ["Intermediate", "Advanced"], priority: "essential", access: "free", durationLabel: "8-12 hours", learningOptions: [
    { mode: "reading", contentType: "official-publication", title: "Study the Search Quality Rater Guidelines", description: "Read the sections on page purpose, E-E-A-T, reputation research, YMYL risk, and quality examples.", url: "https://guidelines.raterhub.com/searchqualityevaluatorguidelines.pdf", provider: "Google", durationLabel: "8-12 hours", isOfficial: true, access: "free", verificationSource: "official-pdf" }, hubspotAeoCourse,
  ] }),
  resource({ id: "geo-search-console", title: "Search Console Performance Reports", provider: "Google Search Central", description: "Official guidance for query, page, country, device, trend, indexation, sitemap, and enhancement analysis.", type: "documentation", canonicalUrl: "https://support.google.com/webmasters/answer/7576553", isOfficial: true, topics: ["measurement", "search-console", "technical-seo"], skillLevels: ["Beginner", "Intermediate", "Advanced"], priority: "essential", access: "free", durationLabel: "2-4 hours", learningOptions: [
    { mode: "reading", contentType: "documentation", title: "Learn Search Console performance analysis", description: "Study dimensions, filters, comparison, anonymized queries, data limits, and defensible interpretation.", url: "https://support.google.com/webmasters/answer/7576553", provider: "Google Search Central", durationLabel: "2-4 hours", isOfficial: true, access: "free" },
    { mode: "practice", contentType: "hands-on-analysis", title: "Build a search-performance baseline", description: "Compare at least 90 days of query and page data and export a baseline for future experiments.", url: "https://search.google.com/search-console", provider: "Google Search Console", durationLabel: "2-4 hours", isOfficial: true, access: "free" },
  ] }),
  resource({ id: "geo-indexnow", title: "IndexNow Protocol", provider: "IndexNow", description: "Official protocol documentation for notifying participating search engines when URLs change.", type: "documentation", canonicalUrl: "https://www.indexnow.org/documentation", isOfficial: true, topics: ["indexing", "technical-seo", "publishing"], skillLevels: ["Intermediate", "Advanced"], priority: "recommended", access: "free", durationLabel: "2-3 hours", learningOptions: [
    { mode: "reading", contentType: "documentation", title: "Read the IndexNow protocol", description: "Study key ownership, submissions, host rules, response handling, limits, and trigger design.", url: "https://www.indexnow.org/documentation", provider: "IndexNow", durationLabel: "2-3 hours", isOfficial: true, access: "free" },
  ] }),
  resource({ id: "geo-international", title: "Managing Multi-Regional and Multilingual Sites", provider: "Google Search Central", description: "Official guidance for locale URLs, hreflang, language signals, regional targeting, canonicals, and international architecture.", type: "documentation", canonicalUrl: "https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites", isOfficial: true, topics: ["international-seo", "hreflang", "localization"], skillLevels: ["Intermediate", "Advanced"], priority: "recommended", access: "free", durationLabel: "2-4 hours", learningOptions: [
    { mode: "reading", contentType: "documentation", title: "Study international-site architecture", description: "Learn locale URL design, hreflang, language and region signals, duplicate-content handling, and UX requirements.", url: "https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites", provider: "Google Search Central", durationLabel: "2-4 hours", isOfficial: true, access: "free" },
    { mode: "video", contentType: "official-course", title: "International SEO Course", description: "A free Semrush Academy course covering international research, URL structures, hreflang, localization, and implementation.", url: "https://www.semrush.com/academy/courses/international-seo-course-with-aleyda-solis/", provider: "Semrush Academy", durationLabel: "Self-paced", isOfficial: true, access: "free" },
    { mode: "practice", contentType: "hands-on-lab", title: "Audit hreflang and international technical issues", description: "Use Ahrefs Webmaster Tools to inspect hreflang, canonicals, crawlability, duplicates, and internal linking.", url: "https://ahrefs.com/webmaster-tools", provider: "Ahrefs Free", durationLabel: "2-4 hours", isOfficial: false, access: "free", curationReason: "Free real-site audit environment with repeatable validation." },
  ] }),
  resource({ id: "geo-career-workbook", title: "GEO Professional Readiness", provider: "AI Career OS / Industry Academies", description: "Use free structured training and assessments to consolidate GEO knowledge and convert it into portfolio evidence.", type: "career-path", canonicalUrl: "/careers/generative-engine-optimization-specialist/portfolio", isOfficial: true, topics: ["career", "portfolio", "geo"], skillLevels: ["Intermediate", "Advanced"], priority: "essential", access: "free", durationLabel: "4-6 hours", learningOptions: [
    { mode: "reading", contentType: "career-path", title: "Review the GEO portfolio requirements", description: "Document the problem, evidence, decisions, implementation, validation, uncertainty, and business implications of GEO work.", url: "/careers/generative-engine-optimization-specialist/portfolio", provider: "AI Career OS", durationLabel: "45-60 minutes", isOfficial: true, access: "free" },
    ahrefsAeoCourse,
    { mode: "practice", contentType: "official-course", title: "Complete the AEO Fundamentals assessment", description: "Finish HubSpot Academy's free course and map each learning outcome to a concrete portfolio artifact.", url: "https://academy.hubspot.com/courses/aeo-fundamentals-certification-en", provider: "HubSpot Academy", durationLabel: "2 hours 20 minutes plus assessment", isOfficial: true, access: "free" },
  ] }),
];
