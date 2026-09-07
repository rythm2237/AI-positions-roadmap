import type { AppLocale } from "./config";

export type TranslationNamespace =
  | "common"
  | "navigation"
  | "landing"
  | "careers"
  | "careerWorkspace"
  | "roadmap"
  | "learning"
  | "careerIntelligence"
  | "cvAnalyzer"
  | "jobAgent"
  | "auth"
  | "onboarding"
  | "dashboard"
  | "legal"
  | "support";

export type TranslationValue = string | { [key: string]: TranslationValue };
export type TranslationDictionary = Partial<Record<TranslationNamespace, TranslationValue>>;

export type TranslationBundle = {
  locale: AppLocale;
  sourceLocale: "en";
  messages: TranslationDictionary;
};

/**
 * No translated page content is loaded yet. The final localization phase will
 * attach namespace loaders to this contract after the product/content freeze.
 */
export function englishFallbackBundle(messages: TranslationDictionary = {}): TranslationBundle {
  return {
    locale: "en",
    sourceLocale: "en",
    messages,
  };
}
