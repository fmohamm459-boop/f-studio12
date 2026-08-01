import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { TopNavBar } from "@/components/global/TopNavBar";
import { Footer } from "@/components/global/Footer";
import { MonoChip } from "@/components/content/MonoChip";
import { StatWidget } from "@/components/data/StatWidget";
import { Button } from "@/components/ui/Button";
import { getProjectBySlug, getProjectSlugs, getProjects } from "@/lib/data/projects";

// Phase 9.3.14-D, Task 1 — Public Project Media Rendering. Cosmetic-only
// filename derivation for a stored Cloudinary file URL (same approach as
// the existing private Review page's `fileLabel`, src/app/(public)/review/
// [token]/ReviewReveal.tsx) — never used for anything but the visible
// label; the actual download always uses the full original `href`.
function pdfFileLabel(url: string, index: number): string {
  try {
    const { pathname } = new URL(url);
    const last = pathname.split("/").filter(Boolean).pop();
    if (last) return decodeURIComponent(last);
  } catch {
    // Not a parseable absolute URL — fall through to the generic label.
  }
  return `Resource ${index + 1}`;
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="M6 2.5h5.5L16 7v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M11.5 2.5V7H16" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

type ProjectDetailsPageProps = {
  params: { slug: string };
};

// Reads live Project rows (Phase 9.3.9, Database Integration) rather than
// the static PROJECTS mock array. Slugs not returned here still render
// on-demand — Next's dynamicParams default (true) is unchanged.
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProjectDetailsPageProps): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);
  // Draft projects are not publicly viewable (Phase 9.3.13-B Hotfix 2) —
  // treat them the same as a missing project so no SEO metadata is ever
  // generated for unpublished work.
  if (!project || project.status !== "Published") {
    return { title: "Project not found — F Studio" };
  }

  // Every field below is read from `project` (already fetched above) —
  // no separate SEO copy is authored or duplicated for this page.
  const title = `${project.title} — F Studio`;
  const description = project.summary;
  // heroImage (Phase 9.3.12 Stage 2) is a real, admin-uploaded Cloudinary
  // URL when present — unlike the static pages in this phase, which have
  // no shipped default OG image asset to reference (see the phase
  // report's "Remaining limitations"). Falls back to no image, not a
  // fabricated path, when a project has none.
  const openGraphImages = project.heroImage ? [{ url: project.heroImage }] : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/portfolio/${project.slug}`,
      siteName: "F Studio",
      type: "article",
      images: openGraphImages,
    },
    twitter: {
      card: openGraphImages ? "summary_large_image" : "summary",
      title,
      description,
      images: openGraphImages,
    },
  };
}

const NARRATIVE_ORDER: { key: "overview" | "challenge" | "research" | "solution"; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "challenge", label: "Challenge" },
  { key: "research", label: "Research & direction" },
  { key: "solution", label: "Solution" },
];

export default async function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
  const allProjects = await getProjects();
  const index = allProjects.findIndex((item) => item.slug === params.slug);
  const project = allProjects[index];

  // Draft projects exist in the database (admin work-in-progress) but are
  // not publicly viewable — only a Published project may render here
  // (Phase 9.3.13-B Hotfix 2). Published projects are unaffected.
  if (!project || project.status !== "Published") {
    notFound();
  }

  const nextProject = allProjects[(index + 1) % allProjects.length];

  return (
    <div className="flex min-h-dvh flex-col">
      <TopNavBar />

      <main role="main" className="flex-1">
        {/* Project Hero */}
        <section className="border-b border-border px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-5xl">
            <MonoChip>{project.category}</MonoChip>
            <h1 className="mt-4 text-balance font-sans text-4xl font-semibold tracking-tight text-foreground">
              {project.title}
            </h1>
            <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-foreground/70">
              {project.summary}
            </p>
            <div
              className="relative mt-8 aspect-video w-full overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface"
              aria-hidden={project.heroImage ? undefined : "true"}
            >
              {project.heroImage ? (
                <Image
                  src={project.heroImage}
                  alt={`${project.title} — hero image`}
                  fill
                  sizes="(min-width: 1024px) 1024px, 100vw"
                  className="object-cover"
                  priority
                />
              ) : null}
            </div>
          </div>
        </section>

        {/* Metadata */}
        <section className="bg-surface px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { label: "Client", value: project.client },
              { label: "Category", value: project.category },
              { label: "Year", value: project.year },
              { label: "Role", value: project.role },
              ...(project.liveLink ? [{ label: "Link", value: "Live site" }] : []),
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">
                  {item.label}
                </p>
                {item.label === "Link" && project.liveLink ? (
                  <a
                    href={project.liveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="numeral-ltr mt-1 block font-mono text-sm text-primary underline-offset-4 hover:underline"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="numeral-ltr mt-1 font-mono text-sm text-foreground">{item.value}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Narrative */}
        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto flex max-w-5xl flex-col gap-12">
            {NARRATIVE_ORDER.map((section) => (
              <div key={section.key}>
                <h2 className="font-sans text-xl font-semibold text-foreground">{section.label}</h2>
                <p className="mt-3 max-w-3xl text-pretty leading-relaxed text-foreground/70">
                  {project[section.key]}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Gallery */}
        {project.galleryImages && project.galleryImages.length > 0 ? (
          <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-5xl">
              <h2 className="font-sans text-xl font-semibold text-foreground">Gallery</h2>
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {project.galleryImages.map((url, index) => (
                  <div
                    key={url}
                    className="relative aspect-video overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface-elevated"
                  >
                    <Image
                      src={url}
                      alt={`${project.title} — gallery image ${index + 1}`}
                      fill
                      sizes="(min-width: 1024px) 512px, 100vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* Before / After */}
        <section className="bg-surface px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-sans text-xl font-semibold text-foreground">Before &amp; after</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-medium text-foreground/70">Before</p>
                <div className="aspect-video rounded-[var(--radius-lg)] border border-border bg-surface-elevated" aria-hidden="true" />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-foreground/70">After</p>
                <div className="aspect-video rounded-[var(--radius-lg)] border border-border bg-surface-elevated" aria-hidden="true" />
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-sans text-xl font-semibold text-foreground">Results</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {project.resultStats.map((stat) => (
                <StatWidget key={stat.label} label={stat.label} value={stat.value} trend={stat.trend} />
              ))}
            </div>
          </div>
        </section>

        {/* Technology */}
        <section className="bg-surface px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-sans text-xl font-semibold text-foreground">Technology</h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <MonoChip key={tag}>{tag}</MonoChip>
              ))}
            </div>
          </div>
        </section>

        {/* Resources */}
        {project.pdfFiles && project.pdfFiles.length > 0 ? (
          <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-5xl">
              <h2 className="font-sans text-xl font-semibold text-foreground">Resources</h2>
              <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {project.pdfFiles.map((url, index) => (
                  <li key={url}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="flex min-h-[44px] items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-3 text-sm text-foreground transition-colors duration-150 hover:bg-surface-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      <DocumentIcon className="shrink-0 text-primary" />
                      <span className="min-w-0 flex-1 truncate">{pdfFileLabel(url, index)}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {/* Navigation */}
        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 rounded-[var(--radius-lg)] border border-border p-8 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">
                Next project
              </p>
              <p className="mt-1 font-sans text-lg font-semibold text-foreground">
                {nextProject.title}
              </p>
            </div>
            <div className="flex gap-3">
              <Button href={`/portfolio/${nextProject.slug}`} variant="secondary">
                Next project
              </Button>
              <Button href="/contact">Start a project</Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
