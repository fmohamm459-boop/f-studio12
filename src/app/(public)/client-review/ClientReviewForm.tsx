"use client";

import { useState, type FormEvent } from "react";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

const RATING_OPTIONS = [
  { value: "5", label: "5 — Excellent" },
  { value: "4", label: "4 — Good" },
  { value: "3", label: "3 — Average" },
  { value: "2", label: "2 — Below average" },
  { value: "1", label: "1 — Poor" },
];

/**
 * Client Review feedback form — page-local client wrapper. The allowed
 * component set for this phase has no dedicated Rating input, so the rating
 * scale is implemented with the existing Select primitive (options 1–5)
 * rather than introducing a new reusable component. Submission writes
 * conceptually to the Testimonials entity (pending/moderation state) per the
 * Blueprint's data-model mapping — no API route exists yet, so this is
 * handled client-side only, and no authentication is implemented per this
 * phase's restriction (Client Review access is deferred to a token-link
 * mechanism in a later phase).
 */
export function ClientReviewForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div role="status" className="rounded-[var(--radius-lg)] border border-border bg-surface-elevated p-8 text-center">
        <p className="font-sans text-lg font-semibold text-foreground">Feedback submitted</p>
        <p className="mt-2 text-sm text-foreground/70">
          Thank you — your review has been sent to the studio for moderation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <Select
        id="review-rating"
        name="rating"
        label="Rating"
        placeholder="Select a rating"
        options={RATING_OPTIONS}
        required
      />
      <Textarea
        id="review-comment"
        name="comment"
        label="Comment"
        placeholder="Tell us how the project went"
        required
      />
      <Button type="submit" className="self-start">
        Submit feedback
      </Button>
    </form>
  );
}
