import type { Metadata } from "next";
import { TopNavBarWrapper } from "@/components/global/TopNavBarWrapper";
import { Footer } from "@/components/global/Footer";
import { Button } from "@/components/ui/Button";
import { validateReviewToken } from "@/lib/actions/review";
import { ReviewReveal } from "./ReviewReveal";
import { getServerTranslation } from "@/i18n/server";

type ReviewPageProps = {
  params: { token: string };
};

// Token-gated content is per-request and must never be statically cached
// or served stale — every visit re-validates against the database.


// Private links are not for search engines, regardless of whether the
// token turns out to be valid.
export const metadata: Metadata = {
  title: "Private review — F Studio",
  robots: { index: false, follow: false },
};

/**
 * Client Review — private token-link page (Phase 9.3.11, "Client Review
 * System via Private Token Links"; Phase 9.3 Decision Record 002's
 * private-review-link concept). Distinct from the existing static
 * `/client-review` feedback-form page (Page_Structure §9) — this route is
 * the presentation side: an admin-generated link (`generateReviewLink`)
 * that shows one project's review materials to whoever holds the token,
 * with no login and no client account, per that decision record.
 *
 * Global Components: TopNavBar, Footer (self-composed here, matching this
 * project's existing public-page convention).
 */
export default async function ReviewPage({ params }: ReviewPageProps) {
  const { dict } = await getServerTranslation();
  const project = await validateReviewToken(params.token);

  if (!project) {
    return (
      <div className="flex min-h-dvh flex-col">
        <TopNavBarWrapper />
        <main role="main" className="flex-1">
          <section className="px-4 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-mono text-xs uppercase tracking-wide text-foreground/50">
                {dict.review.badge}
              </p>
              <h1 className="mt-3 text-balance font-sans text-3xl font-semibold tracking-tight text-foreground">
                {dict.review.unavailableTitle}
              </h1>
              <p className="mt-4 text-pretty leading-relaxed text-foreground/70">
                {dict.review.unavailableDesc}
              </p>
              <div className="mt-8 flex justify-center">
                <Button href="/contact" variant="secondary">
                  {dict.review.contactStudio}
                </Button>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <TopNavBarWrapper />

      <main role="main" className="flex-1">
        {/* Hero */}
        <section className="border-b border-border px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-wide text-foreground/50">
              {dict.review.badge}
            </p>
            <h1 className="mt-4 text-balance font-sans text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {project.title}
            </h1>
            <p className="mt-4 max-w-xl text-pretty leading-relaxed text-foreground/70">
              {dict.review.heroDesc}
            </p>
          </div>
        </section>

        {/* Interactive Reveal */}
        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl">
            <ReviewReveal
              description={project.description}
              projectLink={project.projectLink}
              pdfFiles={project.pdfFiles}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
