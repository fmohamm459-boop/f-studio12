import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  isSupportedLocale,
  getDirectionForLocale,
  type Locale,
  type Direction,
} from "./config";
import { en, type TranslationDictionary } from "./en";
import { ar } from "./ar";

const DICTIONARIES: Record<Locale, TranslationDictionary> = {
  en,
  ar,
};

export type ServerTranslationFunction = TranslationDictionary & {
  (path: string, fallback?: string): string;
};

function createTranslationFunction(dict: TranslationDictionary): ServerTranslationFunction {
  const fn = function (path: string, fallback?: string): string {
    const segments = path.split(".");
    let current: unknown = dict;

    for (const segment of segments) {
      if (current && typeof current === "object" && segment in current) {
        current = (current as Record<string, unknown>)[segment];
      } else {
        return fallback ?? path;
      }
    }

    return typeof current === "string" ? current : (fallback ?? path);
  };

  return Object.assign(fn, dict);
}

export function getDictionary(locale: Locale): TranslationDictionary {
  return DICTIONARIES[locale] ?? DICTIONARIES.en;
}

export async function getServerLocale(): Promise<Locale> {
  // 1. Check Cookie first
  try {
    const cookieStore = cookies();
    const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
    if (isSupportedLocale(cookieLocale)) {
      return cookieLocale;
    }
  } catch {
    // cookies() might not be available in non-request contexts
  }

  // 2. Check SiteSettings in Database
  try {
    const settings = await prisma.siteSettings.findFirst({
      select: { language: true },
    });
    if (settings?.language && isSupportedLocale(settings.language)) {
      return settings.language;
    }
  } catch {
    // Database might be unreachable or initializing
  }

  // 3. Fallback to DEFAULT_LOCALE ("en")
  return DEFAULT_LOCALE;
}

export async function getServerTranslation() {
  const locale = await getServerLocale();
  const direction: Direction = getDirectionForLocale(locale);
  const isRtl = direction === "rtl";
  const dict = getDictionary(locale);
  const t = createTranslationFunction(dict);

  return {
    locale,
    direction,
    isRtl,
    dict,
    t,
  };
}
