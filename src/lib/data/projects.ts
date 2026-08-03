import { prisma } from "@/lib/db";
import { toUiProject } from "@/lib/db-mappers";
import type { Project } from "@/lib/mock-data";

// Data access layer — Project reads only (Phase 9.3.9, Database Integration).
// Mirrors the read shape the public Portfolio/Project Details pages and the
// admin Projects Management page already expect from src/lib/mock-data.ts.
// No mutation logic lives here — see src/lib/actions/projects.ts.

export async function getProjects(): Promise<Project[]> {
  const rows = await prisma.project.findMany({ orderBy: { updatedAt: "desc" } });
  return rows.map(toUiProject);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const row = await prisma.project.findUnique({ where: { slug } });
  return row ? toUiProject(row) : null;
}

export async function getProjectSlugs(): Promise<string[]> {
  const rows = await prisma.project.findMany({ select: { slug: true } });
  return rows.map((row) => row.slug);
}
