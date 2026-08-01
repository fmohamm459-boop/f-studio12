"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { SERVICE_OPTIONS } from "@/lib/mock-data";

// Server Actions — Message supports Create (Phase 9.3.14-D, Task 2, public
// Contact form only) + Read + Delete (admin) per this phase's approved CRUD
// scope. Only the three approved models are touched.

// Phase 9.3.14-D, Task 3 — Critical Production Fixes. Every mutating admin
// Server Action in this file previously relied only on src/middleware.ts
// (route-level protection) with no in-action check of its own — a Server
// Action is a public RPC endpoint reachable directly by its compiled
// action ID, independent of which page rendered the form that calls it,
// so middleware alone does not guarantee this. This mirrors the same
// `Boolean(session?.user)` check src/auth.config.ts's `authorized`
// callback already uses for middleware — no new auth architecture, no new
// role/permission concept, just the same check enforced a second time, at
// the point of mutation. `createMessage` below is intentionally exempt —
// it is the public Contact form's submission path (Page_Structure §8) and
// must remain reachable by anonymous visitors.
async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
}

// Maps the Contact form's SERVICE_OPTIONS values (mock-data.ts) to the
// Prisma MessageService enum — the same UI-shape-to-DB-enum translation
// db-mappers.ts already applies elsewhere (e.g. categoryToDb), kept local
// here since it is only needed by this one action.
const SERVICE_TO_DB: Record<string, "BRANDING" | "WEB_DEVELOPMENT" | "DATA_ANALYSIS" | "AI" | "OTHER"> = {
  branding: "BRANDING",
  "web-development": "WEB_DEVELOPMENT",
  "data-analysis": "DATA_ANALYSIS",
  ai: "AI",
  other: "OTHER",
};

// Phase 9.3.14-E, Fix 2 — Final Critical Fixes. `createMessage` is a
// public, unauthenticated endpoint (intentionally — it is the Contact
// form's submission path), so it is the one place in this file that
// cannot rely on a session check for protection. The Final QA report
// found it previously wrote whatever the client sent, including empty
// strings, with no length ceiling and no email-format check. This adds
// the minimal server-side validation needed to reject junk/empty
// submissions before they reach the database — no new fields, no
// CAPTCHA (this project has no CAPTCHA provider wired anywhere, so
// adding one here would be a new architectural dependency, which this
// phase's Strict Rules disallow), no rate limiting (a distinct,
// larger concern than input validation, out of this phase's scope).
//
// Limits are intentionally generous (they exist to catch empty/garbage/
// abusive-length input, not to constrain a legitimate inquiry) and mirror
// the same field set the form already collects — nothing new is
// validated that wasn't already being written.
const NAME_MAX_LENGTH = 200;
const MESSAGE_MAX_LENGTH = 5000;
const EMAIL_MAX_LENGTH = 254; // RFC 5321 practical max
// Deliberately simple "has an @ with something on both sides and a dot in
// the domain" check — this is a submission-quality gate, not a full RFC
// 5322 validator (which would reject/accept edge cases no differently
// than this simpler pattern for real-world addresses).
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ValidatedContactInput = { name: string; email: string; message: string };
type ValidationResult =
  | { ok: true; data: ValidatedContactInput }
  | { ok: false; error: string };

/**
 * Validates and normalizes the Contact form's raw input. Returns (rather
 * than throws) on failure: Next.js redacts thrown Server Action errors
 * down to a generic message + digest once the app is built for
 * production, since an uncaught throw is treated as an *unexpected*
 * error — so a thrown, specific "Please enter a valid email address."
 * would never actually reach the visitor outside local dev. A validation
 * failure here is an *expected*, recoverable outcome, so it's modeled as
 * a normal return value instead, per Next.js's own guidance for this
 * exact situation. Kept local to this file — only `createMessage` uses it.
 */
function validateContactInput(input: ContactMessageInput): ValidationResult {
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();

  if (!name) {
    return { ok: false, error: "Please enter your name." };
  }
  if (name.length > NAME_MAX_LENGTH) {
    return { ok: false, error: "Name is too long." };
  }

  if (!email) {
    return { ok: false, error: "Please enter your email address." };
  }
  if (email.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  if (!message) {
    return { ok: false, error: "Please enter a message." };
  }
  if (message.length > MESSAGE_MAX_LENGTH) {
    return { ok: false, error: "Message is too long." };
  }

  return { ok: true, data: { name, email, message } };
}

// Phase 9.3.14-D, Task 2 — Contact Form Persistence. `Message.subject` is a
// required field, but the public Contact form (Page_Structure §8) only
// collects name/email/service/message — no subject input, and adding one
// would change the form's existing UX, which this task disallows. A short,
// human-readable subject is derived instead from the selected service's
// label, reusing the same SERVICE_OPTIONS the form's Select already
// renders from, so no new copy or schema field is introduced.
export type ContactMessageInput = {
  name: string;
  email: string;
  service: string;
  message: string;
};

export type CreateMessageResult = { ok: true } | { ok: false; error: string };

export async function createMessage(input: ContactMessageInput): Promise<CreateMessageResult> {
  const validated = validateContactInput(input);
  if (!validated.ok) {
    return validated;
  }
  const { name, email, message } = validated.data;

  const serviceOption = SERVICE_OPTIONS.find((option) => option.value === input.service);
  const serviceEnum = SERVICE_TO_DB[input.service];
  if (!serviceEnum) {
    return { ok: false, error: "Please select a service." };
  }

  await prisma.message.create({
    data: {
      name,
      email,
      subject: `New inquiry — ${serviceOption?.label ?? "General"}`,
      service: serviceEnum,
      message,
    },
  });
  revalidatePath("/admin/messages");
  return { ok: true };
}

export async function deleteMessage(id: string) {
  await requireAdmin();
  await prisma.message.delete({ where: { id } });
  revalidatePath("/admin/messages");
}
