import type { Metadata } from "next";
import { TopNavBarWrapper } from "@/components/global/TopNavBarWrapper";
import { Footer } from "@/components/global/Footer";
import { ServiceCard } from "@/components/content/ServiceCard";
import { ProjectCard } from "@/components/content/ProjectCard";
import { TestimonialCard } from "@/components/content/TestimonialCard";
import { Button } from "@/components/ui/Button";
import { getLocalizedServices } from "@/lib/services-content";
import { getProjects } from "@/lib/data/projects";
import { getTestimonials } from "@/lib/data/testimonials";
import { LogoDesignIcon, BrandIdentityIcon, WebDevelopmentIcon, DataAnalysisIcon, AIIcon } from "@/lib/icons";
import { getServerTranslation } from "@/i18n/server";

const PAGE_TITLE = "F Studio — Digital Design & Technology Solutions";
const PAGE_DESCRIPTION =
  "Brand identity, web development, data analysis, and AI — built as one coherent system.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/",
    siteName: "F Studio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

const SERVICE_ICONS = [LogoDesignIcon, BrandIdentityIcon, WebDevelopmentIcon, DataAnalysisIcon, AIIcon];

// Reads live Project/Testimonial rows on every request (Phase 9.3.9,
// Database Integration — same pattern already used by
// (public)/portfolio/page.tsx and (public)/testimonials/page.tsx) rather
// than the static PROJECTS/TESTIMONIALS mock arrays (Phase 9.3.14-A Fix 1).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { dict, locale } = await getServerTranslation();
  const projects = await getProjects();
  const testimonials = await getTestimonials({ status: "APPROVED" });
  const featuredProjects = projects.slice(0, 3);
  const featuredTestimonial = testimonials[0];
  const services = getLocalizedServices(locale);

  const whyUsItems = [
    { title: dict.home.whyUsQualityTitle, body: dict.home.whyUsQualityBody },
    { title: dict.home.whyUsTechTitle, body: dict.home.whyUsTechBody },
    { title: dict.home.whyUsSolutionsTitle, body: dict.home.whyUsSolutionsBody },
    { title: dict.home.whyUsApproachTitle, body: dict.home.whyUsApproachBody },
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <TopNavBarWrapper />

      <main role="main" className="flex-1">
        {/* Hero */}
        <section className="border-b border-border bg-background px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mt-4 text-balance font-sans text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {dict.home.heroTitle}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-foreground/70">
              {dict.home.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button href="/contact">{dict.home.startProject}</Button>
              <Button href="/portfolio" variant="secondary">
                {dict.home.viewTheWork}
              </Button>
            </div>
          </div>
        </section>

        {/* Who We Are */}
        <section className="bg-surface px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-sans text-2xl font-semibold text-foreground">
              {dict.home.whoWeAreTitle}
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-foreground/70">
              {dict.home.whoWeAreBody}
            </p>
          </div>
        </section>

        {/* Integrated Technical Expertise */}
        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-sans text-2xl font-semibold text-foreground">
                {dict.home.expertiseTitle}
              </h2>
              <p className="mt-3 text-pretty text-foreground/70">
                {dict.home.expertiseSubtitle}
              </p>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => {
                const Icon = SERVICE_ICONS[index];
                return (
                  <ServiceCard
                    key={service.slug}
                    icon={<Icon />}
                    title={service.title}
                    description={service.description}
                    benefits={service.benefits}
                    ctaLabel={service.ctaLabel}
                    ctaHref="/services"
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* Selected Works */}
        {featuredProjects.length > 0 ? (
          <section className="bg-surface px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-6xl">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 className="font-sans text-2xl font-semibold text-foreground">
                  {dict.home.selectedWorks}
                </h2>
                <Button href="/portfolio" variant="ghost">
                  {dict.home.viewAllProjects}
                </Button>
              </div>
              <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredProjects.map((project) => (
                  <ProjectCard
                    key={project.slug}
                    slug={project.slug}
                    title={project.title}
                    category={project.category}
                    client={project.client}
                    description={project.summary}
                    tags={project.tags}
                    viewProjectText={dict.portfolio.viewProject}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* Why Us */}
        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-sans text-2xl font-semibold text-foreground">
              {dict.home.whyUsTitle}
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {whyUsItems.map((item) => (
                <div key={item.title} className="rounded-[var(--radius-lg)] border border-border p-6">
                  <h3 className="font-sans text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/70">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Client Feedback */}
        {featuredTestimonial ? (
          <section className="bg-surface px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-center font-sans text-2xl font-semibold text-foreground">
                {dict.home.clientFeedbackTitle}
              </h2>
              <div className="mt-10">
                <TestimonialCard
                  quote={featuredTestimonial.quote}
                  author={featuredTestimonial.author}
                  role={featuredTestimonial.role}
                  rating={featuredTestimonial.rating}
                  featured
                />
              </div>
            </div>
          </section>
        ) : null}

        {/* Final CTA */}
        <section className="px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-balance font-sans text-2xl font-semibold text-foreground">
              {dict.home.readyToScaleTitle}
            </h2>
            <p className="mt-3 text-foreground/70">
              {dict.home.readyToScaleBody}
            </p>
            <div className="mt-8">
              <Button href="/contact">{dict.home.startProject}</Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
