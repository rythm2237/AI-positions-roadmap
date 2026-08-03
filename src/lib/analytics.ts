export const analyticsEvents = {
  landingPageView: "landing_page_view",
  careerExplorerOpened: "career_explorer_opened",
  careerSelected: "career_selected",
  careerPageViewed: "career_page_viewed",
  roadmapPreviewOpened: "roadmap_preview_opened",
  signupStarted: "signup_started",
  signupCompleted: "signup_completed",
  loginCompleted: "login_completed",
  waitlistJoined: "waitlist_joined",
  assessmentStarted: "assessment_started",
  assessmentCompleted: "assessment_completed",
  learningStageOpened: "learning_stage_opened",
  projectOpened: "project_opened",
  salarySectionViewed: "salary_section_viewed",
  relatedCareerSelected: "related_career_selected",
  ctaClicked: "cta_clicked",
  outboundSourceClicked: "outbound_source_clicked",
  searchUsed: "search_used",
  careerComparisonOpened: "career_comparison_opened",
} as const;

export type AnalyticsEventName = (typeof analyticsEvents)[keyof typeof analyticsEvents];
export type AnalyticsParameters = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: AnalyticsEventName, parameters: AnalyticsParameters = {}) {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "production") return;

  const safeParameters = Object.fromEntries(
    Object.entries(parameters).filter(([, value]) => value !== undefined),
  );

  if (window.dataLayer) {
    window.dataLayer.push({ event: name, ...safeParameters });
  }

  if (window.gtag) {
    window.gtag("event", name, safeParameters);
  }
}
