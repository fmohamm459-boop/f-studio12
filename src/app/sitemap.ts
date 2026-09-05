import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

// Phase 9.3.13-B — Sitemap (Task 1).
//
// Lists exactly the routes that exist in Page_Structure PART A (the public
// website) and are meant to be crawled/indexed. No route is invented here:
// every static entry below corresponds to an existing page.tsx already
// shipped in a prior phase (see F_Studio_Phase_9_3_13_A_SEO_Metadata_Report
// §1 and Page_Structure.md PART A).
//
// Deliberately excluded (see the accompanying Production Readiness report,
// "Sitemap" section, for the full reasoning):
// - PART B admin routes (/admin/*) — private, also blocked in robots.ts.
// - /review/[token] — private per-project client-review link (Phase 9.3.11,
//   Decision Record 002); its own page already sets
//   `robots: { index: false, follow: false }`, so it's excluded here too.
// - Draft (unpublished) Project rows — only PUBLISHED projects are listed,
//   so the sitemap never advertises a project a crawler would 404/soft-404
//   on if it isn't meant to be public yet.

const SITE_URL = new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000");

// Static public routes (Page_Structure PART A §1-8; §9 "/client-review" is
// the static feedback-form page, not the private "/review/[token]" route —
// same distinction the Phase 9.3.13-A report draws in its own §1).
const STATIC_ROUTES = [
  "",
  "/about",
  "/brand-identity",
  "/services",
  "/portfolio",
  "/testimonials",
  "/contact",
  "/client-review",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: new URL(route, SITE_URL).toString(),
    lastModified: new Date(),
  }));

  // Only PUBLISHED projects — draft rows exist in the database (admin can
  // save work-in-progress) but are not meant to be publicly crawled/indexed.
  const publishedProjects = await prisma.project.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  });

  const projectEntries: MetadataRoute.Sitemap = publishedProjects.map(
    (project: { slug: string; updatedAt: Date }) => ({
      url: new URL(`/portfolio/${project.slug}`, SITE_URL).toString(),
      lastModified: project.updatedAt,
    }),
  );


  return [...staticEntries, ...projectEntries];
}
