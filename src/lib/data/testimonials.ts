import { prisma } from "@/lib/db";
import { toUiTestimonial } from "@/lib/db-mappers";
import type { Testimonial } from "@/lib/mock-data";
import { TestimonialStatus } from "@prisma/client";

// Data access layer — Testimonial reads only (Phase 9.3.9, Database
// Integration). Mirrors the read shape the public Testimonials page and the
// admin Testimonials Management page already expect from
// src/lib/mock-data.ts. No mutation logic lives here — see
// src/lib/actions/testimonials.ts.

export async function getTestimonials(filter?: { status?: "APPROVED" | "PENDING" | "HIDDEN" }): Promise<Testimonial[]> {
  const where = filter?.status ? { status: filter.status as TestimonialStatus } : undefined;
  const rows = await prisma.testimonial.findMany({ 
    where,
    orderBy: { submittedAt: "desc" } 
  });
  return rows.map(toUiTestimonial);
}
