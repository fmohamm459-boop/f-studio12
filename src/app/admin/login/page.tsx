import type { Metadata } from "next";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { loginAction } from "@/lib/actions/auth";
import { getServerTranslation } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Admin Login — F Studio",
  description: "Sign in to the F Studio admin dashboard.",
};



export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const { t } = await getServerTranslation();
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
          <h1 className="text-center font-sans text-2xl font-semibold text-foreground">{t.auth.signInHeading}</h1>
          <p className="mt-2 text-center text-sm text-foreground/70">
            {t.auth.signInSubtitle}
          </p>

          <form action={loginAction} className="mt-8 flex flex-col gap-5" noValidate>
            <Input
              id="login-username"
              name="username"
              type="text"
              label={t.auth.usernameLabel}
              autoComplete="username"
              required
            />
            <Input
              id="login-password"
              name="password"
              type="password"
              label={t.auth.passwordLabel}
              autoComplete="current-password"
              error={hasError ? t.auth.incorrectCredentials : undefined}
              required
            />
            <Button type="submit" className="mt-1 w-full">
              {t.auth.signInBtn}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-foreground/60">
          {t.auth.firstTimePrompt}{" "}
          <Link
            href="/admin/setup"
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
          >
            {t.auth.createOwnerLink}
          </Link>
        </p>
      </div>
    </main>
  );
}
