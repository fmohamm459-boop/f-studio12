"use server";

import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

// Client Review System — Server Actions (Phase 9.3.11, "Client Review
// System via Private Token Links"). Implements the private-review-link
// model Phase 9.3 Decision Record 002 pre-approved the design of: no
// Client/User model, no client accounts, no login — a single unguessable,
// expiring token per project instead.

const REVIEW_TOKEN_BYTES = 32; // 256-bit token, hex-encoded
const REVIEW_LINK_TTL_DAYS = 7;

// Phase 9.3.14-E, Fix 1 — Final Critical Fixes. Both `generateReviewLink`
// and `getReviewLink` already re-verified the session inline (`const
// session = await auth(); if (!session?.user) throw ...`) since Phase
// 9.3.11 — they were never actually reachable without an authenticated
// admin session. This extracts that existing check into the same named
// `requireAdmin()` helper already used in src/lib/actions/projects.ts,
// src/lib/actions/testimonials.ts, and src/lib/actions/messages.ts, so
// all four action files enforce (and are seen to enforce) the identical
// pattern. No new authentication concept, role, or permission model is
// introduced — this only renames/centralizes the check this file already
// performed. `validateReviewToken` is intentionally NOT guarded — it is
// the public review-page lookup and must remain reachable by anonymous
// visitors with a valid token.
async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
}

export type ReviewProject = {
  title: string;
  description: string;
  projectLink: string | null;
  pdfFiles: string[];
};

/**
 * Generates (or regenerates) a private review-link token for a project.
 * Admin-only: re-verifies the session directly, since Server Actions are
 * not covered by middleware's `/admin/:path*` matcher unless invoked from
 * a matched admin page.
 *
 * Regenerating an existing token silently overwrites it (no separate
 * revoke step) — confirmed intentional: keeps the admin flow to one click
 * ("generate/regenerate link") rather than "revoke, then generate".
 *
 * Keyed on `slug`, not a Prisma row `id` (adjusted from the Stage 1 draft
 * — see this phase's report, "Modified files"): the admin-facing `Project`
 * UI type (`src/lib/mock-data.ts`) has no `id` field, and every other
 * Project Server Action (`updateProject`, `deleteProject` in
 * `src/lib/actions/projects.ts`) already identifies a project by `slug`.
 * Matching that convention means Stage 3 doesn't need to add an `id`
 * field to the UI type or its DB mapper just for this one action.
 */
export async function generateReviewLink(
  slug: string,
): Promise<{ reviewToken: string; tokenExpiresAt: Date }> {
  await requireAdmin();

  const reviewToken = crypto.randomBytes(REVIEW_TOKEN_BYTES).toString("hex");
  const tokenExpiresAt = new Date(Date.now() + REVIEW_LINK_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.project.update({
    where: { slug },
    data: { reviewToken, tokenExpiresAt },
  });

  return { reviewToken, tokenExpiresAt };
}

/**
 * Reads back a project's current review token, if one exists and hasn't
 * expired — added in Stage 3 so the admin panel can show an already-
 * generated link ("view") without minting a new one just to display it.
 * Admin-only, same reasoning as `generateReviewLink`. Read-only: never
 * creates or mutates a token.
 */
export async function getReviewLink(
  slug: string,
): Promise<{ reviewToken: string; tokenExpiresAt: Date } | null> {
  await requireAdmin();

  const project = await prisma.project.findUnique({
    where: { slug },
    select: { reviewToken: true, tokenExpiresAt: true },
  });

  if (!project?.reviewToken || !project.tokenExpiresAt) return null;
  if (project.tokenExpiresAt < new Date()) return null;

  return { reviewToken: project.reviewToken, tokenExpiresAt: project.tokenExpiresAt };
}

/**
 * Validates a review token submitted on the public Client Review page
 * (src/app/(public)/review/[token]/page.tsx). Returns the project fields
 * that page needs, or `null` if the token is missing, unknown, or expired.
 * Deliberately public/unauthenticated — that's the point of the token.
 */
export async function validateReviewToken(token: string): Promise<ReviewProject | null> {
  if (!token) return null;

  const project = await prisma.project.findUnique({
    where: { reviewToken: token },
    select: {
      title: true,
      description: true,
      projectLink: true,
      pdfFiles: true,
      tokenExpiresAt: true,
    },
  });

  if (!project) return null;
  if (!project.tokenExpiresAt || project.tokenExpiresAt < new Date()) return null;

  return {
    title: project.title,
    description: project.description,
    projectLink: project.projectLink,
    pdfFiles: project.pdfFiles,
  };
}
