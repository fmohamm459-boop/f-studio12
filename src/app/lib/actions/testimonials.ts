"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { testimonialStatusToDb } from "@/lib/db-mappers";
import type { TestimonialStatus } from "@/lib/mock-data";

// Server Actions — Testimonial supports Create/Read/Update/Delete per the
// approved CRUD scope. Only the three approved models are touched.

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

export type TestimonialInput = {
  quote: string;
  author: string;
  role: string;
  rating: number;
  projectSlug?: string;
  status?: TestimonialStatus;
};

function revalidateTestimonialPaths() {
  revalidatePath("/testimonials");
  revalidatePath("/admin/testimonials");
}

export async function createTestimonial(input: TestimonialInput) {
  await requireAdmin();
  await prisma.testimonial.create({
    data: {
      quote: input.quote,
      author: input.author,
      role: input.role,
      rating: input.rating,
      projectSlug: input.projectSlug || null,
      status: testimonialStatusToDb(input.status ?? "Pending"),
    },
  });
  revalidateTestimonialPaths();
}

/** Moderation-focused update (Component_List §15.4/§15.6 Review Panel: Approve / Mark pending / Hide). */
export async function updateTestimonialStatus(id: string, status: TestimonialStatus) {
  await requireAdmin();
  await prisma.testimonial.update({
    where: { id },
    data: { status: testimonialStatusToDb(status) },
  });
  revalidateTestimonialPaths();
}

export async function updateTestimonial(id: string, input: Partial<TestimonialInput>) {
  await requireAdmin();
  await prisma.testimonial.update({
    where: { id },
    data: {
      ...(input.quote !== undefined && { quote: input.quote }),
      ...(input.author !== undefined && { author: input.author }),
      ...(input.role !== undefined && { role: input.role }),
      ...(input.rating !== undefined && { rating: input.rating }),
      ...(input.projectSlug !== undefined && { projectSlug: input.projectSlug || null }),
      ...(input.status !== undefined && { status: testimonialStatusToDb(input.status) }),
    },
  });
  revalidateTestimonialPaths();
}

export async function deleteTestimonial(id: string) {
  await requireAdmin();
  await prisma.testimonial.delete({ where: { id } });
  revalidateTestimonialPaths();
}
