import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  type AppLocale,
} from "./config";

export type LocaleSignals = {
  explicitLocale?: string | null;
  persistedLocale?: string | null;
  acceptLanguage?: string | null;
};

function supportedBaseLocale(value: string | null | undefined): AppLocale | null {
  if (!value) return null;
  const base = value.trim().toLowerCase().split(/[-_]/, 1)[0];
  return isSupportedLocale(base) ? base : null;
}

export function localeFromAcceptLanguage(header: string | null | undefined): AppLocale | null {
  if (!header) return null;

  const candidates = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qualityParam = params.find((param) => param.trim().startsWith("q="));
      const quality = qualityParam ? Number(qualityParam.trim().slice(2)) : 1;
      return { tag, quality: Number.isFinite(quality) ? quality : 0 };
    })
    .filter((candidate) => candidate.tag && candidate.quality > 0)
    .sort((a, b) => b.quality - a.quality);

  for (const candidate of candidates) {
    const locale = supportedBaseLocale(candidate.tag);
    if (locale) return locale;
  }

  return null;
}

/**
 * Resolution order for the future localization phase:
 * explicit user choice -> persisted preference -> browser header -> English.
 * This function has no redirect or persistence side effects.
 */
export function resolveLocale(signals: LocaleSignals): AppLocale {
  return (
    supportedBaseLocale(signals.explicitLocale) ??
    supportedBaseLocale(signals.persistedLocale) ??
    localeFromAcceptLanguage(signals.acceptLanguage) ??
    DEFAULT_LOCALE
  );
}
