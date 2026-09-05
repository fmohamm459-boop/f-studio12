"use client";

import React, {
  createContext,
  useContext,
  useState,
  useTransition,
  useCallback,
  useEffect,
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

interface LanguageContextValue {
  locale: Locale;
  direction: Direction;
  dict: TranslationDictionary;
  t: (path: string, fallback?: string) => string;
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

  const dict = DICTIONARIES[locale] ?? DICTIONARIES.en;

  // Sync document element lang and dir on locale change
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.dir = direction;
    }
  }, [locale, direction]);

  const t = useCallback(
    (path: string, fallback?: string): string => {
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
    },
    [dict]
  );

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
    return {
      locale: fallbackLocale,
      direction: fallbackDirection,
      dict: fallbackDict,
      t: (path: string, fallback?: string) => {
        const segments = path.split(".");
        let current: unknown = fallbackDict;
        for (const segment of segments) {
          if (current && typeof current === "object" && segment in current) {
            current = (current as Record<string, unknown>)[segment];
          } else {
            return fallback ?? path;
          }
        }
        return typeof current === "string" ? current : (fallback ?? path);
      },
      setLocale: async () => {},
      isPending: false,
    };
  }
  return context;
}
