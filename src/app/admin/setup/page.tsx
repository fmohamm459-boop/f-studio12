import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createOwnerAction } from "@/lib/actions/owner";
import { hasOwner } from "@/lib/owner-store";
import { getServerTranslation } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Initial Owner Setup — F Studio",
  description: "Create the first owner account for the F Studio admin dashboard.",
};



export default async function AdminSetupPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  if (await hasOwner()) {
    redirect("/admin/login");
  }

  const { t } = await getServerTranslation();

  const errorMessages: Record<string, string> = {
    "missing-fields": t.auth.missingFields,
    "password-mismatch": t.auth.passwordMismatch,
    "password-too-short": t.auth.passwordTooShort,
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
          <p className="font-mono text-xs uppercase tracking-wide text-primary">{t.auth.firstRunBadge}</p>
          <h1 className="mt-2 font-sans text-2xl font-semibold text-foreground">{t.auth.createOwnerHeading}</h1>
          <p className="mt-2 text-sm text-foreground/70">
            {t.auth.createOwnerSubtitle}
          </p>

          <form action={createOwnerAction} className="mt-8 flex flex-col gap-5" noValidate>
            <Input id="setup-name" name="name" label={t.auth.fullNameLabel} autoComplete="name" required />
            <Input
              id="setup-username"
              name="username"
              type="text"
              label={t.auth.usernameLabel}
              autoComplete="username"
              required
            />
            <Input
              id="setup-password"
              name="password"
              type="password"
              label={t.auth.passwordLabel}
              autoComplete="new-password"
              hint={t.settingsCMS.passwordRequirementHint}
              error={errorMessage}
              required
            />
            <Input
              id="setup-password-confirm"
              name="passwordConfirm"
              type="password"
              label={t.auth.confirmPasswordLabel}
              autoComplete="new-password"
              required
            />
            <Button type="submit" className="mt-1 w-full">
              {t.auth.createOwnerBtn}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-foreground/60">
          {t.auth.alreadySetUpPrompt}{" "}
          <Link href="/admin/login" className="font-medium text-foreground underline underline-offset-4 hover:text-primary">
            {t.auth.signInInsteadLink}
          </Link>
        </p>
      </div>
    </main>
  );
}
