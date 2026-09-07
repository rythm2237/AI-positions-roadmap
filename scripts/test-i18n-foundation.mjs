import assert from "node:assert/strict";
import {
  DEFAULT_LOCALE,
  I18N_FEATURES,
  LOCALE_METADATA,
  SUPPORTED_LOCALES,
  localeDirection,
  normalizeLocale,
} from "../src/i18n/config.ts";
import { localeFromAcceptLanguage, resolveLocale } from "../src/i18n/detection.ts";
import {
  isLocalizablePath,
  localeFromPath,
  replaceLocale,
  stripLocalePrefix,
  withLocale,
} from "../src/i18n/path.ts";

assert.deepEqual(SUPPORTED_LOCALES, ["en", "de", "fr", "fa", "hu"]);
assert.equal(DEFAULT_LOCALE, "en");
assert.equal(I18N_FEATURES.localizedRoutes, false);
assert.equal(I18N_FEATURES.automaticLocaleDetection, false);
assert.equal(I18N_FEATURES.languageSwitcher, false);

assert.equal(normalizeLocale("de-DE"), "de");
assert.equal(normalizeLocale("fa_IR"), "fa");
assert.equal(normalizeLocale("xx"), "en");
assert.equal(localeDirection("fa"), "rtl");
assert.equal(localeDirection("de"), "ltr");
assert.equal(LOCALE_METADATA.hu.openGraphLocale, "hu_HU");

assert.equal(localeFromAcceptLanguage("fr-FR,fr;q=0.9,en;q=0.8"), "fr");
assert.equal(localeFromAcceptLanguage("es-MX,hu;q=0.7,en;q=0.6"), "hu");
assert.equal(localeFromAcceptLanguage("es-MX"), null);
assert.equal(resolveLocale({ explicitLocale: "de", persistedLocale: "fr", acceptLanguage: "hu" }), "de");
assert.equal(resolveLocale({ explicitLocale: "xx", persistedLocale: "fr", acceptLanguage: "hu" }), "fr");
assert.equal(resolveLocale({ acceptLanguage: "es-MX" }), "en");

assert.equal(localeFromPath("/fa/careers/ai-engineer"), "fa");
assert.equal(localeFromPath("/careers/ai-engineer"), null);
assert.equal(stripLocalePrefix("/de/careers/ai-engineer?entry=galaxy"), "/careers/ai-engineer?entry=galaxy");
assert.equal(withLocale("/careers/ai-engineer?entry=galaxy", "fr"), "/fr/careers/ai-engineer?entry=galaxy");
assert.equal(replaceLocale("/de/careers/ai-engineer", "fa"), "/fa/careers/ai-engineer");
assert.equal(withLocale("/", "hu"), "/hu");
assert.equal(isLocalizablePath("/api/waitlist"), false);
assert.equal(isLocalizablePath("/admin/login"), false);
assert.equal(isLocalizablePath("/auth/callback"), false);
assert.equal(isLocalizablePath("/icon.svg"), false);
assert.equal(isLocalizablePath("/careers"), true);

console.log("i18n foundation tests passed");
