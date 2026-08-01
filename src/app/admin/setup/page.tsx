import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createOwnerAction } from "@/lib/actions/owner";
import { hasOwner } from "@/lib/owner-store";

export const metadata: Metadata = {
  title: "Initial Owner Setup — F Studio",
  description: "Create the first owner account for the F Studio admin dashboard.",
};

/**
 * Initial Owner Setup (Page_Structure.md §11). One-time account-creation
 * form, first-run only.
 *
 * Phase 9.3.10-A ("Authentication Core Foundation") wires this form to
 * `createOwnerAction` (a Server Action), redirects to /admin/login if an
 * owner already exists (setup is permanently disabled after first use, per
 * the brief), and switches the identifier field from "Email" to "Username"
 * — Credentials-only, no email login. No other markup, layout, or styling
 * changes were made (see the phase report).
 */
export default async function AdminSetupPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  if (await hasOwner()) {
    redirect("/admin/login");
  }

  const errorMessages: Record<string, string> = {
    "missing-fields": "Please fill in every field.",
    "password-mismatch": "Passwords do not match.",
    "password-too-short": "Password must be at least 12 characters.",
  };
  const errorMessage = searchParams?.error ? errorMessages[searchParams.error] : undefined;

  return (
    <main role="main" className="flex min-h-dvh items-center justify-center bg-background px-4 py-16 sm:px-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <span dir="ltr" className="font-sans text-xl font-semibold tracking-tight text-foreground">
            F Studio
          </span>
        </div>

        <div className="mt-8 rounded-[var(--radius-lg)] border border-border bg-surface-elevated p-8">
          <p className="font-mono text-xs uppercase tracking-wide text-primary">First-run setup</p>
          <h1 className="mt-2 font-sans text-2xl font-semibold text-foreground">Create the owner account</h1>
          <p className="mt-2 text-sm text-foreground/70">
            This one-time step creates the account used to sign in and manage the studio dashboard.
          </p>

          <form action={createOwnerAction} className="mt-8 flex flex-col gap-5" noValidate>
            <Input id="setup-name" name="name" label="Full name" autoComplete="name" required />
            <Input
              id="setup-username"
              name="username"
              type="text"
              label="Username"
              autoComplete="username"
              required
            />
            <Input
              id="setup-password"
              name="password"
              type="password"
              label="Password"
              autoComplete="new-password"
              hint="At least 12 characters, with a mix of letters and numbers."
              error={errorMessage}
              required
            />
            <Input
              id="setup-password-confirm"
              name="passwordConfirm"
              type="password"
              label="Confirm password"
              autoComplete="new-password"
              required
            />
            <Button type="submit" className="mt-1 w-full">
              Create owner account
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-foreground/60">
          Already set up?{" "}
          <Link href="/admin/login" className="font-medium text-foreground underline underline-offset-4 hover:text-primary">
            Sign in instead
          </Link>
        </p>
      </div>
    </main>
  );
}
