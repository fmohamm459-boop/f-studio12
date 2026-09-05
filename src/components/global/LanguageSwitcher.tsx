"use client";

import { useTranslation } from "@/i18n/client";
import { type Locale } from "@/i18n/config";

interface LanguageSwitcherProps {
  variant?: "pill" | "minimal";
  className?: string;
}

export function LanguageSwitcher({
  variant = "pill",
  className = "",
}: LanguageSwitcherProps) {
  const { locale, setLocale, isPending, t } = useTranslation();

  const handleToggle = (targetLocale: Locale) => {
    if (locale === targetLocale || isPending) return;
    setLocale(targetLocale);
  };

  return (
    <div
      role="group"
      aria-label={t("nav.switchLanguage", "Switch Language")}
      className={`inline-flex items-center rounded-full border border-border bg-surface/80 p-0.5 text-xs font-medium backdrop-blur transition-colors ${className}`}
    >
      <button
        type="button"
        disabled={isPending}
        onClick={() => handleToggle("en")}
        aria-pressed={locale === "en"}
        className={`relative rounded-full px-2.5 py-1 transition-all duration-150 ${
          locale === "en"
            ? "bg-foreground font-semibold text-background shadow-xs"
            : "text-foreground/70 hover:text-foreground"
        }`}
      >
        EN
      </button>

      <button
        type="button"
        disabled={isPending}
        onClick={() => handleToggle("ar")}
        aria-pressed={locale === "ar"}
        className={`relative rounded-full px-2.5 py-1 transition-all duration-150 ${
          locale === "ar"
            ? "bg-foreground font-semibold text-background shadow-xs"
            : "text-foreground/70 hover:text-foreground"
        }`}
      >
        عربي
      </button>
    </div>
  );
}
