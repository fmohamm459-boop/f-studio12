"use client";

import { useEffect } from "react";
import { TopNavBar } from "@/components/global/TopNavBar";
import { Footer } from "@/components/global/Footer";
import { Button } from "@/components/ui/Button";

// Phase 9.3.13-B — error.tsx (Task 4).
//
// App Router error boundary (must be a Client Component — Next.js
// requirement, since it wraps its segment in a React error boundary at
// runtime). Catches rendering errors in any public page below the root
// layout and offers graceful recovery via `reset()`, which re-renders the
// segment without a full reload. No redesign: same shell/tokens as
// not-found.tsx and every other page (TopNavBar/Footer, --foreground,
// --surface, --border, --radius-lg, font-mono eyebrow).
//
// No `metadata` export here — error.tsx is a Client Component, and the
// Metadata API is a Server Component–only feature (same reason
// portfolio/[slug]/page.tsx's own `generateMetadata` stays in that
// Server Component page rather than here).

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to the console only — no external error-reporting service exists
    // in this project yet (out of scope; not introduced here).
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col">
      <TopNavBar />

      <main role="main" className="flex-1">
        <section className="px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-xs uppercase tracking-wide text-foreground/50">
              Error
            </p>
            <h1 className="mt-3 text-balance font-sans text-4xl font-semibold tracking-tight text-foreground">
              Something went wrong
            </h1>
            <p className="mt-4 text-pretty leading-relaxed text-foreground/70">
              An unexpected error occurred while loading this page. You can try again, or head
              back to the homepage.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button onClick={() => reset()}>Try again</Button>
              <Button href="/" variant="secondary">
                Back to home
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
