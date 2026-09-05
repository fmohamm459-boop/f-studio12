"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { logoutAction } from "@/lib/actions/auth";
import { useTranslation } from "@/i18n/client";

export type AdminNavKey =
  | "dashboard"
  | "projects"
  | "messages"
  | "testimonials"
  | "settings";

type NavItem = {
  key: AdminNavKey;
  href: string;
  icon: (props: { className?: string }) => React.ReactElement;
};

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="2.5" width="6.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2.5" y="11" width="6.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="11" width="6.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ProjectsIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="M2.5 5.5A1.5 1.5 0 0 1 4 4h3.5l1.5 2H16a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 16 16H4a1.5 1.5 0 0 1-1.5-1.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MessagesIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <rect x="2.5" y="4" width="15" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 5.5 10 10.5l6.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TestimonialsIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="M10 2.5 12 7l5 .7-3.6 3.4.9 4.9-4.3-2.3-4.3 2.3.9-4.9L2.9 7.7 8 7l2-4.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="10" r="2.75" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 3v1.6M10 15.4V17M17 10h-1.6M4.6 10H3M14.8 5.2l-1.1 1.1M6.3 13.7l-1.1 1.1M14.8 14.8l-1.1-1.1M6.3 6.3 5.2 5.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="M7.5 17H4.5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h3M13 13.5 17.5 10 13 6.5M17.5 10h-10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", href: "/admin/dashboard", icon: DashboardIcon },
  { key: "projects", href: "/admin/projects", icon: ProjectsIcon },
  { key: "messages", href: "/admin/messages", icon: MessagesIcon },
  { key: "testimonials", href: "/admin/testimonials", icon: TestimonialsIcon },
  { key: "settings", href: "/admin/settings", icon: SettingsIcon },
];

type SideNavBarProps = {
  active: AdminNavKey;
};

export function SideNavBar({ active }: SideNavBarProps) {
  const [open, setOpen] = useState(false);
  const { t, isRtl } = useTranslation();

  const nav = (
    <nav aria-label={t.admin.navAria} className="flex flex-1 flex-col gap-1 p-3">
      {NAV_ITEMS.map((item) => {
        const isActive = item.key === active;
        const Icon = item.icon;
        const label = t.admin[item.key] ?? item.key;
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            onClick={() => setOpen(false)}
            className={`relative flex min-h-[44px] items-center gap-3 rounded-[var(--radius-lg)] ps-4 pe-3 text-sm transition-colors duration-150 ${
              isActive
                ? "bg-surface font-semibold text-foreground"
                : "font-medium text-foreground/70 hover:bg-surface hover:text-foreground"
            }`}
          >
            {isActive ? (
              <span
                aria-hidden="true"
                className="absolute inset-y-1 start-0 w-0.5 rounded-full bg-primary"
              />
            ) : null}
            <Icon className="shrink-0 text-foreground/70" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Persistent sidebar, lg+ */}
      <aside className="hidden w-64 shrink-0 border-e border-border bg-surface-elevated lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Link
            href="/admin/dashboard"
            dir="ltr"
            className="font-sans text-lg font-semibold tracking-tight text-foreground"
          >
            F Studio
          </Link>
        </div>
        {nav}
        <div className="border-t border-border p-3">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex min-h-[44px] w-full items-center gap-3 rounded-[var(--radius-lg)] ps-4 pe-3 text-sm font-medium text-foreground/70 transition-colors duration-150 hover:bg-surface hover:text-foreground"
              aria-label={t.admin.logoutAria}
            >
              <LogoutIcon className="shrink-0" />
              <span>{t.admin.logout}</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile trigger + slide-in drawer, below lg */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="admin-mobile-nav"
        aria-label={t.admin.openNav}
        className="fixed bottom-4 start-4 z-40 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-lg)] border border-border bg-surface-elevated text-foreground shadow-[var(--shadow-md)] lg:hidden"
      >
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M2.5 5H17.5M2.5 10H17.5M2.5 15H17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <button
              type="button"
              aria-label={t.admin.closeNav}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-ink/40"
            />
            <motion.div
              id="admin-mobile-nav"
              role="dialog"
              aria-modal="true"
              aria-label={t.admin.navAria}
              initial={{ x: isRtl ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? "100%" : "-100%" }}
              transition={{ duration: 0.18 }}
              className="absolute inset-y-0 start-0 flex w-72 max-w-[80vw] flex-col bg-surface-elevated"
            >
              <div className="flex h-16 items-center justify-between border-b border-border px-5">
                <span dir="ltr" className="font-sans text-lg font-semibold tracking-tight text-foreground">
                  F Studio
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t.admin.closeNav}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-lg)] text-foreground"
                >
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M4.5 4.5 13.5 13.5M13.5 4.5 4.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              {nav}
              <div className="border-t border-border p-3">
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="flex min-h-[44px] w-full items-center gap-3 rounded-[var(--radius-lg)] ps-4 pe-3 text-sm font-medium text-foreground/70 hover:bg-surface hover:text-foreground"
                    aria-label={t.admin.logoutAria}
                  >
                    <LogoutIcon className="shrink-0" />
                    <span>{t.admin.logout}</span>
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
