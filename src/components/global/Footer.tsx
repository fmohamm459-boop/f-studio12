"use client";

import Link from "next/link";
import { MonoChip } from "@/components/content/MonoChip";
import { useTranslation } from "@/i18n/client";

interface FooterProps {
  siteName?: string | null;
  description?: string | null;
  contactEmail?: string | null;
}

/**
 * Footer — public global component.
 * Fully translated, responsive, RTL-compatible, and connected with SiteSettings.
 */
export function Footer({
  siteName,
  description,
  contactEmail,
}: FooterProps) {
  const { t } = useTranslation();

  const siteLinks = [
    { label: t("nav.home", "Home"), href: "/" },
    { label: t("nav.about", "About"), href: "/about" },
    { label: t("nav.services", "Services"), href: "/services" },
    { label: t("nav.portfolio", "Portfolio"), href: "/portfolio" },
  ];

  const moreLinks = [
    { label: t("nav.brandIdentity", "Brand Identity"), href: "/brand-identity" },
    { label: t("nav.testimonials", "Testimonials"), href: "/testimonials" },
    { label: t("nav.contact", "Contact"), href: "/contact" },
  ];

  const displayName = siteName || "F Studio";
  const displayDescription =
    description ||
    t(
      "footer.legalNotice",
      "Digital design and technology solutions — brand identity, web development, data analysis, and AI."
    );
  const displayEmail = contactEmail || "hello@fstudio.example";

  return (
    <footer role="contentinfo" className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-sans text-lg font-semibold text-foreground">
              {displayName}
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-foreground/70">
              {displayDescription}
            </p>
          </div>

          <nav aria-label={t("footer.site", "Site Navigation")}>
            <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">
              {t("footer.site", "Site")}
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {siteLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t("footer.more", "More Navigation")}>
            <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">
              {t("footer.more", "More")}
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {moreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">
              {t("footer.contactInfo", "Contact")}
            </p>
            <div className="mt-4 flex flex-col items-start gap-2">
              <MonoChip>{displayEmail}</MonoChip>
              <MonoChip>{t("footer.workingHours", "Mon–Fri, 9:00–18:00")}</MonoChip>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-foreground/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {displayName}. {t("footer.rights", "All rights reserved.")}
          </p>
        </div>
      </div>
    </footer>
  );
}
