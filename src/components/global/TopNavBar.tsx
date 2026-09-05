"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "@/i18n/client";

/**
 * TopNavBar — public global component.
 * Supports dynamic localization (EN/AR), LTR/RTL responsiveness,
 * and preserves SiteSettings branding (logoUrl & siteName).
 */
export function TopNavBar({
  logoUrl,
  siteName,
}: {
  logoUrl?: string | null;
  siteName?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const navLinks = [
    { label: t("nav.home", "Home"), href: "/" },
    { label: t("nav.about", "About"), href: "/about" },
    { label: t("nav.brandIdentity", "Brand Identity"), href: "/brand-identity" },
    { label: t("nav.services", "Services"), href: "/services" },
    { label: t("nav.portfolio", "Portfolio"), href: "/portfolio" },
    { label: t("nav.testimonials", "Testimonials"), href: "/testimonials" },
    { label: t("nav.contact", "Contact"), href: "/contact" },
  ];

  return (
    <header
      role="banner"
      className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-sans text-lg font-semibold tracking-tight text-foreground transition-opacity hover:opacity-90"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={siteName || "F Studio"}
              className="h-8 w-auto object-contain"
            />
          ) : (
            siteName || "F Studio"
          )}
        </Link>

        <nav aria-label={t("nav.menu", "Primary Navigation")} className="hidden lg:block">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-foreground/80 transition-colors duration-150 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher />
          <Button href="/contact" variant="primary">
            {t("nav.startProject", "Start a project")}
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher className="text-[11px]" />
          <button
            type="button"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-lg)] text-foreground"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t("common.close", "Close menu") : t("nav.menu", "Open menu")}
            onClick={() => setOpen((prev) => !prev)}
          >
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none">
              {open ? (
                <path
                  d="M5 5L15 15M15 5L5 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M2.5 5H17.5M2.5 10H17.5M2.5 15H17.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.nav
            id="mobile-nav"
            aria-label={t("nav.menu", "Primary Navigation")}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden border-t border-border lg:hidden"
          >
            <ul className="flex flex-col gap-1 px-4 py-4 sm:px-6">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-[44px] items-center text-start text-sm text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Button href="/contact" variant="primary" className="w-full">
                  {t("nav.startProject", "Start a project")}
                </Button>
              </li>
            </ul>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
