"use client";

import React, {
  createContext,
  useContext,
  useState,
  useTransition,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import {
  type Locale,
  type Direction,
  DEFAULT_LOCALE,
  getDirectionForLocale,
} from "./config";
import { en, type TranslationDictionary } from "./en";
import { ar } from "./ar";
import { setLocaleAction } from "@/lib/actions/locale";

const DICTIONARIES: Record<Locale, TranslationDictionary> = {
  en,
  ar,
};

export type TranslationFunction = TranslationDictionary & {
  (path: string, fallback?: string): string;
};

function createTranslationFunction(dict: TranslationDictionary): TranslationFunction {
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

interface LanguageContextValue {
  locale: Locale;
  direction: Direction;
  isRtl: boolean;
  dict: TranslationDictionary;
  t: TranslationFunction;
  setLocale: (newLocale: Locale) => Promise<void>;
  isPending: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLocaleState(initialLocale);
  }, [initialLocale]);

  const direction = getDirectionForLocale(locale);
  const isRtl = direction === "rtl";
  const dict = DICTIONARIES[locale] ?? DICTIONARIES.en;

  // Sync document element lang and dir on locale change
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.dir = direction;
    }
  }, [locale, direction]);

  const t = useMemo(() => createTranslationFunction(dict), [dict]);

  const handleSetLocale = useCallback(
    async (newLocale: Locale) => {
      if (newLocale === locale) return;
      setLocaleState(newLocale);
      startTransition(async () => {
        await setLocaleAction(newLocale);
        router.refresh();
      });
    },
    [locale, router]
  );

  return (
    <LanguageContext.Provider
      value={{
        locale,
        direction,
        isRtl,
        dict,
        t,
        setLocale: handleSetLocale,
        isPending,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    const fallbackLocale = DEFAULT_LOCALE;
    const fallbackDirection = getDirectionForLocale(fallbackLocale);
    const fallbackDict = DICTIONARIES.en;
    const fallbackT = createTranslationFunction(fallbackDict);
    return {
      locale: fallbackLocale,
      direction: fallbackDirection,
      isRtl: fallbackDirection === "rtl",
      dict: fallbackDict,
      t: fallbackT,
      setLocale: async () => {},
      isPending: false,
    };
  }
  return context;
}
