"use client";

import { useEffect, useState } from "react";

type Breadcrumb = {
  label: string;
  href?: string;
};

type AdminHeaderProps = {
  title: string;
  breadcrumbs?: Breadcrumb[];
  unreadNotifications?: number;
};

function BellIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M9 2.5c-2 0-3.5 1.6-3.5 3.6v2.2c0 .5-.2 1-.5 1.4l-1 1.2c-.4.5 0 1.2.6 1.2h8.8c.6 0 1-.7.6-1.2l-1-1.2c-.3-.4-.5-.9-.5-1.4V6.1c0-2-1.5-3.6-3.5-3.6Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M7.4 14.2a1.6 1.6 0 0 0 3.2 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="3.25" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M9 1.75v1.6M9 14.65v1.6M16.25 9h-1.6M3.35 9h-1.6M13.9 4.1l-1.13 1.13M5.23 12.87l-1.13 1.13M13.9 13.9l-1.13-1.13M5.23 5.13 4.1 4.1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M15 10.4A6 6 0 0 1 7.6 3a6 6 0 1 0 7.4 7.4Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * AdminHeader — admin Global Component (Component_List §15.2; Page_Structure
 * §12–§16 "Global Components: SideNavBar, Admin Header").
 * Renders the page's single <h1> on reading-start; notifications, language,
 * and theme toggles sit on reading-end and collapse into an overflow menu on
 * small screens. No auth/session logic — the theme toggle only flips the
 * existing `.dark` token set already defined in globals.css, and the language
 * control is a static EN/AR label (no i18n routing wired at this stage).
 */
export function AdminHeader({ title, breadcrumbs, unreadNotifications = 2 }: AdminHeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState<"EN" | "AR">("EN");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <header
      role="banner"
      className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8"
    >
      <div className="min-w-0 flex-1">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-xs text-foreground/60">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.label} className="flex items-center gap-1.5">
                  <span>{crumb.label}</span>
                  {index < breadcrumbs.length - 1 ? <span aria-hidden="true">/</span> : null}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <h1 className="truncate text-start font-sans text-lg font-semibold text-foreground">{title}</h1>
      </div>

      {/* Full controls, sm+ */}
      <div className="hidden items-center gap-1.5 sm:flex">
        <button
          type="button"
          className="relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-lg)] text-foreground/80 hover:bg-surface hover:text-foreground"
          aria-label={`Notifications, ${unreadNotifications} unread`}
        >
          <BellIcon />
          {unreadNotifications > 0 ? (
            <span
              aria-hidden="true"
              className="numeral-ltr absolute end-2 top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground"
            >
              {unreadNotifications}
            </span>
          ) : null}
        </button>

        <button
          type="button"
          onClick={() => setLang((prev) => (prev === "EN" ? "AR" : "EN"))}
          className="flex min-h-[44px] items-center justify-center rounded-[var(--radius-lg)] px-3 font-mono text-xs uppercase text-foreground/80 hover:bg-surface hover:text-foreground"
          aria-label={`Language, currently ${lang === "EN" ? "English" : "Arabic"}`}
        >
          {lang}
        </button>

        <button
          type="button"
          onClick={() => setIsDark((prev) => !prev)}
          aria-pressed={isDark}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-lg)] text-foreground/80 hover:bg-surface hover:text-foreground"
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
        >
          {isDark ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>

      {/* Overflow menu, below sm */}
      <details className="relative sm:hidden">
        <summary
          aria-label="More header controls"
          className="flex min-h-[44px] min-w-[44px] list-none items-center justify-center rounded-[var(--radius-lg)] text-foreground/80 [&::-webkit-details-marker]:hidden"
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="4" cy="9" r="1.2" fill="currentColor" />
            <circle cx="9" cy="9" r="1.2" fill="currentColor" />
            <circle cx="14" cy="9" r="1.2" fill="currentColor" />
          </svg>
        </summary>
        <div className="absolute end-0 z-10 mt-2 flex w-48 flex-col gap-1 rounded-[var(--radius-lg)] border border-border bg-surface-elevated p-2 shadow-[var(--shadow-md)]">
          <button
            type="button"
            className="flex min-h-[44px] items-center gap-2.5 rounded-[var(--radius-lg)] px-2.5 text-sm text-foreground/80 hover:bg-surface"
            aria-label={`Notifications, ${unreadNotifications} unread`}
          >
            <BellIcon />
            <span>
              Notifications <span className="numeral-ltr">({unreadNotifications})</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setLang((prev) => (prev === "EN" ? "AR" : "EN"))}
            className="flex min-h-[44px] items-center gap-2.5 rounded-[var(--radius-lg)] px-2.5 text-sm text-foreground/80 hover:bg-surface"
          >
            <span aria-hidden="true" className="font-mono text-xs uppercase">
              {lang}
            </span>
            <span>Language</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDark((prev) => !prev)}
            aria-pressed={isDark}
            className="flex min-h-[44px] items-center gap-2.5 rounded-[var(--radius-lg)] px-2.5 text-sm text-foreground/80 hover:bg-surface"
          >
            {isDark ? <MoonIcon /> : <SunIcon />}
            <span>{isDark ? "Dark theme" : "Light theme"}</span>
          </button>
        </div>
      </details>
    </header>
  );
}
