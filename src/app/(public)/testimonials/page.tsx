import type { Metadata } from "next";
import { TopNavBar } from "@/components/global/TopNavBar";
import { Footer } from "@/components/global/Footer";
import { TestimonialCard } from "@/components/content/TestimonialCard";
import { StatWidget } from "@/components/data/StatWidget";
import { getTestimonials } from "@/lib/data/testimonials";

const PAGE_TITLE = "Testimonials — F Studio";
const PAGE_DESCRIPTION = "Client feedback and satisfaction evidence from F Studio projects.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/testimonials",
    siteName: "F Studio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

// Reads live Testimonial rows on every request (Phase 9.3.9, Database
// Integration) rather than the static TESTIMONIALS mock array.
export const dynamic = "force-dynamic";

export default async function TestimonialsPage() {
  const TESTIMONIALS = await getTestimonials();
  const [featured, ...rest] = TESTIMONIALS;

  if (!featured) {
    return (
      <div className="flex min-h-dvh flex-col">
        <TopNavBar />
        <main role="main" className="flex-1 px-4 py-24 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-foreground/70">No testimonials yet.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <TopNavBar />

      <main role="main" className="flex-1">
        <section className="border-b border-border px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance font-sans text-4xl font-semibold tracking-tight text-foreground">
              Client feedback
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty leading-relaxed text-foreground/70">
              What studio partners say after working with us end to end.
            </p>
          </div>
        </section>

        <section className="bg-surface px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl">
            <TestimonialCard
              quote={featured.quote}
              author={featured.author}
              role={featured.role}
              rating={featured.rating}
              featured
            />
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-6xl columns-1 gap-6 sm:columns-2 lg:columns-3">
            {rest.map((testimonial) => (
              <div key={testimonial.id} className="mb-6 break-inside-avoid">
                <TestimonialCard
                  quote={testimonial.quote}
                  author={testimonial.author}
                  role={testimonial.role}
                  rating={testimonial.rating}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
            <StatWidget label="Average rating" value="4.9/5" />
            <StatWidget label="Projects with feedback" value={String(TESTIMONIALS.length)} />
            <StatWidget label="Would recommend" value="97%" trend={{ direction: "up", text: "vs. last survey" }} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
