export const SUPPORTED_LOCALES = ["en", "de", "fr", "fa", "hu"] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "en";
export const RTL_LOCALES = new Set<AppLocale>(["fa"]);
export const LOCALE_COOKIE_NAME = "airolepath_locale";

/**
 * Foundation flags only. Keep these disabled until the product/content freeze
 * and the dedicated localization phase begins.
 */
export const I18N_FEATURES = {
  localizedRoutes: false,
  automaticLocaleDetection: false,
  languageSwitcher: false,
} as const;

/** Future routing contract once localized routes are activated. */
export const LOCALE_PREFIX_MODE = "always" as const;

export const LOCALE_METADATA: Record<
  AppLocale,
  { languageTag: string; openGraphLocale: string; direction: "ltr" | "rtl" }
> = {
  en: { languageTag: "en", openGraphLocale: "en_US", direction: "ltr" },
  de: { languageTag: "de", openGraphLocale: "de_DE", direction: "ltr" },
  fr: { languageTag: "fr", openGraphLocale: "fr_FR", direction: "ltr" },
  fa: { languageTag: "fa", openGraphLocale: "fa_IR", direction: "rtl" },
  hu: { languageTag: "hu", openGraphLocale: "hu_HU", direction: "ltr" },
};

export function isSupportedLocale(value: string | null | undefined): value is AppLocale {
  return Boolean(value && (SUPPORTED_LOCALES as readonly string[]).includes(value.toLowerCase()));
}

export function normalizeLocale(value: string | null | undefined): AppLocale {
  if (!value) return DEFAULT_LOCALE;
  const base = value.trim().toLowerCase().split(/[-_]/, 1)[0];
  return isSupportedLocale(base) ? base : DEFAULT_LOCALE;
}

export function localeDirection(locale: AppLocale): "ltr" | "rtl" {
  return RTL_LOCALES.has(locale) ? "rtl" : "ltr";
}
