import type { Metadata } from "next";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { loginAction } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Admin Login — F Studio",
  description: "Sign in to the F Studio admin dashboard.",
};

/**
 * Admin Login (Page_Structure.md §10). No Global Components listed for this
 * page (pre-auth), so it renders standalone — no SideNavBar/AdminHeader.
 *
 * Phase 9.3.10-A ("Authentication Core Foundation") wires this form to the
 * Credentials sign-in flow (`loginAction`, a Server Action) and switches
 * the identifier field from "Email" to "Username" — Credentials-only,
 * username + password, no email login, per this phase's brief. No other
 * markup, layout, or styling changes were made (see the phase report).
 */
export default function AdminLoginPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const hasError = searchParams?.error === "invalid-credentials";
  return (
    <main role="main" className="flex min-h-dvh items-center justify-center bg-background px-4 py-16 sm:px-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <span dir="ltr" className="font-sans text-xl font-semibold tracking-tight text-foreground">
            F Studio
          </span>
        </div>

        <div className="mt-8 rounded-[var(--radius-lg)] border border-border bg-surface-elevated p-8">
          <h1 className="text-center font-sans text-2xl font-semibold text-foreground">Sign in</h1>
          <p className="mt-2 text-center text-sm text-foreground/70">
            Access the F Studio admin dashboard.
          </p>

          <form action={loginAction} className="mt-8 flex flex-col gap-5" noValidate>
            <Input
              id="login-username"
              name="username"
              type="text"
              label="Username"
              autoComplete="username"
              required
            />
            <Input
              id="login-password"
              name="password"
              type="password"
              label="Password"
              autoComplete="current-password"
              error={hasError ? "Incorrect username or password." : undefined}
              required
            />
            <Button type="submit" className="mt-1 w-full">
              Sign in
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-foreground/60">
          Setting up F Studio for the first time?{" "}
          <Link
            href="/admin/setup"
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
          >
            Create the owner account
          </Link>
        </p>
      </div>
    </main>
  );
}
