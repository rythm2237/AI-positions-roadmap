import { DEFAULT_LOCALE, isSupportedLocale, type AppLocale } from "./config";

const NON_LOCALIZED_PREFIXES = [
  "/api",
  "/admin",
  "/_next",
  "/auth/callback",
] as const;

const STATIC_FILE_PATTERN = /\.[a-z0-9]{2,8}$/i;

function splitSuffix(input: string) {
  const index = input.search(/[?#]/);
  return index === -1
    ? { pathname: input, suffix: "" }
    : { pathname: input.slice(0, index), suffix: input.slice(index) };
}

function normalizePathname(pathname: string) {
  if (!pathname || pathname === "/") return "/";
  return `/${pathname.replace(/^\/+|\/+$/g, "")}`;
}

export function localeFromPath(path: string): AppLocale | null {
  const { pathname } = splitSuffix(path);
  const first = normalizePathname(pathname).split("/")[1];
  return isSupportedLocale(first) ? first : null;
}

export function stripLocalePrefix(path: string): string {
  const { pathname, suffix } = splitSuffix(path);
  const normalized = normalizePathname(pathname);
  const locale = localeFromPath(normalized);
  if (!locale) return `${normalized}${suffix}`;

  const stripped = normalized.replace(new RegExp(`^/${locale}(?=/|$)`), "") || "/";
  return `${stripped}${suffix}`;
}

export function isLocalizablePath(path: string): boolean {
  const { pathname } = splitSuffix(stripLocalePrefix(path));
  if (STATIC_FILE_PATTERN.test(pathname)) return false;
  return !NON_LOCALIZED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Returns the future locale-prefixed route without enabling routing by itself.
 * Existing production URLs remain unchanged until the localization phase.
 */
export function withLocale(path: string, locale: AppLocale = DEFAULT_LOCALE): string {
  const stripped = stripLocalePrefix(path);
  if (!isLocalizablePath(stripped)) return stripped;

  const { pathname, suffix } = splitSuffix(stripped);
  const normalized = normalizePathname(pathname);
  return normalized === "/"
    ? `/${locale}${suffix}`
    : `/${locale}${normalized}${suffix}`;
}

export function replaceLocale(path: string, locale: AppLocale): string {
  return withLocale(stripLocalePrefix(path), locale);
}
