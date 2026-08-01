import type { Metadata } from "next";
import { TopNavBar } from "@/components/global/TopNavBar";
import { Footer } from "@/components/global/Footer";
import { Button } from "@/components/ui/Button";

// Phase 9.3.13-B — not-found.tsx (Task 3).
//
// App Router's global 404 boundary (renders for any unmatched route, and
// wherever `notFound()` is called — e.g. the existing
// `portfolio/[slug]/page.tsx` when a slug doesn't resolve). No redesign:
// reuses the exact page shell (TopNavBar/Footer), typography, spacing, and
// token classes (--foreground, --surface, --border, --radius-lg, font-mono
// eyebrow) already established by every other page in this project — see
// e.g. `(public)/portfolio/page.tsx`'s hero section for the same pattern.

export const metadata: Metadata = {
  title: "Page not found — F Studio",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopNavBar />

      <main role="main" className="flex-1">
        <section className="px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-xs uppercase tracking-wide text-foreground/50">
              404
            </p>
            <h1 className="mt-3 text-balance font-sans text-4xl font-semibold tracking-tight text-foreground">
              Page not found
            </h1>
            <p className="mt-4 text-pretty leading-relaxed text-foreground/70">
              The page you&apos;re looking for doesn&apos;t exist or may have been moved.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button href="/">Back to home</Button>
              <Button href="/portfolio" variant="secondary">
                View portfolio
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
