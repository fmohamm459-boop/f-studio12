import type { Metadata } from "next";
import { TopNavBarWrapper } from "@/components/global/TopNavBarWrapper";
import { Footer } from "@/components/global/Footer";
import { MonoChip } from "@/components/content/MonoChip";
import { getServerTranslation } from "@/i18n/server";

const PAGE_TITLE = "Brand Identity — F Studio";
const PAGE_DESCRIPTION =
  "The F Studio brand system: logo usage, color, typography, and iconography.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/brand-identity",
    siteName: "F Studio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};



export default async function BrandIdentityPage() {
  const { dict } = await getServerTranslation();

  const palette = [
    { name: dict.brandIdentity.colorPaper, hex: "#FBF9F9" },
    { name: dict.brandIdentity.colorInk, hex: "#1C1B1B" },
    { name: dict.brandIdentity.colorTeal, hex: "#008080" },
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <TopNavBarWrapper />

      <main role="main" className="flex-1">
        <section className="border-b border-border px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance font-sans text-4xl font-semibold tracking-tight text-foreground">
              {dict.brandIdentity.heroTitle}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty leading-relaxed text-foreground/70">
              {dict.brandIdentity.heroSubtitle}
            </p>
          </div>
        </section>

        {/* Logo Usage */}
        <section className="bg-surface px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-sans text-2xl font-semibold text-foreground">
              {dict.brandIdentity.logoUsage}
            </h2>
            <p className="mt-3 max-w-2xl text-foreground/70">
              {dict.brandIdentity.logoUsageDesc}
            </p>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex aspect-square flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-border bg-surface-elevated">
                <span className="font-sans text-2xl font-semibold text-foreground">F Studio</span>
                <MonoChip>{dict.brandIdentity.wordmarkLight}</MonoChip>
              </div>
              <div className="flex aspect-square flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] bg-foreground">
                <span className="font-sans text-2xl font-semibold text-background">F Studio</span>
                <MonoChip className="border-background/20 bg-transparent text-background/80">
                  {dict.brandIdentity.wordmarkDark}
                </MonoChip>
              </div>
            </div>
          </div>
        </section>

        {/* Color Palette */}
        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-sans text-2xl font-semibold text-foreground">
              {dict.brandIdentity.colorPalette}
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {palette.map((color) => (
                <div key={color.hex} className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
                  <div className="h-24" style={{ backgroundColor: color.hex }} aria-hidden="true" />
                  <div className="p-4">
                    <p className="text-sm font-medium text-foreground">{color.name}</p>
                    <p className="numeral-ltr mt-1 font-mono text-xs text-foreground/60">{color.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="bg-surface px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-sans text-2xl font-semibold text-foreground">
              {dict.brandIdentity.typography}
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-[var(--radius-lg)] border border-border bg-surface-elevated p-8">
                <MonoChip>{dict.brandIdentity.typographySansLabel}</MonoChip>
                <p className="mt-4 font-sans text-3xl font-semibold text-foreground">Aa Bb Cc</p>
                <p className="mt-2 font-sans text-sm text-foreground/70">
                  {dict.brandIdentity.typographySansDesc}
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-border bg-surface-elevated p-8">
                <MonoChip>{dict.brandIdentity.typographyMonoLabel}</MonoChip>
                <p className="mt-4 font-mono text-3xl font-semibold text-foreground">Aa Bb Cc</p>
                <p className="mt-2 font-sans text-sm text-foreground/70">
                  {dict.brandIdentity.typographyMonoDesc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Iconography */}
        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-sans text-2xl font-semibold text-foreground">
              {dict.brandIdentity.iconography}
            </h2>
            <p className="mt-3 max-w-2xl text-foreground/70">
              {dict.brandIdentity.iconographyDesc}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  aria-hidden="true"
                  className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-lg)] border border-border text-primary"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Gallery */}
        <section className="bg-surface px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-sans text-2xl font-semibold text-foreground">
              {dict.brandIdentity.applicationGallery}
            </h2>
            <p className="mt-3 max-w-2xl text-foreground/70">
              {dict.brandIdentity.applicationGalleryDesc}
            </p>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="aspect-video rounded-[var(--radius-lg)] border border-border bg-surface-elevated" aria-hidden="true" />
              <div className="aspect-[4/3] rounded-[var(--radius-lg)] border border-border bg-surface-elevated" aria-hidden="true" />
              <div className="aspect-square rounded-[var(--radius-lg)] border border-border bg-surface-elevated" aria-hidden="true" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
