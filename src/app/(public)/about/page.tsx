import type { Metadata } from "next";
import { TopNavBarWrapper } from "@/components/global/TopNavBarWrapper";
import { Footer } from "@/components/global/Footer";
import { StatWidget } from "@/components/data/StatWidget";
import { MonoChip } from "@/components/content/MonoChip";

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

const VALUES = [
  { title: "Mission", body: "Build digital work that is as considered under the hood as it looks on the surface." },
  { title: "Vision", body: "A studio where brand, code, data, and AI are practiced as one discipline." },
];

const PROCESS_STEPS = [
  "Discovery call",
  "Research & audit",
  "Direction & concepts",
  "Design system",
  "Build",
  "Content & data wiring",
  "QA & accessibility pass",
  "Launch & handoff",
];

const TOOL_STACK = {
  Design: ["Figma", "Illustrator"],
  Dev: ["Next.js", "TypeScript", "Tailwind CSS"],
  Data: ["PostgreSQL", "Prisma"],
  AI: ["Claude", "Custom assistants"],
};

const METRICS = [
  { label: "Projects delivered", value: "60+" },
  { label: "Avg. client rating", value: "4.9/5" },
  { label: "Repeat client rate", value: "68%", trend: { direction: "up" as const, text: "vs. last year" } },
];

export default function AboutPage() {
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
              F Studio exists at the intersection of brand craft and software engineering — one
              team, one system, from identity through to production data.
            </p>
          </div>
        </section>

        <section className="bg-surface px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2">
            {VALUES.map((value) => (
              <div key={value.title} className="rounded-[var(--radius-lg)] border border-border bg-surface-elevated p-8">
                <h2 className="font-sans text-lg font-semibold text-foreground">{value.title}</h2>
                <p className="mt-3 text-pretty leading-relaxed text-foreground/70">{value.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-sans text-2xl font-semibold text-foreground">Working process</h2>
            <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PROCESS_STEPS.map((step, index) => (
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
            <h2 className="font-sans text-2xl font-semibold text-foreground">Technical ecosystem</h2>
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
            <h2 className="font-sans text-2xl font-semibold text-foreground">Client success metrics</h2>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {METRICS.map((metric) => (
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
