import type { Metadata } from "next";
import { TopNavBarWrapper } from "@/components/global/TopNavBarWrapper";
import { Footer } from "@/components/global/Footer";
import { ClientReviewForm } from "./ClientReviewForm";

const PAGE_TITLE = "Client Review — F Studio";
const PAGE_DESCRIPTION = "Share feedback on your project with F Studio.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/client-review",
    siteName: "F Studio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

const GUIDELINES = [
  "Speak to the outcome, not just the process — what changed for your team?",
  "Specific details help future clients more than general praise.",
  "If something could have gone better, say so — it helps us improve.",
];

export default function ClientReviewPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopNavBarWrapper />

      <main role="main" className="flex-1">
        <section className="border-b border-border px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-wide text-foreground/50">
              Client review
            </p>
            <h1 className="mt-3 text-balance font-sans text-4xl font-semibold tracking-tight text-foreground">
              Tell us how the project went
            </h1>
            <p className="mt-4 max-w-2xl text-foreground/70">
              Your feedback helps us improve and helps future clients know what to expect.
            </p>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="aspect-video w-full rounded-[var(--radius-lg)] border border-border bg-surface" aria-hidden="true" />
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-[var(--radius-lg)] border border-border bg-surface-elevated p-8">
              <ClientReviewForm />
            </div>

            <div>
              <h2 className="font-sans text-lg font-semibold text-foreground">
                Guidelines for effective feedback
              </h2>
              <ul className="mt-4 flex flex-col gap-3">
                {GUIDELINES.map((guideline) => (
                  <li key={guideline} className="text-start text-sm leading-relaxed text-foreground/70">
                    {guideline}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
