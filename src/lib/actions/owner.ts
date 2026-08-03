"use server";

import { redirect } from "next/navigation";
import { createOwner, hasOwner } from "@/lib/owner-store";

// Owner Server Action (Phase 9.3.10-A, "Authentication Core Foundation").
//
// Backs the existing Initial Owner Setup form (Page_Structure.md §11,
// src/app/admin/setup/page.tsx). This is the "single owner account
// creation" logic the phase brief asks for — Read src/lib/owner-store.ts
// for why it persists to a JSON file rather than a new Prisma model.
//
// Enforces, in order:
//   1. Setup is permanently disabled once an owner exists (redirects to
//      /admin/login instead of creating a second account).
//   2. Minimal field validation (required fields, matching passwords, the
//      12-character minimum the form's own hint already advertises).
//   3. Delegates the actual create + hash to `createOwner`.
//
// No email verification, no roles, no multi-user support — exactly the
// single Credentials-only owner record this phase allows.
export async function createOwnerAction(formData: FormData): Promise<void> {
  if (await hasOwner()) {
    redirect("/admin/login");
  }

  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (!name || !username || !password || !passwordConfirm) {
    redirect("/admin/setup?error=missing-fields");
  }

  if (password !== passwordConfirm) {
    redirect("/admin/setup?error=password-mismatch");
  }

  if (password.length < 12) {
    redirect("/admin/setup?error=password-too-short");
  }

  await createOwner({ name, username, password });
  redirect("/admin/login?setup=complete");
}
