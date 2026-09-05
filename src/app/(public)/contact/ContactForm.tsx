"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { createMessage } from "@/lib/actions/messages";
import { useTranslation } from "@/i18n/client";

/**
 * Contact form — page-local client wrapper around the existing Input/Textarea/
 * Select/Button primitives. Phase 9.3.14-D, Task 2: submission now calls the
 * `createMessage` Server Action (src/lib/actions/messages.ts), persisting to
 * the Message table, instead of only flipping local state. Field set,
 * labels, and validation style are unchanged from the prior phase — no new
 * inputs were added.
 *
 * Phase 9.3.14-E, Fix 2: `createMessage` now returns `{ ok, error }` instead
 * of only throwing on invalid input (Next.js strips thrown Server Action
 * error messages down to a generic one in production, so a specific
 * "Please enter a valid email address." needs to come back as data, not an
 * exception, to actually reach the visitor). `handleSubmit` below reads
 * that result and shows `result.error` in the exact same single error
 * paragraph this form already had — no new error UI, just a real message
 * in the slot that used to always say "Something went wrong." The `catch`
 * block is kept for genuinely unexpected failures (e.g. the database being
 * unreachable), which still throw.
 */
export function ContactForm() {
  const { dict } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const serviceOptions = [
    { value: "branding", label: dict.contact.serviceBranding },
    { value: "web-development", label: dict.contact.serviceWebDev },
    { value: "data-analysis", label: dict.contact.serviceDataAnalysis },
    { value: "ai", label: dict.contact.serviceAi },
    { value: "other", label: dict.contact.serviceOther },
  ];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const service = String(formData.get("service") ?? "");
    const message = String(formData.get("message") ?? "");

    setError(null);
    startTransition(async () => {
      try {
        const result = await createMessage({ name, email, service, message });
        if (result.ok) {
          setSubmitted(true);
        } else {
          setError(result.error);
        }
      } catch {
        setError(dict.contact.errorMessage);
      }
    });
  }

  if (submitted) {
    return (
      <div role="status" className="rounded-[var(--radius-lg)] border border-border bg-surface-elevated p-8 text-center">
        <p className="font-sans text-lg font-semibold text-foreground">{dict.contact.messageSent}</p>
        <p className="mt-2 text-sm text-foreground/70">
          {dict.contact.messageSentDesc}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input id="contact-name" name="name" label={dict.contact.name} autoComplete="name" required />
        <Input id="contact-email" name="email" type="email" label={dict.contact.email} autoComplete="email" required />
      </div>
      <Select
        id="contact-service"
        name="service"
        label={dict.contact.service}
        placeholder={dict.contact.selectService}
        options={serviceOptions}
        required
      />
      <Textarea
        id="contact-message"
        name="message"
        label={dict.contact.message}
        placeholder={dict.contact.messagePlaceholder}
        required
      />
      {error ? (
        <p role="alert" className="text-sm text-foreground">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="self-start" aria-busy={isPending} disabled={isPending}>
        {isPending ? dict.contact.sending : dict.contact.sendMessage}
      </Button>
    </form>
  );
}
