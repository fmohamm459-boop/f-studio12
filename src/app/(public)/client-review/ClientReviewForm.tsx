"use client";

import { useState, type FormEvent } from "react";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/i18n/client";

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
  const { dict } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  const ratingOptions = [
    { value: "5", label: dict.clientReview.rating5 },
    { value: "4", label: dict.clientReview.rating4 },
    { value: "3", label: dict.clientReview.rating3 },
    { value: "2", label: dict.clientReview.rating2 },
    { value: "1", label: dict.clientReview.rating1 },
  ];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div role="status" className="rounded-[var(--radius-lg)] border border-border bg-surface-elevated p-8 text-center">
        <p className="font-sans text-lg font-semibold text-foreground">{dict.clientReview.feedbackSubmitted}</p>
        <p className="mt-2 text-sm text-foreground/70">
          {dict.clientReview.feedbackSubmittedDesc}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <Select
        id="review-rating"
        name="rating"
        label={dict.clientReview.ratingLabel}
        placeholder={dict.clientReview.selectRatingPlaceholder}
        options={ratingOptions}
        required
      />
      <Textarea
        id="review-comment"
        name="comment"
        label={dict.clientReview.commentLabel}
        placeholder={dict.clientReview.commentPlaceholder}
        required
      />
      <Button type="submit" className="self-start">
        {dict.clientReview.submitFeedback}
      </Button>
    </form>
  );
}
