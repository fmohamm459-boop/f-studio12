export type Locale = "en" | "ar";
export type Direction = "ltr" | "rtl";

export const DEFAULT_LOCALE: Locale = "en";
export const SUPPORTED_LOCALES: readonly Locale[] = ["en", "ar"] as const;

export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export const LOCALE_DIRECTIONS: Record<Locale, Direction> = {
  en: "ltr",
  ar: "rtl",
};

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
};

export const LOCALE_SHORT_LABELS: Record<Locale, string> = {
  en: "EN",
  ar: "عربي",
};

export function isSupportedLocale(locale: string | undefined | null): locale is Locale {
  return typeof locale === "string" && SUPPORTED_LOCALES.includes(locale as Locale);
}

export function getDirectionForLocale(locale: Locale): Direction {
  return LOCALE_DIRECTIONS[locale] ?? "ltr";
}
