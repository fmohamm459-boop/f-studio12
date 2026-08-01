"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";

// Login Server Action (Phase 9.3.10-A, "Authentication Core Foundation").
//
// Backs the existing Admin Login form (Page_Structure.md §10,
// src/app/admin/login/page.tsx). This is the "single owner authentication
// flow" the phase brief asks for: it hands the submitted username/password
// to Auth.js's Credentials provider (src/auth.ts), which in turn checks
// them against the single owner record in src/lib/owner-store.ts.
//
// Unmodified in Phase 9.3.10-B ("Authentication Completion & Final
// Verification") — no bug found here, and the Login page itself is on
// this phase's forbidden-to-modify list, so there was nothing for a
// changed loginAction to hook into (e.g. no callback-URL field exists on
// the form). Only `logoutAction`, below, is new this phase.
export async function loginAction(formData: FormData): Promise<void> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", {
      username,
      password,
      redirectTo: "/admin/dashboard",
    });
  } catch (error) {
    // Auth.js throws a redirect internally on success (Next.js handles
    // that specially); only a genuine AuthError means the credentials
    // were rejected. Anything else is a real error and should propagate.
    if (error instanceof AuthError) {
      redirect("/admin/login?error=invalid-credentials");
    }
    throw error;
  }
}

// Logout Server Action (Phase 9.3.10-B, "Authentication Completion & Final
// Verification", Task 3).
//
// Backs the two pre-existing "Log out" buttons in SideNavBar
// (src/components/admin/SideNavBar.tsx, shipped inert — `type="button"`,
// no handler — in Phase 9.3.7, and still inert through Phase 9.3.10-A,
// which explicitly deferred Logout UI). Reuses the existing authentication
// implementation exactly as instructed (Task 3): calls Auth.js's own
// `signOut`, already exported from src/auth.ts (Phase 9.3.10-A), rather
// than hand-rolling session termination. Ends the session and returns the
// owner to /admin/login, which middleware.ts already treats as a public
// admin path — no redirect loop.
export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/admin/login" });
}
