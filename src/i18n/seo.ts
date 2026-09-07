import { absoluteUrl } from "@/lib/seo";
import { SUPPORTED_LOCALES, type AppLocale } from "./config";
import { withLocale } from "./path";

export function localizedAbsoluteUrl(path: string, locale: AppLocale): string {
  return absoluteUrl(withLocale(path, locale));
}

/**
 * Prepared for the final localization phase. Do not wire this into live metadata
 * until localized routes are actually enabled and translated content exists.
 */
export function localizedAlternates(path: string) {
  const languages = Object.fromEntries(
    SUPPORTED_LOCALES.map((locale) => [locale, localizedAbsoluteUrl(path, locale)]),
  );

  return {
    canonical: localizedAbsoluteUrl(path, "en"),
    languages: {
      ...languages,
      "x-default": localizedAbsoluteUrl(path, "en"),
    },
  };
}
