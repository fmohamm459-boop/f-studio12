import type { Metadata } from "next";
import { TopNavBarWrapper } from "@/components/global/TopNavBarWrapper";
import { Footer } from "@/components/global/Footer";
import { ServiceCard } from "@/components/content/ServiceCard";
import { MonoChip } from "@/components/content/MonoChip";
import { SERVICES } from "@/lib/services-content";
import { LogoDesignIcon, BrandIdentityIcon, WebDevelopmentIcon, DataAnalysisIcon, AIIcon } from "@/lib/icons";

const PAGE_TITLE = "Services — F Studio";
const PAGE_DESCRIPTION = "Logo Design, Brand Identity, Website Development, Data Analysis, and AI.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/services",
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

const CAPABILITIES = [
  {
    title: "Technical Branding",
    items: ["Logo & mark systems", "Color & type systems", "Guidelines documentation"],
  },
  {
    title: "Design Engineering",
    items: ["Next.js application builds", "Design-token-driven Tailwind systems", "Accessibility audits"],
  },
];

const STACK = {
  Design: ["Figma", "Illustrator"],
  Engineering: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
  Data: ["PostgreSQL", "Prisma"],
};

const FAQ = [
  {
    q: "How long does a typical engagement take?",
    a: "Brand identity projects run 4–6 weeks; web builds typically run 6–10 weeks depending on scope.",
  },
  {
    q: "Do you work with existing design systems?",
    a: "Yes — we can extend an existing token system rather than starting from zero.",
  },
  {
    q: "Can you support both English and Arabic (RTL)?",
    a: "Yes — RTL/LTR support with logical CSS properties is standard on every build.",
  },
];

export default function ServicesPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopNavBarWrapper />

      <main role="main" className="flex-1">
        <section className="border-b border-border px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance font-sans text-4xl font-semibold tracking-tight text-foreground">
              Strategic design &amp; technical engineering
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty leading-relaxed text-foreground/70">
              Five disciplines, presented with one consistent anatomy so you can compare them at a
              glance.
            </p>
          </div>
        </section>

        {/* Disciplines */}
        <section className="bg-surface px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-sans text-2xl font-semibold text-foreground">Disciplines</h2>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map((service, index) => {
                const Icon = SERVICE_ICONS[index];
                return (
                  <ServiceCard
                    key={service.slug}
                    icon={<Icon />}
                    title={service.title}
                    description={service.description}
                    benefits={service.benefits}
                    ctaLabel={service.ctaLabel}
                    ctaHref="/contact"
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-sans text-2xl font-semibold text-foreground">Capabilities</h2>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {CAPABILITIES.map((group) => (
                <div key={group.title} className="rounded-[var(--radius-lg)] border border-border p-8">
                  <h3 className="font-sans text-lg font-semibold text-foreground">{group.title}</h3>
                  <ul className="mt-4 flex flex-col gap-2 text-sm text-foreground/70">
                    {group.items.map((item) => (
                      <li key={item} className="text-start">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stack Expertise */}
        <section className="bg-surface px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-sans text-2xl font-semibold text-foreground">Stack expertise</h2>
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
              {Object.entries(STACK).map(([group, tools]) => (
                <div key={group}>
                  <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">{group}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tools.map((tool) => (
                      <MonoChip key={tool}>{tool}</MonoChip>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-sans text-2xl font-semibold text-foreground">
              Frequently asked questions
            </h2>
            <div className="mt-8 flex flex-col divide-y divide-border rounded-[var(--radius-lg)] border border-border">
              {FAQ.map((item) => (
                <details key={item.q} className="group p-6">
                  <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-foreground">
                    <span className="text-start">{item.q}</span>
                    <svg
                      aria-hidden="true"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="shrink-0 transition-transform duration-150 group-open:rotate-45"
                    >
                      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </summary>
                  <p className="mt-3 text-start text-sm leading-relaxed text-foreground/70">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
