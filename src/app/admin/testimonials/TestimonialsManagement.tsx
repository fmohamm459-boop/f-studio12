"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type DataTableColumn } from "@/components/data/DataTable";
import { Button } from "@/components/ui/Button";
import type { Testimonial, TestimonialStatus } from "@/lib/mock-data";
import { updateTestimonialStatus } from "@/lib/actions/testimonials";
import { useTranslation } from "@/i18n/client";

type TestimonialsManagementProps = {
  testimonials: Testimonial[];
};

export function TestimonialsManagement({ testimonials }: TestimonialsManagementProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [reviewing, setReviewing] = useState<Testimonial | null>(null);
  const [localStatus, setLocalStatus] = useState<TestimonialStatus | undefined>(undefined);

  const statusIndicator = useCallback(
    (status: TestimonialStatus | undefined) => {
      const tone = status === "Approved" ? "bg-primary" : status === "Hidden" ? "bg-foreground/30" : "bg-foreground/60";
      let statusLabel: string = status ?? "Pending";
      if (status === "Approved") statusLabel = t.testimonialsCMS.statusApproved;
      else if (status === "Hidden") statusLabel = t.testimonialsCMS.statusHidden;
      else if (status === "Pending" || !status) statusLabel = t.testimonialsCMS.statusPending;

      return (
        <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
          <span aria-hidden="true" className={`inline-block h-1.5 w-1.5 rounded-full ${tone}`} />
          {statusLabel}
        </span>
      );
    },
    [t],
  );

  const columns = useMemo<DataTableColumn<Testimonial>[]>(
    () => [
      {
        key: "author",
        header: t.testimonialsCMS.authorCol,
        sortable: true,
        sortValue: (test) => test.author,
        render: (test) => (
          <div>
            <p className="font-medium text-foreground">{test.author}</p>
            <p className="text-xs text-foreground/60">{test.role}</p>
          </div>
        ),
      },
      {
        key: "rating",
        header: t.testimonialsCMS.ratingCol,
        sortable: true,
        sortValue: (test) => test.rating,
        render: (test) => <span className="numeral-ltr text-foreground">{test.rating.toFixed(1)} / 5</span>,
      },
      {
        key: "status",
        header: t.testimonialsCMS.statusCol,
        sortable: true,
        sortValue: (test) => test.status ?? "",
        render: (test) => statusIndicator(test.status),
      },
      {
        key: "submittedAt",
        header: t.testimonialsCMS.submittedCol,
        sortable: true,
        align: "end",
        sortValue: (test) => test.submittedAt ?? "",
        render: (test) => <span className="numeral-ltr text-foreground/70">{test.submittedAt}</span>,
      },
    ],
    [t, statusIndicator],
  );

  function openReview(testimonial: Testimonial) {
    setReviewing(testimonial);
    setLocalStatus(testimonial.status);
  }

  function applyStatus(testimonial: Testimonial, status: TestimonialStatus) {
    setLocalStatus(status);
    startTransition(async () => {
      await updateTestimonialStatus(testimonial.id, status);
      router.refresh();
    });
  }

  return (
    <>
      <DataTable
        caption={t.testimonialsCMS.allTestimonials}
        columns={columns}
        rows={testimonials}
        getRowId={(test) => test.id}
        getRowLabel={(test) => `${t.testimonialsCMS.authorCol}: ${test.author}`}
        rowActions={[
          { label: t.testimonialsCMS.reviewAction, onSelect: openReview },
          { label: t.testimonialsCMS.hideAction, onSelect: (test) => applyStatus(test, "Hidden"), destructive: true },
        ]}
      />

      {reviewing ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label={t.testimonialsCMS.closeReviewAria}
            onClick={() => setReviewing(null)}
            className="absolute inset-0 bg-ink/40"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${t.testimonialsCMS.reviewTitle} - ${reviewing.author}`}
            className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto border-s border-border bg-surface-elevated p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-sans text-xl font-semibold text-foreground">{t.testimonialsCMS.reviewTitle}</h2>
              <button
                type="button"
                onClick={() => setReviewing(null)}
                aria-label={t.testimonialsCMS.closeReviewAria}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-lg)] text-foreground/70 hover:bg-surface hover:text-foreground"
              >
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4.5 4.5 13.5 13.5M13.5 4.5 4.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <blockquote className="mt-6 text-lg leading-relaxed text-foreground">&ldquo;{reviewing.quote}&rdquo;</blockquote>
            <p className="mt-4 text-sm font-medium text-foreground">{reviewing.author}</p>
            <p className="text-sm text-foreground/60">{reviewing.role}</p>
            <p className="numeral-ltr mt-1 text-sm text-foreground/70">{reviewing.rating.toFixed(1)} / 5</p>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-foreground/70">{t.testimonialsCMS.currentStatus}</span>
              {statusIndicator(localStatus)}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
              <Button type="button" onClick={() => applyStatus(reviewing, "Approved")}>
                {t.testimonialsCMS.approveBtn}
              </Button>
              <Button type="button" variant="secondary" onClick={() => applyStatus(reviewing, "Pending")}>
                {t.testimonialsCMS.markPendingBtn}
              </Button>
              <Button type="button" variant="ghost" onClick={() => applyStatus(reviewing, "Hidden")}>
                {t.testimonialsCMS.hideBtn}
              </Button>
            </div>
            <p className="mt-3 text-xs text-foreground/50">
              {t.testimonialsCMS.moderationImmediateNotice}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
