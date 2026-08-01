import type { Metadata } from "next";
import { TopNavBar } from "@/components/global/TopNavBar";
import { Footer } from "@/components/global/Footer";
import { StatWidget } from "@/components/data/StatWidget";
import { getProjects } from "@/lib/data/projects";
import { PortfolioBrowser } from "./PortfolioBrowser";

const PAGE_TITLE = "Portfolio — F Studio";
const PAGE_DESCRIPTION = "The full list of F Studio projects across branding, web, data, and AI.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/portfolio",
    siteName: "F Studio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

// Reads live Project rows on every request (Phase 9.3.9, Database
// Integration) rather than the static PROJECTS mock array.
export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const PROJECTS = await getProjects();

  return (
    <div className="flex min-h-dvh flex-col">
      <TopNavBar />

      <main role="main" className="flex-1">
        <section className="border-b border-border px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-4xl">
            <p className="font-mono text-xs uppercase tracking-wide text-foreground/50">
              Portfolio
            </p>
            <h1 className="mt-3 text-balance font-sans text-4xl font-semibold tracking-tight text-foreground">
              The work
            </h1>
            <p className="mt-4 max-w-2xl text-foreground/70">
              Every project across brand identity, web development, data analysis, and AI.
            </p>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <PortfolioBrowser projects={PROJECTS} />
          </div>
        </section>

        <section className="bg-surface px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2">
            <StatWidget label="Total projects" value={String(PROJECTS.length)} />
            <StatWidget label="Client satisfaction" value="98%" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
