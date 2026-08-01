"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { categoryToDb, projectStatusToDb } from "@/lib/db-mappers";
import type { Project, ProjectCategory, ProjectStatus } from "@/lib/mock-data";

// Server Actions — the chosen data-access approach for this phase (brief:
// "Server Actions OR Route Handlers — choose one"). Project supports
// Create/Read/Update/Delete per the approved CRUD scope; only the three
// approved models (Project, Testimonial, Message) are touched anywhere in
// this file.

// Phase 9.3.14-D, Task 3 — Critical Production Fixes. Every mutating
// action below previously relied only on src/middleware.ts (route-level
// protection) with no in-action check of its own — a Server Action is a
// public RPC endpoint reachable directly by its compiled action ID,
// independent of which page rendered the form that calls it, so
// middleware alone does not guarantee this. This mirrors the same
// `Boolean(session?.user)` check src/auth.config.ts's `authorized`
// callback already uses for middleware — no new auth architecture, no new
// role/permission concept, just the same check enforced a second time, at
// the point of mutation.
async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
}

export type ProjectInput = {
  slug: string;
  title: string;
  client: string;
  category: ProjectCategory;
  year: string;
  role: string;
  status?: ProjectStatus;
  liveLink?: string;
  summary: string;
  description: string;
  tags: string[];
  overview: string;
  challenge: string;
  research: string;
  solution: string;
  resultStats: Project["resultStats"];
  // Phase 9.3.12 — File & Media Management. Cloudinary secure_url values;
  // the schema field (Project.pdfFiles) has existed since Phase 9.3.11
  // (Client Review System), this just wires it into the general
  // Create/Update input for the first time.
  pdfFiles?: string[];
  // Phase 9.3.12 Stage 2 — same reasoning, for the two newly-approved
  // fields. `heroImage` accepts `null` (not just `undefined`) so "Remove
  // image" can explicitly clear a previously-saved hero image.
  heroImage?: string | null;
  galleryImages?: string[];
};

function revalidateProjectPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/portfolio");
  revalidatePath("/admin/projects");
  if (slug) revalidatePath(`/portfolio/${slug}`);
}

export async function createProject(input: ProjectInput) {
  await requireAdmin();
  await prisma.project.create({
    data: {
      slug: input.slug,
      title: input.title,
      client: input.client,
      category: categoryToDb(input.category),
      year: input.year,
      role: input.role,
      status: projectStatusToDb(input.status ?? "Draft"),
      liveLink: input.liveLink || null,
      summary: input.summary,
      description: input.description,
      tags: input.tags,
      overview: input.overview,
      challenge: input.challenge,
      research: input.research,
      solution: input.solution,
      resultStats: input.resultStats,
      pdfFiles: input.pdfFiles ?? [],
      heroImage: input.heroImage ?? null,
      galleryImages: input.galleryImages ?? [],
    },
  });
  revalidateProjectPaths(input.slug);
}

export async function updateProject(slug: string, input: Partial<ProjectInput>) {
  await requireAdmin();
  await prisma.project.update({
    where: { slug },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.client !== undefined && { client: input.client }),
      ...(input.category !== undefined && { category: categoryToDb(input.category) }),
      ...(input.year !== undefined && { year: input.year }),
      ...(input.role !== undefined && { role: input.role }),
      ...(input.status !== undefined && { status: projectStatusToDb(input.status) }),
      ...(input.liveLink !== undefined && { liveLink: input.liveLink || null }),
      ...(input.summary !== undefined && { summary: input.summary }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.tags !== undefined && { tags: input.tags }),
      ...(input.overview !== undefined && { overview: input.overview }),
      ...(input.challenge !== undefined && { challenge: input.challenge }),
      ...(input.research !== undefined && { research: input.research }),
      ...(input.solution !== undefined && { solution: input.solution }),
      ...(input.resultStats !== undefined && { resultStats: input.resultStats }),
      ...(input.pdfFiles !== undefined && { pdfFiles: input.pdfFiles }),
      ...(input.heroImage !== undefined && { heroImage: input.heroImage }),
      ...(input.galleryImages !== undefined && { galleryImages: input.galleryImages }),
    },
  });
  revalidateProjectPaths(slug);
}

export async function deleteProject(slug: string) {
  await requireAdmin();
  await prisma.project.delete({ where: { slug } });
  revalidateProjectPaths(slug);
}
