import Link from "next/link";
import { MonoChip } from "@/components/content/MonoChip";

const SITE_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
];

const MORE_LINKS = [
  { label: "Brand Identity", href: "/brand-identity" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Contact", href: "/contact" },
];

/**
 * Footer — public global component (Page_Structure PART A, every page).
 * One wordmark instance (UI_Guidelines §18.1). Contact info rendered as
 * mono-labels per the studio's technical visual personality (§19.2).
 */
export function Footer() {
  return (
    <footer role="contentinfo" className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-sans text-lg font-semibold text-foreground">F Studio</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-foreground/70">
              Digital design and technology solutions — brand identity, web development, data
              analysis, and AI.
            </p>
          </div>

          <nav aria-label="Site">
            <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">Site</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {SITE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-foreground/80 hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="More">
            <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">More</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {MORE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-foreground/80 hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">Contact</p>
            <div className="mt-4 flex flex-col items-start gap-2">
              <MonoChip>hello@fstudio.example</MonoChip>
              <MonoChip>Mon–Fri, 9:00–18:00</MonoChip>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-foreground/50 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} F Studio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
