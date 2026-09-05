import type { Metadata } from "next";
import { TopNavBarWrapper } from "@/components/global/TopNavBarWrapper";
import { Footer } from "@/components/global/Footer";
import { StatWidget } from "@/components/data/StatWidget";
import { MonoChip } from "@/components/content/MonoChip";
import { getServerTranslation } from "@/i18n/server";

const PAGE_TITLE = "About — F Studio";
const PAGE_DESCRIPTION = "Studio philosophy, mission, and process behind F Studio's work.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/about",
    siteName: "F Studio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

const TOOL_STACK = {
  Design: ["Figma", "Illustrator"],
  Dev: ["Next.js", "TypeScript", "Tailwind CSS"],
  Data: ["PostgreSQL", "Prisma"],
  AI: ["Claude", "Custom assistants"],
};

export default async function AboutPage() {
  const { dict } = await getServerTranslation();

  const values = [
    { title: dict.about.missionTitle, body: dict.about.missionBody },
    { title: dict.about.visionTitle, body: dict.about.visionBody },
  ];

  const processSteps = [
    dict.about.processStep1,
    dict.about.processStep2,
    dict.about.processStep3,
    dict.about.processStep4,
    dict.about.processStep5,
    dict.about.processStep6,
    dict.about.processStep7,
    dict.about.processStep8,
  ];

  const metrics = [
    { label: dict.about.metricProjectsDelivered, value: "60+" },
    { label: dict.about.metricClientRating, value: "4.9/5" },
    {
      label: dict.about.metricRepeatClientRate,
      value: "68%",
      trend: { direction: "up" as const, text: dict.about.metricVsLastYear },
    },
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <TopNavBarWrapper />

      <main role="main" className="flex-1">
        <section className="border-b border-border px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance font-sans text-4xl font-semibold tracking-tight text-foreground">
              {dict.about.heroTitle}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty leading-relaxed text-foreground/70">
              {dict.about.heroSubtitle}
            </p>
          </div>
        </section>

        <section className="bg-surface px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2">
            {values.map((value) => (
              <div key={value.title} className="rounded-[var(--radius-lg)] border border-border bg-surface-elevated p-8">
                <h2 className="font-sans text-lg font-semibold text-foreground">{value.title}</h2>
                <p className="mt-3 text-pretty leading-relaxed text-foreground/70">{value.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-sans text-2xl font-semibold text-foreground">
              {dict.about.workingProcess}
            </h2>
            <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {processSteps.map((step, index) => (
                <li
                  key={step}
                  className="rounded-[var(--radius-lg)] border border-border p-5"
                >
                  <span className="numeral-ltr font-mono text-xs text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-2 text-sm font-medium text-foreground">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-surface px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-sans text-2xl font-semibold text-foreground">
              {dict.about.technicalEcosystem}
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(TOOL_STACK).map(([group, tools]) => (
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

        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-sans text-2xl font-semibold text-foreground">
              {dict.about.clientSuccessMetrics}
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {metrics.map((metric) => (
                <StatWidget key={metric.label} label={metric.label} value={metric.value} trend={metric.trend} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
